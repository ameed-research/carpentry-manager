package com.carpentry.manager.document.service;

import com.carpentry.manager.ai.service.GeminiService;
import com.carpentry.manager.category.model.Category;
import com.carpentry.manager.category.repository.CategoryRepository;
import com.carpentry.manager.document.model.CarpentryDocument;
import com.carpentry.manager.document.repository.DocumentRepository;
import com.carpentry.manager.inventory.model.InventoryHistory;
import com.carpentry.manager.inventory.model.Item;
import com.carpentry.manager.inventory.repository.InventoryHistoryRepository;
import com.carpentry.manager.inventory.repository.ItemRepository;
import com.carpentry.manager.notification.model.Notification;
import com.carpentry.manager.notification.service.NotificationService;
import com.carpentry.manager.supplier.model.Supplier;
import com.carpentry.manager.supplier.repository.SupplierRepository;
import com.carpentry.manager.supplier.service.SupplierService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final ItemRepository itemRepository;
    private final InventoryHistoryRepository historyRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final SupplierService supplierService;
    private final NotificationService notificationService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    @Value("${app.storage.docs-path}")
    private String docsPath;

    public List<CarpentryDocument> getAllDocuments() {
        return documentRepository.findAll();
    }

    public CarpentryDocument uploadDocument(MultipartFile file, CarpentryDocument.DocumentType type) throws IOException {
        byte[] content = file.getBytes();
        String fileHash = DigestUtils.md5Hex(content);

        if (documentRepository.findByFileHash(fileHash).isPresent()) {
            throw new RuntimeException("מסמך זה כבר הועלה בעבר");
        }

        Path root = Paths.get(docsPath);
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = root.resolve(fileName);
        Files.write(filePath, content);

        CarpentryDocument document = CarpentryDocument.builder()
                .originalName(file.getOriginalFilename())
                .filePath(filePath.toString())
                .fileSize(file.getSize())
                .fileHash(fileHash)
                .uploadDate(LocalDateTime.now())
                .status(CarpentryDocument.DocumentStatus.PENDING)
                .type(type)
                .build();

        document = documentRepository.save(document);

        // Process document
        processDocument(document, file);

        return document;
    }

    private void processDocument(CarpentryDocument document, MultipartFile file) {
        try {
            log.info("Processing document: {} of type {}", document.getOriginalName(), document.getType());

            Map<String, Object> extractedData = geminiService.extractDocumentData(file, document.getType());
            String jsonText = objectMapper.writeValueAsString(extractedData);
            document.setExtractedData(jsonText);
            document.setStatus(CarpentryDocument.DocumentStatus.PROCESSED);
            documentRepository.save(document);

            // Logic based on document type
            if (document.getType() == CarpentryDocument.DocumentType.INVOICE ||
                    document.getType() == CarpentryDocument.DocumentType.DELIVERY_NOTE) {
                
                String supplierName = (String) extractedData.get("supplierName");
                String supplierTaxId = (String) extractedData.get("supplierTaxId");
                
                Supplier supplier = findOrCreateSupplier(supplierName, supplierTaxId);
                
                updateInventoryFromExtractedData(document, extractedData, supplier.getId());
                updateSupplierFromExtractedData(document, extractedData, supplier);
            }

            notificationService.sendNotification(
                    "מסמך " + document.getOriginalName() + " עובד בהצלחה",
                    Notification.NotificationType.INFO
            );

        } catch (Exception e) {
            log.error("Error processing document", e);
            document.setStatus(CarpentryDocument.DocumentStatus.FAILED);
            documentRepository.save(document);
            notificationService.sendNotification(
                    "שגיאה בעיבוד מסמך " + document.getOriginalName(),
                    Notification.NotificationType.ERROR
            );
        }
    }

    public Map<String, Object> analyzeInventoryDocument(MultipartFile file) throws Exception {
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
            throw new RuntimeException("סוג קובץ לא נתמך. יש להעלות תמונות או קבצי PDF בלבד.");
        }

        byte[] content = file.getBytes();
        String fileHash = DigestUtils.md5Hex(content);

        if (documentRepository.findByFileHash(fileHash).isPresent()) {
            throw new RuntimeException("מסמך זה כבר הועלה בעבר");
        }

        Path root = Paths.get(docsPath);
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = root.resolve(fileName);
        Files.write(filePath, content);

        CarpentryDocument document = CarpentryDocument.builder()
                .originalName(file.getOriginalFilename())
                .filePath(filePath.toString())
                .fileSize(file.getSize())
                .fileHash(fileHash)
                .uploadDate(LocalDateTime.now())
                .status(CarpentryDocument.DocumentStatus.PENDING)
                .build();

        // 1. Send to Gemini for analysis
        Map<String, Object> extractedData = geminiService.analyzeInventoryDocument(file);
        
        // 2. Determine type
        String typeStr = (String) extractedData.get("type");
        if ("INVOICE".equals(typeStr)) {
            document.setType(CarpentryDocument.DocumentType.INVOICE);
        } else if ("DELIVERY_NOTE".equals(typeStr)) {
            document.setType(CarpentryDocument.DocumentType.DELIVERY_NOTE);
        } else {
            // Default to invoice if not clear, though Gemini should return one
            document.setType(CarpentryDocument.DocumentType.INVOICE);
        }

        document = documentRepository.save(document);
        
        // Include document ID in response so frontend can approve it later
        extractedData.put("documentId", document.getId());
        
        return extractedData;
    }

    public void approveInventoryDocument(String documentId, Map<String, Object> finalizedData) throws Exception {
        CarpentryDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("מסמך לא נמצא"));

        if (document.getStatus() == CarpentryDocument.DocumentStatus.PROCESSED) {
            throw new RuntimeException("מסמך זה כבר אושר ועובד");
        }

        String jsonText = objectMapper.writeValueAsString(finalizedData);
        document.setExtractedData(jsonText);
        
        // Update document type if user changed it
        String typeStr = (String) finalizedData.get("type");
        if ("INVOICE".equals(typeStr)) {
            document.setType(CarpentryDocument.DocumentType.INVOICE);
        } else if ("DELIVERY_NOTE".equals(typeStr)) {
            document.setType(CarpentryDocument.DocumentType.DELIVERY_NOTE);
        }

        try {
            String supplierName = (String) finalizedData.get("supplierName");
            String supplierTaxId = (String) finalizedData.get("supplierTaxId");
            
            Supplier supplier = findOrCreateSupplier(supplierName, supplierTaxId);
            
            updateInventoryFromExtractedData(document, finalizedData, supplier.getId());
            updateSupplierFromExtractedData(document, finalizedData, supplier);

            document.setStatus(CarpentryDocument.DocumentStatus.PROCESSED);
            documentRepository.save(document);

            notificationService.sendNotification(
                    "מסמך המלאי " + document.getOriginalName() + " עובד ואושר בהצלחה",
                    Notification.NotificationType.INFO
            );
        } catch (Exception e) {
            log.error("Error approving document", e);
            document.setStatus(CarpentryDocument.DocumentStatus.FAILED);
            documentRepository.save(document);
            throw new RuntimeException("שגיאה בעדכון הנתונים ממסמך: " + e.getMessage());
        }
    }

    private Supplier findOrCreateSupplier(String name, String taxId) {
        Optional<Supplier> supplier = Optional.empty();
        if (taxId != null && !taxId.isBlank()) {
            supplier = supplierRepository.findByTaxId(taxId);
        }
        if (supplier.isEmpty() && name != null && !name.isBlank()) {
            supplier = supplierRepository.findByName(name);
        }

        if (supplier.isPresent()) {
            return supplier.get();
        }

        // Create new supplier if not found
        Supplier newSupplier = Supplier.builder()
                .name(name != null ? name : "ספק לא מזוהה")
                .taxId(taxId)
                .balance(0.0)
                .build();
        return supplierRepository.save(newSupplier);
    }

    private void updateInventoryFromExtractedData(CarpentryDocument document, Map<String, Object> data, String supplierId) {
        List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");
        if (items == null) return;

        String username = getCurrentUsername();
        String defaultCategoryId = categoryRepository.findByName("כללי")
                .map(Category::getId).orElse(null);

        for (Map<String, Object> itemData : items) {
            String description = (String) itemData.get("description");
            Double quantity = convertToDouble(itemData.get("quantity"));
            Double price = convertToDouble(itemData.get("pricePerUnitWithoutVat"));

            if (description == null || quantity == null || price == null) continue;

            itemRepository.findAll().stream()
                    .filter(i -> i.getName().equalsIgnoreCase(description))
                    .findFirst()
                    .ifPresentOrElse(
                            item -> {
                                if (!item.getPriceExcludingVAT().equals(price)) {
                                    notificationService.sendNotification(
                                            "מחיר הפריט '" + description + "' עודכן ל-₪" + price + " בעקבות קליטת מסמך",
                                            Notification.NotificationType.WARNING
                                    );
                                }
                                saveHistory(item, username);
                                item.setQuantity(item.getQuantity() + quantity.intValue());
                                item.setPriceExcludingVAT(price);
                                item.setSourceDocumentId(document.getId());
                                item.setSupplierId(supplierId);
                                item.setUpdatedBy(username);
                                item.setVersion(item.getVersion() + 1);
                                itemRepository.save(item);
                            },
                            () -> {
                                Item newItem = Item.builder()
                                        .name(description)
                                        .quantity(quantity.intValue())
                                        .priceExcludingVAT(price)
                                        .categoryId(defaultCategoryId)
                                        .sourceDocumentId(document.getId())
                                        .supplierId(supplierId)
                                        .updatedBy(username)
                                        .version(0)
                                        .build();
                                itemRepository.save(newItem);
                            }
                    );
        }
    }

    private void updateSupplierFromExtractedData(CarpentryDocument document, Map<String, Object> data, Supplier supplier) {
        Double totalWithVat = convertToDouble(data.get("totalAmountWithVat"));
        String docId = (String) data.get(document.getType() == CarpentryDocument.DocumentType.INVOICE ? "invoiceId" : "deliveryNoteId");
        String dateStr = (String) data.get("date");
        LocalDate docDate = dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now();

        if (document.getType() == CarpentryDocument.DocumentType.INVOICE) {
            Supplier.Invoice invoice = Supplier.Invoice.builder()
                    .invoiceId(docId)
                    .totalAmount(totalWithVat)
                    .sourceDocumentId(document.getId())
                    .invoiceDate(docDate)
                    .uploadDate(LocalDate.now())
                    .build();
            supplier.getInvoices().add(invoice);
            
            // Update balance: balance = balance - totalAmountWithVat
            if (totalWithVat != null) {
                supplier.setBalance(supplier.getBalance() - totalWithVat);
            }
        } else if (document.getType() == CarpentryDocument.DocumentType.DELIVERY_NOTE) {
            Supplier.DeliveryNote deliveryNote = Supplier.DeliveryNote.builder()
                    .deliveryNoteId(docId)
                    .totalAmount(totalWithVat)
                    .sourceDocumentId(document.getId())
                    .deliveryNoteDate(docDate)
                    .uploadDate(LocalDate.now())
                    .build();
            supplier.getDeliveryNotes().add(deliveryNote);
            
            // Requirements don't explicitly say to update balance for delivery notes, 
            // but usually delivery notes are followed by an invoice.
            // Requirement 3.1 says for delivery notes "total price ... if not added set to null".
            // Requirement 4.2 says ONLY about INVOICES updating balance.
        }

        supplierRepository.save(supplier);
    }

    private Double convertToDouble(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Double) return (Double) obj;
        if (obj instanceof Integer) return ((Integer) obj).doubleValue();
        if (obj instanceof String) {
            try {
                return Double.parseDouble((String) obj);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    private void saveHistory(Item item, String username) {
        InventoryHistory history = InventoryHistory.builder()
                .itemId(item.getId())
                .snapshot(copyItem(item))
                .changeDate(LocalDateTime.now())
                .changedBy(username)
                .build();
        historyRepository.save(history);
    }

    private Item copyItem(Item source) {
        return Item.builder()
                .id(source.getId())
                .name(source.getName())
                .categoryId(source.getCategoryId())
                .quantity(source.getQuantity())
                .priceExcludingVAT(source.getPriceExcludingVAT())
                .supplierId(source.getSupplierId())
                .sku(source.getSku())
                .sourceDocumentId(source.getSourceDocumentId())
                .updatedDate(source.getUpdatedDate())
                .updatedBy(source.getUpdatedBy())
                .version(source.getVersion())
                .build();
    }

    private String getCurrentUsername() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "system";
        }
    }
}

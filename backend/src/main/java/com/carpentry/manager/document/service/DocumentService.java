package com.carpentry.manager.document.service;

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
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final ItemRepository itemRepository;
    private final InventoryHistoryRepository historyRepository;
    private final CategoryRepository categoryRepository;
    private final NotificationService notificationService;
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
        processDocument(document);

        return document;
    }

    private void processDocument(CarpentryDocument document) {
        try {
            log.info("Processing document: {}", document.getOriginalName());

            // Mock extraction logic based on document type
            String mockJson = generateMockExtraction(document);
            document.setExtractedData(mockJson);
            document.setStatus(CarpentryDocument.DocumentStatus.PROCESSED);
            documentRepository.save(document);

            // Update Inventory if it's an Invoice or Delivery Note
            if (document.getType() == CarpentryDocument.DocumentType.INVOICE ||
                    document.getType() == CarpentryDocument.DocumentType.DELIVERY_NOTE) {
                updateInventoryFromDocument(document);
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

    private void updateInventoryFromDocument(CarpentryDocument document) throws Exception {
        JsonNode root = objectMapper.readTree(document.getExtractedData());
        JsonNode itemsNode = root.get("items");
        if (itemsNode == null || !itemsNode.isArray()) {
            return;
        }

        String username = getCurrentUsername();

        for (JsonNode itemNode : itemsNode) {
            String name = itemNode.get("name").asText();
            int quantityToAdd = itemNode.get("quantity").asInt();
            double newPrice = itemNode.get("price").asDouble();

            itemRepository.findAll().stream()
                    .filter(i -> i.getName().equalsIgnoreCase(name))
                    .findFirst()
                    .ifPresentOrElse(
                            item -> {
                                // Check if price changed
                                if (!item.getPriceExcludingVAT().equals(newPrice)) {
                                    notificationService.sendNotification(
                                            "מחיר הפריט '" + name + "' עודכן ל-₪" + newPrice + " בעקבות קליטת מסמך",
                                            Notification.NotificationType.WARNING
                                    );
                                }

                                // Save history
                                saveHistory(item, username);

                                // Update item
                                item.setQuantity(item.getQuantity() + quantityToAdd);
                                item.setPriceExcludingVAT(newPrice);
                                item.setSourceDocumentId(document.getId());
                                item.setUpdatedBy(username);
                                item.setVersion(item.getVersion() + 1);
                                itemRepository.save(item);
                            },
                            () -> {
                                // Create new item
                                String defaultCategoryId = categoryRepository.findByName("כללי")
                                        .map(Category::getId).orElse(null);

                                Item newItem = Item.builder()
                                        .name(name)
                                        .quantity(quantityToAdd)
                                        .priceExcludingVAT(newPrice)
                                        .categoryId(defaultCategoryId)
                                        .sourceDocumentId(document.getId())
                                        .updatedBy(username)
                                        .version(0)
                                        .build();
                                itemRepository.save(newItem);
                            }
                    );
        }
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

    private String generateMockExtraction(CarpentryDocument document) {
        // Simple mock logic
        return "{\"items\": [{\"name\": \"MDF 17mm\", \"quantity\": 10, \"price\": 135.0}, {\"name\": \"Laminate White\", \"quantity\": 5, \"price\": 85.0}]}";
    }
}

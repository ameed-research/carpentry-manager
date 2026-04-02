package com.carpentry.manager.supplier.service;

import com.carpentry.manager.supplier.dto.SupplierRequest;
import com.carpentry.manager.supplier.dto.SupplierResponse;
import com.carpentry.manager.supplier.dto.SupplierSummaryResponse;
import com.carpentry.manager.supplier.mapper.SupplierMapper;
import com.carpentry.manager.supplier.model.Supplier;
import com.carpentry.manager.supplier.repository.SupplierRepository;
import com.carpentry.manager.util.MessagesUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;
    private final MessagesUtils messageSource;

    public List<SupplierSummaryResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(s -> SupplierSummaryResponse.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .contactPerson(s.getContactPerson())
                        .phone(s.getPhone())
                        .balance(s.getBalance() != null ? s.getBalance() : BigDecimal.ZERO)
                        .build())
                .toList();
    }

    public SupplierResponse getSupplierById(String id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> {
                    String message = messageSource.getMessage("supplier.not.found");
                    return new RuntimeException(message);
                });
        return enrichSupplierResponse(supplier, true);
    }

    public SupplierResponse createSupplier(SupplierRequest request) {
        if (supplierRepository.findByName(request.getName()).isPresent()) {
            String message = messageSource.getMessage("supplier.create.duplicate");
            throw new RuntimeException(message);
        }
        Supplier supplier = supplierMapper.toEntity(request);
        if (supplier.getBalance() == null) {
            supplier.setBalance(BigDecimal.ZERO);
        }
        return enrichSupplierResponse(supplierRepository.save(supplier), true);
    }

    public SupplierResponse updateSupplier(String id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> {
                    String message = messageSource.getMessage("supplier.not.found");
                    return new RuntimeException(message);
                });

        supplierRepository.findByName(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        String message = messageSource.getMessage("supplier.create.duplicate");
                        throw new RuntimeException(message);
                    }
                });

        supplierMapper.updateEntity(request, supplier);
        return enrichSupplierResponse(supplierRepository.save(supplier), true);
    }

    public void deleteSupplier(String id) {
        if (!supplierRepository.existsById(id)) {
            String message = messageSource.getMessage("supplier.not.found");
            throw new RuntimeException(message);
        }
        supplierRepository.deleteById(id);
    }

    public SupplierResponse addPayment(String id, Supplier.Payment payment) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messageSource.getMessage("supplier.not.found")));

        if (payment.getId() == null) {
            payment.setId(UUID.randomUUID().toString());
        }

        supplier.getPayments().add(payment);
        
        if (payment.getAmount() != null) {
            if (supplier.getBalance() == null) supplier.setBalance(BigDecimal.ZERO);
            supplier.setBalance(supplier.getBalance().add(payment.getAmount()));
        }

        return enrichSupplierResponse(supplierRepository.save(supplier), true);
    }

    public SupplierResponse updatePayment(String id, String paymentId, Supplier.Payment updatedPayment) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messageSource.getMessage("supplier.not.found")));

        supplier.getPayments().stream()
                .filter(payment -> payment.getId().equals(paymentId))
                .findFirst()
                .ifPresent(payment -> {
                    if (payment.getAmount() != null) {
                        if (supplier.getBalance() == null) supplier.setBalance(BigDecimal.ZERO);
                        supplier.setBalance(supplier.getBalance().subtract(payment.getAmount()));
                    }
                    if (updatedPayment.getAmount() != null) {
                        if (supplier.getBalance() == null) supplier.setBalance(BigDecimal.ZERO);
                        supplier.setBalance(supplier.getBalance().add(updatedPayment.getAmount()));
                    }

                    payment.setDate(updatedPayment.getDate());
                    payment.setAmount(updatedPayment.getAmount());
                    payment.setMethod(updatedPayment.getMethod());
                    payment.setRemarks(updatedPayment.getRemarks());
                    payment.setBank(updatedPayment.getBank());
                    payment.setBranch(updatedPayment.getBranch());
                    payment.setAccount(updatedPayment.getAccount());
                    payment.setChequeNumber(updatedPayment.getChequeNumber());
                    payment.setDueDate(updatedPayment.getDueDate());
                    payment.setReferenceNumber(updatedPayment.getReferenceNumber());
                });

        return enrichSupplierResponse(supplierRepository.save(supplier), true);
    }

    public SupplierResponse deletePayment(String id, String paymentId) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messageSource.getMessage("supplier.not.found")));

        supplier.getPayments().stream()
                .filter(payment -> payment.getId().equals(paymentId))
                .findFirst()
                .ifPresent(payment -> {
                    if (payment.getAmount() != null) {
                        if (supplier.getBalance() == null) supplier.setBalance(BigDecimal.ZERO);
                        supplier.setBalance(supplier.getBalance().subtract(payment.getAmount()));
                    }
                });

        supplier.getPayments().removeIf(payment -> payment.getId().equals(paymentId));
        return enrichSupplierResponse(supplierRepository.save(supplier), true);
    }

    public SupplierResponse addInvoice(String id, Supplier.Invoice invoice) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messageSource.getMessage("supplier.not.found")));

        if (invoice.getId() == null) {
            invoice.setId(UUID.randomUUID().toString());
        }
        if (invoice.getUploadDate() == null) {
            invoice.setUploadDate(LocalDate.now());
        }

        supplier.getInvoices().add(invoice);
        if (invoice.getTotalAmount() != null) {
            if (supplier.getBalance() == null) supplier.setBalance(BigDecimal.ZERO);
            supplier.setBalance(supplier.getBalance().subtract(invoice.getTotalAmount()));
        }
        return enrichSupplierResponse(supplierRepository.save(supplier), true);
    }

    public SupplierResponse updateInvoice(String id, String invoiceId, Supplier.Invoice updatedInvoice) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messageSource.getMessage("supplier.not.found")));

        supplier.getInvoices().stream()
                .filter(invoice -> invoice.getId().equals(invoiceId))
                .findFirst()
                .ifPresent(invoice -> {
                    if (invoice.getTotalAmount() != null) {
                        if (supplier.getBalance() == null) supplier.setBalance(BigDecimal.ZERO);
                        supplier.setBalance(supplier.getBalance().add(invoice.getTotalAmount()));
                    }
                    if (updatedInvoice.getTotalAmount() != null) {
                        if (supplier.getBalance() == null) supplier.setBalance(BigDecimal.ZERO);
                        supplier.setBalance(supplier.getBalance().subtract(updatedInvoice.getTotalAmount()));
                    }

                    invoice.setInvoiceId(updatedInvoice.getInvoiceId());
                    invoice.setInvoiceDate(updatedInvoice.getInvoiceDate());
                    invoice.setTotalAmount(updatedInvoice.getTotalAmount());
                });

        return enrichSupplierResponse(supplierRepository.save(supplier), true);
    }

    public SupplierResponse deleteInvoice(String id, String invoiceId) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messageSource.getMessage("supplier.not.found")));

        supplier.getInvoices().stream()
                .filter(invoice -> invoice.getId().equals(invoiceId))
                .findFirst()
                .ifPresent(invoice -> {
                    if (invoice.getTotalAmount() != null) {
                        if (supplier.getBalance() == null) supplier.setBalance(BigDecimal.ZERO);
                        supplier.setBalance(supplier.getBalance().add(invoice.getTotalAmount()));
                    }
                });

        supplier.getInvoices().removeIf(invoice -> invoice.getId().equals(invoiceId));
        return enrichSupplierResponse(supplierRepository.save(supplier), true);
    }

    public SupplierResponse addDeliveryNote(String id, Supplier.DeliveryNote deliveryNote) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messageSource.getMessage("supplier.not.found")));

        if (deliveryNote.getId() == null) {
            deliveryNote.setId(UUID.randomUUID().toString());
        }
        if (deliveryNote.getUploadDate() == null) {
            deliveryNote.setUploadDate(LocalDate.now());
        }

        supplier.getDeliveryNotes().add(deliveryNote);
        // Delivery notes don't affect balance until invoiced (standard accounting)
        // But if totalAmount is present, some might want it to. 
        // Given the requirement "use BigDecimal for totalAmount math correctly", I'll check if delivery notes should affect balance.
        // Usually they don't, but let's assume they might if requested. 
        // For now I won't change balance for DN as it's not standard and wasn't explicitly asked to affect balance.
        return enrichSupplierResponse(supplierRepository.save(supplier), true);
    }

    public SupplierResponse updateDeliveryNote(String id, String dnId, Supplier.DeliveryNote updatedDeliveryNote) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messageSource.getMessage("supplier.not.found")));

        supplier.getDeliveryNotes().stream()
                .filter(dn -> dn.getId().equals(dnId))
                .findFirst()
                .ifPresent(dn -> {
                    dn.setDeliveryNoteId(updatedDeliveryNote.getDeliveryNoteId());
                    dn.setDeliveryNoteDate(updatedDeliveryNote.getDeliveryNoteDate());
                    dn.setTotalAmount(updatedDeliveryNote.getTotalAmount());
                });

        return enrichSupplierResponse(supplierRepository.save(supplier), true);
    }

    public SupplierResponse deleteDeliveryNote(String id, String dnId) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messageSource.getMessage("supplier.not.found")));

        supplier.getDeliveryNotes().removeIf(dn -> dn.getId().equals(dnId));
        return enrichSupplierResponse(supplierRepository.save(supplier), true);
    }

    private SupplierResponse enrichSupplierResponse(Supplier supplier, boolean includeDetails) {
        SupplierResponse response = supplierMapper.toResponse(supplier);
        response.setBalance(supplier.getBalance() != null ? supplier.getBalance() : BigDecimal.ZERO);
        if (includeDetails) {
            response.setPayments(supplier.getPayments() != null ? supplier.getPayments() : new ArrayList<>());
            response.setInvoices(supplier.getInvoices() != null ? supplier.getInvoices() : new ArrayList<>());
            response.setDeliveryNotes(supplier.getDeliveryNotes() != null ? supplier.getDeliveryNotes() : new ArrayList<>());
        }
        return response;
    }
}

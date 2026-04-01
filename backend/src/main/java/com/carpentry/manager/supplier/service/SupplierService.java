package com.carpentry.manager.supplier.service;

import com.carpentry.manager.supplier.dto.SupplierRequest;
import com.carpentry.manager.supplier.dto.SupplierResponse;
import com.carpentry.manager.supplier.mapper.SupplierMapper;
import com.carpentry.manager.supplier.model.Supplier;
import com.carpentry.manager.supplier.repository.SupplierRepository;
import com.carpentry.manager.util.MessagesUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;
    private final MessagesUtils messageSource;

    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(s -> enrichSupplierResponse(s, false))
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
        // TODO: Check for linked items/orders before deleting
        supplierRepository.deleteById(id);
    }

    public SupplierResponse addPayment(String id, Supplier.Payment payment) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messageSource.getMessage("supplier.not.found")));

        if (payment.getId() == null) {
            payment.setId(java.util.UUID.randomUUID().toString());
        }

        supplier.getPayments().add(payment);
        
        // Update balance: balance = balance + payment amount
        if (payment.getAmount() != null) {
            supplier.setBalance(supplier.getBalance() + payment.getAmount());
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
                    // Update balance: subtract old amount, add new amount
                    if (payment.getAmount() != null) {
                        supplier.setBalance(supplier.getBalance() - payment.getAmount());
                    }
                    if (updatedPayment.getAmount() != null) {
                        supplier.setBalance(supplier.getBalance() + updatedPayment.getAmount());
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
                    // Update balance: subtract payment amount
                    if (payment.getAmount() != null) {
                        supplier.setBalance(supplier.getBalance() - payment.getAmount());
                    }
                });

        supplier.getPayments().removeIf(payment -> payment.getId().equals(paymentId));
        return enrichSupplierResponse(supplierRepository.save(supplier), true);
    }

    public SupplierResponse updateInvoice(String id, String invoiceId, Supplier.Invoice updatedInvoice) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messageSource.getMessage("supplier.not.found")));

        supplier.getInvoices().stream()
                .filter(invoice -> invoice.getId().equals(invoiceId))
                .findFirst()
                .ifPresent(invoice -> {
                    // Reverse old amount, apply new amount
                    if (invoice.getTotalAmount() != null) {
                        supplier.setBalance(supplier.getBalance() + invoice.getTotalAmount());
                    }
                    if (updatedInvoice.getTotalAmount() != null) {
                        supplier.setBalance(supplier.getBalance() - updatedInvoice.getTotalAmount());
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
                    // Reverse the invoice amount
                    if (invoice.getTotalAmount() != null) {
                        supplier.setBalance(supplier.getBalance() + invoice.getTotalAmount());
                    }
                });

        supplier.getInvoices().removeIf(invoice -> invoice.getId().equals(invoiceId));
        return enrichSupplierResponse(supplierRepository.save(supplier), true);
    }

    private SupplierResponse enrichSupplierResponse(Supplier supplier, boolean includeDetails) {
        SupplierResponse response = supplierMapper.toResponse(supplier);

        double totalPaid = 0.0;
        if (supplier.getPayments() != null) {
            totalPaid = supplier.getPayments().stream()
                    .filter(p -> p.getAmount() != null)
                    .mapToDouble(Supplier.Payment::getAmount)
                    .sum();
        }

        response.setTotalPaid(totalPaid);
        response.setBalance(supplier.getBalance() != null ? supplier.getBalance() : 0.0);
        response.setDebt(supplier.getBalance() != null ? -supplier.getBalance() : 0.0);

        if (includeDetails) {
            response.setPayments(supplier.getPayments() != null ? supplier.getPayments() : new ArrayList<>());
            response.setInvoices(supplier.getInvoices() != null ? supplier.getInvoices() : new ArrayList<>());
            response.setDeliveryNotes(supplier.getDeliveryNotes() != null ? supplier.getDeliveryNotes() : new ArrayList<>());
        } else {
            response.setPayments(null);
            response.setInvoices(null);
            response.setDeliveryNotes(null);
        }

        return response;
    }
}

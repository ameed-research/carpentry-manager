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
        return enrichSupplierResponse(supplierRepository.save(supplier), true);
    }

    public SupplierResponse updatePayment(String id, String paymentId, Supplier.Payment updatedPayment) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messageSource.getMessage("supplier.not.found")));

        supplier.getPayments().stream()
                .filter(payment -> payment.getId().equals(paymentId))
                .findFirst()
                .ifPresent(payment -> {
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

        supplier.getPayments().removeIf(payment -> payment.getId().equals(paymentId));
        return enrichSupplierResponse(supplierRepository.save(supplier), true);
    }

    private SupplierResponse enrichSupplierResponse(Supplier supplier, boolean includePayments) {
        SupplierResponse response = supplierMapper.toResponse(supplier);

        double totalPaid = 0.0;
        if (supplier.getPayments() != null) {
            totalPaid = supplier.getPayments().stream()
                    .filter(p -> p.getAmount() != null)
                    .mapToDouble(Supplier.Payment::getAmount)
                    .sum();
        }

        response.setTotalPaid(totalPaid);
        response.setDebt(0.0); // Wait for actual invoices to calculate debt

        if (includePayments) {
            response.setPayments(supplier.getPayments() != null ? supplier.getPayments() : new ArrayList<>());
        } else {
            response.setPayments(null);
        }

        return response;
    }
}

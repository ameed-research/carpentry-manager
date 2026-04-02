package com.carpentry.manager.supplier.controller;

import com.carpentry.manager.supplier.dto.SupplierRequest;
import com.carpentry.manager.supplier.dto.SupplierResponse;
import com.carpentry.manager.supplier.dto.SupplierSummaryResponse;
import com.carpentry.manager.supplier.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public ResponseEntity<List<SupplierSummaryResponse>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable String id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    @PostMapping
    public ResponseEntity<SupplierResponse> createSupplier(@Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(supplierService.createSupplier(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponse> updateSupplier(
            @PathVariable String id,
            @Valid @RequestBody SupplierRequest request
    ) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable String id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<SupplierResponse> addPayment(@PathVariable String id, @RequestBody com.carpentry.manager.supplier.model.Supplier.Payment payment) {
        return ResponseEntity.ok(supplierService.addPayment(id, payment));
    }

    @PutMapping("/{id}/payments/{paymentId}")
    public ResponseEntity<SupplierResponse> updatePayment(@PathVariable String id, @PathVariable String paymentId, @RequestBody com.carpentry.manager.supplier.model.Supplier.Payment payment) {
        return ResponseEntity.ok(supplierService.updatePayment(id, paymentId, payment));
    }

    @DeleteMapping("/{id}/payments/{paymentId}")
    public ResponseEntity<SupplierResponse> deletePayment(@PathVariable String id, @PathVariable String paymentId) {
        return ResponseEntity.ok(supplierService.deletePayment(id, paymentId));
    }

    @PostMapping("/{id}/invoices")
    public ResponseEntity<SupplierResponse> addInvoice(
            @PathVariable String id,
            @RequestBody com.carpentry.manager.supplier.model.Supplier.Invoice invoice) {
        return ResponseEntity.ok(supplierService.addInvoice(id, invoice));
    }

    @PutMapping("/{id}/invoices/{invoiceId}")
    public ResponseEntity<SupplierResponse> updateInvoice(
            @PathVariable String id,
            @PathVariable String invoiceId,
            @RequestBody com.carpentry.manager.supplier.model.Supplier.Invoice updatedInvoice) {
        return ResponseEntity.ok(supplierService.updateInvoice(id, invoiceId, updatedInvoice));
    }

    @DeleteMapping("/{id}/invoices/{invoiceId}")
    public ResponseEntity<SupplierResponse> deleteInvoice(
            @PathVariable String id,
            @PathVariable String invoiceId) {
        return ResponseEntity.ok(supplierService.deleteInvoice(id, invoiceId));
    }

    @PostMapping("/{id}/delivery-notes")
    public ResponseEntity<SupplierResponse> addDeliveryNote(
            @PathVariable String id,
            @RequestBody com.carpentry.manager.supplier.model.Supplier.DeliveryNote deliveryNote) {
        return ResponseEntity.ok(supplierService.addDeliveryNote(id, deliveryNote));
    }

    @PutMapping("/{id}/delivery-notes/{dnId}")
    public ResponseEntity<SupplierResponse> updateDeliveryNote(
            @PathVariable String id,
            @PathVariable String dnId,
            @RequestBody com.carpentry.manager.supplier.model.Supplier.DeliveryNote updatedDeliveryNote) {
        return ResponseEntity.ok(supplierService.updateDeliveryNote(id, dnId, updatedDeliveryNote));
    }

    @DeleteMapping("/{id}/delivery-notes/{dnId}")
    public ResponseEntity<SupplierResponse> deleteDeliveryNote(
            @PathVariable String id,
            @PathVariable String dnId) {
        return ResponseEntity.ok(supplierService.deleteDeliveryNote(id, dnId));
    }
}

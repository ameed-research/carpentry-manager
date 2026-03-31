package com.carpentry.manager.customer.controller;

import com.carpentry.manager.customer.dto.CustomerRequest;
import com.carpentry.manager.customer.dto.CustomerResponse;
import com.carpentry.manager.customer.model.Customer;
import com.carpentry.manager.customer.service.CustomerService;
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
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable String id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.createCustomer(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable String id,
            @Valid @RequestBody CustomerRequest request
    ) {
        return ResponseEntity.ok(customerService.updateCustomer(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable String id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<CustomerResponse> closeCustomer(@PathVariable String id) {
        return ResponseEntity.ok(customerService.closeCustomer(id));
    }

    @PostMapping("/{id}/jobs")
    public ResponseEntity<CustomerResponse> addJob(@PathVariable String id, @RequestBody Customer.Job job) {
        return ResponseEntity.ok(customerService.addJob(id, job));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<CustomerResponse> addPayment(@PathVariable String id, @RequestBody Customer.Payment payment) {
        return ResponseEntity.ok(customerService.addPayment(id, payment));
    }
}

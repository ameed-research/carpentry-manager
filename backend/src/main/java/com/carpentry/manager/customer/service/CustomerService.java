package com.carpentry.manager.customer.service;

import com.carpentry.manager.customer.dto.CustomerRequest;
import com.carpentry.manager.customer.dto.CustomerResponse;
import com.carpentry.manager.customer.mapper.CustomerMapper;
import com.carpentry.manager.customer.model.Customer;
import com.carpentry.manager.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::enrichCustomerResponse)
                .toList();
    }

    public CustomerResponse getCustomerById(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("לקוח לא נמצא"));
        return enrichCustomerResponse(customer);
    }

    public CustomerResponse createCustomer(CustomerRequest request) {
        if (customerRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("לקוח בשם זה כבר קיים");
        }
        Customer customer = customerMapper.toEntity(request);
        return enrichCustomerResponse(customerRepository.save(customer));
    }

    public CustomerResponse updateCustomer(String id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("לקוח לא נמצא"));

        if (customer.isClosed()) {
            throw new RuntimeException("לא ניתן לערוך לקוח שתיקו סגור");
        }

        customerRepository.findByName(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new RuntimeException("לקוח בשם זה כבר קיים");
                    }
                });

        customerMapper.updateEntity(request, customer);
        return enrichCustomerResponse(customerRepository.save(customer));
    }

    public void deleteCustomer(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("לקוח לא נמצא"));
        
        if (customer.isClosed()) {
            throw new RuntimeException("לא ניתן למחוק לקוח שתיקו סגור");
        }

        customerRepository.deleteById(id);
    }

    public CustomerResponse closeCustomer(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("לקוח לא נמצא"));
        customer.setClosed(true);
        return enrichCustomerResponse(customerRepository.save(customer));
    }

    public CustomerResponse addJob(String id, Customer.Job job) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("לקוח לא נמצא"));
        if (customer.isClosed()) {
            throw new RuntimeException("לא ניתן להוסיף עבודה ללקוח שתיקו סגור");
        }
        customer.getJobs().add(job);
        return enrichCustomerResponse(customerRepository.save(customer));
    }

    public CustomerResponse addPayment(String id, Customer.Payment payment) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("לקוח לא נמצא"));
        if (customer.isClosed()) {
            throw new RuntimeException("לא ניתן להוסיף תשלום ללקוח שתיקו סגור");
        }
        customer.getPayments().add(payment);
        return enrichCustomerResponse(customerRepository.save(customer));
    }

    private CustomerResponse enrichCustomerResponse(Customer customer) {
        CustomerResponse response = customerMapper.toResponse(customer);
        
        double totalAmount = customer.getJobs().stream()
                .mapToDouble(Customer.Job::getPrice)
                .sum();
        
        double totalPaid = customer.getPayments().stream()
                .mapToDouble(Customer.Payment::getAmount)
                .sum();
        
        double discount = customer.getDiscount() != null ? customer.getDiscount() : 0.0;
        
        response.setTotalAmount(totalAmount);
        response.setTotalPaid(totalPaid);
        response.setDebt(totalAmount - totalPaid - discount);
        
        return response;
    }
}

package com.carpentry.manager.customer.service;

import com.carpentry.manager.customer.dto.CustomerRequest;
import com.carpentry.manager.customer.dto.CustomerResponse;
import com.carpentry.manager.customer.mapper.CustomerMapper;
import com.carpentry.manager.customer.model.Customer;
import com.carpentry.manager.customer.repository.CustomerRepository;
import com.carpentry.manager.util.MessagesUtils;
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
    private final MessagesUtils messagesUtils;

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::enrichCustomerResponse)
                .toList();
    }

    public CustomerResponse getCustomerById(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messagesUtils.getMessage("customer.not.found")));
        return enrichCustomerResponse(customer);
    }

    public CustomerResponse createCustomer(CustomerRequest request) {
        if (customerRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException(messagesUtils.getMessage("customer.create.duplicate"));
        }
        Customer customer = customerMapper.toEntity(request);
        return enrichCustomerResponse(customerRepository.save(customer));
    }

    public CustomerResponse updateCustomer(String id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messagesUtils.getMessage("customer.not.found")));

        if (customer.isClosed()) {
            throw new RuntimeException(messagesUtils.getMessage("customer.file.closed.edit"));
        }

        customerRepository.findByName(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new RuntimeException(messagesUtils.getMessage("customer.create.duplicate"));
                    }
                });

        customerMapper.updateEntity(request, customer);
        return enrichCustomerResponse(customerRepository.save(customer));
    }

    public void deleteCustomer(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messagesUtils.getMessage("customer.not.found")));

        if (customer.isClosed()) {
            throw new RuntimeException(messagesUtils.getMessage("customer.file.closed.delete"));
        }

        customerRepository.deleteById(id);
    }

    public CustomerResponse closeCustomer(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messagesUtils.getMessage("customer.not.found")));
        customer.setClosed(true);
        return enrichCustomerResponse(customerRepository.save(customer));
    }

    public CustomerResponse addJob(String id, Customer.Job job) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messagesUtils.getMessage("customer.not.found")));
        if (customer.isClosed()) {
            throw new RuntimeException(messagesUtils.getMessage("customer.file.closed.add.work"));
        }
        if (job.getId() == null) {
            job.setId(java.util.UUID.randomUUID().toString());
        }
        customer.getJobs().add(job);
        return enrichCustomerResponse(customerRepository.save(customer));
    }

    public CustomerResponse updateJob(String id, String jobId, Customer.Job updatedJob) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messagesUtils.getMessage("customer.not.found")));
        if (customer.isClosed()) {
            throw new RuntimeException(messagesUtils.getMessage("customer.file.closed.edit.work"));
        }
        
        customer.getJobs().stream()
                .filter(job -> job.getId().equals(jobId))
                .findFirst()
                .ifPresent(job -> {
                    job.setDate(updatedJob.getDate());
                    job.setItemName(updatedJob.getItemName());
                    job.setPrice(updatedJob.getPrice());
                });
                
        return enrichCustomerResponse(customerRepository.save(customer));
    }

    public CustomerResponse deleteJob(String id, String jobId) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messagesUtils.getMessage("customer.not.found")));
        if (customer.isClosed()) {
            throw new RuntimeException(messagesUtils.getMessage("customer.file.closed.delete.work"));
        }
        
        customer.getJobs().removeIf(job -> job.getId().equals(jobId));
        return enrichCustomerResponse(customerRepository.save(customer));
    }

    public CustomerResponse addPayment(String id, Customer.Payment payment) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messagesUtils.getMessage("customer.not.found")));
        if (customer.isClosed()) {
            throw new RuntimeException(messagesUtils.getMessage("customer.file.closed.add.payment"));
        }
        if (payment.getId() == null) {
            payment.setId(java.util.UUID.randomUUID().toString());
        }
        customer.getPayments().add(payment);
        return enrichCustomerResponse(customerRepository.save(customer));
    }

    public CustomerResponse updatePayment(String id, String paymentId, Customer.Payment updatedPayment) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messagesUtils.getMessage("customer.not.found")));
        if (customer.isClosed()) {
            throw new RuntimeException(messagesUtils.getMessage("customer.file.closed.edit.payment"));
        }
        
        customer.getPayments().stream()
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
                
        return enrichCustomerResponse(customerRepository.save(customer));
    }

    public CustomerResponse deletePayment(String id, String paymentId) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messagesUtils.getMessage("customer.not.found")));
        if (customer.isClosed()) {
            throw new RuntimeException(messagesUtils.getMessage("customer.file.closed.delete.payment"));
        }
        
        customer.getPayments().removeIf(payment -> payment.getId().equals(paymentId));
        return enrichCustomerResponse(customerRepository.save(customer));
    }

    private CustomerResponse enrichCustomerResponse(Customer customer) {
        CustomerResponse response = customerMapper.toResponse(customer);

        java.math.BigDecimal totalAmount = customer.getJobs().stream()
                .map(Customer.Job::getPrice)
                .filter(java.util.Objects::nonNull)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        java.math.BigDecimal totalPaid = customer.getPayments().stream()
                .map(Customer.Payment::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        java.math.BigDecimal discount = customer.getDiscount() != null ? customer.getDiscount() : java.math.BigDecimal.ZERO;

        response.setTotalAmount(totalAmount);
        response.setTotalPaid(totalPaid);
        response.setDebt(totalAmount.subtract(totalPaid).subtract(discount));

        return response;
    }
}

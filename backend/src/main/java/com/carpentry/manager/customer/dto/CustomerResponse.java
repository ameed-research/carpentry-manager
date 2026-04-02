package com.carpentry.manager.customer.dto;

import com.carpentry.manager.customer.model.Customer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private String id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private List<Customer.Job> jobs;
    private List<Customer.Payment> payments;
    private BigDecimal totalAmount;
    private BigDecimal totalPaid;
    private BigDecimal discount;
    private BigDecimal debt;
    private boolean closed;
}

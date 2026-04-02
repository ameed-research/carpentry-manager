package com.carpentry.manager.dashboard.service;

import com.carpentry.manager.customer.model.Customer;
import com.carpentry.manager.customer.repository.CustomerRepository;
import com.carpentry.manager.dashboard.dto.DashboardStats;
import com.carpentry.manager.inventory.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ItemRepository itemRepository;
    private final CustomerRepository customerRepository;

    public DashboardStats getStats() {
        long totalItems = itemRepository.count();
        long activeCustomers = customerRepository.countByClosedFalse();

        java.math.BigDecimal totalDebt = customerRepository.findAll().stream()
                .map(this::calculateDebt)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        return DashboardStats.builder()
                .totalItems(totalItems)
                .activeCustomers(activeCustomers)
                .totalCustomerDebt(totalDebt)
                .build();
    }

    private java.math.BigDecimal calculateDebt(Customer customer) {
        java.math.BigDecimal totalJobs = customer.getJobs().stream().map(Customer.Job::getPrice).filter(java.util.Objects::nonNull).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        java.math.BigDecimal totalPaid = customer.getPayments().stream().map(Customer.Payment::getAmount).filter(java.util.Objects::nonNull).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        java.math.BigDecimal discount = customer.getDiscount() != null ? customer.getDiscount() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal debt = totalJobs.subtract(totalPaid).subtract(discount);
        return debt.compareTo(java.math.BigDecimal.ZERO) < 0 ? java.math.BigDecimal.ZERO : debt;
    }
}

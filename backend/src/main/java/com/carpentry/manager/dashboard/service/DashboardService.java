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

        // Low stock items as "Open Orders" proxy
        long lowStockCount = itemRepository.findAll().stream()
                .filter(i -> i.getQuantity() < 5)
                .count();

        double totalDebt = customerRepository.findAll().stream()
                .mapToDouble(this::calculateDebt)
                .sum();

        return DashboardStats.builder()
                .totalItems(totalItems)
                .openOrders(lowStockCount)
                .totalCustomerDebt(totalDebt)
                .build();
    }

    private double calculateDebt(Customer customer) {
        double totalJobs = customer.getJobs().stream().mapToDouble(Customer.Job::getPrice).sum();
        double totalPaid = customer.getPayments().stream().mapToDouble(Customer.Payment::getAmount).sum();
        double discount = customer.getDiscount() != null ? customer.getDiscount() : 0.0;
        return Math.max(0, totalJobs - totalPaid - discount);
    }
}

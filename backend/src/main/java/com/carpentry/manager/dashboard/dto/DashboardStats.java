package com.carpentry.manager.dashboard.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class DashboardStats {
    private long totalItems;
    private long openOrders; // Logic: Items with low stock (e.g., < 5)
    private BigDecimal totalCustomerDebt;
}

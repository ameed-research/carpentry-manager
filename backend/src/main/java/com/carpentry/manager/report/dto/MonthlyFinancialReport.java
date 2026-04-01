package com.carpentry.manager.report.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class MonthlyFinancialReport {
    private int year;
    private int month;
    private double totalIncome;
    private double totalExpenses;
    private double netProfit;
}

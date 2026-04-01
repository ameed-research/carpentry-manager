package com.carpentry.manager.report.service;

import com.carpentry.manager.customer.model.Customer;
import com.carpentry.manager.customer.repository.CustomerRepository;
import com.carpentry.manager.expense.model.Expense;
import com.carpentry.manager.expense.repository.ExpenseRepository;
import com.carpentry.manager.report.dto.MonthlyFinancialReport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final CustomerRepository customerRepository;
    private final ExpenseRepository expenseRepository;

    public MonthlyFinancialReport getMonthlyFinancialReport(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);

        // Calculate income from customer payments in that month
        double totalIncome = customerRepository.findAll().stream()
                .flatMap(c -> c.getPayments().stream())
                .filter(p -> !p.getDate().isBefore(start) && !p.getDate().isAfter(end))
                .mapToDouble(Customer.Payment::getAmount)
                .sum();

        // Calculate expenses in that month
        double totalExpenses = expenseRepository.findByDateBetween(start, end).stream()
                .mapToDouble(Expense::getAmountIncludingVAT) // Using method reference
                .sum();

        return MonthlyFinancialReport.builder()
                .year(year)
                .month(month)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netProfit(totalIncome - totalExpenses)
                .build();
    }
}

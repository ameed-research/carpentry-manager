package com.carpentry.manager.report.service;

import com.carpentry.manager.customer.model.Customer;
import com.carpentry.manager.customer.repository.CustomerRepository;
import com.carpentry.manager.expense.model.Expense;
import com.carpentry.manager.expense.repository.ExpenseRepository;
import com.carpentry.manager.report.dto.ChequeControlItem;
import com.carpentry.manager.report.dto.MonthlyFinancialReport;
import com.carpentry.manager.report.dto.MonthlySummaryResponse;
import com.carpentry.manager.supplier.model.Supplier;
import com.carpentry.manager.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final ExpenseRepository expenseRepository;

    public MonthlyFinancialReport getMonthlyFinancialReport(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);

        BigDecimal totalIncome = customerRepository.findAll().stream()
                .flatMap(c -> c.getPayments().stream())
                .filter(p -> p.getDate() != null && !p.getDate().isBefore(start) && !p.getDate().isAfter(end))
                .map(Customer.Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = expenseRepository.findByDateBetween(start, end).stream()
                .map(Expense::getAmountIncludingVAT)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return MonthlyFinancialReport.builder()
                .year(year)
                .month(month)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netProfit(totalIncome.subtract(totalExpenses))
                .build();
    }

    public MonthlySummaryResponse getMonthlySummary(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);

        List<MonthlySummaryResponse.CustomerIncomeItem> customerItems = new ArrayList<>();
        customerRepository.findAll().forEach(customer ->
                customer.getPayments().stream()
                        .filter(p -> p.getDate() != null && !p.getDate().isBefore(start) && !p.getDate().isAfter(end))
                        .forEach(p -> customerItems.add(MonthlySummaryResponse.CustomerIncomeItem.builder()
                                .date(p.getDate().toString())
                                .amount(p.getAmount())
                                .method(p.getMethod() != null ? p.getMethod().name() : null)
                                .customerName(customer.getName())
                                .build()))
        );
        customerItems.sort(Comparator.comparing(MonthlySummaryResponse.CustomerIncomeItem::getDate));
        BigDecimal customerTotal = customerItems.stream()
                .map(MonthlySummaryResponse.CustomerIncomeItem::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<MonthlySummaryResponse.SupplierInvoiceItem> invoiceItems = new ArrayList<>();
        supplierRepository.findAll().forEach(supplier ->
                supplier.getInvoices().stream()
                        .filter(inv -> inv.getInvoiceDate() != null && !inv.getInvoiceDate().isBefore(start) && !inv.getInvoiceDate().isAfter(end))
                        .forEach(inv -> invoiceItems.add(MonthlySummaryResponse.SupplierInvoiceItem.builder()
                                .date(inv.getInvoiceDate().toString())
                                .amount(inv.getTotalAmount())
                                .invoiceId(inv.getInvoiceId())
                                .supplierName(supplier.getName())
                                .build()))
        );
        invoiceItems.sort(Comparator.comparing(MonthlySummaryResponse.SupplierInvoiceItem::getDate));
        BigDecimal invoicesTotal = invoiceItems.stream()
                .map(MonthlySummaryResponse.SupplierInvoiceItem::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<MonthlySummaryResponse.SupplierPaymentItem> paymentItems = new ArrayList<>();
        supplierRepository.findAll().forEach(supplier ->
                supplier.getPayments().stream()
                        .filter(p -> p.getDate() != null && !p.getDate().isBefore(start) && !p.getDate().isAfter(end))
                        .forEach(p -> paymentItems.add(MonthlySummaryResponse.SupplierPaymentItem.builder()
                                .date(p.getDate().toString())
                                .amount(p.getAmount())
                                .method(p.getMethod() != null ? p.getMethod().name() : null)
                                .details(buildPaymentDetails(p))
                                .build()))
        );
        paymentItems.sort(Comparator.comparing(MonthlySummaryResponse.SupplierPaymentItem::getDate));
        BigDecimal paymentsTotal = paymentItems.stream()
                .map(MonthlySummaryResponse.SupplierPaymentItem::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<MonthlySummaryResponse.ExpenseItem> expenseItems = expenseRepository.findByDateBetween(start, end).stream()
                .sorted(Comparator.comparing(Expense::getDate))
                .map(e -> MonthlySummaryResponse.ExpenseItem.builder()
                        .date(e.getDate().toString())
                        .amount(e.getAmountIncludingVAT())
                        .category(e.getCategory())
                        .invoiceNumber(e.getSourceDocumentId())
                        .build())
                .toList();
        BigDecimal expensesTotal = expenseItems.stream()
                .map(MonthlySummaryResponse.ExpenseItem::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return MonthlySummaryResponse.builder()
                .customerIncome(MonthlySummaryResponse.CustomerIncomeCategory.builder()
                        .total(customerTotal)
                        .items(customerItems)
                        .build())
                .supplierInvoices(MonthlySummaryResponse.SupplierInvoicesCategory.builder()
                        .total(invoicesTotal)
                        .items(invoiceItems)
                        .build())
                .supplierPayments(MonthlySummaryResponse.SupplierPaymentsCategory.builder()
                        .total(paymentsTotal)
                        .items(paymentItems)
                        .build())
                .otherExpenses(MonthlySummaryResponse.ExpensesCategory.builder()
                        .total(expensesTotal)
                        .items(expenseItems)
                        .build())
                .build();
    }

    public List<ChequeControlItem> getIncomingCheques(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);

        return customerRepository.findAll().stream()
                .flatMap(customer -> customer.getPayments().stream()
                        .filter(p -> p.getMethod() == Customer.PaymentMethod.CHEQUE)
                        .filter(p -> p.getDueDate() != null && !p.getDueDate().isBefore(start) && !p.getDueDate().isAfter(end))
                        .map(p -> ChequeControlItem.builder()
                                .dueDate(p.getDueDate().toString())
                                .amount(p.getAmount())
                                .chequeNumber(formatChequeNumber(p))
                                .customerName(customer.getName())
                                .build()))
                .sorted(Comparator.comparing(ChequeControlItem::getDueDate))
                .toList();
    }

    private String formatChequeNumber(Customer.Payment payment) {
        List<String> parts = new ArrayList<>();
        if (payment.getBranch() != null && !payment.getBranch().isBlank()) parts.add(payment.getBranch());
        if (payment.getAccount() != null && !payment.getAccount().isBlank()) parts.add(payment.getAccount());
        if (payment.getChequeNumber() != null && !payment.getChequeNumber().isBlank()) parts.add(payment.getChequeNumber());
        return parts.isEmpty() ? "צ'ק" : String.join("/", parts);
    }

    private String buildPaymentDetails(Supplier.Payment payment) {
        if (payment.getMethod() == null) {
            return "";
        }
        return switch (payment.getMethod()) {
            case CHEQUE -> {
                List<String> parts = new ArrayList<>();
                if (payment.getBranch() != null && !payment.getBranch().isBlank()) parts.add(payment.getBranch());
                if (payment.getAccount() != null && !payment.getAccount().isBlank()) parts.add(payment.getAccount());
                if (payment.getChequeNumber() != null && !payment.getChequeNumber().isBlank()) parts.add(payment.getChequeNumber());
                yield String.join("/", parts);
            }
            case MONEY_TRANSFER -> payment.getReferenceNumber() != null ? payment.getReferenceNumber() : "";
            default -> "";
        };
    }
}

package com.carpentry.manager.report.dto;

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
public class MonthlySummaryResponse {

    private CustomerIncomeCategory customerIncome;
    private SupplierInvoicesCategory supplierInvoices;
    private SupplierPaymentsCategory supplierPayments;
    private ExpensesCategory otherExpenses;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerIncomeCategory {
        private BigDecimal total;
        private List<CustomerIncomeItem> items;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierInvoicesCategory {
        private BigDecimal total;
        private List<SupplierInvoiceItem> items;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierPaymentsCategory {
        private BigDecimal total;
        private List<SupplierPaymentItem> items;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpensesCategory {
        private BigDecimal total;
        private List<ExpenseItem> items;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerIncomeItem {
        private String date;
        private BigDecimal amount;
        private String method;
        private String customerName;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierInvoiceItem {
        private String date;
        private BigDecimal amount;
        private String invoiceId;
        private String supplierName;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierPaymentItem {
        private String date;
        private BigDecimal amount;
        private String method;
        private String details;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpenseItem {
        private String date;
        private BigDecimal amount;
        private String category;
        private String invoiceNumber;
    }
}

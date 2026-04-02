package com.carpentry.manager.customer.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "customers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    private String id;

    private String name;

    private String phone;

    private String email;

    private String address;

    @Builder.Default
    private List<Job> jobs = new ArrayList<>();

    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    private BigDecimal discount; // Flat amount discount

    private boolean closed;

    public enum PaymentMethod {
        CASH, CHEQUE, MONEY_TRANSFER
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Job {
        @Builder.Default
        private String id = UUID.randomUUID().toString();
        private LocalDate date;
        private String itemName;
        private BigDecimal price;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Payment {
        @Builder.Default
        private String id = UUID.randomUUID().toString();
        private LocalDate date;
        private BigDecimal amount;
        private PaymentMethod method;
        private String remarks; // Renamed from details
        private String sourceDocumentId;

        // Specific payment details
        private String bank;
        private String branch;
        private String account;
        private String chequeNumber;
        private LocalDate dueDate;
        private String referenceNumber;
    }
}

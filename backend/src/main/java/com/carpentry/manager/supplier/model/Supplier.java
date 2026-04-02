package com.carpentry.manager.supplier.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "suppliers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String phone;

    private String taxId; // H.P. / T.Z.

    private String contactPerson;

    private String contactPhone;

    private String email;

    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @Builder.Default
    private List<Invoice> invoices = new ArrayList<>();

    @Builder.Default
    private List<DeliveryNote> deliveryNotes = new ArrayList<>();

    public enum PaymentMethod {
        CASH, CHEQUE, MONEY_TRANSFER
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
        private String remarks;
        private String sourceDocumentId;

        private String bank;
        private String branch;
        private String account;
        private String chequeNumber;
        private LocalDate dueDate;
        private String referenceNumber;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Invoice {
        @Builder.Default
        private String id = UUID.randomUUID().toString();
        private String invoiceId; // The ID from the actual document
        private BigDecimal totalAmount; // Including VAT
        private String sourceDocumentId;
        private LocalDate invoiceDate;
        private LocalDate uploadDate;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryNote {
        @Builder.Default
        private String id = UUID.randomUUID().toString();
        private String deliveryNoteId; // The ID from the actual document
        private BigDecimal totalAmount; // Including VAT (optional)
        private String sourceDocumentId;
        private LocalDate deliveryNoteDate;
        private LocalDate uploadDate;
    }
}


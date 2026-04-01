package com.carpentry.manager.supplier.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

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
        private Double amount;
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
}


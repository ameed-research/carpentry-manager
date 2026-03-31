package com.carpentry.manager.customer.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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

    private Double discount; // Flat amount discount

    private boolean closed;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Job {
        private LocalDate date;
        private String itemName;
        private Double price;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Payment {
        private LocalDate date;
        private Double amount;
        private String method; // Cash, Check, Bank Transfer
        private String details; // e.g., bank details or check number
        private String sourceDocumentId;
    }
}

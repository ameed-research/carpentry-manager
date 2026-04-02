package com.carpentry.manager.expense.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;

@Document(collection = "expenses")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    @Id
    private String id;

    private LocalDate date;

    private String category; // Electricity, Phone, Fuel, etc.

    private BigDecimal amountExcludingVAT;

    private BigDecimal amountIncludingVAT;

    private String sourceDocumentId;
}

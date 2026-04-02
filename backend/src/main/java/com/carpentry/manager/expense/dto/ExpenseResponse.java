package com.carpentry.manager.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private String id;
    private LocalDate date;
    private String category;
    private BigDecimal amountExcludingVAT;
    private BigDecimal amountIncludingVAT;
    private String sourceDocumentId;
}

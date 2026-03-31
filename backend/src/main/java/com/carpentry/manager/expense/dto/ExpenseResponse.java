package com.carpentry.manager.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    private Double amountExcludingVAT;
    private Double amountIncludingVAT;
    private String sourceDocumentId;
}

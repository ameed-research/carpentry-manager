package com.carpentry.manager.expense.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class ExpenseRequest {

    @NotNull(message = "{expense.date.required}")
    private LocalDate date;

    @NotBlank(message = "{expense.category.required}")
    private String category;

    @NotNull(message = "{expense.amount.without.vat.required}")
    @Min(value = 0, message = "{expense.amount.min}")
    private BigDecimal amountExcludingVAT;

    @NotNull(message = "{expense.amount.with.vat.required}")
    @Min(value = 0, message = "{expense.amount.min}")
    private BigDecimal amountIncludingVAT;

    private String sourceDocumentId;
}

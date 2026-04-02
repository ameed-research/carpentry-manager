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

    @NotNull(message = "תאריך ההוצאה הוא חובה")
    private LocalDate date;

    @NotBlank(message = "קטגוריית ההוצאה היא חובה")
    private String category;

    @NotNull(message = "סכום ללא מע\"מ הוא חובה")
    @Min(value = 0, message = "הסכום חייב להיות לפחות 0")
    private BigDecimal amountExcludingVAT;

    @NotNull(message = "סכום כולל מע\"מ הוא חובה")
    @Min(value = 0, message = "הסכום חייב להיות לפחות 0")
    private BigDecimal amountIncludingVAT;

    private String sourceDocumentId;
}

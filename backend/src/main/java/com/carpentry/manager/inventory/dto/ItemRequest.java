package com.carpentry.manager.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemRequest {

    @NotBlank(message = "שם הפריט הוא חובה")
    @Size(max = 150, message = "שם הפריט חייב להיות עד 150 תווים")
    private String name;

    private String categoryId; // Default to "כללי" if null

    @NotNull(message = "כמות היא חובה")
    @Min(value = 0, message = "הכמות חייבת להיות לפחות 0")
    private Integer quantity;

    @NotNull(message = "מחיר הוא חובה")
    @Min(value = 0, message = "המחיר חייב להיות לפחות 0")
    private Double priceExcludingVAT;

    @NotBlank(message = "ספק הוא חובה")
    private String supplierId;

    private String sku;
}

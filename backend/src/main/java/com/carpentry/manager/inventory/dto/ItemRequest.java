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

    @NotBlank(message = "{inventory.item.name.required}")
    @Size(max = 150, message = "{inventory.item.name.max.size}")
    private String name;

    @NotNull(message = "{inventory.item.quantity.required}")
    @Min(value = 0, message = "{inventory.item.quantity.min}")
    private Integer quantity;

    @NotNull(message = "{inventory.item.price.required}")
    @Min(value = 0, message = "{inventory.item.price.min}")
    private Double priceExcludingVAT;

    @NotBlank(message = "{inventory.item.supplier.required}")
    private String supplierId;

    private String sku;

    private String documentNumber;
}

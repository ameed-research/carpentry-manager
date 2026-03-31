package com.carpentry.manager.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemResponse {
    private String id;
    private String name;
    private String categoryId;
    private String categoryName;
    private Integer quantity;
    private Double priceExcludingVAT;
    private String supplierId;
    private String supplierName;
    private String sku;
    private LocalDateTime updatedDate;
    private String updatedBy;
    private Integer version;
}

package com.carpentry.manager.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemResponse {
    private String id;
    private String name;
    private Integer quantity;
    private BigDecimal priceExcludingVAT;
    private String supplierId;
    private String supplierName;
    private String sku;
    private String documentNumber;
    private LocalDateTime updatedDate;
    private String updatedBy;
    private Integer version;
}

package com.carpentry.manager.inventory.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Item {

    @Id
    private String id;

    private String name;

    private String categoryId;

    private Integer quantity;

    private Double priceExcludingVAT;

    private String supplierId;

    private String sku; // Universal Catalog Number / MAK"T

    private String sourceDocumentId;

    @LastModifiedDate
    private LocalDateTime updatedDate;

    private String updatedBy;

    private Integer version; // Starting from 0
}

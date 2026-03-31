package com.carpentry.manager.supplier.dto;

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
public class SupplierResponse {
    private String id;
    private String name;
    private String phone;
    private String taxId;
    private String contactPerson;
    private String contactPhone;
    private String email;
}

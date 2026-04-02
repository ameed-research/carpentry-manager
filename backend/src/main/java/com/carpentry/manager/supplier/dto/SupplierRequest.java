package com.carpentry.manager.supplier.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
public class SupplierRequest {

    @NotBlank(message = "{supplier.name.required}")
    @Size(max = 100, message = "{supplier.name.max.size}")
    private String name;

    @Pattern(regexp = "^$|^(0[23489]|0[57]\\d)\\d{7}$", message = "{supplier.phone.invalid}")
    private String phone;

    private String taxId;

    @Size(max = 100, message = "{supplier.contact.name.max.size}")
    private String contactPerson;

    @Pattern(regexp = "^$|^(0[23489]|0[57]\\d)\\d{7}$", message = "{supplier.contact.phone.invalid}")
    private String contactPhone;

    @Email(message = "{supplier.email.invalid}")
    private String email;
}

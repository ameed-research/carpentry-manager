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

    @NotBlank(message = "שם הספק הוא חובה")
    @Size(max = 100, message = "שם הספק חייב להיות עד 100 תווים")
    private String name;

    @NotBlank(message = "טלפון ראשי הוא חובה")
    @Pattern(regexp = "^(0[23489]|0[57]\\d)\\d{7}$", message = "מספר טלפון לא תקין")
    private String phone;

    private String taxId;

    @Size(max = 100, message = "שם איש קשר חייב להיות עד 100 תווים")
    private String contactPerson;

    @Pattern(regexp = "^$|^(0[23489]|0[57]\\d)\\d{7}$", message = "מספר טלפון של איש קשר לא תקין")
    private String contactPhone;

    @Email(message = "כתובת אימייל לא תקינה")
    private String email;
}

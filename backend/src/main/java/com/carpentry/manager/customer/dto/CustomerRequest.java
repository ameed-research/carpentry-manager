package com.carpentry.manager.customer.dto;

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
public class CustomerRequest {

    @NotBlank(message = "שם הלקוח הוא חובה")
    @Size(max = 100, message = "שם הלקוח חייב להיות עד 100 תווים")
    private String name;

    @NotBlank(message = "טלפון הוא חובה")
    @Pattern(regexp = "^(0[23489]|0[57]\\d)\\d{7}$", message = "מספר טלפון לא תקין")
    private String phone;

    @Email(message = "כתובת אימייל לא תקינה")
    private String email;

    @Size(max = 100, message = "הכתובת חייבת להיות עד 100 תווים")
    private String address;

    private Double discount;
}

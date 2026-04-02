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

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {

    @NotBlank(message = "{customer.name.required}")
    @Size(max = 100, message = "{customer.name.max.size}")
    private String name;

    @NotBlank(message = "{customer.phone.required}")
    @Pattern(regexp = "^(0[23489]|0[57]\\d)\\d{7}$", message = "{customer.phone.invalid}")
    private String phone;

    @Email(message = "{customer.email.invalid}")
    private String email;

    @Size(max = 100, message = "{customer.address.max.size}")
    private String address;

    private BigDecimal discount;
}

package com.carpentry.manager.category.dto;

import jakarta.validation.constraints.NotBlank;
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
public class CategoryRequest {
    @NotBlank(message = "שם הקטגוריה הוא חובה")
    @Size(max = 50, message = "שם הקטגוריה חייב להיות עד 50 תווים")
    private String name;
}

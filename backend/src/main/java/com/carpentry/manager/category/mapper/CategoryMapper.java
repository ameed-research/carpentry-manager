package com.carpentry.manager.category.mapper;

import com.carpentry.manager.category.dto.CategoryRequest;
import com.carpentry.manager.category.dto.CategoryResponse;
import com.carpentry.manager.category.model.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryResponse toResponse(Category category);

    @Mapping(target = "id", ignore = true)
    Category toEntity(CategoryRequest request);

    @Mapping(target = "id", ignore = true)
    void updateEntity(CategoryRequest request, @MappingTarget Category category);
}

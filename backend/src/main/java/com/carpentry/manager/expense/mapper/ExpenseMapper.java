package com.carpentry.manager.expense.mapper;

import com.carpentry.manager.expense.dto.ExpenseRequest;
import com.carpentry.manager.expense.dto.ExpenseResponse;
import com.carpentry.manager.expense.model.Expense;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ExpenseMapper {

    ExpenseResponse toResponse(Expense expense);

    @Mapping(target = "id", ignore = true)
    Expense toEntity(ExpenseRequest request);

    @Mapping(target = "id", ignore = true)
    void updateEntity(ExpenseRequest request, @MappingTarget Expense expense);
}

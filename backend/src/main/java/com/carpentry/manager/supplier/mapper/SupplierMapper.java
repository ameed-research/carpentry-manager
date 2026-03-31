package com.carpentry.manager.supplier.mapper;

import com.carpentry.manager.supplier.dto.SupplierRequest;
import com.carpentry.manager.supplier.dto.SupplierResponse;
import com.carpentry.manager.supplier.model.Supplier;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SupplierMapper {

    SupplierResponse toResponse(Supplier supplier);

    @Mapping(target = "id", ignore = true)
    Supplier toEntity(SupplierRequest request);

    @Mapping(target = "id", ignore = true)
    void updateEntity(SupplierRequest request, @MappingTarget Supplier supplier);
}

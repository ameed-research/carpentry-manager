package com.carpentry.manager.customer.mapper;

import com.carpentry.manager.customer.dto.CustomerRequest;
import com.carpentry.manager.customer.dto.CustomerResponse;
import com.carpentry.manager.customer.model.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "totalPaid", ignore = true)
    @Mapping(target = "debt", ignore = true)
    CustomerResponse toResponse(Customer customer);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "jobs", ignore = true)
    @Mapping(target = "payments", ignore = true)
    @Mapping(target = "closed", constant = "false")
    Customer toEntity(CustomerRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "jobs", ignore = true)
    @Mapping(target = "payments", ignore = true)
    @Mapping(target = "closed", ignore = true)
    void updateEntity(CustomerRequest request, @MappingTarget Customer customer);
}

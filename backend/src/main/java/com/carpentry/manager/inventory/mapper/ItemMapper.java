package com.carpentry.manager.inventory.mapper;

import com.carpentry.manager.inventory.dto.ItemRequest;
import com.carpentry.manager.inventory.dto.ItemResponse;
import com.carpentry.manager.inventory.model.Item;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ItemMapper {

    @Mapping(target = "categoryName", ignore = true)
    @Mapping(target = "supplierName", ignore = true)
    ItemResponse toResponse(Item item);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", constant = "0")
    @Mapping(target = "sourceDocumentId", ignore = true)
    Item toEntity(ItemRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "sourceDocumentId", ignore = true)
    void updateEntity(ItemRequest request, @MappingTarget Item item);
}

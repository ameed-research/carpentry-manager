package com.carpentry.manager.inventory.dto;

import com.carpentry.manager.common.dto.PageResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryListResponse {
    private PageResponse<ItemResponse> page;
    private List<SupplierOption> suppliers;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SupplierOption {
        private String id;
        private String name;
    }
}

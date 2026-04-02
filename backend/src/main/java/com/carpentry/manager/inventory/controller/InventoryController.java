package com.carpentry.manager.inventory.controller;

import com.carpentry.manager.inventory.dto.InventoryListResponse;
import com.carpentry.manager.inventory.dto.ItemRequest;
import com.carpentry.manager.inventory.dto.ItemResponse;
import com.carpentry.manager.inventory.model.InventoryHistory;
import com.carpentry.manager.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<InventoryListResponse> getAllItems(Pageable pageable) {
        return ResponseEntity.ok(inventoryService.getAllItems(pageable));
    }

    @PostMapping
    public ResponseEntity<ItemResponse> createItem(@Valid @RequestBody ItemRequest request) {
        return ResponseEntity.ok(inventoryService.createItem(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponse> updateItem(
            @PathVariable String id,
            @Valid @RequestBody ItemRequest request
    ) {
        return ResponseEntity.ok(inventoryService.updateItem(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable String id) {
        inventoryService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<InventoryHistory>> getItemHistory(@PathVariable String id) {
        return ResponseEntity.ok(inventoryService.getItemHistory(id));
    }
}

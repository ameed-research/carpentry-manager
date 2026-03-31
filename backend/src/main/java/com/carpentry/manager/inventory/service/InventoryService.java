package com.carpentry.manager.inventory.service;

import com.carpentry.manager.category.model.Category;
import com.carpentry.manager.category.repository.CategoryRepository;
import com.carpentry.manager.inventory.dto.ItemRequest;
import com.carpentry.manager.inventory.dto.ItemResponse;
import com.carpentry.manager.inventory.mapper.ItemMapper;
import com.carpentry.manager.inventory.model.InventoryHistory;
import com.carpentry.manager.inventory.model.Item;
import com.carpentry.manager.inventory.repository.InventoryHistoryRepository;
import com.carpentry.manager.inventory.repository.ItemRepository;
import com.carpentry.manager.supplier.model.Supplier;
import com.carpentry.manager.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryService {

    private final ItemRepository itemRepository;
    private final InventoryHistoryRepository historyRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ItemMapper itemMapper;

    public Page<ItemResponse> getAllItems(Pageable pageable) {
        return itemRepository.findAll(pageable).map(this::enrichItemResponse);
    }

    public ItemResponse createItem(ItemRequest request) {
        String categoryId = request.getCategoryId();
        if (categoryId == null || categoryId.isBlank()) {
            categoryId = categoryRepository.findByName("כללי")
                    .map(Category::getId)
                    .orElseThrow(() -> new RuntimeException("קטגוריית ברירת מחדל לא נמצאה"));
        }

        Item item = itemMapper.toEntity(request);
        item.setCategoryId(categoryId);
        item.setUpdatedBy(getCurrentUsername());
        item.setVersion(0);

        return enrichItemResponse(itemRepository.save(item));
    }

    public ItemResponse updateItem(String id, ItemRequest request) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("פריט לא נמצא"));

        // Create history record before update
        InventoryHistory history = InventoryHistory.builder()
                .itemId(id)
                .snapshot(copyItem(item))
                .changeDate(LocalDateTime.now())
                .changedBy(getCurrentUsername())
                .build();
        historyRepository.save(history);

        // Update item
        itemMapper.updateEntity(request, item);
        item.setUpdatedBy(getCurrentUsername());
        item.setVersion(item.getVersion() + 1);

        return enrichItemResponse(itemRepository.save(item));
    }

    public void deleteItem(String id) {
        if (!itemRepository.existsById(id)) {
            throw new RuntimeException("פריט לא נמצא");
        }
        itemRepository.deleteById(id);
    }

    public List<InventoryHistory> getItemHistory(String itemId) {
        return historyRepository.findByItemIdOrderByChangeDateDesc(itemId, PageRequest.of(0, 10));
    }

    private ItemResponse enrichItemResponse(Item item) {
        ItemResponse response = itemMapper.toResponse(item);
        
        categoryRepository.findById(item.getCategoryId())
                .ifPresent(c -> response.setCategoryName(c.getName()));
        
        supplierRepository.findById(item.getSupplierId())
                .ifPresent(s -> response.setSupplierName(s.getName()));
        
        return response;
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private Item copyItem(Item source) {
        return Item.builder()
                .id(source.getId())
                .name(source.getName())
                .categoryId(source.getCategoryId())
                .quantity(source.getQuantity())
                .priceExcludingVAT(source.getPriceExcludingVAT())
                .supplierId(source.getSupplierId())
                .sku(source.getSku())
                .sourceDocumentId(source.getSourceDocumentId())
                .updatedDate(source.getUpdatedDate())
                .updatedBy(source.getUpdatedBy())
                .version(source.getVersion())
                .build();
    }
}

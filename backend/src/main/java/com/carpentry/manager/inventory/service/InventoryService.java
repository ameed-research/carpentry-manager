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
import com.carpentry.manager.util.MessagesUtils;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryService {

    private final ItemRepository itemRepository;
    private final InventoryHistoryRepository historyRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ItemMapper itemMapper;
    private final MessagesUtils messageSource;

    public Page<ItemResponse> getAllItems(Pageable pageable) {
        return itemRepository.findAll(pageable).map(this::enrichItemResponse);
    }

    public ItemResponse createItem(ItemRequest request) {
        String categoryId = request.getCategoryId();
        if (categoryId == null || categoryId.isBlank()) {
            String defaultCategoryName = messageSource.getMessage("inventory.category.default");
            categoryId = categoryRepository.findByName(defaultCategoryName)
                    .map(Category::getId)
                    .orElseThrow(() -> new RuntimeException(messageSource.getMessage("inventory.category.default.not.found")));
        }

        Optional<Supplier> supplier = supplierRepository.findById(request.getSupplierId());
        if (supplier.isEmpty()) {
            throw new RuntimeException(messageSource.getMessage("supplier.not.found"));
        }

        Item item = itemMapper.toEntity(request);
        item.setCategoryId(categoryId);
        item.setUpdatedBy(getCurrentUsername());
        item.setVersion(0);

        return enrichItemResponse(itemRepository.save(item));
    }

    public ItemResponse updateItem(String id, ItemRequest request) {
        Item item = getItemOrThrow(id);

        createHistoryRecord(item);

        // Update item
        itemMapper.updateEntity(request, item);
        item.setUpdatedBy(getCurrentUsername());
        item.setVersion(item.getVersion() + 1);

        return enrichItemResponse(itemRepository.save(item));
    }

    private @NonNull Item getItemOrThrow(String id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> {
                    String message = messageSource.getMessage("inventory.item.not.found");
                    return new RuntimeException(message);
                });
    }

    private void createHistoryRecord(Item item) {
        InventoryHistory history = InventoryHistory.builder()
                .itemId(item.getId())
                .snapshot(copyItem(item))
                .changeDate(LocalDateTime.now())
                .changedBy(getCurrentUsername())
                .build();
        historyRepository.save(history);
    }

    public void deleteItem(String id) {
        if (!itemRepository.existsById(id)) {
            String message = messageSource.getMessage("inventory.item.not.found");
            throw new RuntimeException(message);
        }
        Item item = getItemOrThrow(id);// Ensure item exists and create history record
        createHistoryRecord(item);
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
                .documentNumber(source.getDocumentNumber())
                .sourceDocumentId(source.getSourceDocumentId())
                .updatedDate(source.getUpdatedDate())
                .updatedBy(source.getUpdatedBy())
                .version(source.getVersion())
                .build();
    }
}

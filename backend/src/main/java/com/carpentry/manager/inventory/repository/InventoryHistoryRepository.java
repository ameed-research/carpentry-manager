package com.carpentry.manager.inventory.repository;

import com.carpentry.manager.inventory.model.InventoryHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryHistoryRepository extends MongoRepository<InventoryHistory, String> {
    List<InventoryHistory> findByItemIdOrderByChangeDateDesc(String itemId, Pageable pageable);
}

package com.carpentry.manager.supplier.service;

import com.carpentry.manager.supplier.dto.SupplierRequest;
import com.carpentry.manager.supplier.dto.SupplierResponse;
import com.carpentry.manager.supplier.mapper.SupplierMapper;
import com.carpentry.manager.supplier.model.Supplier;
import com.carpentry.manager.supplier.repository.SupplierRepository;
import com.carpentry.manager.util.MessagesUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;
    private final MessagesUtils messageSource;

    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(supplierMapper::toResponse)
                .toList();
    }

    public SupplierResponse createSupplier(SupplierRequest request) {
        if (supplierRepository.findByName(request.getName()).isPresent()) {
            String message = messageSource.getMessage("supplier.create.duplicate");
            throw new RuntimeException(message);
        }
        Supplier supplier = supplierMapper.toEntity(request);
        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    public SupplierResponse updateSupplier(String id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> {
                    String message = messageSource.getMessage("supplier.not.found");
                    return new RuntimeException(message);
                });

        supplierRepository.findByName(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        String message = messageSource.getMessage("supplier.create.duplicate");
                        throw new RuntimeException(message);
                    }
                });

        supplierMapper.updateEntity(request, supplier);
        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    public void deleteSupplier(String id) {
        if (!supplierRepository.existsById(id)) {
            String message = messageSource.getMessage("supplier.not.found");
            throw new RuntimeException(message);
        }
        // TODO: Check for linked items/orders before deleting
        supplierRepository.deleteById(id);
    }
}

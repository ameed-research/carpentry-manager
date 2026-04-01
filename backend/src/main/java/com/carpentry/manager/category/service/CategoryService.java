package com.carpentry.manager.category.service;

import com.carpentry.manager.category.dto.CategoryRequest;
import com.carpentry.manager.category.dto.CategoryResponse;
import com.carpentry.manager.category.mapper.CategoryMapper;
import com.carpentry.manager.category.model.Category;
import com.carpentry.manager.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("קטגוריה בשם זה כבר קיימת");
        }
        Category category = categoryMapper.toEntity(request);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    public CategoryResponse updateCategory(String id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("קטגוריה לא נמצאה"));

        categoryRepository.findByName(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new RuntimeException("קטגוריה בשם זה כבר קיימת");
                    }
                });

        categoryMapper.updateEntity(request, category);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    public void deleteCategory(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("קטגוריה לא נמצאה"));

        if ("כללי".equals(category.getName())) {
            throw new RuntimeException("לא ניתן למחוק את קטגוריית ברירת המחדל");
        }

        // TODO: Check if items are linked to this category before deleting
        categoryRepository.deleteById(id);
    }
}

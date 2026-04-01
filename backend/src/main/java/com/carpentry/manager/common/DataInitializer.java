package com.carpentry.manager.common;

import com.carpentry.manager.category.model.Category;
import com.carpentry.manager.category.repository.CategoryRepository;
import com.carpentry.manager.util.MessagesUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final MessagesUtils messagesUtils;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            log.info("Initializing default category...");
            String generalCategory = messagesUtils.getMessage("inventory.category.default");
            Category general = Category.builder()
                    .name(generalCategory)
                    .build();
            categoryRepository.save(general);
            log.info("Default category '{}' initialized successfully.", generalCategory);
        }
    }
}

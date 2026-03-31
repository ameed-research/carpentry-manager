package com.carpentry.manager.common.initializer;

import com.carpentry.manager.category.model.Category;
import com.carpentry.manager.category.repository.CategoryRepository;
import com.carpentry.manager.security.model.Role;
import com.carpentry.manager.security.model.User;
import com.carpentry.manager.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeUsers();
        initializeCategories();
    }

    private void initializeUsers() {
        if (userRepository.count() == 0) {
            log.info("Initializing default users...");
            
            User admin = User.builder()
                    .username("ameed")
                    .password(passwordEncoder.encode("admin"))
                    .roles(List.of(Role.ADMIN))
                    .build();

            User user = User.builder()
                    .username("ameer")
                    .password(passwordEncoder.encode("ameer123"))
                    .roles(List.of(Role.USER))
                    .build();

            userRepository.saveAll(List.of(admin, user));
            log.info("Default users initialized successfully.");
        }
    }

    private void initializeCategories() {
        if (categoryRepository.count() == 0) {
            log.info("Initializing default category...");
            Category general = Category.builder()
                    .name("כללי")
                    .build();
            categoryRepository.save(general);
            log.info("Default category 'כללי' initialized successfully.");
        }
    }
}

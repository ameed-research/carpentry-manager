package com.carpentry.manager.security.controller;

import com.carpentry.manager.security.model.User;
import com.carpentry.manager.security.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
    }

    @PatchMapping("/{id}/status")
    public User updateStatus(
            @PathVariable String id,
            @RequestParam boolean enabled,
            @RequestParam boolean accountNonLocked) {
        return userService.updateStatus(id, enabled, accountNonLocked);
    }
}

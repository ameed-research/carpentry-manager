package com.carpentry.manager.common.controller;

import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final MongoTemplate mongoTemplate;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        String dbStatus;
        try {
            mongoTemplate.getDb().runCommand(new Document("ping", 1));
            dbStatus = "UP";
        } catch (Exception e) {
            dbStatus = "DOWN";
        }

        Map<String, Object> response = Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString(),
                "db", Map.of("status", dbStatus)
        );

        return ResponseEntity.ok(response);
    }
}

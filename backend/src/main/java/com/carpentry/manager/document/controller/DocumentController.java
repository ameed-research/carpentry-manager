package com.carpentry.manager.document.controller;

import com.carpentry.manager.document.model.CarpentryDocument;
import com.carpentry.manager.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public ResponseEntity<List<CarpentryDocument>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @PostMapping("/upload")
    public ResponseEntity<CarpentryDocument> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") CarpentryDocument.DocumentType type
    ) throws IOException {
        return ResponseEntity.ok(documentService.uploadDocument(file, type));
    }
}

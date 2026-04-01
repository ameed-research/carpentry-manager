package com.carpentry.manager.document.controller;

import com.carpentry.manager.document.model.CarpentryDocument;
import com.carpentry.manager.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

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

    @PostMapping("/analyze-inventory")
    public ResponseEntity<Map<String, Object>> analyzeInventoryDocument(
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(documentService.analyzeInventoryDocument(file));
    }

    @PostMapping("/{id}/approve-inventory")
    public ResponseEntity<Void> approveInventoryDocument(
            @PathVariable String id,
            @RequestBody Map<String, Object> data
    ) throws Exception {
        documentService.approveInventoryDocument(id, data);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<org.springframework.core.io.Resource> downloadDocument(@PathVariable String id) throws Exception {
        org.springframework.core.io.Resource resource = documentService.downloadDocument(id);
        String contentType = "application/octet-stream";
        if (resource.getFilename() != null) {
            if (resource.getFilename().endsWith(".pdf")) contentType = "application/pdf";
            else if (resource.getFilename().endsWith(".png")) contentType = "image/png";
            else if (resource.getFilename().endsWith(".jpg") || resource.getFilename().endsWith(".jpeg")) contentType = "image/jpeg";
        }
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
    }
}

package com.carpentry.manager.ai.service;

import com.carpentry.manager.document.model.CarpentryDocument;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface AiService {

    Map<String, Object> analyzeSupplierDocument(MultipartFile file);

    Map<String, Object> analyzeInventoryDocument(MultipartFile file);

    Map<String, Object> extractPaymentData(MultipartFile file);

    Map<String, Object> extractDocumentData(MultipartFile file, CarpentryDocument.DocumentType type);
}

package com.carpentry.manager.ai.service;

import com.carpentry.manager.document.model.CarpentryDocument;
import com.carpentry.manager.util.MessagesUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "claude")
@RequiredArgsConstructor
@Slf4j
public class ClaudeService implements AiService {

    private static final String PDF_MEDIA_TYPE = "application/pdf";
    private static final String ANTHROPIC_BETA_HEADER = "anthropic-beta";
    private static final String PDF_BETA_VALUE = "pdfs-2024-09-25";

    private final MessagesUtils messagesUtils;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.create();

    @Value("${app.claude.api-key}")
    private String apiKey;

    @Value("${app.claude.url}")
    private String url;

    @Value("${app.claude.model}")
    private String model;

    @Value("${app.claude.version}")
    private String anthropicVersion;

    @Override
    public Map<String, Object> analyzeSupplierDocument(MultipartFile file) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Claude API key is not configured");
            return new HashMap<>();
        }

        String prompt = "Analyze this supplier document. Determine if it is an INVOICE, DELIVERY_NOTE, CHEQUE, or BANK_TRANSFER. Return ONLY a JSON object with:\n" +
                "1. For all types:\n" +
                "   type (string: 'INVOICE', 'DELIVERY_NOTE', 'CHEQUE', or 'BANK_TRANSFER'),\n" +
                "   supplierName (string, null if not present), supplierTaxId (string, null if not present),\n" +
                "   date (string: YYYY-MM-DD, null if not present).\n" +
                "2. If INVOICE or DELIVERY_NOTE:\n" +
                "   documentId (string: invoice or delivery note number), totalAmountWithVat (number, null if not present), totalAmountWithoutVat (number, null if not present),\n" +
                "   items (array of objects with: description, quantity, pricePerUnitWithoutVat, totalPriceWithoutVat, sku (string, null if not present)).\n" +
                "3. If CHEQUE or BANK_TRANSFER:\n" +
                "   amount (number), remarks (string, null if not present),\n" +
                "   If CHEQUE: bank (string), branch (string), account (string), chequeNumber (string), dueDate (string: YYYY-MM-DD).\n" +
                "   If BANK_TRANSFER: referenceNumber (string).";

        log.info("Sending supplier document '{}' to Claude for unified analysis", file.getOriginalFilename());
        return callClaude(file, prompt);
    }

    @Override
    public Map<String, Object> analyzeInventoryDocument(MultipartFile file) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Claude API key is not configured");
            return new HashMap<>();
        }

        String prompt = "Analyze this document. Determine if it is an INVOICE or a DELIVERY_NOTE. Return ONLY a JSON object with: " +
                "type (string: 'INVOICE' or 'DELIVERY_NOTE'), " +
                "supplierName (string), supplierTaxId (string), supplierPhone (string, null if not present), supplierEmail (string, null if not present), " +
                "documentId (string: the invoice or delivery note number), date (string: YYYY-MM-DD), " +
                "totalAmountWithVat (number, null if not present), totalAmountWithoutVat (number, null if not present), " +
                "items (array of objects with: description, quantity, pricePerUnitWithoutVat, totalPriceWithoutVat, sku (string, null if not present)).";

        log.info("Sending inventory document '{}' to Claude for analysis", file.getOriginalFilename());
        return callClaude(file, prompt);
    }

    @Override
    public Map<String, Object> extractPaymentData(MultipartFile file) {
        return extractDocumentData(file, CarpentryDocument.DocumentType.PAYMENT_CHECK);
    }

    @Override
    public Map<String, Object> extractDocumentData(MultipartFile file, CarpentryDocument.DocumentType type) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Claude API key is not configured");
            return new HashMap<>();
        }

        log.info("Sending file '{}' of type '{}' to Claude", file.getOriginalFilename(), type);
        return callClaude(file, getPromptForType(type));
    }

    private Map<String, Object> callClaude(MultipartFile file, String prompt) {
        Map<String, Object> requestBody = createRequestBody(file, prompt);

        String responseStr = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .header("x-api-key", apiKey)
                .header("anthropic-version", anthropicVersion)
                .header(ANTHROPIC_BETA_HEADER, PDF_BETA_VALUE)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        return extractJsonAsMap(responseStr);
    }

    private String getPromptForType(CarpentryDocument.DocumentType type) {
        return switch (type) {
            case INVOICE -> "Extract invoice details from this document. Return ONLY a JSON object with: " +
                    "supplierName (string), supplierTaxId (string), supplierPhone (string, null if not present), supplierEmail (string, null if not present), " +
                    "documentId (string), date (string: YYYY-MM-DD), " +
                    "totalAmountWithVat (number), totalAmountWithoutVat (number), " +
                    "items (array of objects with: description, quantity, pricePerUnitWithoutVat, totalPriceWithoutVat, sku (string, null if not present)).";
            case DELIVERY_NOTE -> "Extract delivery note details from this document. Return ONLY a JSON object with: " +
                    "supplierName (string), supplierTaxId (string), supplierPhone (string, null if not present), supplierEmail (string, null if not present), " +
                    "documentId (string), date (string: YYYY-MM-DD), " +
                    "totalAmountWithVat (number, null if not present), " +
                    "items (array of objects with: description, quantity, pricePerUnitWithoutVat, totalPriceWithoutVat, sku (string, null if not present)).";
            case PAYMENT_CHECK, BANK_TRANSFER -> "Extract payment details from this image or document. " +
                    "Return ONLY a JSON object with: " +
                    "amount (number), method (string: either 'CHEQUE', 'MONEY_TRANSFER'), " +
                    "bank (string), branch (string), account (string), chequeNumber (string), " +
                    "dueDate (string: YYYY-MM-DD), referenceNumber (string), from (string), to (string).";
            default -> "Extract all possible data from this document into a structured JSON object.";
        };
    }

    private Map<String, Object> createRequestBody(MultipartFile file, String prompt) {
        String mimeType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
        boolean isPdf = PDF_MEDIA_TYPE.equals(mimeType);

        String base64Data;
        try {
            base64Data = Base64.getEncoder().encodeToString(file.getBytes());
        } catch (IOException e) {
            log.error("Failed to encode the file", e);
            throw new RuntimeException(messagesUtils.getMessage("file.reading.error", file.getOriginalFilename()), e);
        }

        String contentType = isPdf ? "document" : "image";
        Map<String, Object> fileContent = Map.of(
                "type", contentType,
                "source", Map.of("type", "base64", "media_type", mimeType, "data", base64Data)
        );

        return Map.of(
                "model", model,
                "max_tokens", 4096,
                "messages", List.of(
                        Map.of("role", "user", "content", List.of(
                                fileContent,
                                Map.of("type", "text", "text", prompt)
                        ))
                )
        );
    }

    private Map<String, Object> extractJsonAsMap(String responseStr) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseStr);
            JsonNode contentArray = rootNode.get("content");
            if (contentArray != null && contentArray.isArray() && !contentArray.isEmpty()) {
                String jsonText = contentArray.get(0).get("text").asText();

                // Cleanup markdown
                if (jsonText.startsWith("```json")) jsonText = jsonText.substring(7);
                else if (jsonText.startsWith("```")) jsonText = jsonText.substring(3);
                if (jsonText.endsWith("```")) jsonText = jsonText.substring(0, jsonText.length() - 3);

                return objectMapper.readValue(jsonText.trim(), Map.class);
            }
            log.error("Failed to extract data or parse Claude response: {}", responseStr);
        } catch (Exception e) {
            log.error("Failed to extract data or parse Claude response", e);
        }
        throw new RuntimeException(messagesUtils.getMessage("claude.parsing.error"));
    }
}

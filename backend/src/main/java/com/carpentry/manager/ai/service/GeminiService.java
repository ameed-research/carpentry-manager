package com.carpentry.manager.ai.service;

import com.carpentry.manager.document.model.CarpentryDocument;
import com.carpentry.manager.util.MessagesUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
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
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final MessagesUtils messagesUtils;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.create();
    @Value("${app.gemini.api-key}")
    private String apiKey;
    @Value("${app.gemini.url}")
    private String url;

    public Map<String, Object> extractPaymentData(MultipartFile file) {
        return extractDocumentData(file, CarpentryDocument.DocumentType.PAYMENT_CHECK);
    }

    public Map<String, Object> extractDocumentData(MultipartFile file, CarpentryDocument.DocumentType type) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Gemini API key is not configured");
            return new HashMap<>();
        }

        String prompt = getPromptForType(type);
        Map<String, Object> requestBody = createRequestBody(file, prompt);
        log.info("Sending file '{}' of type '{}' to Gemini", file.getOriginalFilename(), type);

        String responseStr = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .header("x-goog-api-key", apiKey)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        return extractJsonAsMap(responseStr);
    }

    private String getPromptForType(CarpentryDocument.DocumentType type) {
        return switch (type) {
            case INVOICE -> "Extract invoice details from this document. Return ONLY a JSON object with: " +
                    "supplierName (string), supplierTaxId (string), invoiceId (string), date (string: YYYY-MM-DD), " +
                    "totalAmountWithVat (number), totalAmountWithoutVat (number), " +
                    "items (array of objects with: description, quantity, pricePerUnitWithoutVat, totalPriceWithoutVat).";
            case DELIVERY_NOTE -> "Extract delivery note details from this document. Return ONLY a JSON object with: " +
                    "supplierName (string), supplierTaxId (string), deliveryNoteId (string), date (string: YYYY-MM-DD), " +
                    "totalAmountWithVat (number, null if not present), " +
                    "items (array of objects with: description, quantity, pricePerUnitWithoutVat, totalPriceWithoutVat).";
            case PAYMENT_CHECK, BANK_TRANSFER -> "Extract payment details from this image or document. " +
                    "Return ONLY a JSON object with: " +
                    "amount (number), method (string: either 'CHEQUE', 'MONEY_TRANSFER'), " +
                    "bank (string), branch (string), account (string), chequeNumber (string), " +
                    "dueDate (string: YYYY-MM-DD), referenceNumber (string), from (string), to (string).";
            default -> "Extract all possible data from this document into a structured JSON object.";
        };
    }

    private Map<String, Object> extractJsonAsMap(String responseStr) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseStr);
            if (rootNode.has("candidates") && rootNode.get("candidates").isArray() && rootNode.get("candidates").size() > 0) {
                JsonNode contentNode = rootNode.get("candidates").get(0).get("content");
                if (contentNode != null && contentNode.has("parts") && contentNode.get("parts").isArray() && contentNode.get("parts").size() > 0) {
                    String jsonText = contentNode.get("parts").get(0).get("text").asText();

                    // Cleanup markdown
                    if (jsonText.startsWith("```json")) jsonText = jsonText.substring(7);
                    else if (jsonText.startsWith("```")) jsonText = jsonText.substring(3);
                    if (jsonText.endsWith("```")) jsonText = jsonText.substring(0, jsonText.length() - 3);

                    return objectMapper.readValue(jsonText.trim(), Map.class);
                }
            }
            log.error("Failed to extract data or parse Gemini response: {}", responseStr);
        } catch (Exception e) {
            log.error("Failed to extract data or parse Gemini response", e);
        }
        throw new RuntimeException(messagesUtils.getMessage("gemini.parsing.error"));
    }

    private @NonNull Map<String, Object> createRequestBody(MultipartFile file, String prompt) {
        String mimeType = file.getContentType();
        String base64Data;
        try {
            base64Data = Base64.getEncoder().encodeToString(file.getBytes());
        } catch (IOException e) {
            log.error("Failed to encode the file", e);
            throw new RuntimeException(messagesUtils.getMessage("file.reading.error", file.getOriginalFilename()), e);
        }

        return Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt),
                                Map.of("inline_data", Map.of(
                                        "mime_type", mimeType != null ? mimeType : "image/jpeg",
                                        "data", base64Data
                                ))
                        ))
                ),
                "generationConfig", Map.of(
                        "response_mime_type", "application/json"
                )
        );
    }
}

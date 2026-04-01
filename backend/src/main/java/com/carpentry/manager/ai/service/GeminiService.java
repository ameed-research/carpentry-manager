package com.carpentry.manager.ai.service;

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

    public Map<String, Object> extractPaymentData(MultipartFile file) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Gemini API key is not configured");
            return new HashMap<>(); // Return empty if not configured to prevent crashes during dev
        }

        Map<String, Object> requestBody = createRequestBody(file);
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

        String responseStr = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .header("x-goog-api-key", apiKey)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        return extractJsonAsMap(responseStr);
    }

    private Map<String, Object> extractJsonAsMap(String responseStr) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseStr);
            if (rootNode.has("candidates") && rootNode.get("candidates").isArray() && rootNode.get("candidates").size() > 0) {
                JsonNode contentNode = rootNode.get("candidates").get(0).get("content");
                if (contentNode != null && contentNode.has("parts") && contentNode.get("parts").isArray() && contentNode.get("parts").size() > 0) {
                    String jsonText = contentNode.get("parts").get(0).get("text").asText();

                    // Cleanup markdown in case Gemini ignores response_mime_type
                    if (jsonText.startsWith("```json")) {
                        jsonText = jsonText.substring(7);
                    }
                    if (jsonText.startsWith("```")) {
                        jsonText = jsonText.substring(3);
                    }
                    if (jsonText.endsWith("```")) {
                        jsonText = jsonText.substring(0, jsonText.length() - 3);
                    }

                    return objectMapper.readValue(jsonText.trim(), Map.class);
                }
            }
            log.error("Failed to extract data or parse Gemini response: {}", responseStr);
        } catch (Exception e) {
            log.error("Failed to extract data or parse Gemini response: " + responseStr, e);
        }
        throw new RuntimeException(messagesUtils.getMessage("gemini.parsing.error"));
    }

    private @NonNull Map<String, Object> createRequestBody(MultipartFile file) {
        String mimeType = file.getContentType();
        String base64Data;
        try {
            base64Data = Base64.getEncoder().encodeToString(file.getBytes());
        } catch (IOException e) {
            log.error("Failed to encode the file", e);
            throw new RuntimeException(messagesUtils.getMessage("file.reading.error", file.getName()), e);
        }

        String prompt = "Extract cheque or money transfer details from this image or document. " +
                "Return ONLY a JSON object with the following fields (omit fields not found or leave them empty): " +
                "amount (number), method (string: either 'CHEQUE', 'MONEY_TRANSFER'), " +
                "bank (string), branch (string), account (string), chequeNumber (string), " +
                "dueDate (string: YYYY-MM-DD), referenceNumber (string), from (string), to (string). " +
                "Do not include Markdown formatting blocks (e.g., ```json).";

        Map<String, Object> requestBody = Map.of(
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
        return requestBody;
    }

}

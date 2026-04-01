package com.carpentry.manager.document.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "documents")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarpentryDocument {

    @Id
    private String id;

    private String originalName;

    private String filePath;

    private Long fileSize;

    private String fileHash;

    private LocalDateTime uploadDate;

    private DocumentStatus status;

    private DocumentType type;

    private String extractedData; // JSON string for now

    public enum DocumentStatus {
        PENDING,
        PROCESSED,
        FAILED
    }

    public enum DocumentType {
        INVOICE,
        RECEIPT,
        DELIVERY_NOTE,
        PAYMENT_CHECK,
        BANK_TRANSFER
    }
}

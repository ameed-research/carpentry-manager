package com.carpentry.manager.document.repository;

import com.carpentry.manager.document.model.CarpentryDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentRepository extends MongoRepository<CarpentryDocument, String> {
    Optional<CarpentryDocument> findByFileHash(String fileHash);
}

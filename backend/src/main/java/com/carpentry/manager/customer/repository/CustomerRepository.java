package com.carpentry.manager.customer.repository;

import com.carpentry.manager.customer.model.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends MongoRepository<Customer, String> {
    Optional<Customer> findByName(String name);
    long countByClosedFalse();
}

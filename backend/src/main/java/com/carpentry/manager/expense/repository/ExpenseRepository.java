package com.carpentry.manager.expense.repository;

import com.carpentry.manager.expense.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findByDateBetween(LocalDate start, LocalDate end);
}

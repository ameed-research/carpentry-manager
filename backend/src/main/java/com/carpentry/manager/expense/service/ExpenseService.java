package com.carpentry.manager.expense.service;

import com.carpentry.manager.expense.dto.ExpenseRequest;
import com.carpentry.manager.expense.dto.ExpenseResponse;
import com.carpentry.manager.expense.mapper.ExpenseMapper;
import com.carpentry.manager.expense.model.Expense;
import com.carpentry.manager.expense.repository.ExpenseRepository;
import com.carpentry.manager.util.MessagesUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseMapper expenseMapper;
    private final MessagesUtils messagesUtils;

    public List<ExpenseResponse> getAllExpenses() {
        return expenseRepository.findAll().stream()
                .map(expenseMapper::toResponse)
                .toList();
    }

    public List<ExpenseResponse> getExpensesByMonth(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        return expenseRepository.findByDateBetween(start, end).stream()
                .map(expenseMapper::toResponse)
                .toList();
    }

    public ExpenseResponse createExpense(ExpenseRequest request) {
        Expense expense = expenseMapper.toEntity(request);
        return expenseMapper.toResponse(expenseRepository.save(expense));
    }

    public ExpenseResponse updateExpense(String id, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(messagesUtils.getMessage("expense.not.found")));
        expenseMapper.updateEntity(request, expense);
        return expenseMapper.toResponse(expenseRepository.save(expense));
    }

    public void deleteExpense(String id) {
        if (!expenseRepository.existsById(id)) {
            throw new RuntimeException(messagesUtils.getMessage("expense.not.found"));
        }
        expenseRepository.deleteById(id);
    }
}

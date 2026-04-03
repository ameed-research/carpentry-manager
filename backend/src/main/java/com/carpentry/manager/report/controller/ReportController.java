package com.carpentry.manager.report.controller;

import com.carpentry.manager.report.dto.ChequeControlItem;
import com.carpentry.manager.report.dto.MonthlyFinancialReport;
import com.carpentry.manager.report.dto.MonthlySummaryResponse;
import com.carpentry.manager.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/financial")
    public ResponseEntity<MonthlyFinancialReport> getMonthlyFinancialReport(
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(reportService.getMonthlyFinancialReport(year, month));
    }

    @GetMapping("/monthly-summary")
    public ResponseEntity<MonthlySummaryResponse> getMonthlySummary(
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(reportService.getMonthlySummary(year, month));
    }

    @GetMapping("/cheques")
    public ResponseEntity<List<ChequeControlItem>> getIncomingCheques(
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(reportService.getIncomingCheques(year, month));
    }
}

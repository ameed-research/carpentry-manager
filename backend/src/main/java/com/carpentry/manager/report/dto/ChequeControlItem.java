package com.carpentry.manager.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChequeControlItem {
    private String dueDate;
    private BigDecimal amount;
    private String chequeNumber;
    private String customerName;
}

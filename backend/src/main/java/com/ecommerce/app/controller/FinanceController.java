package com.ecommerce.app.controller;

import com.ecommerce.app.dto.Dtos.FinanceSummary;
import com.ecommerce.app.model.Transaction;
import com.ecommerce.app.service.FinanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
@Tag(name = "9. Finance", description = "Revenue dashboard and reports — Finance token required (login as finance1)")
@SecurityRequirement(name = "Bearer Authentication")
public class FinanceController {

    private final FinanceService financeService;

    @GetMapping("/summary")
    @Operation(summary = "Get finance dashboard summary",
            description = "Returns total lock revenue, refunds, payments, wallet credits, order count and active locks.")
    public ResponseEntity<FinanceSummary> getSummary() {
        return ResponseEntity.ok(financeService.getSummary());
    }

    @GetMapping("/transactions")
    @Operation(summary = "Get all transactions",
            description = "Returns all transactions. Optional filter by type: LOCK_FEE, PAYMENT, REFUND, WALLET_CREDIT, PRICE_DROP_CREDIT")
    public ResponseEntity<List<Transaction>> getTransactions(
            @Parameter(description = "Filter by transaction type (optional)")
            @RequestParam(required = false) Transaction.TransactionType type) {
        if (type != null) return ResponseEntity.ok(financeService.getTransactionsByType(type));
        return ResponseEntity.ok(financeService.getAllTransactions());
    }
}

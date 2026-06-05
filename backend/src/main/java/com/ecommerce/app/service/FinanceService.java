package com.ecommerce.app.service;

import com.ecommerce.app.dto.Dtos.FinanceSummary;
import com.ecommerce.app.model.PriceLock;
import com.ecommerce.app.model.Transaction;
import com.ecommerce.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final TransactionRepository transactionRepository;
    private final OrderRepository orderRepository;
    private final PriceLockRepository priceLockRepository;

    public FinanceSummary getSummary() {
        FinanceSummary summary = new FinanceSummary();
        summary.setTotalLockRevenue(safeSum(Transaction.TransactionType.LOCK_FEE));
        summary.setTotalRefunds(safeSum(Transaction.TransactionType.REFUND));
        summary.setTotalWalletCredits(safeSum(Transaction.TransactionType.WALLET_CREDIT));
        summary.setTotalPayments(safeSum(Transaction.TransactionType.PAYMENT));
        summary.setTotalOrders(orderRepository.count());
        summary.setActiveLocks(priceLockRepository.findByStatus(PriceLock.LockStatus.ACTIVE).size());
        return summary;
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public List<Transaction> getTransactionsByType(Transaction.TransactionType type) {
        return transactionRepository.findByType(type);
    }

    private BigDecimal safeSum(Transaction.TransactionType type) {
        BigDecimal sum = transactionRepository.sumByType(type);
        return sum != null ? sum : BigDecimal.ZERO;
    }
}

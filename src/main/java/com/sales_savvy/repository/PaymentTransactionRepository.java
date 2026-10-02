package com.sales_savvy.repository;

import org.springframework.data.jpa.repository.JpaRepository;


import com.sales_savvy.entity.PaymentTransaction;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
}
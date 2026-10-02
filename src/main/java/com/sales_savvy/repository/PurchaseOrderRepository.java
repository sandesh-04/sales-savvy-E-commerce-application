package com.sales_savvy.repository;

import java.util.Optional;


import org.springframework.data.jpa.repository.JpaRepository;

import com.sales_savvy.entity.PurchaseOrder;
import com.sales_savvy.entity.User;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByIdAndUser(Long id, User user);
}

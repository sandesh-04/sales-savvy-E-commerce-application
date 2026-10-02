package com.sales_savvy.repository;

import org.springframework.data.jpa.repository.JpaRepository;


import com.sales_savvy.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}

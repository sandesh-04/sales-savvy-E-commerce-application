package com.sales_savvy.repository;

import java.util.List;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sales_savvy.entity.CartItem;
import com.sales_savvy.entity.Product;
import com.sales_savvy.entity.User;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUser(User user);

    Optional<CartItem> findByUserAndProduct(User user, Product product);

    Optional<CartItem> findByIdAndUser(Long id, User user);
    
    void deleteByUser(User user);
}

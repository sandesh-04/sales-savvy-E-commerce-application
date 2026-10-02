package com.sales_savvy.repository;

import org.springframework.data.jpa.repository.JpaRepository;


import com.sales_savvy.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}

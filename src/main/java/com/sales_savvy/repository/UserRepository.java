package com.sales_savvy.repository;

import java.util.Optional;


import org.springframework.data.jpa.repository.JpaRepository;

import com.sales_savvy.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);
}

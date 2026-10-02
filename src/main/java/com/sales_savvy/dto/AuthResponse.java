package com.sales_savvy.dto;

public record AuthResponse(
        String token,
        String tokenType,
        String username,
        String role
) {
}
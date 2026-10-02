package com.sales_savvy.service;

import java.math.BigDecimal;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sales_savvy.dto.AddToCartRequest;
import com.sales_savvy.dto.CartItemResponse;
import com.sales_savvy.dto.CartResponse;
import com.sales_savvy.dto.UpdateCartRequest;
import com.sales_savvy.entity.CartItem;
import com.sales_savvy.entity.Product;
import com.sales_savvy.entity.User;
import com.sales_savvy.repository.CartItemRepository;
import com.sales_savvy.repository.ProductRepository;
import com.sales_savvy.repository.UserRepository;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public String addToCart(AddToCartRequest request) {
        User user = getCurrentUser();

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.productId()));

        if (request.quantity() > product.getStock()) {
            throw new RuntimeException("Requested quantity exceeds available stock");
        }

        CartItem cartItem = cartItemRepository.findByUserAndProduct(user, product)
                .orElse(null);

        if (cartItem != null) {
            int newQuantity = cartItem.getQuantity() + request.quantity();

            if (newQuantity > product.getStock()) {
                throw new RuntimeException("Requested quantity exceeds available stock");
            }

            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);
            return "Product quantity updated in cart";
        }

        CartItem newCartItem = new CartItem(user, product, request.quantity());
        cartItemRepository.save(newCartItem);

        return "Product added to cart successfully";
    }

    public CartResponse getCart() {
        User user = getCurrentUser();

        List<CartItemResponse> items = cartItemRepository.findByUser(user)
                .stream()
                .map(this::mapToCartItemResponse)
                .toList();

        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(items, totalAmount);
    }

    public String updateCartItem(Long cartItemId, UpdateCartRequest request) {
        User user = getCurrentUser();

        CartItem cartItem = cartItemRepository.findByIdAndUser(cartItemId, user)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (request.quantity() > cartItem.getProduct().getStock()) {
            throw new RuntimeException("Requested quantity exceeds available stock");
        }

        cartItem.setQuantity(request.quantity());
        cartItemRepository.save(cartItem);

        return "Cart item updated successfully";
    }

    public String removeCartItem(Long cartItemId) {
        User user = getCurrentUser();

        CartItem cartItem = cartItemRepository.findByIdAndUser(cartItemId, user)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        cartItemRepository.delete(cartItem);
        return "Cart item removed successfully";
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Logged in user not found"));
    }

    private CartItemResponse mapToCartItemResponse(CartItem cartItem) {
        Product product = cartItem.getProduct();
        BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        return new CartItemResponse(
                cartItem.getId(),
                product.getId(),
                product.getName(),
                product.getPrice(),
                cartItem.getQuantity(),
                subtotal,
                product.getCategory(),
                product.getImageUrl()
        );
    }
}

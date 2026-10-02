# 🛒 SalesSavvy - E-Commerce Application

[![Java](https://img.shields.io/badge/Java-22-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1.svg)](https://www.mysql.com/)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT-green.svg)](https://spring.io/projects/spring-security)
[![Razorpay](https://img.shields.io/badge/Payment-Razorpay-blue.svg)](https://razorpay.com/)

A full-stack e-commerce application built with **Java Spring Boot** to provide secure product management, customer shopping, cart management, order processing, and online payment functionality.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Design](#system-design)
- [API Services](#api-services)
- [Security](#security)
- [Getting Started](#getting-started)
- [Author](#author)

## 🎯 Overview

SalesSavvy is a monolithic full-stack e-commerce application designed to manage products, customer carts, orders, payments, and inventory through a Spring Boot REST API and web-based frontend.

The application provides separate customer and admin functionality with **JWT-based authentication** and **role-based authorization**.

## ✨ Key Features

### Authentication & Authorization

- **JWT-based Authentication** for secure login sessions
- **Role-Based Access Control** for `USER` and `ADMIN`
- **BCrypt Password Encryption** for secure password storage
- Stateless session management using Spring Security

### Product Management

- Admin product creation
- View all products
- View individual product details
- Update product information
- Delete products
- Product stock management

### Shopping Cart

- Add products to cart
- View cart items
- Update product quantities
- Remove products from cart
- Automatic subtotal and total calculation
- Stock availability validation

### Order & Payment Management

- Create purchase orders from cart
- Razorpay payment order creation
- Razorpay payment signature verification
- Payment transaction persistence
- Order item persistence
- Automatic stock reduction after successful payment
- Cart clearing after successful payment

## 🛠️ Technology Stack

### Backend

- **Language**: Java 22
- **Framework**: Spring Boot
- **Security**: Spring Security + JWT
- **Persistence**: Spring Data JPA + Hibernate
- **API**: REST APIs
- **Build Tool**: Maven

### Database

- **MySQL 8.x**

### Frontend

- HTML
- CSS
- JavaScript

### Payment

- Razorpay Payment Gateway

### Development & Testing

- Spring Tool Suite (STS)
- Postman
- MySQL Workbench
- Git & GitHub

## 🎨 System Design

The application follows a layered Spring Boot architecture:

```text
┌───────────────────────────────┐
│          Frontend             │
│       HTML / CSS / JS         │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│        REST Controllers       │
│   Auth / Product / Cart /     │
│          Payment / Admin      │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│           Services            │
│      Business Logic           │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       Spring Data JPA         │
│         Repositories          │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│            MySQL              │
│  Users / Products / Cart /    │
│ Orders / Payments             │
└───────────────────────────────┘
```

### Database Entities

- User
- Product
- CartItem
- PurchaseOrder
- OrderItem
- PaymentTransaction

## 🔌 API Services

### Authentication

```text
POST   /auth/register
POST   /auth/login
```

### Customer

```text
GET    /products
POST   /customer/cart
GET    /customer/cart
PUT    /customer/cart/{cartItemId}
DELETE /customer/cart/{cartItemId}
POST   /customer/payment/create-order
POST   /customer/payment/verify
```

### Admin

```text
GET    /admin/home
POST   /admin/products
GET    /admin/products
GET    /admin/products/{id}
PUT    /admin/products/{id}
DELETE /admin/products/{id}
```

## 🔒 Security

### Authentication & Authorization

- JWT authentication for protected APIs
- Role-based access for customer and admin operations
- BCrypt password hashing
- Stateless authentication using Spring Security
- Custom JWT authentication filter

### Payment Security

- Razorpay order ID validation
- Payment signature verification
- Payment transaction persistence
- Prevention of duplicate payment processing
- Stock validation before completing an order

## 🏁 Getting Started

### Prerequisites

- Java 22
- Maven
- MySQL 8.x
- Razorpay account/API credentials

### Local Development Setup

1. **Clone the repository**

```bash
git clone YOUR_REPOSITORY_URL
```

2. **Configure MySQL**

Create the `salessavvy` database and update your MySQL credentials in `application.properties`.

3. **Configure Razorpay**

Add your Razorpay key ID and secret to the application configuration.

4. **Run the application**

```bash
mvn spring-boot:run
```

Or run the main Spring Boot application directly from STS.

5. **Access the application**

```text
http://localhost:8080
```

### API Testing

The REST APIs were tested using **Postman**, including authentication, product, cart, admin, and payment workflows.

## 👨‍💻 Author

**Sandesh Singh**

[![GitHub](https://img.shields.io/badge/GitHub-SalesSavvy-181717?logo=github&logoColor=white)](https://github.com/sandesh-04/sales-savvy-E-commerce-application)

---

**Note:** This README describes the current SalesSavvy application and its implemented functionality. Deployment and additional infrastructure technologies can be added as the project evolves.

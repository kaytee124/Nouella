-- =============================================
-- E-Commerce Database Schema
-- =============================================
-- This SQL file creates all tables, foreign keys, and indexes
-- for the e-commerce system based on the ER diagram.
-- =============================================
use nouella;

-- Drop tables if they exist (in reverse order of dependencies)
-- Uncomment the following lines if you want to drop existing tables
 DROP TABLE IF EXISTS Payment;
 DROP TABLE IF EXISTS Order_Items;
 DROP TABLE IF EXISTS Orders;
 DROP TABLE IF EXISTS Cart_Items;
 DROP TABLE IF EXISTS Cart;
 DROP TABLE IF EXISTS Product;
 DROP TABLE IF EXISTS Categories;
 DROP TABLE IF EXISTS Customers;
 DROP TABLE IF EXISTS Superadmin;

-- =============================================
-- 1. Superadmin Table
-- =============================================
CREATE TABLE IF NOT EXISTS Superadmin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emailName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    INDEX idx_email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. Customers Table
-- =============================================
CREATE TABLE IF NOT EXISTS Customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emailName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    INDEX idx_email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. Categories Table
-- =============================================
CREATE TABLE IF NOT EXISTS Categories (
    catid INT AUTO_INCREMENT PRIMARY KEY,
    adminid INT NOT NULL,
    catName VARCHAR(255) NOT NULL,
    Description TEXT,
    INDEX idx_adminid (adminid),
    CONSTRAINT fk_categories_adminid 
        FOREIGN KEY (adminid) 
        REFERENCES Superadmin(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. Product Table
-- =============================================
CREATE TABLE IF NOT EXISTS Product (
    productid INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(255) NOT NULL,
    Description TEXT,
    ProductPhoto VARCHAR(255),
    catid INT NOT NULL,
    Price INT NOT NULL,
    Stock INT NOT NULL DEFAULT 0,
    INDEX idx_catid (catid),
    INDEX idx_productname (ProductName),
    INDEX idx_price (Price),
    CONSTRAINT fk_product_catid 
        FOREIGN KEY (catid) 
        REFERENCES Categories(catid) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. Cart Table
-- =============================================
CREATE TABLE IF NOT EXISTS Cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerid INT NOT NULL,
    carttotal INT NOT NULL DEFAULT 0,
    dateadded DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	status ENUM('Active', 'Processed', 'Canceled') NOT NULL DEFAULT 'Active',
    INDEX idx_customerid (customerid),
    INDEX idx_dateadded (dateadded),
    CONSTRAINT fk_cart_customerid 
        FOREIGN KEY (customerid) 
        REFERENCES Customers(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. Cart_Items Table
-- =============================================
CREATE TABLE IF NOT EXISTS Cart_Items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cartID INT NOT NULL,
    productid INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    dateadded DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cartid (cartID),
    INDEX idx_productid (productid),
    INDEX idx_dateadded (dateadded),
    CONSTRAINT fk_cart_items_cartid 
        FOREIGN KEY (cartID) 
        REFERENCES Cart(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_cart_items_productid 
        FOREIGN KEY (productid) 
        REFERENCES Product(productid) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 7. Orders Table
-- =============================================
CREATE TABLE IF NOT EXISTS Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerid INT NOT NULL,
    dateadded DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'paid', 'Delivered') NOT NULL DEFAULT 'Pending',
    address VARCHAR(500) NULL,
	ordertotal DECIMAL(10, 2) NOT NULL,
    INDEX idx_customerid (customerid),
    INDEX idx_status (status),
    INDEX idx_dateadded (dateadded),
    CONSTRAINT fk_orders_customerid 
        FOREIGN KEY (customerid) 
        REFERENCES Customers(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 8. Order_Items Table
-- =============================================
CREATE TABLE IF NOT EXISTS Order_Items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderID INT NOT NULL,
    productid INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    INDEX idx_orderid (orderID),
    INDEX idx_productid (productid),
    CONSTRAINT fk_order_items_orderid 
        FOREIGN KEY (orderID) 
        REFERENCES Orders(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_productid 
        FOREIGN KEY (productid) 
        REFERENCES Product(productid) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 9. Payment Table
-- =============================================
CREATE TABLE IF NOT EXISTS Payment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    TransactionId INT NOT NULL UNIQUE,
    orderid INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    amount_paid DECIMAL(15, 2) NOT NULL,
    paymentMethod VARCHAR(255) NOT NULL,
    date_paid DATETIME NOT NULL,
    date_completed DATETIME,
    Status ENUM('Completed', 'Pending', 'Unsuccessful') NOT NULL DEFAULT 'Pending',
    customerid INT NOT NULL,
    INDEX idx_orderid (orderid),
    INDEX idx_customerid (customerid),
    INDEX idx_transactionid (TransactionId),
    INDEX idx_status (Status),
    INDEX idx_date_paid (date_paid),
    CONSTRAINT fk_payment_orderid 
        FOREIGN KEY (orderid) 
        REFERENCES Orders(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_payment_customerid 
        FOREIGN KEY (customerid) 
        REFERENCES Customers(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- End of Schema Creation
-- =============================================


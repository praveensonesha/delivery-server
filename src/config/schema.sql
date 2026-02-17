-- Create database
CREATE DATABASE IF NOT EXISTS delivery_track;
USE delivery_track;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  staff_id INT NOT NULL,
  building_name VARCHAR(150) NOT NULL,
  room_no VARCHAR(50) NOT NULL,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(15),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_staff (staff_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  delivery_id INT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_mode ENUM('cash', 'online') DEFAULT 'cash',
  collected_by INT NOT NULL,
  note TEXT,
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
  FOREIGN KEY (collected_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_delivery (delivery_id),
  INDEX idx_collected (collected_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

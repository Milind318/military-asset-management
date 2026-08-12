-- =========================================================
-- Military Asset Management System
-- MySQL 8.x schema
-- Run this entire file in MySQL Workbench.
-- =========================================================

CREATE DATABASE IF NOT EXISTS military_assets
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE military_assets;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS expenditures;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS transfers;
DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS equipment_types;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS bases;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- Bases
-- =========================================================
CREATE TABLE bases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================
-- Users / RBAC
-- =========================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM(
    'ADMIN',
    'BASE_COMMANDER',
    'LOGISTICS_OFFICER'
  ) NOT NULL,
  base_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_users_base
    FOREIGN KEY (base_id)
    REFERENCES bases(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================================================
-- Equipment Types
-- =========================================================
CREATE TABLE equipment_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category ENUM(
    'WEAPON',
    'VEHICLE',
    'AMMUNITION'
  ) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================
-- Purchases
-- =========================================================
CREATE TABLE purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  base_id INT NOT NULL,
  equipment_type_id INT NOT NULL,
  quantity INT NOT NULL,
  purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  supplier VARCHAR(150) NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT chk_purchase_quantity
    CHECK (quantity > 0),

  CONSTRAINT fk_purchases_base
    FOREIGN KEY (base_id)
    REFERENCES bases(id),

  CONSTRAINT fk_purchases_equipment
    FOREIGN KEY (equipment_type_id)
    REFERENCES equipment_types(id),

  CONSTRAINT fk_purchases_user
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE SET NULL,

  INDEX idx_purchases_base (base_id),
  INDEX idx_purchases_equipment (equipment_type_id),
  INDEX idx_purchases_created (created_at)
) ENGINE=InnoDB;

-- =========================================================
-- Transfers
-- =========================================================
CREATE TABLE transfers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source_base_id INT NOT NULL,
  destination_base_id INT NOT NULL,
  equipment_type_id INT NOT NULL,
  quantity INT NOT NULL,

  status ENUM(
    'PENDING',
    'IN_TRANSIT',
    'COMPLETED'
  ) NOT NULL DEFAULT 'COMPLETED',

  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  initiated_by INT NULL,

  CONSTRAINT chk_transfer_quantity
    CHECK (quantity > 0),

  CONSTRAINT chk_transfer_bases
    CHECK (source_base_id <> destination_base_id),

  CONSTRAINT fk_transfers_source
    FOREIGN KEY (source_base_id)
    REFERENCES bases(id),

  CONSTRAINT fk_transfers_destination
    FOREIGN KEY (destination_base_id)
    REFERENCES bases(id),

  CONSTRAINT fk_transfers_equipment
    FOREIGN KEY (equipment_type_id)
    REFERENCES equipment_types(id),

  CONSTRAINT fk_transfers_user
    FOREIGN KEY (initiated_by)
    REFERENCES users(id)
    ON DELETE SET NULL,

  INDEX idx_transfers_source (source_base_id),
  INDEX idx_transfers_destination (destination_base_id),
  INDEX idx_transfers_equipment (equipment_type_id),
  INDEX idx_transfers_timestamp (timestamp)
) ENGINE=InnoDB;

-- =========================================================
-- Assignments
-- =========================================================
CREATE TABLE assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  base_id INT NOT NULL,
  equipment_type_id INT NOT NULL,
  quantity INT NOT NULL,
  personnel_name VARCHAR(120) NOT NULL,
  purpose VARCHAR(255) NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT chk_assignment_quantity
    CHECK (quantity > 0),

  CONSTRAINT fk_assignments_base
    FOREIGN KEY (base_id)
    REFERENCES bases(id),

  CONSTRAINT fk_assignments_equipment
    FOREIGN KEY (equipment_type_id)
    REFERENCES equipment_types(id),

  CONSTRAINT fk_assignments_user
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE SET NULL,

  INDEX idx_assignments_base (base_id),
  INDEX idx_assignments_equipment (equipment_type_id)
) ENGINE=InnoDB;

-- =========================================================
-- Expenditures
-- =========================================================
CREATE TABLE expenditures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  base_id INT NOT NULL,
  equipment_type_id INT NOT NULL,
  quantity INT NOT NULL,
  reason VARCHAR(255) NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT chk_expenditure_quantity
    CHECK (quantity > 0),

  CONSTRAINT fk_expenditures_base
    FOREIGN KEY (base_id)
    REFERENCES bases(id),

  CONSTRAINT fk_expenditures_equipment
    FOREIGN KEY (equipment_type_id)
    REFERENCES equipment_types(id),

  CONSTRAINT fk_expenditures_user
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE SET NULL,

  INDEX idx_expenditures_base (base_id),
  INDEX idx_expenditures_equipment (equipment_type_id),
  INDEX idx_expenditures_created (created_at)
) ENGINE=InnoDB;

-- =========================================================
-- Audit Logs
-- =========================================================
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action ENUM(
    'PURCHASE',
    'TRANSFER',
    'ASSIGNMENT',
    'EXPENDITURE'
  ) NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_audit_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL,

  INDEX idx_audit_created (created_at),
  INDEX idx_audit_action (action)
) ENGINE=InnoDB;

-- =========================================================
-- Seed Bases
-- =========================================================
INSERT INTO bases (name, location) VALUES
('Fort Alpha', 'Northern Command'),
('Fort Bravo', 'Western Command'),
('Fort Charlie', 'Eastern Command');

-- =========================================================
-- Seed Equipment
-- =========================================================
INSERT INTO equipment_types (name, category) VALUES
('M4 Carbine', 'WEAPON'),
('Humvee', 'VEHICLE'),
('5.56mm Ammunition', 'AMMUNITION'),
('9mm Ammunition', 'AMMUNITION');

-- Demo users are created/updated by:
-- npm run seed
--
-- Demo credentials:
-- admin_user / AdminPass123!
-- commander_alpha / CommandPass123!
-- logistics_officer / LogisticsPass123!

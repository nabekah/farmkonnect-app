-- FarmKonnect Database Initialization Script
-- This script runs automatically when the MySQL container starts

-- Create database if not exists (usually already created by MYSQL_DATABASE env var)
CREATE DATABASE IF NOT EXISTS farmkonnect;
USE farmkonnect;

-- Set default charset to utf8mb4
ALTER DATABASE farmkonnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a basic health check table
CREATE TABLE IF NOT EXISTS health_check (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status VARCHAR(50) DEFAULT 'healthy',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial health check record
INSERT INTO health_check (status) VALUES ('healthy');

-- Grant all privileges to the application user
GRANT ALL PRIVILEGES ON farmkonnect.* TO 'farmkonnect'@'%';
FLUSH PRIVILEGES;

-- Note: The actual schema will be created by Drizzle migrations when the app starts
-- Run: pnpm db:push

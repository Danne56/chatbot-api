-- database-setup.sql
-- Database schema for the Secure Gateway API

-- Create the database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS n8n;
USE n8n;

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  timestamp DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone_number (phone_number)
);

-- Create message_logs table
CREATE TABLE IF NOT EXISTS message_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_id INT NOT NULL,
  timestamp DATETIME NOT NULL,
  message_in TEXT NOT NULL,
  message_out TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  INDEX idx_contact_id (contact_id),
  INDEX idx_timestamp (timestamp)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_id INT UNIQUE NOT NULL,
  has_opted_in BOOLEAN DEFAULT FALSE,
  awaiting_optin BOOLEAN DEFAULT FALSE,
  opted_in_at DATETIME NULL,
  opted_out_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  INDEX idx_contact_id (contact_id),
  INDEX idx_has_opted_in (has_opted_in)
);

-- Create a dedicated database user for the API
-- Note: Replace 'strong_password' with a secure password
CREATE USER IF NOT EXISTS 'secure_user'@'localhost' IDENTIFIED BY 'strong_password';

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE ON n8n.contacts TO 'secure_user'@'localhost';
GRANT SELECT, INSERT, UPDATE ON n8n.message_logs TO 'secure_user'@'localhost';
GRANT SELECT, INSERT, UPDATE ON n8n.user_preferences TO 'secure_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show created tables
SHOW TABLES;

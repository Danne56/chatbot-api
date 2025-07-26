-- Create the database (if it doesn't exist) and use it
CREATE DATABASE IF NOT EXISTS n8n CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE n8n;

-- Create contacts table
-- Purpose: Stores unique phone numbers and their first encounter timestamp.
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_phone_number (phone_number)
);

-- Create message_logs table
-- Purpose: Logs incoming and outgoing messages linked to a contact.
CREATE TABLE IF NOT EXISTS message_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_id INT NOT NULL,
  timestamp DATETIME NOT NULL,
  message_in TEXT NOT NULL,
  message_out TEXT NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_contact_id (contact_id),
  INDEX idx_timestamp (timestamp)
);

-- Create user_preferences table
-- Purpose: Manages user consent status and daily introduction flag per contact.
CREATE TABLE IF NOT EXISTS user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_id INT UNIQUE NOT NULL,
  has_opted_in BOOLEAN DEFAULT FALSE,
  awaiting_optin BOOLEAN DEFAULT TRUE, -- Changed default to match original schema logic
  intro_sent_today BOOLEAN NOT NULL DEFAULT FALSE, -- Added for daily intro tracking
  opted_in_at DATETIME NULL,
  opted_out_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_contact_id (contact_id),
  INDEX idx_has_opted_in (has_opted_in)
  -- Consider adding an index on intro_sent_today if queried frequently
  -- INDEX idx_intro_sent_today (intro_sent_today)
);

-- Note: The creation of a specific database user and granting privileges
-- is typically done separately for security reasons and environment-specific passwords.
-- Example commands (run these manually or in a separate secure script):
-- CREATE USER IF NOT EXISTS 'n8n_user'@'localhost' IDENTIFIED BY 'a_strong_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON n8n.* TO 'n8n_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Show created tables
SHOW TABLES;
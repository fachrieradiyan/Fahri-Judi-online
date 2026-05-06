-- ===== ERPEEL336 DATABASE SCHEMA =====
-- MySQL Database Schema for Casino Website

CREATE DATABASE IF NOT EXISTS erpeel336_casino;
USE erpeel336_casino;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('member', 'vip', 'staff', 'admin', 'developer') DEFAULT 'member',
    balance DECIMAL(15, 2) DEFAULT 100000.00,
    initial_balance DECIMAL(15, 2) DEFAULT 100000.00,
    last_claim DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Game History Table
CREATE TABLE IF NOT EXISTS game_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_name VARCHAR(100) NOT NULL,
    bet_amount DECIMAL(15, 2) NOT NULL,
    result ENUM('win', 'loss') NOT NULL,
    win_amount DECIMAL(15, 2) DEFAULT 0.00,
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_game_name (game_name),
    INDEX idx_played_at (played_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deposits Table
CREATE TABLE IF NOT EXISTS deposits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily Claims Table
CREATE TABLE IF NOT EXISTS daily_claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    claim_amount DECIMAL(15, 2) NOT NULL,
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_claimed_at (claimed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions Table (for better session management)
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leaderboard View (for performance)
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    u.id,
    u.username,
    u.role,
    u.balance,
    COUNT(gh.id) as total_games,
    SUM(CASE WHEN gh.result = 'win' THEN gh.win_amount ELSE 0 END) as total_wins,
    SUM(CASE WHEN gh.result = 'loss' THEN gh.bet_amount ELSE 0 END) as total_losses
FROM users u
LEFT JOIN game_history gh ON u.id = gh.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.username, u.role, u.balance
ORDER BY u.balance DESC
LIMIT 100;

-- Insert Demo Accounts
INSERT INTO users (username, email, password, role, balance, initial_balance) VALUES
('member', 'member@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member', 100000.00, 100000.00),
('vip', 'vip@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vip', 500000.00, 500000.00),
('staff', 'staff@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff', 1000000.00, 1000000.00),
('admin', 'admin@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 5000000.00, 5000000.00),
('developer', 'developer@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'developer', 10000000.00, 10000000.00)
ON DUPLICATE KEY UPDATE username=username;

-- Password for all demo accounts: 123456

-- Create indexes for better performance
CREATE INDEX idx_game_history_composite ON game_history(user_id, played_at DESC);
CREATE INDEX idx_deposits_composite ON deposits(user_id, created_at DESC);
CREATE INDEX idx_daily_claims_composite ON daily_claims(user_id, claimed_at DESC);

-- Statistics View
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.id,
    u.username,
    u.balance,
    COUNT(gh.id) as total_games,
    SUM(CASE WHEN gh.result = 'win' THEN 1 ELSE 0 END) as wins,
    SUM(CASE WHEN gh.result = 'loss' THEN 1 ELSE 0 END) as losses,
    SUM(CASE WHEN gh.result = 'win' THEN gh.win_amount ELSE 0 END) as total_win_amount,
    SUM(CASE WHEN gh.result = 'loss' THEN gh.bet_amount ELSE 0 END) as total_loss_amount,
    MAX(gh.played_at) as last_played
FROM users u
LEFT JOIN game_history gh ON u.id = gh.user_id
GROUP BY u.id, u.username, u.balance;

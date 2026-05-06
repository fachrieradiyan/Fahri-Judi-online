<?php
/**
 * ERPEEL336 Casino - Authentication API
 * Handles login, register, logout
 */

require_once 'config.php';

$db = Database::getInstance()->getConnection();
$requestData = getRequestData();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin($db, $requestData);
        break;
    
    case 'register':
        handleRegister($db, $requestData);
        break;
    
    case 'logout':
        handleLogout();
        break;
    
    case 'check':
        checkAuth();
        break;
    
    default:
        jsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

function handleLogin($db, $data) {
    // Validate input
    if (!validateRequired($data, ['username', 'password'])) {
        jsonResponse(['success' => false, 'message' => 'Username dan password harus diisi'], 400);
    }
    
    $username = sanitizeInput($data['username']);
    $password = $data['password'];
    
    try {
        // Get user from database
        $stmt = $db->prepare("
            SELECT id, username, email, password, role, balance, initial_balance, last_claim, created_at
            FROM users 
            WHERE (username = :username OR email = :username) AND is_active = TRUE
        ");
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();
        
        if (!$user) {
            jsonResponse(['success' => false, 'message' => 'Username atau password salah'], 401);
        }
        
        // Verify password
        if (!password_verify($password, $user['password'])) {
            jsonResponse(['success' => false, 'message' => 'Username atau password salah'], 401);
        }
        
        // Update last login
        $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = :id");
        $stmt->execute(['id' => $user['id']]);
        
        // Create session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['logged_in'] = true;
        
        // Remove password from response
        unset($user['password']);
        
        // Get role config
        $roleConfig = ROLES[$user['role']];
        
        jsonResponse([
            'success' => true,
            'message' => 'Login berhasil',
            'user' => $user,
            'roleConfig' => $roleConfig
        ]);
        
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function handleRegister($db, $data) {
    // Validate input
    if (!validateRequired($data, ['username', 'email', 'password'])) {
        jsonResponse(['success' => false, 'message' => 'Semua field harus diisi'], 400);
    }
    
    $username = sanitizeInput($data['username']);
    $email = sanitizeInput($data['email']);
    $password = $data['password'];
    
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['success' => false, 'message' => 'Email tidak valid'], 400);
    }
    
    // Validate password length
    if (strlen($password) < 6) {
        jsonResponse(['success' => false, 'message' => 'Password minimal 6 karakter'], 400);
    }
    
    try {
        // Check if username exists
        $stmt = $db->prepare("SELECT id FROM users WHERE username = :username");
        $stmt->execute(['username' => $username]);
        if ($stmt->fetch()) {
            jsonResponse(['success' => false, 'message' => 'Username sudah digunakan'], 400);
        }
        
        // Check if email exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        if ($stmt->fetch()) {
            jsonResponse(['success' => false, 'message' => 'Email sudah digunakan'], 400);
        }
        
        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_HASH_ALGO, ['cost' => PASSWORD_HASH_COST]);
        
        // Insert user
        $role = 'member';
        $startBalance = ROLES[$role]['startBalance'];
        
        $stmt = $db->prepare("
            INSERT INTO users (username, email, password, role, balance, initial_balance)
            VALUES (:username, :email, :password, :role, :balance, :initial_balance)
        ");
        
        $stmt->execute([
            'username' => $username,
            'email' => $email,
            'password' => $hashedPassword,
            'role' => $role,
            'balance' => $startBalance,
            'initial_balance' => $startBalance
        ]);
        
        $userId = $db->lastInsertId();
        
        // Create session
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['role'] = $role;
        $_SESSION['logged_in'] = true;
        
        jsonResponse([
            'success' => true,
            'message' => 'Registrasi berhasil',
            'user' => [
                'id' => $userId,
                'username' => $username,
                'email' => $email,
                'role' => $role,
                'balance' => $startBalance,
                'initial_balance' => $startBalance
            ],
            'roleConfig' => ROLES[$role]
        ]);
        
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function handleLogout() {
    session_unset();
    session_destroy();
    
    jsonResponse([
        'success' => true,
        'message' => 'Logout berhasil'
    ]);
}

function checkAuth() {
    if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
        jsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
    }
    
    jsonResponse([
        'success' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'role' => $_SESSION['role']
        ]
    ]);
}
?>

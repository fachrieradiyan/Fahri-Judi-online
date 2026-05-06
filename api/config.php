<?php
/**
 * ERPEEL336 Casino - Configuration File
 * Database connection and global settings
 */

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('Asia/Jakarta');

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'erpeel336_casino');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Session Configuration
define('SESSION_LIFETIME', 86400); // 24 hours
define('SESSION_NAME', 'ERPEEL336_SESSION');

// Security
define('SECRET_KEY', 'erpeel336_secret_key_change_in_production');
define('PASSWORD_HASH_ALGO', PASSWORD_BCRYPT);
define('PASSWORD_HASH_COST', 10);

// Role Configuration
define('ROLES', [
    'member' => [
        'name' => 'MEMBER',
        'icon' => '👤',
        'startBalance' => 100000,
        'dailyClaim' => 50000,
        'winBonus' => 0
    ],
    'vip' => [
        'name' => 'VIP',
        'icon' => '⭐',
        'startBalance' => 500000,
        'dailyClaim' => 150000,
        'winBonus' => 0.20
    ],
    'staff' => [
        'name' => 'STAFF',
        'icon' => '🛡️',
        'startBalance' => 1000000,
        'dailyClaim' => 200000,
        'winBonus' => 0.30
    ],
    'admin' => [
        'name' => 'ADMIN',
        'icon' => '👑',
        'startBalance' => 5000000,
        'dailyClaim' => 500000,
        'winBonus' => 0.50
    ],
    'developer' => [
        'name' => 'DEVELOPER',
        'icon' => '💻',
        'startBalance' => 10000000,
        'dailyClaim' => 1000000,
        'winBonus' => 1.00
    ]
]);

// CORS Headers (for API)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Database Connection Class
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ];
            
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            die(json_encode([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage()
            ]));
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    // Prevent cloning
    private function __clone() {}
    
    // Prevent unserialization
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

// Helper Functions
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function getRequestData() {
    $data = json_decode(file_get_contents('php://input'), true);
    return $data ?? [];
}

function validateRequired($data, $fields) {
    foreach ($fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            return false;
        }
    }
    return true;
}

function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

function formatRupiah($amount) {
    return 'Rp ' . number_format($amount, 0, ',', '.');
}

// Start session
session_name(SESSION_NAME);
session_start();

// Session timeout check
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > SESSION_LIFETIME)) {
    session_unset();
    session_destroy();
    session_start();
}
$_SESSION['last_activity'] = time();
?>

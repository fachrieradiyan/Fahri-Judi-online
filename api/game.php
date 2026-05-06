<?php
/**
 * ERPEEL336 Casino - Game API
 * Handles game operations, balance updates, history
 */

require_once 'config.php';

// Check authentication
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
}

$db = Database::getInstance()->getConnection();
$requestData = getRequestData();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'play':
        handleGamePlay($db, $requestData);
        break;
    
    case 'balance':
        getBalance($db);
        break;
    
    case 'history':
        getHistory($db);
        break;
    
    case 'claim':
        handleDailyClaim($db);
        break;
    
    case 'reset':
        handleResetBalance($db);
        break;
    
    case 'deposit':
        handleDeposit($db, $requestData);
        break;
    
    default:
        jsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

function handleGamePlay($db, $data) {
    // Validate input
    if (!validateRequired($data, ['gameName', 'betAmount', 'result'])) {
        jsonResponse(['success' => false, 'message' => 'Data tidak lengkap'], 400);
    }
    
    $userId = $_SESSION['user_id'];
    $gameName = sanitizeInput($data['gameName']);
    $betAmount = floatval($data['betAmount']);
    $result = sanitizeInput($data['result']); // 'win' or 'loss'
    $winAmount = floatval($data['winAmount'] ?? 0);
    
    try {
        $db->beginTransaction();
        
        // Get current balance
        $stmt = $db->prepare("SELECT balance, role FROM users WHERE id = :id FOR UPDATE");
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            $db->rollBack();
            jsonResponse(['success' => false, 'message' => 'User not found'], 404);
        }
        
        $balanceBefore = $user['balance'];
        
        // Calculate new balance
        if ($result === 'win') {
            $balanceAfter = $balanceBefore + $winAmount;
        } else {
            $balanceAfter = $balanceBefore; // Already deducted on frontend
        }
        
        // Update balance
        $stmt = $db->prepare("UPDATE users SET balance = :balance WHERE id = :id");
        $stmt->execute([
            'balance' => $balanceAfter,
            'id' => $userId
        ]);
        
        // Insert game history
        $stmt = $db->prepare("
            INSERT INTO game_history (user_id, game_name, bet_amount, result, win_amount, balance_before, balance_after)
            VALUES (:user_id, :game_name, :bet_amount, :result, :win_amount, :balance_before, :balance_after)
        ");
        
        $stmt->execute([
            'user_id' => $userId,
            'game_name' => $gameName,
            'bet_amount' => $betAmount,
            'result' => $result,
            'win_amount' => $winAmount,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter
        ]);
        
        $db->commit();
        
        jsonResponse([
            'success' => true,
            'message' => 'Game recorded',
            'balance' => $balanceAfter
        ]);
        
    } catch (PDOException $e) {
        $db->rollBack();
        jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function getBalance($db) {
    $userId = $_SESSION['user_id'];
    
    try {
        $stmt = $db->prepare("SELECT balance FROM users WHERE id = :id");
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            jsonResponse(['success' => false, 'message' => 'User not found'], 404);
        }
        
        jsonResponse([
            'success' => true,
            'balance' => $user['balance']
        ]);
        
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function getHistory($db) {
    $userId = $_SESSION['user_id'];
    $limit = intval($_GET['limit'] ?? 50);
    
    try {
        $stmt = $db->prepare("
            SELECT game_name, bet_amount, result, win_amount, played_at
            FROM game_history
            WHERE user_id = :user_id
            ORDER BY played_at DESC
            LIMIT :limit
        ");
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $history = $stmt->fetchAll();
        
        // Calculate statistics
        $totalGames = count($history);
        $totalWins = 0;
        $totalLosses = 0;
        
        foreach ($history as $game) {
            if ($game['result'] === 'win') {
                $totalWins += $game['win_amount'];
            } else {
                $totalLosses += $game['bet_amount'];
            }
        }
        
        jsonResponse([
            'success' => true,
            'history' => $history,
            'statistics' => [
                'totalGames' => $totalGames,
                'totalWins' => $totalWins,
                'totalLosses' => $totalLosses
            ]
        ]);
        
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function handleDailyClaim($db) {
    $userId = $_SESSION['user_id'];
    
    try {
        $db->beginTransaction();
        
        // Get user data
        $stmt = $db->prepare("SELECT role, balance, last_claim FROM users WHERE id = :id FOR UPDATE");
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            $db->rollBack();
            jsonResponse(['success' => false, 'message' => 'User not found'], 404);
        }
        
        // Check if can claim
        if ($user['last_claim']) {
            $lastClaim = new DateTime($user['last_claim']);
            $now = new DateTime();
            $diff = $now->diff($lastClaim);
            $hoursSince = ($diff->days * 24) + $diff->h;
            
            if ($hoursSince < 24) {
                $db->rollBack();
                $hoursLeft = 24 - $hoursSince;
                jsonResponse([
                    'success' => false,
                    'message' => "Klaim tersedia dalam {$hoursLeft} jam",
                    'hoursLeft' => $hoursLeft
                ], 400);
            }
        }
        
        // Get claim amount based on role
        $claimAmount = ROLES[$user['role']]['dailyClaim'];
        $newBalance = $user['balance'] + $claimAmount;
        
        // Update user
        $stmt = $db->prepare("
            UPDATE users 
            SET balance = :balance, last_claim = NOW()
            WHERE id = :id
        ");
        $stmt->execute([
            'balance' => $newBalance,
            'id' => $userId
        ]);
        
        // Record claim
        $stmt = $db->prepare("
            INSERT INTO daily_claims (user_id, claim_amount)
            VALUES (:user_id, :claim_amount)
        ");
        $stmt->execute([
            'user_id' => $userId,
            'claim_amount' => $claimAmount
        ]);
        
        $db->commit();
        
        jsonResponse([
            'success' => true,
            'message' => 'Klaim harian berhasil',
            'claimAmount' => $claimAmount,
            'newBalance' => $newBalance
        ]);
        
    } catch (PDOException $e) {
        $db->rollBack();
        jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function handleResetBalance($db) {
    $userId = $_SESSION['user_id'];
    
    try {
        // Get user role and initial balance
        $stmt = $db->prepare("SELECT role, initial_balance FROM users WHERE id = :id");
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            jsonResponse(['success' => false, 'message' => 'User not found'], 404);
        }
        
        // Reset balance
        $stmt = $db->prepare("UPDATE users SET balance = :balance WHERE id = :id");
        $stmt->execute([
            'balance' => $user['initial_balance'],
            'id' => $userId
        ]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Saldo berhasil direset',
            'newBalance' => $user['initial_balance']
        ]);
        
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function handleDeposit($db, $data) {
    // Validate input
    if (!validateRequired($data, ['amount', 'paymentMethod'])) {
        jsonResponse(['success' => false, 'message' => 'Data tidak lengkap'], 400);
    }
    
    $userId = $_SESSION['user_id'];
    $amount = floatval($data['amount']);
    $paymentMethod = sanitizeInput($data['paymentMethod']);
    
    if ($amount < 10000) {
        jsonResponse(['success' => false, 'message' => 'Minimal deposit Rp 10.000'], 400);
    }
    
    try {
        $db->beginTransaction();
        
        // Get current balance
        $stmt = $db->prepare("SELECT balance FROM users WHERE id = :id FOR UPDATE");
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            $db->rollBack();
            jsonResponse(['success' => false, 'message' => 'User not found'], 404);
        }
        
        $newBalance = $user['balance'] + $amount;
        
        // Update balance
        $stmt = $db->prepare("UPDATE users SET balance = :balance WHERE id = :id");
        $stmt->execute([
            'balance' => $newBalance,
            'id' => $userId
        ]);
        
        // Record deposit
        $stmt = $db->prepare("
            INSERT INTO deposits (user_id, amount, payment_method, status)
            VALUES (:user_id, :amount, :payment_method, 'completed')
        ");
        $stmt->execute([
            'user_id' => $userId,
            'amount' => $amount,
            'payment_method' => $paymentMethod
        ]);
        
        $db->commit();
        
        jsonResponse([
            'success' => true,
            'message' => 'Deposit berhasil',
            'amount' => $amount,
            'newBalance' => $newBalance
        ]);
        
    } catch (PDOException $e) {
        $db->rollBack();
        jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}
?>

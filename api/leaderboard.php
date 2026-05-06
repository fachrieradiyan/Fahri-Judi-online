<?php
/**
 * ERPEEL336 Casino - Leaderboard API
 * Handles leaderboard data
 */

require_once 'config.php';

$db = Database::getInstance()->getConnection();
$action = $_GET['action'] ?? 'get';
$limit = intval($_GET['limit'] ?? 10);

switch ($action) {
    case 'get':
        getLeaderboard($db, $limit);
        break;
    
    case 'stats':
        getGlobalStats($db);
        break;
    
    default:
        jsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

function getLeaderboard($db, $limit) {
    try {
        $stmt = $db->prepare("
            SELECT 
                username,
                role,
                balance,
                total_games,
                total_wins,
                total_losses
            FROM leaderboard_view
            LIMIT :limit
        ");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $leaderboard = $stmt->fetchAll();
        
        jsonResponse([
            'success' => true,
            'leaderboard' => $leaderboard
        ]);
        
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function getGlobalStats($db) {
    try {
        // Total users
        $stmt = $db->query("SELECT COUNT(*) as total FROM users WHERE is_active = TRUE");
        $totalUsers = $stmt->fetch()['total'];
        
        // Total games played
        $stmt = $db->query("SELECT COUNT(*) as total FROM game_history");
        $totalGames = $stmt->fetch()['total'];
        
        // Total balance in system
        $stmt = $db->query("SELECT SUM(balance) as total FROM users WHERE is_active = TRUE");
        $totalBalance = $stmt->fetch()['total'];
        
        // Total wins
        $stmt = $db->query("SELECT SUM(win_amount) as total FROM game_history WHERE result = 'win'");
        $totalWins = $stmt->fetch()['total'];
        
        // Total losses
        $stmt = $db->query("SELECT SUM(bet_amount) as total FROM game_history WHERE result = 'loss'");
        $totalLosses = $stmt->fetch()['total'];
        
        jsonResponse([
            'success' => true,
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalGames' => $totalGames,
                'totalBalance' => $totalBalance,
                'totalWins' => $totalWins,
                'totalLosses' => $totalLosses
            ]
        ]);
        
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}
?>

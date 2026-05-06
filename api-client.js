/**
 * ERPEEL336 Casino - API Client
 * Handles all API communications with PHP backend
 */

const API_BASE_URL = 'api/';

class APIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }
    
    // Generic API call method
    async call(endpoint, method = 'GET', data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin' // Include cookies
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(this.baseURL + endpoint, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'API request failed');
            }
            
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // Authentication APIs
    async login(username, password) {
        return await this.call('auth.php?action=login', 'POST', {
            username,
            password
        });
    }
    
    async register(username, email, password) {
        return await this.call('auth.php?action=register', 'POST', {
            username,
            email,
            password
        });
    }
    
    async logout() {
        return await this.call('auth.php?action=logout', 'POST');
    }
    
    async checkAuth() {
        return await this.call('auth.php?action=check');
    }
    
    // Game APIs
    async recordGame(gameName, betAmount, result, winAmount = 0) {
        return await this.call('game.php?action=play', 'POST', {
            gameName,
            betAmount,
            result,
            winAmount
        });
    }
    
    async getBalance() {
        return await this.call('game.php?action=balance');
    }
    
    async getHistory(limit = 50) {
        return await this.call(`game.php?action=history&limit=${limit}`);
    }
    
    async claimDaily() {
        return await this.call('game.php?action=claim', 'POST');
    }
    
    async resetBalance() {
        return await this.call('game.php?action=reset', 'POST');
    }
    
    async deposit(amount, paymentMethod) {
        return await this.call('game.php?action=deposit', 'POST', {
            amount,
            paymentMethod
        });
    }
    
    // Leaderboard APIs
    async getLeaderboard(limit = 10) {
        return await this.call(`leaderboard.php?action=get&limit=${limit}`);
    }
    
    async getGlobalStats() {
        return await this.call('leaderboard.php?action=stats');
    }
}

// Create global instance
const api = new APIClient();

// Enhanced functions that integrate with existing code
async function handleLoginWithAPI() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showNotification('❌ Mohon isi semua field', 'error');
        return;
    }
    
    try {
        const result = await api.login(username, password);
        
        if (result.success) {
            currentUser = result.user;
            balance = result.user.balance;
            
            // Load game history from server
            const historyResult = await api.getHistory();
            if (historyResult.success) {
                gameHistory = historyResult.history;
            }
            
            showNotification(`✅ ${result.message}`, 'success');
            showDashboard();
        }
    } catch (error) {
        showNotification(`❌ ${error.message}`, 'error');
    }
}

async function handleRegisterWithAPI() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    if (!username || !email || !password) {
        showNotification('❌ Mohon isi semua field', 'error');
        return;
    }
    
    try {
        const result = await api.register(username, email, password);
        
        if (result.success) {
            currentUser = result.user;
            balance = result.user.balance;
            gameHistory = [];
            
            showNotification(`✅ ${result.message}`, 'success');
            showDashboard();
        }
    } catch (error) {
        showNotification(`❌ ${error.message}`, 'error');
    }
}

async function logoutWithAPI() {
    try {
        await api.logout();
        
        currentUser = null;
        balance = 0;
        gameHistory = [];
        
        document.getElementById('dashboardScreen').classList.remove('active');
        document.getElementById('loginScreen').classList.add('active');
        
        showNotification('👋 Logout berhasil', 'success');
    } catch (error) {
        showNotification(`❌ ${error.message}`, 'error');
    }
}

async function claimDailyWithAPI() {
    try {
        const result = await api.claimDaily();
        
        if (result.success) {
            balance = result.newBalance;
            updateBalance();
            showNotification(`🎁 ${result.message}! +${formatRupiah(result.claimAmount)}`, 'success');
        }
    } catch (error) {
        showNotification(`❌ ${error.message}`, 'error');
    }
}

async function resetBalanceWithAPI() {
    if (!currentUser) return;
    
    const confirmed = confirm(`🔄 Reset saldo ke saldo awal?\n\nSaldo saat ini: ${formatRupiah(balance)}\nRiwayat permainan akan tetap tersimpan.`);
    
    if (confirmed) {
        try {
            const result = await api.resetBalance();
            
            if (result.success) {
                balance = result.newBalance;
                updateBalance();
                showNotification(`✅ ${result.message}`, 'success');
            }
        } catch (error) {
            showNotification(`❌ ${error.message}`, 'error');
        }
    }
}

async function processDepositWithAPI() {
    if (selectedDepositAmount < 10000) {
        showNotification('❌ Minimal deposit Rp 10.000', 'error');
        return;
    }
    
    if (!selectedPaymentMethod) {
        showNotification('❌ Pilih metode pembayaran', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('depositSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Memproses...';
    
    try {
        const result = await api.deposit(selectedDepositAmount, selectedPaymentMethod);
        
        if (result.success) {
            balance = result.newBalance;
            updateBalance();
            showNotification(`✅ ${result.message}! +${formatRupiah(result.amount)}`, 'success');
            closeDepositModal();
        }
    } catch (error) {
        showNotification(`❌ ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '💳 Proses Deposit';
    }
}

async function addToHistoryWithAPI(game, bet, result, winAmount) {
    // Add to local history immediately for instant feedback
    const historyItem = {
        game_name: game,
        bet_amount: bet,
        result: result,
        win_amount: winAmount,
        played_at: new Date().toISOString()
    };
    
    gameHistory.unshift(historyItem);
    if (gameHistory.length > 100) gameHistory.pop();
    
    updateHistory();
    
    // Send to server in background
    try {
        await api.recordGame(game, bet, result, winAmount);
    } catch (error) {
        console.error('Failed to record game:', error);
        // Don't show error to user, just log it
    }
}

async function updateLeaderboardWithAPI() {
    try {
        const result = await api.getLeaderboard(10);
        
        if (result.success) {
            const leaderboardList = document.getElementById('leaderboardList');
            
            if (result.leaderboard.length === 0) {
                leaderboardList.innerHTML = '<p class="empty-state">Belum ada data</p>';
                return;
            }
            
            leaderboardList.innerHTML = result.leaderboard.map((user, index) => {
                let rankClass = '';
                if (index === 0) rankClass = 'gold';
                else if (index === 1) rankClass = 'silver';
                else if (index === 2) rankClass = 'bronze';
                
                const roleConfig = ROLES[user.role || 'member'];
                
                return `
                    <div class="leaderboard-item">
                        <div class="rank ${rankClass}">#${index + 1}</div>
                        <div style="flex: 1;">
                            <strong>${user.username}</strong>
                            <span class="role-badge ${user.role || 'member'}" style="margin-left: 10px; font-size: 0.7em;">
                                ${roleConfig.icon} ${roleConfig.name}
                            </span>
                        </div>
                        <div style="text-align: right;">
                            <strong>${formatRupiah(user.balance || 0)}</strong>
                            <div style="font-size: 0.8em; color: #aaa;">${user.total_games || 0} games</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
    }
}

async function loadAdminDataWithAPI() {
    try {
        const result = await api.getGlobalStats();
        
        if (result.success) {
            const stats = result.stats;
            
            document.getElementById('totalUsers').textContent = stats.totalUsers;
            document.getElementById('totalSystemBalance').textContent = formatRupiah(stats.totalBalance || 0);
            document.getElementById('totalGamesPlayed').textContent = stats.totalGames;
        }
    } catch (error) {
        console.error('Failed to load admin data:', error);
    }
}

// Auto-sync balance periodically
setInterval(async () => {
    if (currentUser) {
        try {
            const result = await api.getBalance();
            if (result.success && result.balance !== balance) {
                balance = result.balance;
                updateBalance();
            }
        } catch (error) {
            // Silently fail
        }
    }
}, 30000); // Every 30 seconds

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { api, APIClient };
}

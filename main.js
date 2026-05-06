// ===== ROLE CONFIGURATION =====
const ROLES = {
    member: {
        name: 'MEMBER',
        icon: '👤',
        color: '#4a90e2',
        startBalance: 100000,
        dailyClaim: 50000,
        benefits: [
            'Saldo awal Rp 100.000',
            'Klaim harian Rp 50.000',
            'Akses semua game dasar'
        ]
    },
    vip: {
        name: 'VIP',
        icon: '⭐',
        color: '#ffd700',
        startBalance: 500000,
        dailyClaim: 150000,
        benefits: [
            'Saldo awal Rp 500.000',
            'Klaim harian Rp 150.000',
            'Bonus kemenangan +20%',
            'Akses game eksklusif'
        ]
    },
    staff: {
        name: 'STAFF',
        icon: '🛡️',
        color: '#00d4ff',
        startBalance: 1000000,
        dailyClaim: 200000,
        benefits: [
            'Saldo awal Rp 1.000.000',
            'Klaim harian Rp 200.000',
            'Bonus kemenangan +30%',
            'Lihat statistik user'
        ]
    },
    admin: {
        name: 'ADMIN',
        icon: '👑',
        color: '#ff6b6b',
        startBalance: 5000000,
        dailyClaim: 500000,
        benefits: [
            'Saldo awal Rp 5.000.000',
            'Klaim harian Rp 500.000',
            'Bonus kemenangan +50%',
            'Akses panel admin',
            'Kelola semua user'
        ]
    },
    developer: {
        name: 'DEVELOPER',
        icon: '💻',
        color: '#9b59b6',
        startBalance: 10000000,
        dailyClaim: 1000000,
        benefits: [
            'Saldo awal Rp 10.000.000',
            'Klaim harian Rp 1.000.000',
            'Bonus kemenangan +100%',
            'Akses penuh sistem',
            'Mode debug'
        ]
    }
};

// ===== DEMO ACCOUNTS =====
const DEMO_ACCOUNTS = {
    member: { username: 'member', password: '123456', email: 'member@demo.com', role: 'member' },
    vip: { username: 'vip', password: '123456', email: 'vip@demo.com', role: 'vip' },
    staff: { username: 'staff', password: '123456', email: 'staff@demo.com', role: 'staff' },
    admin: { username: 'admin', password: '123456', email: 'admin@demo.com', role: 'admin' },
    developer: { username: 'developer', password: '123456', email: 'developer@demo.com', role: 'developer' }
};

// ===== GLOBAL STATE =====
let currentUser = null;
let balance = 100000;
let gameHistory = [];
let isPlaying = false;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeDemoAccounts();
    loadUserData();
    if (currentUser) {
        showDashboard();
    }
    setupEventListeners();
});

function initializeDemoAccounts() {
    const users = JSON.parse(localStorage.getItem('rupiahplay_users') || '{}');
    let updated = false;
    
    Object.values(DEMO_ACCOUNTS).forEach(account => {
        if (!users[account.username]) {
            users[account.username] = {
                ...account,
                balance: ROLES[account.role].startBalance,
                lastClaim: null,
                history: [],
                createdAt: new Date().toISOString()
            };
            updated = true;
        }
    });
    
    if (updated) {
        localStorage.setItem('rupiahplay_users', JSON.stringify(users));
    }
}

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });
    
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleRegister();
    });
}

// ===== AUTH FUNCTIONS =====
function switchTab(tab) {
    const tabs = document.querySelectorAll('.auth-tabs .tab-btn');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    
    if (tab === 'login') {
        tabs[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

function quickLogin(role) {
    const account = DEMO_ACCOUNTS[role];
    document.getElementById('loginUsername').value = account.username;
    document.getElementById('loginPassword').value = account.password;
    handleLogin();
}

function handleLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showNotification('❌ Mohon isi semua field', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('rupiahplay_users') || '{}');
    
    if (users[username] && users[username].password === password) {
        currentUser = users[username];
        balance = currentUser.balance || ROLES[currentUser.role].startBalance;
        gameHistory = currentUser.history || [];
        showNotification(`✅ Selamat datang, ${ROLES[currentUser.role].icon} ${currentUser.username}!`, 'success');
        showDashboard();
    } else {
        showNotification('❌ Username atau password salah', 'error');
    }
}

function handleRegister() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    if (!username || !email || !password) {
        showNotification('❌ Mohon isi semua field', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('❌ Password minimal 6 karakter', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('rupiahplay_users') || '{}');
    
    if (users[username]) {
        showNotification('❌ Username sudah digunakan', 'error');
        return;
    }
    
    users[username] = {
        username,
        email,
        password,
        role: 'member',
        balance: ROLES.member.startBalance,
        lastClaim: null,
        history: [],
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('rupiahplay_users', JSON.stringify(users));
    
    currentUser = users[username];
    balance = ROLES.member.startBalance;
    gameHistory = [];
    
    showNotification('✅ Registrasi berhasil!', 'success');
    showDashboard();
}

function logout() {
    saveUserData();
    currentUser = null;
    balance = 100000;
    gameHistory = [];
    
    // Hide dashboard
    document.getElementById('dashboardScreen').classList.remove('active');
    
    // Show login screen
    document.getElementById('loginScreen').classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Close mobile menu if open
    const nav = document.getElementById('mainNav');
    if (nav) nav.classList.remove('mobile-open');
    
    // Reset forms
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    
    showNotification('👋 Logout berhasil', 'success');
}

// ===== DATA PERSISTENCE =====
function saveUserData() {
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('rupiahplay_users') || '{}');
    users[currentUser.username] = {
        ...currentUser,
        balance,
        history: gameHistory
    };
    localStorage.setItem('rupiahplay_users', JSON.stringify(users));
}

function loadUserData() {
    const lastUser = localStorage.getItem('rupiahplay_lastUser');
    if (lastUser) {
        const users = JSON.parse(localStorage.getItem('rupiahplay_users') || '{}');
        if (users[lastUser]) {
            currentUser = users[lastUser];
            balance = currentUser.balance || ROLES[currentUser.role].startBalance;
            gameHistory = currentUser.history || [];
        }
    }
}

// ===== DASHBOARD FUNCTIONS =====
function showDashboard() {
    // Hide login screen
    document.getElementById('loginScreen').classList.remove('active');
    
    // Show dashboard screen
    document.getElementById('dashboardScreen').classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    const role = currentUser.role || 'member';
    const roleConfig = ROLES[role];
    
    document.getElementById('userName').textContent = currentUser.username;
    document.getElementById('userRole').textContent = roleConfig.icon + ' ' + roleConfig.name;
    document.getElementById('userRole').className = 'role-badge ' + role;
    
    // Show admin panel for admin/developer
    if (role === 'admin' || role === 'developer' || role === 'staff') {
        const adminBtn = document.querySelector('.admin-only');
        if (adminBtn) adminBtn.style.display = 'block';
    }
    
    updateBalance();
    updateRoleBenefits();
    updateHistory();
    updateLeaderboard();
    
    localStorage.setItem('rupiahplay_lastUser', currentUser.username);
}

function updateRoleBenefits() {
    const role = currentUser.role || 'member';
    const roleConfig = ROLES[role];
    
    const benefitsDiv = document.getElementById('roleBenefits');
    benefitsDiv.innerHTML = `
        <h4>${roleConfig.icon} Keuntungan ${roleConfig.name}</h4>
        <ul>
            ${roleConfig.benefits.map(b => `<li>${b}</li>`).join('')}
        </ul>
    `;
}

function toggleMobileMenu() {
    const nav = document.getElementById('mainNav');
    nav.classList.toggle('mobile-open');
}

function showSection(section) {
    const sections = document.querySelectorAll('.content-section');
    const navBtns = document.querySelectorAll('.nav-btn');
    
    sections.forEach(s => s.classList.remove('active'));
    navBtns.forEach(b => b.classList.remove('active'));
    
    document.getElementById(section + 'Section').classList.add('active');
    
    // Update active nav button
    navBtns.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(section.substring(0, 4))) {
            btn.classList.add('active');
        }
    });
    
    // Close mobile menu
    document.getElementById('mainNav').classList.remove('mobile-open');
    
    // Load admin data if admin section
    if (section === 'admin') {
        loadAdminData();
    }
}

function updateBalance() {
    document.getElementById('userBalance').textContent = formatRupiah(balance);
    saveUserData();
}

function formatRupiah(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

// ===== DAILY CLAIM =====
function claimDaily() {
    const now = new Date();
    const lastClaim = currentUser.lastClaim ? new Date(currentUser.lastClaim) : null;
    
    if (lastClaim) {
        const hoursSince = (now - lastClaim) / (1000 * 60 * 60);
        if (hoursSince < 24) {
            const hoursLeft = Math.ceil(24 - hoursSince);
            showNotification(`⏰ Klaim tersedia dalam ${hoursLeft} jam`, 'info');
            return;
        }
    }
    
    const role = currentUser.role || 'member';
    const claimAmount = ROLES[role].dailyClaim;
    
    balance += claimAmount;
    currentUser.lastClaim = now.toISOString();
    updateBalance();
    showNotification(`🎁 Klaim harian berhasil! +${formatRupiah(claimAmount)}`, 'success');
}

// ===== RESET BALANCE =====
function resetBalance() {
    if (!currentUser) return;
    
    const role = currentUser.role || 'member';
    const startBalance = ROLES[role].startBalance;
    
    // Konfirmasi
    const confirmed = confirm(`🔄 Reset saldo ke ${formatRupiah(startBalance)}?\n\nSaldo saat ini: ${formatRupiah(balance)}\nRiwayat permainan akan tetap tersimpan.`);
    
    if (confirmed) {
        balance = startBalance;
        updateBalance();
        showNotification(`✅ Saldo berhasil direset ke ${formatRupiah(startBalance)}!`, 'success');
    }
}

// ===== DEPOSIT SYSTEM =====
let selectedDepositAmount = 0;
let selectedPaymentMethod = '';

function openDepositModal() {
    document.getElementById('depositModal').classList.add('active');
    resetDepositForm();
}

function closeDepositModal() {
    document.getElementById('depositModal').classList.remove('active');
    resetDepositForm();
}

function resetDepositForm() {
    selectedDepositAmount = 0;
    selectedPaymentMethod = '';
    
    // Reset amount buttons
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Reset payment buttons
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Reset custom amount
    const customInput = document.getElementById('customAmount');
    if (customInput) customInput.value = '';
    
    // Update summary
    updateDepositSummary();
}

function selectAmount(amount) {
    selectedDepositAmount = amount;
    
    // Update button states
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.closest('.amount-btn').classList.add('selected');
    
    // Clear custom amount
    const customInput = document.getElementById('customAmount');
    if (customInput) customInput.value = '';
    
    updateDepositSummary();
}

// Handle custom amount input
document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'customAmount') {
        const customAmount = parseInt(e.target.value) || 0;
        if (customAmount >= 10000) {
            selectedDepositAmount = customAmount;
            
            // Deselect preset buttons
            document.querySelectorAll('.amount-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            updateDepositSummary();
        }
    }
});

function selectPayment(method) {
    selectedPaymentMethod = method;
    
    // Update button states
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.closest('.payment-btn').classList.add('selected');
    
    updateDepositSummary();
}

function updateDepositSummary() {
    document.getElementById('summaryAmount').textContent = formatRupiah(selectedDepositAmount);
    document.getElementById('summaryTotal').textContent = formatRupiah(selectedDepositAmount);
    
    const methodNames = {
        'gopay': 'GoPay',
        'ovo': 'OVO',
        'dana': 'DANA',
        'shopeepay': 'ShopeePay',
        'bca': 'Transfer BCA',
        'mandiri': 'Transfer Mandiri',
        'bni': 'Transfer BNI',
        'bri': 'Transfer BRI',
        'va-bca': 'Virtual Account BCA',
        'va-mandiri': 'Virtual Account Mandiri',
        'va-bni': 'Virtual Account BNI',
        'va-permata': 'Virtual Account Permata',
        'alfamart': 'Alfamart',
        'indomaret': 'Indomaret',
        'qris': 'QRIS'
    };
    
    document.getElementById('summaryMethod').textContent = selectedPaymentMethod 
        ? methodNames[selectedPaymentMethod] 
        : 'Belum dipilih';
    
    // Enable/disable submit button
    const submitBtn = document.getElementById('depositSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = !(selectedDepositAmount >= 10000 && selectedPaymentMethod);
    }
}

function processDeposit() {
    if (selectedDepositAmount < 10000) {
        showNotification('❌ Minimal deposit Rp 10.000', 'error');
        return;
    }
    
    if (!selectedPaymentMethod) {
        showNotification('❌ Pilih metode pembayaran', 'error');
        return;
    }
    
    // Simulate processing
    const submitBtn = document.getElementById('depositSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Memproses...';
    
    setTimeout(() => {
        // Add balance
        balance += selectedDepositAmount;
        updateBalance();
        
        // Show success notification
        showNotification(`✅ Deposit berhasil! +${formatRupiah(selectedDepositAmount)}`, 'success');
        
        // Close modal
        closeDepositModal();
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = '💳 Proses Deposit';
        
        // Add to history (optional)
        addToHistory('Deposit', selectedDepositAmount, 'win', selectedDepositAmount);
    }, 2000);
}

// ===== GAME HISTORY =====
function addToHistory(game, bet, result, winAmount) {
    const historyItem = {
        game,
        bet,
        result,
        winAmount,
        timestamp: new Date().toISOString()
    };
    
    gameHistory.unshift(historyItem);
    if (gameHistory.length > 100) gameHistory.pop();
    
    updateHistory();
    saveUserData();
}

function updateHistory() {
    const historyList = document.getElementById('historyList');
    
    if (gameHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-state">Belum ada riwayat permainan</p>';
        document.getElementById('totalGames').textContent = '0';
        document.getElementById('totalWins').textContent = 'Rp 0';
        document.getElementById('totalLosses').textContent = 'Rp 0';
        return;
    }
    
    let totalWins = 0;
    let totalLosses = 0;
    
    historyList.innerHTML = gameHistory.slice(0, 20).map(item => {
        const isWin = item.result === 'win';
        if (isWin) totalWins += item.winAmount;
        else totalLosses += item.bet;
        
        return `
            <div class="history-item ${isWin ? 'win' : 'loss'}">
                <div>
                    <strong>${item.game}</strong><br>
                    <small>${new Date(item.timestamp).toLocaleString('id-ID')}</small>
                </div>
                <div style="text-align: right;">
                    <div>Taruhan: ${formatRupiah(item.bet)}</div>
                    <div style="color: ${isWin ? '#00ff88' : '#ff4444'}">
                        ${isWin ? '+' : '-'}${formatRupiah(isWin ? item.winAmount : item.bet)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('totalGames').textContent = gameHistory.length;
    document.getElementById('totalWins').textContent = formatRupiah(totalWins);
    document.getElementById('totalLosses').textContent = formatRupiah(totalLosses);
}

// ===== LEADERBOARD =====
function updateLeaderboard() {
    const users = JSON.parse(localStorage.getItem('rupiahplay_users') || '{}');
    const leaderboard = Object.values(users)
        .sort((a, b) => (b.balance || 0) - (a.balance || 0))
        .slice(0, 10);
    
    const leaderboardList = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<p class="empty-state">Belum ada data</p>';
        return;
    }
    
    leaderboardList.innerHTML = leaderboard.map((user, index) => {
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
                </div>
            </div>
        `;
    }).join('');
}

// ===== ADMIN PANEL =====
function loadAdminData() {
    const users = JSON.parse(localStorage.getItem('rupiahplay_users') || '{}');
    const userList = Object.values(users);
    
    document.getElementById('totalUsers').textContent = userList.length;
    
    const totalBalance = userList.reduce((sum, user) => sum + (user.balance || 0), 0);
    document.getElementById('totalSystemBalance').textContent = formatRupiah(totalBalance);
    
    const totalGames = userList.reduce((sum, user) => sum + (user.history?.length || 0), 0);
    document.getElementById('totalGamesPlayed').textContent = totalGames;
    
    const adminUserList = document.getElementById('adminUserList');
    adminUserList.innerHTML = userList.map(user => {
        const roleConfig = ROLES[user.role || 'member'];
        return `
            <div class="admin-user-item">
                <div>
                    <strong>${user.username}</strong>
                    <span class="role-badge ${user.role || 'member'}" style="margin-left: 10px;">
                        ${roleConfig.icon} ${roleConfig.name}
                    </span>
                    <br>
                    <small>${user.email}</small>
                </div>
                <div style="text-align: right;">
                    <strong>${formatRupiah(user.balance || 0)}</strong><br>
                    <small>${user.history?.length || 0} games</small>
                </div>
            </div>
        `;
    }).join('');
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== GAME MODAL =====
function openGame(gameType) {
    const modal = document.getElementById('gameModal');
    const container = document.getElementById('gameContainer');
    
    modal.classList.add('active');
    
    switch(gameType) {
        case 'slot':
            loadSlotGame(container);
            break;
        case 'crash':
            loadCrashGame(container);
            break;
        case 'fish':
            loadFishGame(container);
            break;
        case 'roulette':
            loadRouletteGame(container);
            break;
        case 'blackjack':
            loadBlackjackGame(container);
            break;
        case 'wheel':
            loadWheelGame(container);
            break;
        case 'scratch':
            loadScratchGame(container);
            break;
        case 'dice':
            loadDiceGame(container);
            break;
        case 'mahjong':
            loadMahjongGame(container);
            break;
        case 'sicbo':
            loadSicBoGame(container);
            break;
        case 'poker':
            loadPokerGame(container);
            break;
        case 'mines':
            loadMinesGame(container);
            break;
        case 'plinko':
            loadPlinkoGame(container);
            break;
        case 'coinflip':
            loadCoinFlipGame(container);
            break;
        case 'billiard':
            loadBilliardGame(container);
            break;
        case 'texasholdem':
            loadTexasHoldemGame(container);
            break;
        case 'togel':
            loadTogelGame(container);
            break;
        case 'sportbet':
            loadSportsBettingGame(container);
            break;
        case 'baccarat':
            loadBaccaratGame(container);
            break;
        case 'craps':
            loadCrapsGame(container);
            break;
        case 'darts':
            loadDartsGame(container);
            break;
        case 'fortune':
            loadFortuneWheelGame(container);
            break;
        case 'bingo':
            loadBingoGame(container);
            break;
        case 'keno':
            loadKenoGame(container);
            break;
    }
}

function closeGame() {
    document.getElementById('gameModal').classList.remove('active');
    isPlaying = false;
    
    // Stop auto spin if active
    if (mahjongAutoSpinActive) {
        stopMahjongAutoSpin();
    }
    
    // Clear any intervals
    if (window.crashInterval) clearInterval(window.crashInterval);
    if (window.fishInterval) clearInterval(window.fishInterval);
    if (window.wheelInterval) clearInterval(window.wheelInterval);
    if (window.mahjongTimer) clearInterval(window.mahjongTimer);
}

function applyRoleBonus(winAmount) {
    const role = currentUser.role || 'member';
    let bonus = 0;
    
    switch(role) {
        case 'vip': bonus = 0.2; break;
        case 'staff': bonus = 0.3; break;
        case 'admin': bonus = 0.5; break;
        case 'developer': bonus = 1.0; break;
    }
    
    return Math.floor(winAmount * (1 + bonus));
}

// Continue with game implementations...

// ===== SLOT GAME =====
const slotSymbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐', '💎', '7️⃣'];

function loadSlotGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎰 Slot Machine</h2>
        </div>
        
        <div style="display: flex; justify-content: center; gap: 15px; margin: 30px 0; flex-wrap: wrap;">
            <div class="slot-reel" style="width: 100px; height: 100px; background: rgba(0,0,0,0.5); border: 3px solid #ffd700; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 4em;">🍒</div>
            <div class="slot-reel" style="width: 100px; height: 100px; background: rgba(0,0,0,0.5); border: 3px solid #ffd700; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 4em;">🍋</div>
            <div class="slot-reel" style="width: 100px; height: 100px; background: rgba(0,0,0,0.5); border: 3px solid #ffd700; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 4em;">🍊</div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="slotBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
            <div class="bet-presets" style="margin-top: 15px;">
                <button class="preset-btn" onclick="document.getElementById('slotBet').value = 5000">Rp 5K</button>
                <button class="preset-btn" onclick="document.getElementById('slotBet').value = 10000">Rp 10K</button>
                <button class="preset-btn" onclick="document.getElementById('slotBet').value = 25000">Rp 25K</button>
                <button class="preset-btn" onclick="document.getElementById('slotBet').value = 50000">Rp 50K</button>
            </div>
        </div>
        
        <div class="result-message" id="slotResult"></div>
        
        <div style="text-align: center;">
            <button class="game-btn" onclick="spinSlot()">🎰 SPIN!</button>
        </div>
    `;
}

function spinSlot() {
    if (isPlaying) return;
    
    const bet = parseInt(document.getElementById('slotBet').value);
    
    if (bet < 1000) {
        showNotification('❌ Taruhan minimal Rp 1.000', 'error');
        return;
    }
    
    if (balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    isPlaying = true;
    balance -= bet;
    updateBalance();
    
    const reels = document.querySelectorAll('.slot-reel');
    const resultDiv = document.getElementById('slotResult');
    resultDiv.textContent = '🎰 Spinning...';
    resultDiv.className = 'result-message';
    
    let spins = 0;
    const maxSpins = 20;
    
    const interval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
        });
        
        spins++;
        
        if (spins >= maxSpins) {
            clearInterval(interval);
            checkSlotResult(reels[0].textContent, reels[1].textContent, reels[2].textContent, bet);
        }
    }, 100);
}

function checkSlotResult(s1, s2, s3, bet) {
    let winAmount = 0;
    let message = '';
    let result = 'loss';
    
    if (s1 === s2 && s2 === s3) {
        result = 'win';
        if (s1 === '💎') winAmount = bet * 50;
        else if (s1 === '7️⃣') winAmount = bet * 30;
        else if (s1 === '⭐') winAmount = bet * 20;
        else winAmount = bet * 10;
        message = '🎉 JACKPOT! 🎉';
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        result = 'win';
        winAmount = bet * 2;
        message = '✨ Double Match! ✨';
    } else {
        message = '😢 Coba Lagi!';
    }
    
    const resultDiv = document.getElementById('slotResult');
    
    if (result === 'win') {
        winAmount = applyRoleBonus(winAmount);
        balance += winAmount;
        updateBalance();
        resultDiv.textContent = `${message} Menang: ${formatRupiah(winAmount)}`;
        resultDiv.className = 'result-message win';
        addToHistory('Slot Machine', bet, 'win', winAmount);
    } else {
        resultDiv.textContent = message;
        resultDiv.className = 'result-message loss';
        addToHistory('Slot Machine', bet, 'loss', 0);
    }
    
    isPlaying = false;
}

// ===== CRASH GAME =====
function loadCrashGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🚀 Spaceman Crash</h2>
            <p>Terbang ke luar angkasa! Cash out sebelum meledak!</p>
        </div>
        
        <div class="space-container" style="position: relative; background: linear-gradient(180deg, #000428 0%, #004e92 100%); border-radius: 20px; padding: 40px 20px; margin: 20px 0; overflow: hidden; min-height: 350px;">
            <!-- Stars Background -->
            <div class="space-stars" id="spaceStars"></div>
            
            <!-- Planets -->
            <div style="position: absolute; top: 20px; right: 30px; font-size: 3em; opacity: 0.6; animation: float 6s ease-in-out infinite;">🪐</div>
            <div style="position: absolute; bottom: 30px; left: 40px; font-size: 2em; opacity: 0.5; animation: float 8s ease-in-out infinite;">🌙</div>
            
            <!-- Astronaut Display -->
            <div style="position: relative; z-index: 10; text-align: center;">
                <div id="crashDisplay" style="font-size: 6em; margin: 20px 0; transition: all 0.3s; filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));">🧑‍🚀</div>
                <div id="crashMultiplier" style="font-size: 4em; color: #00ff88; font-weight: bold; text-shadow: 0 0 20px rgba(0, 255, 136, 0.8), 0 0 40px rgba(0, 255, 136, 0.5);">1.00x</div>
                <div id="crashStatus" style="font-size: 1.2em; color: #fff; margin-top: 10px; min-height: 30px;"></div>
            </div>
            
            <!-- Shooting Stars -->
            <div class="shooting-star" style="position: absolute; width: 2px; height: 2px; background: white; top: 20%; left: 80%; animation: shoot 3s linear infinite;"></div>
            <div class="shooting-star" style="position: absolute; width: 2px; height: 2px; background: white; top: 60%; left: 20%; animation: shoot 4s linear infinite 1s;"></div>
        </div>
        
        <style>
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
            }
            
            @keyframes shoot {
                0% {
                    transform: translateX(0) translateY(0);
                    opacity: 1;
                }
                100% {
                    transform: translateX(-300px) translateY(300px);
                    opacity: 0;
                }
            }
            
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
            }
            
            @keyframes astronautFly {
                0% { transform: translateY(0) rotate(-5deg); }
                100% { transform: translateY(-30px) rotate(5deg); }
            }
            
            .astronaut-flying {
                animation: astronautFly 0.5s ease-in-out infinite alternate !important;
            }
            
            .space-stars {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
            
            .space-star {
                position: absolute;
                width: 2px;
                height: 2px;
                background: white;
                border-radius: 50%;
                animation: twinkle 3s ease-in-out infinite;
            }
        </style>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="crashBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
            <div class="bet-presets" style="margin-top: 15px;">
                <button class="preset-btn" onclick="document.getElementById('crashBet').value = 5000">Rp 5K</button>
                <button class="preset-btn" onclick="document.getElementById('crashBet').value = 10000">Rp 10K</button>
                <button class="preset-btn" onclick="document.getElementById('crashBet').value = 25000">Rp 25K</button>
                <button class="preset-btn" onclick="document.getElementById('crashBet').value = 50000">Rp 50K</button>
                <button class="preset-btn" onclick="document.getElementById('crashBet').value = 100000">Rp 100K</button>
            </div>
        </div>
        
        <!-- Auto Cashout Section -->
        <div class="bet-section" style="margin-top: 20px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="autoCashoutEnabled" onchange="toggleAutoCashout()" style="width: 20px; height: 20px; cursor: pointer;">
                    <span style="font-weight: bold; color: #ffd700;">🤖 Auto Cashout</span>
                </label>
            </div>
            
            <div id="autoCashoutSettings" style="display: none;">
                <div class="bet-controls" style="margin-bottom: 15px;">
                    <label>Target Multiplier:</label>
                    <input type="number" id="autoCashoutTarget" class="bet-input" value="2.00" min="1.10" max="100.00" step="0.10" style="width: 120px;">
                    <span style="margin-left: 10px; color: #00ff88; font-weight: bold;">x</span>
                </div>
                
                <div class="bet-presets">
                    <button class="preset-btn" onclick="setAutoCashout(1.5)">1.5x</button>
                    <button class="preset-btn" onclick="setAutoCashout(2.0)">2.0x</button>
                    <button class="preset-btn" onclick="setAutoCashout(3.0)">3.0x</button>
                    <button class="preset-btn" onclick="setAutoCashout(5.0)">5.0x</button>
                    <button class="preset-btn" onclick="setAutoCashout(10.0)">10.0x</button>
                </div>
                
                <div style="text-align: center; margin-top: 15px; padding: 15px; background: rgba(0, 255, 136, 0.1); border-radius: 10px; border: 1px solid rgba(0, 255, 136, 0.3);">
                    <div style="font-size: 0.9em; color: #00ff88;">
                        ✅ Auto cashout akan aktif di <span id="autoCashoutDisplay" style="font-weight: bold; font-size: 1.2em;">2.00x</span>
                    </div>
                    <div style="font-size: 0.8em; color: #aaa; margin-top: 5px;">
                        Roket akan otomatis cash out saat mencapai target multiplier
                    </div>
                </div>
            </div>
        </div>
        
        <div class="result-message" id="crashResult"></div>
        
        <div style="text-align: center;">
            <button class="game-btn" id="crashBtn" onclick="startCrash()">🚀 START FLIGHT</button>
        </div>
    `;
    
    // Create stars
    const starsContainer = document.getElementById('spaceStars');
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'space-star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
    }
}

let crashMultiplier = 1.0;
let crashTarget = 1.0;
let autoCashoutEnabled = false;
let autoCashoutTarget = 2.0;

function toggleAutoCashout() {
    autoCashoutEnabled = document.getElementById('autoCashoutEnabled').checked;
    const settings = document.getElementById('autoCashoutSettings');
    
    if (autoCashoutEnabled) {
        settings.style.display = 'block';
        autoCashoutTarget = parseFloat(document.getElementById('autoCashoutTarget').value);
        updateAutoCashoutDisplay();
    } else {
        settings.style.display = 'none';
    }
}

function setAutoCashout(multiplier) {
    document.getElementById('autoCashoutTarget').value = multiplier.toFixed(2);
    autoCashoutTarget = multiplier;
    updateAutoCashoutDisplay();
}

function updateAutoCashoutDisplay() {
    const target = parseFloat(document.getElementById('autoCashoutTarget').value);
    autoCashoutTarget = target;
    document.getElementById('autoCashoutDisplay').textContent = target.toFixed(2) + 'x';
}

// Update auto cashout target when input changes
document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'autoCashoutTarget') {
        updateAutoCashoutDisplay();
    }
});

function startCrash() {
    if (isPlaying) {
        cashOut();
        return;
    }
    
    const bet = parseInt(document.getElementById('crashBet').value);
    
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup atau taruhan invalid!', 'error');
        return;
    }
    
    isPlaying = true;
    balance -= bet;
    updateBalance();
    
    crashMultiplier = 1.0;
    crashTarget = 1.5 + Math.random() * 8.5;
    
    // Update auto cashout settings
    autoCashoutEnabled = document.getElementById('autoCashoutEnabled')?.checked || false;
    if (autoCashoutEnabled) {
        autoCashoutTarget = parseFloat(document.getElementById('autoCashoutTarget').value);
    }
    
    const btn = document.getElementById('crashBtn');
    const rocket = document.getElementById('crashDisplay');
    const status = document.getElementById('crashStatus');
    
    btn.textContent = '💰 CASH OUT NOW!';
    btn.style.background = 'linear-gradient(45deg, #00ff88, #00cc6a)';
    rocket.classList.add('rocket-flying');
    
    if (autoCashoutEnabled) {
        status.textContent = `🤖 Auto cashout at ${autoCashoutTarget.toFixed(2)}x`;
        status.style.color = '#ffd700';
    } else {
        status.textContent = '🚀 Flying to space...';
        status.style.color = '#00ff88';
    }
    
    document.getElementById('crashResult').textContent = '';
    
    window.crashInterval = setInterval(() => {
        crashMultiplier += 0.05;
        const multiplierEl = document.getElementById('crashMultiplier');
        multiplierEl.textContent = crashMultiplier.toFixed(2) + 'x';
        
        // Change color based on multiplier
        if (crashMultiplier < 2) {
            multiplierEl.style.color = '#00ff88';
        } else if (crashMultiplier < 5) {
            multiplierEl.style.color = '#ffd700';
        } else {
            multiplierEl.style.color = '#ff4444';
        }
        
        // Auto cashout check
        if (autoCashoutEnabled && crashMultiplier >= autoCashoutTarget) {
            cashOut(true);
            return;
        }
        
        if (crashMultiplier >= crashTarget) {
            crashGame(bet);
        }
    }, 100);
}

function cashOut(isAuto = false) {
    if (!isPlaying) return;
    
    clearInterval(window.crashInterval);
    isPlaying = false;
    
    const bet = parseInt(document.getElementById('crashBet').value);
    let winAmount = Math.floor(bet * crashMultiplier);
    winAmount = applyRoleBonus(winAmount);
    
    balance += winAmount;
    updateBalance();
    
    const rocket = document.getElementById('crashDisplay');
    const status = document.getElementById('crashStatus');
    
    rocket.classList.remove('rocket-flying');
    rocket.textContent = '✅';
    
    if (isAuto) {
        status.textContent = `🤖 Auto cashed out at ${crashMultiplier.toFixed(2)}x!`;
        status.style.color = '#ffd700';
    } else {
        status.textContent = `Safe landing at ${crashMultiplier.toFixed(2)}x!`;
        status.style.color = '#00ff88';
    }
    
    const resultText = isAuto 
        ? `🤖 Auto Cash Out! Menang: ${formatRupiah(winAmount)}` 
        : `✅ Cash Out Berhasil! Menang: ${formatRupiah(winAmount)}`;
    
    document.getElementById('crashResult').textContent = resultText;
    document.getElementById('crashResult').className = 'result-message win';
    document.getElementById('crashBtn').textContent = '🚀 START FLIGHT';
    document.getElementById('crashBtn').style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
    
    addToHistory('Spaceman Crash', bet, 'win', winAmount);
    
    // Reset rocket after 2 seconds
    setTimeout(() => {
        rocket.textContent = '🚀';
        status.textContent = '';
    }, 2000);
}

function crashGame(bet) {
    clearInterval(window.crashInterval);
    isPlaying = false;
    
    const rocket = document.getElementById('crashDisplay');
    const status = document.getElementById('crashStatus');
    
    rocket.classList.remove('rocket-flying');
    rocket.textContent = '💥';
    rocket.style.fontSize = '8em';
    status.textContent = `Crashed at ${crashMultiplier.toFixed(2)}x!`;
    status.style.color = '#ff4444';
    
    document.getElementById('crashResult').textContent = `💥 CRASHED! Kalah: ${formatRupiah(bet)}`;
    document.getElementById('crashResult').className = 'result-message loss';
    document.getElementById('crashBtn').textContent = '🚀 START FLIGHT';
    document.getElementById('crashBtn').style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
    
    addToHistory('Spaceman Crash', bet, 'loss', 0);
    
    // Reset rocket after 2 seconds
    setTimeout(() => {
        rocket.textContent = '🚀';
        rocket.style.fontSize = '6em';
        status.textContent = '';
    }, 2000);
}

// ===== ROULETTE GAME =====
function loadRouletteGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎡 Roulette</h2>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <div id="rouletteWheel" style="width: 200px; height: 200px; margin: 0 auto; border-radius: 50%; background: conic-gradient(#ff0000 0deg 180deg, #000000 180deg 360deg); border: 5px solid #ffd700; position: relative; transition: transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99);">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background: #ffd700; border-radius: 50%;"></div>
            </div>
        </div>
        
        <div class="bet-section">
            <div style="display: flex; justify-content: center; gap: 15px; margin: 20px 0; flex-wrap: wrap;">
                <button class="game-btn" style="background: linear-gradient(45deg, #ff0000, #ff4444);" onclick="selectRouletteColor('red')">🔴 MERAH</button>
                <button class="game-btn" style="background: linear-gradient(45deg, #000000, #333333);" onclick="selectRouletteColor('black')">⚫ HITAM</button>
            </div>
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="rouletteBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
        </div>
        
        <div class="result-message" id="rouletteResult"></div>
    `;
}

function selectRouletteColor(color) {
    if (isPlaying) return;
    
    const bet = parseInt(document.getElementById('rouletteBet').value);
    
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup atau taruhan invalid!', 'error');
        return;
    }
    
    isPlaying = true;
    balance -= bet;
    updateBalance();
    
    const wheel = document.getElementById('rouletteWheel');
    const spins = 5 + Math.random() * 3;
    const degrees = spins * 360 + Math.random() * 360;
    
    wheel.style.transform = `rotate(${degrees}deg)`;
    document.getElementById('rouletteResult').textContent = '🎡 Spinning...';
    
    setTimeout(() => {
        const normalizedDegrees = degrees % 360;
        const resultColor = normalizedDegrees < 180 ? 'red' : 'black';
        const colorText = resultColor === 'red' ? '🔴 MERAH' : '⚫ HITAM';
        
        if (resultColor === color) {
            let winAmount = bet * 2;
            winAmount = applyRoleBonus(winAmount);
            balance += winAmount;
            updateBalance();
            document.getElementById('rouletteResult').textContent = `🎉 MENANG! ${colorText} - ${formatRupiah(winAmount)}`;
            document.getElementById('rouletteResult').className = 'result-message win';
            addToHistory('Roulette', bet, 'win', winAmount);
        } else {
            document.getElementById('rouletteResult').textContent = `😢 KALAH! Hasil: ${colorText}`;
            document.getElementById('rouletteResult').className = 'result-message loss';
            addToHistory('Roulette', bet, 'loss', 0);
        }
        
        isPlaying = false;
    }, 3000);
}

// ===== DICE GAME =====
function loadDiceGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎲 Dice Roll</h2>
        </div>
        
        <div style="display: flex; justify-content: center; gap: 20px; margin: 30px 0; flex-wrap: wrap;">
            <div id="dice1" style="width: 80px; height: 80px; background: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 3em; color: #000;">1</div>
            <div id="dice2" style="width: 80px; height: 80px; background: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 3em; color: #000;">1</div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="diceBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
        </div>
        
        <div class="result-message" id="diceResult"></div>
        
        <div style="text-align: center;">
            <button class="game-btn" onclick="rollDice()">🎲 ROLL!</button>
        </div>
    `;
}

function rollDice() {
    if (isPlaying) return;
    
    const bet = parseInt(document.getElementById('diceBet').value);
    
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup atau taruhan invalid!', 'error');
        return;
    }
    
    isPlaying = true;
    balance -= bet;
    updateBalance();
    
    const dice1 = document.getElementById('dice1');
    const dice2 = document.getElementById('dice2');
    
    let rolls = 0;
    const maxRolls = 15;
    
    const interval = setInterval(() => {
        dice1.textContent = Math.floor(Math.random() * 6) + 1;
        dice2.textContent = Math.floor(Math.random() * 6) + 1;
        
        rolls++;
        
        if (rolls >= maxRolls) {
            clearInterval(interval);
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            dice1.textContent = d1;
            dice2.textContent = d2;
            checkDiceResult(d1, d2, bet);
        }
    }, 100);
}

function checkDiceResult(d1, d2, bet) {
    const total = d1 + d2;
    let winAmount = 0;
    let message = '';
    
    if (d1 === d2) {
        if (d1 === 6) winAmount = bet * 20;
        else winAmount = bet * 5;
        message = `🎲 DOUBLE ${d1}s! 🎲`;
    } else if (total >= 10) {
        winAmount = bet * 3;
        message = `✨ HIGH ROLL (${total})! ✨`;
    } else if (total === 7) {
        winAmount = bet * 2;
        message = '🍀 LUCKY 7! 🍀';
    } else {
        message = `😢 Total: ${total} - Coba Lagi!`;
    }
    
    const resultDiv = document.getElementById('diceResult');
    
    if (winAmount > 0) {
        winAmount = applyRoleBonus(winAmount);
        balance += winAmount;
        updateBalance();
        resultDiv.textContent = `${message} Menang: ${formatRupiah(winAmount)}`;
        resultDiv.className = 'result-message win';
        addToHistory('Dice Roll', bet, 'win', winAmount);
    } else {
        resultDiv.textContent = message;
        resultDiv.className = 'result-message loss';
        addToHistory('Dice Roll', bet, 'loss', 0);
    }
    
    isPlaying = false;
}

// ===== FISH SHOOTING GAME =====
function loadFishGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎣 Fish Shooting</h2>
            <p>Tembak ikan untuk mendapat hadiah!</p>
        </div>
        
        <div style="position: relative; background: linear-gradient(180deg, #001a33 0%, #003d66 100%); border-radius: 20px; padding: 30px 20px; margin: 20px 0; min-height: 400px; overflow: hidden;">
            <div id="fishPond" style="position: relative; height: 350px;">
                <!-- Fish will be spawned here -->
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <div style="font-size: 1.5em; color: #ffd700; font-weight: bold;">
                    Ammo: <span id="fishAmmo">20</span> | Score: <span id="fishScore">0</span>
                </div>
            </div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Biaya per Peluru:</label>
                <input type="number" id="fishBet" class="bet-input" value="1000" min="500" step="500" readonly>
            </div>
            <p style="text-align: center; color: #aaa; margin-top: 10px;">
                Klik ikan untuk menembak! Setiap tembakan = Rp 1.000
            </p>
        </div>
        
        <div class="result-message" id="fishResult"></div>
        
        <div style="text-align: center;">
            <button class="game-btn" onclick="startFishGame()">🎣 START GAME</button>
        </div>
    `;
}

let fishAmmo = 20;
let fishScore = 0;
let fishGameActive = false;

function startFishGame() {
    const totalCost = fishAmmo * 1000;
    
    if (balance < totalCost) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    balance -= totalCost;
    updateBalance();
    
    fishGameActive = true;
    fishScore = 0;
    fishAmmo = 20;
    
    updateFishDisplay();
    spawnFish();
    
    document.getElementById('fishResult').textContent = '🎣 Game dimulai! Klik ikan untuk menembak!';
    document.getElementById('fishResult').className = 'result-message';
}

function updateFishDisplay() {
    document.getElementById('fishAmmo').textContent = fishAmmo;
    document.getElementById('fishScore').textContent = fishScore;
}

function spawnFish() {
    const pond = document.getElementById('fishPond');
    if (!pond) return;
    
    pond.innerHTML = '';
    
    const fishTypes = [
        { emoji: '🐟', value: 1000, size: '3em' },
        { emoji: '🐠', value: 2000, size: '3.5em' },
        { emoji: '🐡', value: 3000, size: '4em' },
        { emoji: '🦈', value: 5000, size: '5em' }
    ];
    
    for (let i = 0; i < 8; i++) {
        const fishType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
        const fish = document.createElement('div');
        fish.className = 'fish-target';
        fish.innerHTML = fishType.emoji;
        fish.style.cssText = `
            position: absolute;
            font-size: ${fishType.size};
            cursor: crosshair;
            transition: all 0.3s;
            left: ${Math.random() * 80}%;
            top: ${Math.random() * 80}%;
            animation: swim ${3 + Math.random() * 3}s ease-in-out infinite;
        `;
        fish.dataset.value = fishType.value;
        
        fish.onclick = () => shootFish(fish, fishType.value);
        pond.appendChild(fish);
    }
}

function shootFish(fishElement, value) {
    if (!fishGameActive || fishAmmo <= 0) return;
    
    fishAmmo--;
    fishScore += value;
    updateFishDisplay();
    
    fishElement.style.transform = 'scale(0) rotate(360deg)';
    fishElement.style.opacity = '0';
    
    setTimeout(() => {
        if (fishElement.parentNode) {
            fishElement.remove();
        }
    }, 300);
    
    if (fishAmmo <= 0) {
        endFishGame();
    }
}

function endFishGame() {
    fishGameActive = false;
    
    let winAmount = applyRoleBonus(fishScore);
    balance += winAmount;
    updateBalance();
    
    const resultDiv = document.getElementById('fishResult');
    resultDiv.textContent = `🎉 Game Selesai! Total Hadiah: ${formatRupiah(winAmount)}`;
    resultDiv.className = 'result-message win';
    
    addToHistory('Fish Shooting', 20000, 'win', winAmount);
}

// ===== BLACKJACK GAME =====
function loadBlackjackGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🃏 Blackjack</h2>
            <p>Dapatkan 21 atau mendekati 21!</p>
        </div>
        
        <div style="background: rgba(0, 100, 0, 0.3); border-radius: 20px; padding: 30px 20px; margin: 20px 0;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h3 style="color: #ffd700;">Dealer</h3>
                <div id="dealerCards" style="font-size: 3em; margin: 15px 0; min-height: 80px;">🂠</div>
                <div id="dealerScore" style="font-size: 1.3em; color: #fff;">Score: ?</div>
            </div>
            
            <div style="text-align: center;">
                <h3 style="color: #00ff88;">You</h3>
                <div id="playerCards" style="font-size: 3em; margin: 15px 0; min-height: 80px;">🂠</div>
                <div id="playerScore" style="font-size: 1.3em; color: #fff;">Score: 0</div>
            </div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="blackjackBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
        </div>
        
        <div class="result-message" id="blackjackResult"></div>
        
        <div style="text-align: center; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button class="game-btn" id="bjStartBtn" onclick="startBlackjack()">🃏 START</button>
            <button class="game-btn" id="bjHitBtn" onclick="hitBlackjack()" style="display: none;">👆 HIT</button>
            <button class="game-btn" id="bjStandBtn" onclick="standBlackjack()" style="display: none;">✋ STAND</button>
        </div>
    `;
}

let bjDeck = [];
let bjPlayerHand = [];
let bjDealerHand = [];
let bjGameActive = false;

function startBlackjack() {
    const bet = parseInt(document.getElementById('blackjackBet').value);
    
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    balance -= bet;
    updateBalance();
    
    bjGameActive = true;
    bjDeck = createDeck();
    bjPlayerHand = [drawCard(), drawCard()];
    bjDealerHand = [drawCard(), drawCard()];
    
    updateBlackjackDisplay(true);
    
    document.getElementById('bjStartBtn').style.display = 'none';
    document.getElementById('bjHitBtn').style.display = 'inline-block';
    document.getElementById('bjStandBtn').style.display = 'inline-block';
    document.getElementById('blackjackResult').textContent = '';
    
    if (calculateBJScore(bjPlayerHand) === 21) {
        standBlackjack();
    }
}

function createDeck() {
    const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    for (let i = 0; i < 4; i++) {
        deck.push(...cards);
    }
    return deck.sort(() => Math.random() - 0.5);
}

function drawCard() {
    return bjDeck.pop();
}

function calculateBJScore(hand) {
    let score = 0;
    let aces = 0;
    
    for (let card of hand) {
        if (card === 'A') {
            aces++;
            score += 11;
        } else if (['J', 'Q', 'K'].includes(card)) {
            score += 10;
        } else {
            score += parseInt(card);
        }
    }
    
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

function updateBlackjackDisplay(hideDealer = false) {
    const cardEmojis = { 'A': '🂡', '2': '🂢', '3': '🂣', '4': '🂤', '5': '🂥', '6': '🂦', '7': '🂧', '8': '🂨', '9': '🂩', '10': '🂪', 'J': '🂫', 'Q': '🂭', 'K': '🂮' };
    
    document.getElementById('playerCards').textContent = bjPlayerHand.map(c => cardEmojis[c] || '🂠').join(' ');
    document.getElementById('playerScore').textContent = 'Score: ' + calculateBJScore(bjPlayerHand);
    
    if (hideDealer) {
        document.getElementById('dealerCards').textContent = cardEmojis[bjDealerHand[0]] + ' 🂠';
        document.getElementById('dealerScore').textContent = 'Score: ?';
    } else {
        document.getElementById('dealerCards').textContent = bjDealerHand.map(c => cardEmojis[c] || '🂠').join(' ');
        document.getElementById('dealerScore').textContent = 'Score: ' + calculateBJScore(bjDealerHand);
    }
}

function hitBlackjack() {
    if (!bjGameActive) return;
    
    bjPlayerHand.push(drawCard());
    updateBlackjackDisplay(true);
    
    const playerScore = calculateBJScore(bjPlayerHand);
    if (playerScore > 21) {
        endBlackjack('bust');
    } else if (playerScore === 21) {
        standBlackjack();
    }
}

function standBlackjack() {
    if (!bjGameActive) return;
    
    updateBlackjackDisplay(false);
    
    while (calculateBJScore(bjDealerHand) < 17) {
        bjDealerHand.push(drawCard());
        updateBlackjackDisplay(false);
    }
    
    const playerScore = calculateBJScore(bjPlayerHand);
    const dealerScore = calculateBJScore(bjDealerHand);
    
    if (dealerScore > 21 || playerScore > dealerScore) {
        endBlackjack('win');
    } else if (playerScore === dealerScore) {
        endBlackjack('push');
    } else {
        endBlackjack('lose');
    }
}

function endBlackjack(result) {
    bjGameActive = false;
    const bet = parseInt(document.getElementById('blackjackBet').value);
    const resultDiv = document.getElementById('blackjackResult');
    
    document.getElementById('bjHitBtn').style.display = 'none';
    document.getElementById('bjStandBtn').style.display = 'none';
    document.getElementById('bjStartBtn').style.display = 'inline-block';
    
    if (result === 'win') {
        let winAmount = bet * 2;
        winAmount = applyRoleBonus(winAmount);
        balance += winAmount;
        updateBalance();
        resultDiv.textContent = `🎉 MENANG! +${formatRupiah(winAmount)}`;
        resultDiv.className = 'result-message win';
        addToHistory('Blackjack', bet, 'win', winAmount);
    } else if (result === 'push') {
        balance += bet;
        updateBalance();
        resultDiv.textContent = '🤝 SERI! Taruhan dikembalikan';
        resultDiv.className = 'result-message';
    } else {
        resultDiv.textContent = `😢 KALAH! -${formatRupiah(bet)}`;
        resultDiv.className = 'result-message loss';
        addToHistory('Blackjack', bet, 'loss', 0);
    }
}

// ===== LUCKY WHEEL GAME =====
function loadWheelGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎯 Lucky Wheel</h2>
            <p>Putar roda keberuntungan!</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <div id="luckyWheel" style="width: 300px; height: 300px; margin: 0 auto; border-radius: 50%; background: conic-gradient(
                #ff0000 0deg 45deg,
                #ffd700 45deg 90deg,
                #00ff00 90deg 135deg,
                #00ffff 135deg 180deg,
                #0000ff 180deg 225deg,
                #ff00ff 225deg 270deg,
                #ff8800 270deg 315deg,
                #ffffff 315deg 360deg
            ); border: 5px solid #ffd700; position: relative; transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2em;">🎯</div>
            </div>
            <div style="margin-top: 20px; font-size: 1.5em; color: #ffd700; font-weight: bold;" id="wheelPrize">Hadiah: ?</div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="wheelBet" class="bet-input" value="5000" min="1000" step="1000">
            </div>
        </div>
        
        <div class="result-message" id="wheelResult"></div>
        
        <div style="text-align: center;">
            <button class="game-btn" onclick="spinWheel()">🎯 SPIN WHEEL!</button>
        </div>
    `;
}

function spinWheel() {
    if (isPlaying) return;
    
    const bet = parseInt(document.getElementById('wheelBet').value);
    
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    isPlaying = true;
    balance -= bet;
    updateBalance();
    
    const wheel = document.getElementById('luckyWheel');
    const spins = 5 + Math.random() * 3;
    const degrees = spins * 360 + Math.random() * 360;
    
    wheel.style.transform = `rotate(${degrees}deg)`;
    document.getElementById('wheelResult').textContent = '🎯 Spinning...';
    
    setTimeout(() => {
        const prizes = [
            { multiplier: 0, label: 'Zonk' },
            { multiplier: 2, label: '2x' },
            { multiplier: 3, label: '3x' },
            { multiplier: 5, label: '5x' },
            { multiplier: 10, label: '10x' },
            { multiplier: 20, label: '20x' },
            { multiplier: 50, label: '50x' },
            { multiplier: 100, label: 'JACKPOT 100x!' }
        ];
        
        const normalizedDegrees = degrees % 360;
        const segment = Math.floor(normalizedDegrees / 45);
        const prize = prizes[segment];
        
        document.getElementById('wheelPrize').textContent = `Hadiah: ${prize.label}`;
        
        const resultDiv = document.getElementById('wheelResult');
        
        if (prize.multiplier > 0) {
            let winAmount = bet * prize.multiplier;
            winAmount = applyRoleBonus(winAmount);
            balance += winAmount;
            updateBalance();
            resultDiv.textContent = `🎉 MENANG ${prize.label}! +${formatRupiah(winAmount)}`;
            resultDiv.className = 'result-message win';
            addToHistory('Lucky Wheel', bet, 'win', winAmount);
        } else {
            resultDiv.textContent = `😢 Zonk! Coba lagi!`;
            resultDiv.className = 'result-message loss';
            addToHistory('Lucky Wheel', bet, 'loss', 0);
        }
        
        isPlaying = false;
    }, 4000);
}

// ===== SCRATCH CARD GAME =====
function loadScratchGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎫 Scratch Card</h2>
            <p>Gosok kartu untuk menang!</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <div id="scratchCard" style="width: 300px; height: 200px; margin: 0 auto; background: linear-gradient(45deg, #ffd700, #ffed4e); border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 4em; cursor: pointer; position: relative; overflow: hidden;" onclick="scratchCard()">
                <div id="scratchCover" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #888; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.5em;">
                    Klik untuk Gosok!
                </div>
                <div id="scratchPrize" style="position: relative; z-index: 1; display: none;"></div>
            </div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Harga Kartu:</label>
                <input type="number" id="scratchBet" class="bet-input" value="10000" min="5000" step="5000">
            </div>
        </div>
        
        <div class="result-message" id="scratchResult"></div>
        
        <div style="text-align: center;">
            <button class="game-btn" onclick="buyScratchCard()">🎫 BELI KARTU</button>
        </div>
    `;
}

let scratchCardActive = false;

function buyScratchCard() {
    const bet = parseInt(document.getElementById('scratchBet').value);
    
    if (bet < 5000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    balance -= bet;
    updateBalance();
    
    scratchCardActive = true;
    
    const prizes = [
        { multiplier: 0, emoji: '😢', label: 'Zonk' },
        { multiplier: 1, emoji: '😐', label: 'Balik Modal' },
        { multiplier: 2, emoji: '😊', label: '2x' },
        { multiplier: 5, emoji: '😃', label: '5x' },
        { multiplier: 10, emoji: '🤩', label: '10x' },
        { multiplier: 50, emoji: '🎉', label: 'JACKPOT 50x!' }
    ];
    
    const weights = [40, 30, 15, 10, 4, 1];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    let selectedPrize = prizes[0];
    for (let i = 0; i < prizes.length; i++) {
        if (random < weights[i]) {
            selectedPrize = prizes[i];
            break;
        }
        random -= weights[i];
    }
    
    document.getElementById('scratchPrize').textContent = selectedPrize.emoji;
    document.getElementById('scratchPrize').dataset.multiplier = selectedPrize.multiplier;
    document.getElementById('scratchPrize').dataset.label = selectedPrize.label;
    
    document.getElementById('scratchCover').style.display = 'flex';
    document.getElementById('scratchPrize').style.display = 'none';
    document.getElementById('scratchResult').textContent = 'Klik kartu untuk gosok!';
    document.getElementById('scratchResult').className = 'result-message';
}

function scratchCard() {
    if (!scratchCardActive) return;
    
    scratchCardActive = false;
    
    const cover = document.getElementById('scratchCover');
    const prize = document.getElementById('scratchPrize');
    
    cover.style.opacity = '0';
    cover.style.transition = 'opacity 0.5s';
    prize.style.display = 'block';
    
    setTimeout(() => {
        cover.style.display = 'none';
        
        const multiplier = parseInt(prize.dataset.multiplier);
        const label = prize.dataset.label;
        const bet = parseInt(document.getElementById('scratchBet').value);
        const resultDiv = document.getElementById('scratchResult');
        
        if (multiplier > 0) {
            let winAmount = bet * multiplier;
            winAmount = applyRoleBonus(winAmount);
            balance += winAmount;
            updateBalance();
            resultDiv.textContent = `🎉 ${label}! Menang: ${formatRupiah(winAmount)}`;
            resultDiv.className = 'result-message win';
            addToHistory('Scratch Card', bet, 'win', winAmount);
        } else {
            resultDiv.textContent = `😢 ${label}! Coba lagi!`;
            resultDiv.className = 'result-message loss';
            addToHistory('Scratch Card', bet, 'loss', 0);
        }
    }, 500);
}


// ===== MAHJONG WAYS GAME =====
function loadMahjongGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🀄 Mahjong Ways</h2>
            <p>Scatter system - Semakin banyak scatter, semakin besar multiplier!</p>
        </div>
        
        <div style="background: rgba(139, 69, 19, 0.3); border-radius: 20px; padding: 30px 20px; margin: 20px 0;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 1.5em; color: #ffd700; font-weight: bold;">
                    🀄 MAHJONG WAYS 🀄
                </div>
                <div style="font-size: 1em; color: #00ff88; margin-top: 10px;">
                    Draws: <span id="mahjongDraws">0</span> | Total Win: <span id="mahjongTotalWin">Rp 0</span>
                </div>
            </div>
            
            <div id="mahjongBoard" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; max-width: 500px; margin: 0 auto; min-height: 400px;">
                <!-- Tiles will be generated here -->
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <div id="mahjongScatter" style="font-size: 1.5em; color: #ffd700; font-weight: bold; min-height: 40px;">
                    <!-- Scatter info will show here -->
                </div>
            </div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="mahjongBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
            <div class="bet-presets" style="margin-top: 15px;">
                <button class="preset-btn" onclick="document.getElementById('mahjongBet').value = 5000">Rp 5K</button>
                <button class="preset-btn" onclick="document.getElementById('mahjongBet').value = 10000">Rp 10K</button>
                <button class="preset-btn" onclick="document.getElementById('mahjongBet').value = 25000">Rp 25K</button>
                <button class="preset-btn" onclick="document.getElementById('mahjongBet').value = 50000">Rp 50K</button>
            </div>
            
            <!-- Auto Spin Section -->
            <div style="margin-top: 20px; padding: 20px; background: rgba(0, 255, 136, 0.1); border-radius: 15px; border: 2px solid rgba(0, 255, 136, 0.3);">
                <div style="text-align: center; margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer;">
                        <input type="checkbox" id="mahjongAutoSpinEnabled" onchange="toggleMahjongAutoSpin()" style="width: 20px; height: 20px; cursor: pointer;">
                        <span style="font-weight: bold; color: #00ff88; font-size: 1.1em;">🤖 AUTO SPIN</span>
                    </label>
                </div>
                
                <div id="mahjongAutoSpinSettings" style="display: none;">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <label style="color: #fff; margin-bottom: 10px; display: block;">Jumlah Spin:</label>
                        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                            <button class="preset-btn" onclick="setMahjongAutoSpin(10)">10x</button>
                            <button class="preset-btn" onclick="setMahjongAutoSpin(25)">25x</button>
                            <button class="preset-btn" onclick="setMahjongAutoSpin(50)">50x</button>
                            <button class="preset-btn" onclick="setMahjongAutoSpin(100)">100x</button>
                        </div>
                    </div>
                    
                    <div style="text-align: center; padding: 15px; background: rgba(0, 0, 0, 0.3); border-radius: 10px;">
                        <div style="font-size: 1.2em; color: #00ff88; font-weight: bold;">
                            <span id="mahjongAutoSpinDisplay">0</span> Spin Otomatis
                        </div>
                        <div style="font-size: 0.9em; color: #aaa; margin-top: 5px;">
                            Progress: <span id="mahjongAutoSpinProgress">0/0</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(255, 215, 0, 0.1); border-radius: 10px; padding: 15px; margin-top: 15px;">
                <div style="text-align: center; color: #ffd700; font-weight: bold; margin-bottom: 10px;">
                    💰 PAYTABLE 💰
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9em;">
                    <div style="color: #fff;">3 Scatter 🀄</div><div style="color: #00ff88; text-align: right;">= 2x</div>
                    <div style="color: #fff;">4 Scatter 🀄</div><div style="color: #00ff88; text-align: right;">= 5x</div>
                    <div style="color: #fff;">5 Scatter 🀄</div><div style="color: #00ff88; text-align: right;">= 10x + 10 Draws</div>
                    <div style="color: #fff;">6 Scatter 🀄</div><div style="color: #ffd700; text-align: right;">= 20x + 20 Draws</div>
                    <div style="color: #fff;">7+ Scatter 🀄</div><div style="color: #ff4444; text-align: right;">= 40x + 40 Draws</div>
                </div>
            </div>
        </div>
        
        <div class="result-message" id="mahjongResult"></div>
        
        <div style="text-align: center; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button class="game-btn" id="mahjongSpinBtn" onclick="spinMahjong()">🀄 SPIN!</button>
            <button class="game-btn" id="mahjongStopBtn" onclick="stopMahjongAutoSpin()" style="display: none; background: linear-gradient(45deg, #ff4444, #cc0000);">⏹️ STOP</button>
        </div>
    `;
}

let mahjongDrawsLeft = 0;
let mahjongTotalWinAmount = 0;
let mahjongCurrentBet = 0;
let mahjongAutoSpinCount = 0;
let mahjongAutoSpinActive = false;
let mahjongSpinsCompleted = 0;

function toggleMahjongAutoSpin() {
    const enabled = document.getElementById('mahjongAutoSpinEnabled').checked;
    const settings = document.getElementById('mahjongAutoSpinSettings');
    
    if (enabled) {
        settings.style.display = 'block';
    } else {
        settings.style.display = 'none';
        mahjongAutoSpinActive = false;
        mahjongAutoSpinCount = 0;
        updateMahjongAutoSpinDisplay();
    }
}

function setMahjongAutoSpin(count) {
    mahjongAutoSpinCount = count;
    mahjongSpinsCompleted = 0;
    updateMahjongAutoSpinDisplay();
}

function updateMahjongAutoSpinDisplay() {
    document.getElementById('mahjongAutoSpinDisplay').textContent = mahjongAutoSpinCount;
    document.getElementById('mahjongAutoSpinProgress').textContent = `${mahjongSpinsCompleted}/${mahjongAutoSpinCount}`;
}

function stopMahjongAutoSpin() {
    mahjongAutoSpinActive = false;
    mahjongAutoSpinCount = 0;
    mahjongSpinsCompleted = 0;
    
    document.getElementById('mahjongStopBtn').style.display = 'none';
    document.getElementById('mahjongSpinBtn').style.display = 'inline-block';
    document.getElementById('mahjongSpinBtn').disabled = false;
    document.getElementById('mahjongSpinBtn').textContent = '🀄 SPIN!';
    
    updateMahjongAutoSpinDisplay();
    showNotification('⏹️ Auto spin dihentikan', 'info');
}

function spinMahjong() {
    if (isPlaying) return;
    
    const bet = parseInt(document.getElementById('mahjongBet').value);
    const autoSpinEnabled = document.getElementById('mahjongAutoSpinEnabled')?.checked || false;
    
    // Check if starting auto spin
    if (autoSpinEnabled && mahjongAutoSpinCount > 0 && !mahjongAutoSpinActive) {
        // Check if balance is enough for all spins
        const totalCost = bet * mahjongAutoSpinCount;
        if (balance < totalCost) {
            showNotification(`❌ Saldo tidak cukup untuk ${mahjongAutoSpinCount}x spin! Butuh ${formatRupiah(totalCost)}`, 'error');
            return;
        }
        
        mahjongAutoSpinActive = true;
        mahjongSpinsCompleted = 0;
        
        document.getElementById('mahjongStopBtn').style.display = 'inline-block';
        document.getElementById('mahjongSpinBtn').style.display = 'none';
        
        showNotification(`🤖 Auto spin dimulai: ${mahjongAutoSpinCount}x`, 'success');
    }
    
    // Regular spin check
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        stopMahjongAutoSpin();
        return;
    }
    
    isPlaying = true;
    balance -= bet;
    updateBalance();
    
    mahjongCurrentBet = bet;
    mahjongDrawsLeft = 0;
    mahjongTotalWinAmount = 0;
    
    if (!mahjongAutoSpinActive) {
        document.getElementById('mahjongSpinBtn').disabled = true;
        document.getElementById('mahjongSpinBtn').textContent = '⏳ SPINNING...';
    }
    
    drawMahjongTiles(bet, true);
}

function drawMahjongTiles(bet, isFirstDraw = false) {
    const tiles = ['🀄', '🀅', '🀆', '🀇', '🀈', '🀉', '🀊', '🀋', '🀌'];
    const board = document.getElementById('mahjongBoard');
    board.innerHTML = '';
    
    // Draw 15 tiles
    const drawnTiles = [];
    for (let i = 0; i < 15; i++) {
        drawnTiles.push(tiles[Math.floor(Math.random() * tiles.length)]);
    }
    
    document.getElementById('mahjongResult').textContent = '🀄 Drawing tiles...';
    document.getElementById('mahjongResult').className = 'result-message';
    document.getElementById('mahjongScatter').textContent = '';
    
    // Animate tiles with scatter effect
    drawnTiles.forEach((tile, index) => {
        setTimeout(() => {
            const tileEl = document.createElement('div');
            tileEl.className = 'mahjong-tile-scatter';
            tileEl.textContent = tile;
            tileEl.style.cssText = `
                background: linear-gradient(145deg, #f0f0f0, #d0d0d0);
                border: 3px solid #8b4513;
                border-radius: 8px;
                padding: 20px 10px;
                font-size: 2.5em;
                text-align: center;
                animation: scatterDrop 0.5s ease;
                position: relative;
            `;
            
            // Add glow for scatter tiles
            if (tile === '🀄') {
                tileEl.style.background = 'linear-gradient(145deg, #ffd700, #ffed4e)';
                tileEl.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
                tileEl.style.animation = 'scatterGlow 0.5s ease';
            }
            
            board.appendChild(tileEl);
            
            // Check after all tiles drawn
            if (index === 14) {
                setTimeout(() => {
                    checkMahjongScatter(drawnTiles, bet, isFirstDraw);
                }, 500);
            }
        }, index * 80);
    });
}

function checkMahjongScatter(tiles, bet, isFirstDraw) {
    // Count scatter tiles (🀄)
    const scatterCount = tiles.filter(t => t === '🀄').length;
    
    const scatterDiv = document.getElementById('mahjongScatter');
    const resultDiv = document.getElementById('mahjongResult');
    
    let winAmount = 0;
    let extraDraws = 0;
    let message = '';
    
    if (scatterCount >= 3) {
        if (scatterCount === 3) {
            winAmount = bet * 2;
            message = `🀄 3 SCATTER! 2x`;
        } else if (scatterCount === 4) {
            winAmount = bet * 5;
            message = `🀄🀄 4 SCATTER! 5x`;
        } else if (scatterCount === 5) {
            winAmount = bet * 10;
            extraDraws = 10;
            message = `🀄🀄🀄 5 SCATTER! 10x + 10 FREE DRAWS!`;
        } else if (scatterCount === 6) {
            winAmount = bet * 20;
            extraDraws = 20;
            message = `🀄🀄🀄🀄 6 SCATTER! 20x + 20 FREE DRAWS!`;
        } else if (scatterCount >= 7) {
            winAmount = bet * 40;
            extraDraws = 40;
            message = `🀄🀄🀄🀄🀄 ${scatterCount} SCATTER! MEGA WIN 40x + 40 FREE DRAWS!`;
        }
        
        winAmount = applyRoleBonus(winAmount);
        mahjongTotalWinAmount += winAmount;
        
        scatterDiv.innerHTML = `
            <div style="color: #ffd700; font-size: 1.3em; margin-bottom: 10px;">
                ${message}
            </div>
            <div style="color: #00ff88;">
                Win: ${formatRupiah(winAmount)}
            </div>
        `;
        
        if (extraDraws > 0) {
            mahjongDrawsLeft += extraDraws;
            showNotification(`🎉 +${extraDraws} Free Draws!`, 'success');
        }
    } else {
        scatterDiv.innerHTML = `
            <div style="color: #aaa;">
                ${scatterCount} Scatter (Need 3+ for win)
            </div>
        `;
    }
    
    // Update display
    updateMahjongDisplay();
    
    // Check if there are more draws
    if (mahjongDrawsLeft > 0) {
        mahjongDrawsLeft--;
        updateMahjongDisplay();
        
        setTimeout(() => {
            drawMahjongTiles(bet, false);
        }, 2000);
    } else {
        // Game end
        endMahjongGame(isFirstDraw);
    }
}

function updateMahjongDisplay() {
    document.getElementById('mahjongDraws').textContent = mahjongDrawsLeft;
    document.getElementById('mahjongTotalWin').textContent = formatRupiah(mahjongTotalWinAmount);
}

function endMahjongGame(isFirstDraw) {
    isPlaying = false;
    
    const resultDiv = document.getElementById('mahjongResult');
    
    if (mahjongTotalWinAmount > 0) {
        balance += mahjongTotalWinAmount;
        updateBalance();
        resultDiv.textContent = `🎉 TOTAL WIN: ${formatRupiah(mahjongTotalWinAmount)}`;
        resultDiv.className = 'result-message win';
        addToHistory('Mahjong Ways', mahjongCurrentBet, 'win', mahjongTotalWinAmount);
    } else {
        resultDiv.textContent = `😢 No scatter! Coba lagi!`;
        resultDiv.className = 'result-message loss';
        addToHistory('Mahjong Ways', mahjongCurrentBet, 'loss', 0);
    }
    
    // Check if auto spin is active
    if (mahjongAutoSpinActive && mahjongAutoSpinCount > 0) {
        mahjongSpinsCompleted++;
        updateMahjongAutoSpinDisplay();
        
        // Check if we should continue
        if (mahjongSpinsCompleted < mahjongAutoSpinCount) {
            // Continue auto spin after delay
            setTimeout(() => {
                if (mahjongAutoSpinActive) {
                    spinMahjong();
                }
            }, 1500);
        } else {
            // Auto spin completed
            stopMahjongAutoSpin();
            showNotification(`✅ Auto spin selesai! ${mahjongSpinsCompleted}x spin completed`, 'success');
        }
    } else {
        // Normal single spin
        document.getElementById('mahjongSpinBtn').disabled = false;
        document.getElementById('mahjongSpinBtn').textContent = '🀄 SPIN!';
    }
}

// ===== SIC BO GAME =====
function loadSicBoGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎲 Sic Bo</h2>
            <p>Tebak hasil 3 dadu!</p>
        </div>
        
        <div style="display: flex; justify-content: center; gap: 20px; margin: 30px 0; flex-wrap: wrap;">
            <div id="sicbo1" style="width: 80px; height: 80px; background: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 3em; color: #000;">1</div>
            <div id="sicbo2" style="width: 80px; height: 80px; background: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 3em; color: #000;">1</div>
            <div id="sicbo3" style="width: 80px; height: 80px; background: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 3em; color: #000;">1</div>
        </div>
        
        <div class="bet-section">
            <div style="margin-bottom: 20px;">
                <h4 style="text-align: center; color: #ffd700; margin-bottom: 15px;">Pilih Taruhan:</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;">
                    <button class="preset-btn sicbo-bet-btn" onclick="selectSicBoBet('small', 2)" data-bet="small">
                        KECIL (4-10)<br><small>2x</small>
                    </button>
                    <button class="preset-btn sicbo-bet-btn" onclick="selectSicBoBet('big', 2)" data-bet="big">
                        BESAR (11-17)<br><small>2x</small>
                    </button>
                    <button class="preset-btn sicbo-bet-btn" onclick="selectSicBoBet('odd', 2)" data-bet="odd">
                        GANJIL<br><small>2x</small>
                    </button>
                    <button class="preset-btn sicbo-bet-btn" onclick="selectSicBoBet('even', 2)" data-bet="even">
                        GENAP<br><small>2x</small>
                    </button>
                    <button class="preset-btn sicbo-bet-btn" onclick="selectSicBoBet('triple', 30)" data-bet="triple">
                        TRIPLE<br><small>30x</small>
                    </button>
                </div>
            </div>
            
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="sicboBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
        </div>
        
        <div class="result-message" id="sicboResult"></div>
        
        <div style="text-align: center;">
            <button class="game-btn" onclick="rollSicBo()">🎲 ROLL DICE!</button>
        </div>
    `;
}

let sicboBetType = '';
let sicboMultiplier = 0;

function selectSicBoBet(type, multiplier) {
    sicboBetType = type;
    sicboMultiplier = multiplier;
    
    document.querySelectorAll('.sicbo-bet-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.background = '';
    });
    
    event.target.closest('.sicbo-bet-btn').classList.add('selected');
    event.target.closest('.sicbo-bet-btn').style.background = 'rgba(255, 215, 0, 0.3)';
}

function rollSicBo() {
    if (isPlaying) return;
    
    if (!sicboBetType) {
        showNotification('❌ Pilih jenis taruhan terlebih dahulu!', 'error');
        return;
    }
    
    const bet = parseInt(document.getElementById('sicboBet').value);
    
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    isPlaying = true;
    balance -= bet;
    updateBalance();
    
    const dice1 = document.getElementById('sicbo1');
    const dice2 = document.getElementById('sicbo2');
    const dice3 = document.getElementById('sicbo3');
    
    let rolls = 0;
    const maxRolls = 15;
    
    const interval = setInterval(() => {
        dice1.textContent = Math.floor(Math.random() * 6) + 1;
        dice2.textContent = Math.floor(Math.random() * 6) + 1;
        dice3.textContent = Math.floor(Math.random() * 6) + 1;
        
        rolls++;
        
        if (rolls >= maxRolls) {
            clearInterval(interval);
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const d3 = Math.floor(Math.random() * 6) + 1;
            dice1.textContent = d1;
            dice2.textContent = d2;
            dice3.textContent = d3;
            checkSicBoResult(d1, d2, d3, bet);
        }
    }, 100);
}

function checkSicBoResult(d1, d2, d3, bet) {
    const total = d1 + d2 + d3;
    const isTriple = (d1 === d2 && d2 === d3);
    const isSmall = total >= 4 && total <= 10;
    const isBig = total >= 11 && total <= 17;
    const isOdd = total % 2 === 1;
    const isEven = total % 2 === 0;
    
    let won = false;
    let message = '';
    
    switch(sicboBetType) {
        case 'small':
            won = isSmall && !isTriple;
            message = `Total: ${total} - ${won ? 'KECIL!' : 'BESAR!'}`;
            break;
        case 'big':
            won = isBig && !isTriple;
            message = `Total: ${total} - ${won ? 'BESAR!' : 'KECIL!'}`;
            break;
        case 'odd':
            won = isOdd && !isTriple;
            message = `Total: ${total} - ${won ? 'GANJIL!' : 'GENAP!'}`;
            break;
        case 'even':
            won = isEven && !isTriple;
            message = `Total: ${total} - ${won ? 'GENAP!' : 'GANJIL!'}`;
            break;
        case 'triple':
            won = isTriple;
            message = isTriple ? `🎉 TRIPLE ${d1}s! 🎉` : `Total: ${total}`;
            break;
    }
    
    const resultDiv = document.getElementById('sicboResult');
    
    if (won) {
        let winAmount = bet * sicboMultiplier;
        winAmount = applyRoleBonus(winAmount);
        balance += winAmount;
        updateBalance();
        resultDiv.textContent = `${message} Menang: ${formatRupiah(winAmount)}`;
        resultDiv.className = 'result-message win';
        addToHistory('Sic Bo', bet, 'win', winAmount);
    } else {
        resultDiv.textContent = `${message} Coba lagi!`;
        resultDiv.className = 'result-message loss';
        addToHistory('Sic Bo', bet, 'loss', 0);
    }
    
    isPlaying = false;
}




// ===== VIDEO POKER GAME =====
function loadPokerGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🃏 Video Poker</h2>
            <p>Dapatkan kombinasi kartu terbaik!</p>
        </div>
        
        <div style="background: rgba(0, 100, 0, 0.3); border-radius: 20px; padding: 30px 20px; margin: 20px 0;">
            <div id="pokerHand" style="display: flex; justify-content: center; gap: 10px; margin: 20px 0; flex-wrap: wrap;">
                <!-- Cards will be generated here -->
            </div>
            
            <div id="pokerHandName" style="text-align: center; font-size: 1.5em; color: #ffd700; font-weight: bold; min-height: 40px; margin: 20px 0;">
                Klik DEAL untuk mulai
            </div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="pokerBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
            
            <div style="background: rgba(255, 215, 0, 0.1); border-radius: 10px; padding: 15px; margin-top: 15px;">
                <div style="text-align: center; color: #ffd700; font-weight: bold; margin-bottom: 10px;">
                    💰 PAYTABLE 💰
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9em;">
                    <div style="color: #fff;">Royal Flush</div><div style="color: #ff4444; text-align: right;">= 250x</div>
                    <div style="color: #fff;">Straight Flush</div><div style="color: #ff4444; text-align: right;">= 50x</div>
                    <div style="color: #fff;">Four of a Kind</div><div style="color: #ffd700; text-align: right;">= 25x</div>
                    <div style="color: #fff;">Full House</div><div style="color: #ffd700; text-align: right;">= 9x</div>
                    <div style="color: #fff;">Flush</div><div style="color: #00ff88; text-align: right;">= 6x</div>
                    <div style="color: #fff;">Straight</div><div style="color: #00ff88; text-align: right;">= 4x</div>
                    <div style="color: #fff;">Three of a Kind</div><div style="color: #00ff88; text-align: right;">= 3x</div>
                    <div style="color: #fff;">Two Pair</div><div style="color: #00ff88; text-align: right;">= 2x</div>
                    <div style="color: #fff;">Jacks or Better</div><div style="color: #00ff88; text-align: right;">= 1x</div>
                </div>
            </div>
        </div>
        
        <div class="result-message" id="pokerResult"></div>
        
        <div style="text-align: center; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button class="game-btn" id="pokerDealBtn" onclick="dealPoker()">🃏 DEAL</button>
            <button class="game-btn" id="pokerDrawBtn" onclick="drawPoker()" style="display: none;">🔄 DRAW</button>
        </div>
    `;
}

let pokerDeck = [];
let pokerHand = [];
let pokerHeld = [false, false, false, false, false];
let pokerGameActive = false;

function dealPoker() {
    const bet = parseInt(document.getElementById('pokerBet').value);
    
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    balance -= bet;
    updateBalance();
    
    pokerGameActive = true;
    pokerDeck = createPokerDeck();
    pokerHand = [drawPokerCard(), drawPokerCard(), drawPokerCard(), drawPokerCard(), drawPokerCard()];
    pokerHeld = [false, false, false, false, false];
    
    displayPokerHand();
    
    document.getElementById('pokerDealBtn').style.display = 'none';
    document.getElementById('pokerDrawBtn').style.display = 'inline-block';
    document.getElementById('pokerHandName').textContent = 'Klik kartu untuk HOLD, lalu klik DRAW';
    document.getElementById('pokerResult').textContent = '';
}

function createPokerDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ rank, suit, value: getRankValue(rank) });
        }
    }
    
    return deck.sort(() => Math.random() - 0.5);
}

function getRankValue(rank) {
    if (rank === 'A') return 14;
    if (rank === 'K') return 13;
    if (rank === 'Q') return 12;
    if (rank === 'J') return 11;
    return parseInt(rank);
}

function drawPokerCard() {
    return pokerDeck.pop();
}

function displayPokerHand() {
    const handDiv = document.getElementById('pokerHand');
    handDiv.innerHTML = '';
    
    pokerHand.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        const isRed = card.suit === '♥' || card.suit === '♦';
        
        cardDiv.style.cssText = `
            width: 80px;
            height: 110px;
            background: ${pokerHeld[index] ? '#ffd700' : '#fff'};
            border: 3px solid ${pokerHeld[index] ? '#ff4444' : '#333'};
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            color: ${isRed ? '#ff0000' : '#000'};
            font-size: 1.5em;
            font-weight: bold;
        `;
        
        cardDiv.innerHTML = `
            <div>${card.rank}</div>
            <div style="font-size: 1.5em;">${card.suit}</div>
            ${pokerHeld[index] ? '<div style="font-size: 0.6em; color: #ff4444;">HOLD</div>' : ''}
        `;
        
        if (pokerGameActive && document.getElementById('pokerDrawBtn').style.display !== 'none') {
            cardDiv.onclick = () => toggleHoldPoker(index);
        }
        
        handDiv.appendChild(cardDiv);
    });
}

function toggleHoldPoker(index) {
    pokerHeld[index] = !pokerHeld[index];
    displayPokerHand();
}

function drawPoker() {
    // Replace non-held cards
    for (let i = 0; i < 5; i++) {
        if (!pokerHeld[i]) {
            pokerHand[i] = drawPokerCard();
        }
    }
    
    pokerGameActive = false;
    displayPokerHand();
    
    const result = evaluatePokerHand(pokerHand);
    const bet = parseInt(document.getElementById('pokerBet').value);
    
    document.getElementById('pokerHandName').textContent = result.name;
    document.getElementById('pokerDrawBtn').style.display = 'none';
    document.getElementById('pokerDealBtn').style.display = 'inline-block';
    
    const resultDiv = document.getElementById('pokerResult');
    
    if (result.multiplier > 0) {
        let winAmount = bet * result.multiplier;
        winAmount = applyRoleBonus(winAmount);
        balance += winAmount;
        updateBalance();
        resultDiv.textContent = `🎉 ${result.name}! Menang: ${formatRupiah(winAmount)}`;
        resultDiv.className = 'result-message win';
        addToHistory('Video Poker', bet, 'win', winAmount);
    } else {
        resultDiv.textContent = `😢 ${result.name} - Coba lagi!`;
        resultDiv.className = 'result-message loss';
        addToHistory('Video Poker', bet, 'loss', 0);
    }
}

function evaluatePokerHand(hand) {
    const ranks = hand.map(c => c.value).sort((a, b) => b - a);
    const suits = hand.map(c => c.suit);
    
    const isFlush = suits.every(s => s === suits[0]);
    const isStraight = checkStraight(ranks);
    const rankCounts = {};
    
    ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    
    // Royal Flush
    if (isFlush && isStraight && ranks[0] === 14) {
        return { name: '👑 ROYAL FLUSH!', multiplier: 250 };
    }
    
    // Straight Flush
    if (isFlush && isStraight) {
        return { name: '🌟 STRAIGHT FLUSH!', multiplier: 50 };
    }
    
    // Four of a Kind
    if (counts[0] === 4) {
        return { name: '💎 FOUR OF A KIND!', multiplier: 25 };
    }
    
    // Full House
    if (counts[0] === 3 && counts[1] === 2) {
        return { name: '🏠 FULL HOUSE!', multiplier: 9 };
    }
    
    // Flush
    if (isFlush) {
        return { name: '✨ FLUSH!', multiplier: 6 };
    }
    
    // Straight
    if (isStraight) {
        return { name: '📊 STRAIGHT!', multiplier: 4 };
    }
    
    // Three of a Kind
    if (counts[0] === 3) {
        return { name: '🎯 THREE OF A KIND!', multiplier: 3 };
    }
    
    // Two Pair
    if (counts[0] === 2 && counts[1] === 2) {
        return { name: '👥 TWO PAIR!', multiplier: 2 };
    }
    
    // Jacks or Better
    if (counts[0] === 2) {
        const pairRank = Object.keys(rankCounts).find(k => rankCounts[k] === 2);
        if (parseInt(pairRank) >= 11) {
            return { name: '🃏 JACKS OR BETTER!', multiplier: 1 };
        }
    }
    
    return { name: 'No Win', multiplier: 0 };
}

function checkStraight(ranks) {
    for (let i = 0; i < ranks.length - 1; i++) {
        if (ranks[i] - ranks[i + 1] !== 1) {
            // Check for A-2-3-4-5 straight
            if (!(ranks[0] === 14 && ranks[1] === 5 && ranks[2] === 4 && ranks[3] === 3 && ranks[4] === 2)) {
                return false;
            }
        }
    }
    return true;
}


// ===== MINES GAME =====
function loadMinesGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">💣 Mines</h2>
            <p>Buka kotak, hindari bom!</p>
        </div>
        
        <div style="background: rgba(50, 50, 50, 0.5); border-radius: 20px; padding: 30px 20px; margin: 20px 0;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 1.3em; color: #ffd700; font-weight: bold;">
                    Multiplier: <span id="minesMultiplier">1.00x</span>
                </div>
                <div style="font-size: 1em; color: #00ff88; margin-top: 10px;">
                    Opened: <span id="minesOpened">0</span> | Potential Win: <span id="minesPotentialWin">Rp 0</span>
                </div>
            </div>
            
            <div id="minesBoard" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; max-width: 400px; margin: 0 auto;">
                <!-- Tiles will be generated here -->
            </div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="minesBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
            
            <div style="margin-top: 15px;">
                <label style="display: block; text-align: center; margin-bottom: 10px; color: #ffd700;">Jumlah Bom:</label>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button class="preset-btn" onclick="setMinesBombs(3)">3 Bom</button>
                    <button class="preset-btn" onclick="setMinesBombs(5)">5 Bom</button>
                    <button class="preset-btn" onclick="setMinesBombs(7)">7 Bom</button>
                    <button class="preset-btn" onclick="setMinesBombs(10)">10 Bom</button>
                </div>
                <div style="text-align: center; margin-top: 10px; color: #aaa;">
                    Bom dipilih: <span id="minesBombCount" style="color: #ff4444; font-weight: bold;">3</span>
                </div>
            </div>
        </div>
        
        <div class="result-message" id="minesResult"></div>
        
        <div style="text-align: center; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button class="game-btn" id="minesStartBtn" onclick="startMines()">💣 START</button>
            <button class="game-btn" id="minesCashoutBtn" onclick="cashoutMines()" style="display: none; background: linear-gradient(45deg, #00ff88, #00cc6a);">💰 CASHOUT</button>
        </div>
    `;
}

let minesBoard = [];
let minesBombs = 3;
let minesOpened = 0;
let minesGameActive = false;
let minesBet = 0;

function setMinesBombs(count) {
    minesBombs = count;
    document.getElementById('minesBombCount').textContent = count;
}

function startMines() {
    const bet = parseInt(document.getElementById('minesBet').value);
    
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    balance -= bet;
    updateBalance();
    
    minesBet = bet;
    minesGameActive = true;
    minesOpened = 0;
    
    // Create board with bombs
    minesBoard = Array(25).fill('safe');
    const bombPositions = [];
    
    while (bombPositions.length < minesBombs) {
        const pos = Math.floor(Math.random() * 25);
        if (!bombPositions.includes(pos)) {
            bombPositions.push(pos);
            minesBoard[pos] = 'bomb';
        }
    }
    
    displayMinesBoard();
    updateMinesDisplay();
    
    document.getElementById('minesStartBtn').style.display = 'none';
    document.getElementById('minesCashoutBtn').style.display = 'inline-block';
    document.getElementById('minesResult').textContent = 'Klik kotak untuk membuka!';
    document.getElementById('minesResult').className = 'result-message';
}

function displayMinesBoard() {
    const board = document.getElementById('minesBoard');
    board.innerHTML = '';
    
    for (let i = 0; i < 25; i++) {
        const tile = document.createElement('div');
        tile.style.cssText = `
            width: 70px;
            height: 70px;
            background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
            border: 2px solid #555;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2em;
            cursor: pointer;
            transition: all 0.3s;
        `;
        
        tile.dataset.index = i;
        tile.dataset.revealed = 'false';
        
        if (minesGameActive) {
            tile.onclick = () => revealMinesTile(i);
        }
        
        tile.onmouseenter = () => {
            if (tile.dataset.revealed === 'false' && minesGameActive) {
                tile.style.background = 'linear-gradient(145deg, #4a4a4a, #3a3a3a)';
                tile.style.transform = 'scale(1.05)';
            }
        };
        
        tile.onmouseleave = () => {
            if (tile.dataset.revealed === 'false') {
                tile.style.background = 'linear-gradient(145deg, #3a3a3a, #2a2a2a)';
                tile.style.transform = 'scale(1)';
            }
        };
        
        board.appendChild(tile);
    }
}

function revealMinesTile(index) {
    if (!minesGameActive) return;
    
    const tiles = document.querySelectorAll('#minesBoard > div');
    const tile = tiles[index];
    
    if (tile.dataset.revealed === 'true') return;
    
    tile.dataset.revealed = 'true';
    
    if (minesBoard[index] === 'bomb') {
        // Hit a bomb!
        tile.textContent = '💣';
        tile.style.background = 'linear-gradient(145deg, #ff4444, #cc0000)';
        tile.style.animation = 'pulse 0.5s';
        
        // Reveal all bombs
        setTimeout(() => {
            revealAllMines();
            endMinesGame(false);
        }, 500);
    } else {
        // Safe tile
        tile.textContent = '💎';
        tile.style.background = 'linear-gradient(145deg, #00ff88, #00cc6a)';
        tile.style.cursor = 'default';
        minesOpened++;
        updateMinesDisplay();
        
        // Check if won
        if (minesOpened === 25 - minesBombs) {
            setTimeout(() => {
                cashoutMines();
            }, 500);
        }
    }
}

function revealAllMines() {
    const tiles = document.querySelectorAll('#minesBoard > div');
    tiles.forEach((tile, index) => {
        if (minesBoard[index] === 'bomb' && tile.dataset.revealed === 'false') {
            tile.textContent = '💣';
            tile.style.background = 'linear-gradient(145deg, #666, #444)';
        }
    });
}

function updateMinesDisplay() {
    const safeLeft = 25 - minesBombs;
    const multiplier = calculateMinesMultiplier();
    const potentialWin = Math.floor(minesBet * multiplier);
    
    document.getElementById('minesMultiplier').textContent = multiplier.toFixed(2) + 'x';
    document.getElementById('minesOpened').textContent = minesOpened;
    document.getElementById('minesPotentialWin').textContent = formatRupiah(potentialWin);
}

function calculateMinesMultiplier() {
    if (minesOpened === 0) return 1;
    
    const safeSpots = 25 - minesBombs;
    let multiplier = 1;
    
    for (let i = 0; i < minesOpened; i++) {
        multiplier *= (25 - i) / (safeSpots - i);
    }
    
    return multiplier;
}

function cashoutMines() {
    if (!minesGameActive) return;
    
    minesGameActive = false;
    
    const multiplier = calculateMinesMultiplier();
    let winAmount = Math.floor(minesBet * multiplier);
    winAmount = applyRoleBonus(winAmount);
    
    balance += winAmount;
    updateBalance();
    
    document.getElementById('minesResult').textContent = `💰 CASHOUT! Menang: ${formatRupiah(winAmount)}`;
    document.getElementById('minesResult').className = 'result-message win';
    
    document.getElementById('minesCashoutBtn').style.display = 'none';
    document.getElementById('minesStartBtn').style.display = 'inline-block';
    
    addToHistory('Mines', minesBet, 'win', winAmount);
    
    // Disable clicking
    const tiles = document.querySelectorAll('#minesBoard > div');
    tiles.forEach(tile => {
        tile.onclick = null;
        tile.style.cursor = 'default';
    });
}

function endMinesGame(won) {
    minesGameActive = false;
    
    const resultDiv = document.getElementById('minesResult');
    
    if (!won) {
        resultDiv.textContent = `💥 BOOM! Kalah: ${formatRupiah(minesBet)}`;
        resultDiv.className = 'result-message loss';
        addToHistory('Mines', minesBet, 'loss', 0);
    }
    
    document.getElementById('minesCashoutBtn').style.display = 'none';
    document.getElementById('minesStartBtn').style.display = 'inline-block';
    
    // Disable clicking
    const tiles = document.querySelectorAll('#minesBoard > div');
    tiles.forEach(tile => {
        tile.onclick = null;
        tile.style.cursor = 'default';
    });
}


// ===== PLINKO GAME =====
function loadPlinkoGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎯 Plinko</h2>
            <p>Jatuhkan bola, dapatkan multiplier!</p>
        </div>
        
        <div style="background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%); border-radius: 20px; padding: 30px 20px; margin: 20px 0; position: relative; overflow: hidden;">
            <div id="plinkoBoard" style="position: relative; width: 100%; max-width: 400px; height: 500px; margin: 0 auto; background: rgba(0, 0, 0, 0.3); border-radius: 15px; border: 2px solid #ffd700;">
                <!-- Plinko pegs and ball will be animated here -->
                <div id="plinkoBall" style="position: absolute; width: 20px; height: 20px; background: radial-gradient(circle, #ffd700, #ff8800); border-radius: 50%; display: none; box-shadow: 0 0 10px #ffd700; z-index: 10;"></div>
                
                <!-- Multiplier slots at bottom -->
                <div id="plinkoSlots" style="position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-around; padding: 10px 5px;">
                    <div class="plinko-slot" data-multiplier="10">10x</div>
                    <div class="plinko-slot" data-multiplier="5">5x</div>
                    <div class="plinko-slot" data-multiplier="3">3x</div>
                    <div class="plinko-slot" data-multiplier="1.5">1.5x</div>
                    <div class="plinko-slot" data-multiplier="0.5">0.5x</div>
                    <div class="plinko-slot" data-multiplier="1.5">1.5x</div>
                    <div class="plinko-slot" data-multiplier="3">3x</div>
                    <div class="plinko-slot" data-multiplier="5">5x</div>
                    <div class="plinko-slot" data-multiplier="10">10x</div>
                </div>
            </div>
        </div>
        
        <style>
            .plinko-slot {
                flex: 1;
                padding: 10px 5px;
                background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                border: 2px solid #ffd700;
                border-radius: 8px;
                text-align: center;
                font-weight: bold;
                font-size: 0.9em;
                color: #ffd700;
                margin: 0 2px;
            }
            
            .plinko-slot[data-multiplier="10"] {
                background: linear-gradient(145deg, #ff4444, #cc0000);
                color: #fff;
            }
            
            .plinko-slot[data-multiplier="5"] {
                background: linear-gradient(145deg, #ff8800, #cc6600);
                color: #fff;
            }
            
            .plinko-slot[data-multiplier="3"] {
                background: linear-gradient(145deg, #ffd700, #ffb700);
                color: #000;
            }
            
            .plinko-slot[data-multiplier="0.5"] {
                background: linear-gradient(145deg, #666, #444);
                color: #fff;
            }
        </style>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="plinkoBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
            <div class="bet-presets" style="margin-top: 15px;">
                <button class="preset-btn" onclick="document.getElementById('plinkoBet').value = 5000">Rp 5K</button>
                <button class="preset-btn" onclick="document.getElementById('plinkoBet').value = 10000">Rp 10K</button>
                <button class="preset-btn" onclick="document.getElementById('plinkoBet').value = 25000">Rp 25K</button>
                <button class="preset-btn" onclick="document.getElementById('plinkoBet').value = 50000">Rp 50K</button>
            </div>
        </div>
        
        <div class="result-message" id="plinkoResult"></div>
        
        <div style="text-align: center;">
            <button class="game-btn" id="plinkoDropBtn" onclick="dropPlinkoBall()">🎯 DROP BALL!</button>
        </div>
    `;
}

function dropPlinkoBall() {
    if (isPlaying) return;
    
    const bet = parseInt(document.getElementById('plinkoBet').value);
    
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    isPlaying = true;
    balance -= bet;
    updateBalance();
    
    document.getElementById('plinkoDropBtn').disabled = true;
    document.getElementById('plinkoResult').textContent = '🎯 Bola jatuh...';
    document.getElementById('plinkoResult').className = 'result-message';
    
    const ball = document.getElementById('plinkoBall');
    const board = document.getElementById('plinkoBoard');
    const boardWidth = board.offsetWidth;
    
    // Start position (top center)
    let x = boardWidth / 2;
    let y = 20;
    
    ball.style.display = 'block';
    ball.style.left = x + 'px';
    ball.style.top = y + 'px';
    
    // Simulate ball dropping with random bounces
    const drops = 8; // Number of rows
    let currentDrop = 0;
    
    const dropInterval = setInterval(() => {
        if (currentDrop >= drops) {
            clearInterval(dropInterval);
            
            // Determine which slot the ball landed in
            const slotIndex = Math.floor((x / boardWidth) * 9);
            const slots = document.querySelectorAll('.plinko-slot');
            const landedSlot = slots[Math.min(slotIndex, 8)];
            const multiplier = parseFloat(landedSlot.dataset.multiplier);
            
            // Highlight the slot
            landedSlot.style.transform = 'scale(1.2)';
            landedSlot.style.boxShadow = '0 0 20px #ffd700';
            
            setTimeout(() => {
                landedSlot.style.transform = 'scale(1)';
                landedSlot.style.boxShadow = 'none';
                
                // Calculate win
                let winAmount = Math.floor(bet * multiplier);
                
                if (multiplier >= 1) {
                    winAmount = applyRoleBonus(winAmount);
                    balance += winAmount;
                    updateBalance();
                    document.getElementById('plinkoResult').textContent = `🎉 ${multiplier}x! Menang: ${formatRupiah(winAmount)}`;
                    document.getElementById('plinkoResult').className = 'result-message win';
                    addToHistory('Plinko', bet, 'win', winAmount);
                } else {
                    balance += winAmount;
                    updateBalance();
                    document.getElementById('plinkoResult').textContent = `😢 ${multiplier}x - Kalah: ${formatRupiah(bet - winAmount)}`;
                    document.getElementById('plinkoResult').className = 'result-message loss';
                    addToHistory('Plinko', bet, 'loss', bet - winAmount);
                }
                
                ball.style.display = 'none';
                document.getElementById('plinkoDropBtn').disabled = false;
                isPlaying = false;
            }, 500);
            
            return;
        }
        
        // Random bounce left or right
        const direction = Math.random() > 0.5 ? 1 : -1;
        const bounceAmount = (boardWidth / 10) * direction;
        
        x += bounceAmount;
        
        // Keep within bounds
        x = Math.max(20, Math.min(boardWidth - 20, x));
        
        y += 50;
        
        ball.style.left = x + 'px';
        ball.style.top = y + 'px';
        
        currentDrop++;
    }, 200);
}


// ===== COIN FLIP GAME =====
function loadCoinFlipGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🪙 Coin Flip</h2>
            <p>Tebak sisi koin - Head atau Tail?</p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
            <div id="coinDisplay" style="width: 150px; height: 150px; margin: 0 auto; background: linear-gradient(145deg, #ffd700, #ffed4e); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 4em; box-shadow: 0 10px 30px rgba(255, 215, 0, 0.5); transition: all 0.5s;">
                🪙
            </div>
            <div id="coinResult" style="font-size: 1.5em; color: #ffd700; font-weight: bold; margin-top: 20px; min-height: 40px;">
                Pilih HEAD atau TAIL
            </div>
        </div>
        
        <div class="bet-section">
            <div style="margin-bottom: 20px;">
                <h4 style="text-align: center; color: #ffd700; margin-bottom: 15px;">Pilih Sisi:</h4>
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                    <button class="game-btn coinflip-choice" onclick="selectCoinSide('heads')" data-side="heads" style="min-width: 150px;">
                        👤 HEADS<br><small>2x</small>
                    </button>
                    <button class="game-btn coinflip-choice" onclick="selectCoinSide('tails')" data-side="tails" style="min-width: 150px;">
                        🦅 TAILS<br><small>2x</small>
                    </button>
                </div>
            </div>
            
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="coinflipBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
            <div class="bet-presets" style="margin-top: 15px;">
                <button class="preset-btn" onclick="document.getElementById('coinflipBet').value = 5000">Rp 5K</button>
                <button class="preset-btn" onclick="document.getElementById('coinflipBet').value = 10000">Rp 10K</button>
                <button class="preset-btn" onclick="document.getElementById('coinflipBet').value = 25000">Rp 25K</button>
                <button class="preset-btn" onclick="document.getElementById('coinflipBet').value = 50000">Rp 50K</button>
                <button class="preset-btn" onclick="document.getElementById('coinflipBet').value = 100000">Rp 100K</button>
            </div>
        </div>
        
        <div class="result-message" id="coinflipResultMsg"></div>
        
        <div style="text-align: center;">
            <button class="game-btn" id="coinflipFlipBtn" onclick="flipCoin()">🪙 FLIP COIN!</button>
        </div>
        
        <style>
            .coinflip-choice {
                background: linear-gradient(45deg, #667eea, #764ba2);
                transition: all 0.3s;
            }
            
            .coinflip-choice.selected {
                background: linear-gradient(45deg, #ffd700, #ffed4e);
                color: #000;
                transform: scale(1.1);
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
            }
            
            @keyframes coinFlip {
                0% { transform: rotateY(0deg); }
                100% { transform: rotateY(1800deg); }
            }
            
            .flipping {
                animation: coinFlip 2s ease-in-out;
            }
        </style>
    `;
}

let coinflipChoice = '';

function selectCoinSide(side) {
    coinflipChoice = side;
    
    document.querySelectorAll('.coinflip-choice').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    event.target.closest('.coinflip-choice').classList.add('selected');
}

function flipCoin() {
    if (isPlaying) return;
    
    if (!coinflipChoice) {
        showNotification('❌ Pilih HEADS atau TAILS terlebih dahulu!', 'error');
        return;
    }
    
    const bet = parseInt(document.getElementById('coinflipBet').value);
    
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    isPlaying = true;
    balance -= bet;
    updateBalance();
    
    document.getElementById('coinflipFlipBtn').disabled = true;
    document.getElementById('coinResult').textContent = 'Flipping...';
    document.getElementById('coinflipResultMsg').textContent = '';
    
    const coin = document.getElementById('coinDisplay');
    coin.classList.add('flipping');
    
    // Determine result
    const result = Math.random() > 0.5 ? 'heads' : 'tails';
    
    setTimeout(() => {
        coin.classList.remove('flipping');
        
        // Show result
        if (result === 'heads') {
            coin.textContent = '👤';
            coin.style.background = 'linear-gradient(145deg, #4a90e2, #357abd)';
            document.getElementById('coinResult').textContent = 'HEADS!';
        } else {
            coin.textContent = '🦅';
            coin.style.background = 'linear-gradient(145deg, #ff6b6b, #ee5a52)';
            document.getElementById('coinResult').textContent = 'TAILS!';
        }
        
        const resultDiv = document.getElementById('coinflipResultMsg');
        
        if (result === coinflipChoice) {
            // Win!
            let winAmount = bet * 2;
            winAmount = applyRoleBonus(winAmount);
            balance += winAmount;
            updateBalance();
            
            resultDiv.textContent = `🎉 MENANG! +${formatRupiah(winAmount)}`;
            resultDiv.className = 'result-message win';
            addToHistory('Coin Flip', bet, 'win', winAmount);
            
            // Celebration effect
            coin.style.boxShadow = '0 0 40px rgba(0, 255, 136, 0.8)';
            setTimeout(() => {
                coin.style.boxShadow = '0 10px 30px rgba(255, 215, 0, 0.5)';
            }, 1000);
        } else {
            // Lose
            resultDiv.textContent = `😢 KALAH! -${formatRupiah(bet)}`;
            resultDiv.className = 'result-message loss';
            addToHistory('Coin Flip', bet, 'loss', 0);
        }
        
        // Reset
        setTimeout(() => {
            coin.textContent = '🪙';
            coin.style.background = 'linear-gradient(145deg, #ffd700, #ffed4e)';
            document.getElementById('coinResult').textContent = 'Pilih HEAD atau TAIL';
        }, 3000);
        
        document.getElementById('coinflipFlipBtn').disabled = false;
        isPlaying = false;
    }, 2000);
}


// ===== BILLIARD 8-BALL GAME =====
function loadBilliardGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎱 Billiard 8-Ball</h2>
            <p>Masukkan semua bola Anda, lalu bola 8!</p>
        </div>
        
        <div style="background: linear-gradient(145deg, #0a5f0a, #064406); border-radius: 20px; padding: 30px 20px; margin: 20px 0; border: 10px solid #8b4513;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 1.2em; color: #ffd700; font-weight: bold;">
                    Your Balls: <span id="billiardYourBalls">7</span> | Opponent: <span id="billiardOppBalls">7</span>
                </div>
                <div style="font-size: 1em; color: #00ff88; margin-top: 10px;">
                    Turn: <span id="billiardTurn">YOU</span> | Type: <span id="billiardType">SOLID</span>
                </div>
            </div>
            
            <div id="billiardTable" style="position: relative; width: 100%; max-width: 500px; height: 300px; margin: 0 auto; background: #0a5f0a; border-radius: 15px; border: 3px solid #8b4513; overflow: hidden;">
                <!-- Pockets -->
                <div class="pocket" style="position: absolute; top: 5px; left: 5px; width: 30px; height: 30px; background: #000; border-radius: 50%;"></div>
                <div class="pocket" style="position: absolute; top: 5px; right: 5px; width: 30px; height: 30px; background: #000; border-radius: 50%;"></div>
                <div class="pocket" style="position: absolute; bottom: 5px; left: 5px; width: 30px; height: 30px; background: #000; border-radius: 50%;"></div>
                <div class="pocket" style="position: absolute; bottom: 5px; right: 5px; width: 30px; height: 30px; background: #000; border-radius: 50%;"></div>
                <div class="pocket" style="position: absolute; top: 50%; left: 5px; transform: translateY(-50%); width: 30px; height: 30px; background: #000; border-radius: 50%;"></div>
                <div class="pocket" style="position: absolute; top: 50%; right: 5px; transform: translateY(-50%); width: 30px; height: 30px; background: #000; border-radius: 50%;"></div>
                
                <!-- Balls will be generated here -->
                <div id="billiardBalls"></div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <div style="font-size: 0.9em; color: #aaa;">
                    Klik bola untuk "shoot" (simulasi)
                </div>
            </div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="billiardBet" class="bet-input" value="50000" min="10000" step="10000">
            </div>
            <div class="bet-presets" style="margin-top: 15px;">
                <button class="preset-btn" onclick="document.getElementById('billiardBet').value = 25000">Rp 25K</button>
                <button class="preset-btn" onclick="document.getElementById('billiardBet').value = 50000">Rp 50K</button>
                <button class="preset-btn" onclick="document.getElementById('billiardBet').value = 100000">Rp 100K</button>
                <button class="preset-btn" onclick="document.getElementById('billiardBet').value = 250000">Rp 250K</button>
            </div>
        </div>
        
        <div class="result-message" id="billiardResult"></div>
        
        <div style="text-align: center;">
            <button class="game-btn" id="billiardStartBtn" onclick="startBilliard()">🎱 START GAME</button>
        </div>
    `;
}

let billiardYourBalls = 7;
let billiardOppBalls = 7;
let billiardGameActive = false;
let billiardBet = 0;
let billiardYourType = 'solid'; // solid or stripe

function startBilliard() {
    const bet = parseInt(document.getElementById('billiardBet').value);
    
    if (bet < 10000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    balance -= bet;
    updateBalance();
    
    billiardBet = bet;
    billiardGameActive = true;
    billiardYourBalls = 7;
    billiardOppBalls = 7;
    billiardYourType = Math.random() > 0.5 ? 'solid' : 'stripe';
    
    updateBilliardDisplay();
    generateBilliardBalls();
    
    document.getElementById('billiardStartBtn').style.display = 'none';
    document.getElementById('billiardResult').textContent = 'Klik bola untuk shoot!';
    document.getElementById('billiardResult').className = 'result-message';
}

function generateBilliardBalls() {
    const ballsContainer = document.getElementById('billiardBalls');
    ballsContainer.innerHTML = '';
    
    const totalBalls = billiardYourBalls + billiardOppBalls + 1; // +1 for 8-ball
    
    for (let i = 0; i < totalBalls; i++) {
        const ball = document.createElement('div');
        const isYourBall = i < billiardYourBalls;
        const is8Ball = i === totalBalls - 1;
        
        ball.style.cssText = `
            position: absolute;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: ${is8Ball ? '#000' : isYourBall ? (billiardYourType === 'solid' ? '#ff4444' : '#fff') : (billiardYourType === 'solid' ? '#fff' : '#ff4444')};
            border: 2px solid ${is8Ball ? '#ffd700' : '#333'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7em;
            font-weight: bold;
            color: ${is8Ball ? '#ffd700' : '#000'};
            cursor: pointer;
            transition: all 0.3s;
            left: ${Math.random() * 85 + 5}%;
            top: ${Math.random() * 85 + 5}%;
        `;
        
        ball.textContent = is8Ball ? '8' : '';
        ball.dataset.type = is8Ball ? '8ball' : (isYourBall ? 'yours' : 'opponent');
        
        if (billiardGameActive) {
            ball.onclick = () => shootBilliardBall(ball);
        }
        
        ballsContainer.appendChild(ball);
    }
}

function shootBilliardBall(ball) {
    if (!billiardGameActive) return;
    
    const type = ball.dataset.type;
    
    // Check if shooting 8-ball too early
    if (type === '8ball' && billiardYourBalls > 0) {
        showNotification('❌ Masukkan semua bola Anda dulu!', 'error');
        return;
    }
    
    // Check if shooting opponent's ball
    if (type === 'opponent') {
        showNotification('❌ Itu bola lawan!', 'error');
        return;
    }
    
    // Animate ball going to pocket
    ball.style.transition = 'all 0.5s';
    ball.style.transform = 'scale(0)';
    ball.style.opacity = '0';
    
    setTimeout(() => {
        ball.remove();
        
        if (type === 'yours') {
            billiardYourBalls--;
            updateBilliardDisplay();
            
            if (billiardYourBalls === 0) {
                document.getElementById('billiardResult').textContent = '🎯 Semua bola masuk! Sekarang masukkan bola 8!';
                document.getElementById('billiardResult').className = 'result-message';
            }
        } else if (type === '8ball') {
            // Win!
            endBilliardGame(true);
        }
        
        // Opponent turn (simulate)
        if (billiardGameActive && type !== '8ball') {
            setTimeout(() => {
                opponentBilliardTurn();
            }, 1000);
        }
    }, 500);
}

function opponentBilliardTurn() {
    if (!billiardGameActive) return;
    
    // 60% chance opponent makes a shot
    if (Math.random() < 0.6 && billiardOppBalls > 0) {
        billiardOppBalls--;
        updateBilliardDisplay();
        showNotification('🤖 Lawan memasukkan bola!', 'info');
        
        // Check if opponent wins
        if (billiardOppBalls === 0) {
            // Opponent shoots 8-ball
            setTimeout(() => {
                if (Math.random() < 0.7) {
                    endBilliardGame(false);
                } else {
                    showNotification('🤖 Lawan gagal masukkan bola 8!', 'info');
                }
            }, 1000);
        }
    } else {
        showNotification('🤖 Lawan meleset!', 'info');
    }
}

function updateBilliardDisplay() {
    document.getElementById('billiardYourBalls').textContent = billiardYourBalls;
    document.getElementById('billiardOppBalls').textContent = billiardOppBalls;
    document.getElementById('billiardType').textContent = billiardYourType.toUpperCase();
}

function endBilliardGame(won) {
    billiardGameActive = false;
    
    const resultDiv = document.getElementById('billiardResult');
    
    if (won) {
        let winAmount = billiardBet * 2;
        winAmount = applyRoleBonus(winAmount);
        balance += winAmount;
        updateBalance();
        
        resultDiv.textContent = `🎉 MENANG! Bola 8 masuk! +${formatRupiah(winAmount)}`;
        resultDiv.className = 'result-message win';
        addToHistory('Billiard 8-Ball', billiardBet, 'win', winAmount);
    } else {
        resultDiv.textContent = `😢 KALAH! Lawan memasukkan bola 8 lebih dulu!`;
        resultDiv.className = 'result-message loss';
        addToHistory('Billiard 8-Ball', billiardBet, 'loss', 0);
    }
    
    document.getElementById('billiardStartBtn').style.display = 'inline-block';
}


// ===== TEXAS HOLD'EM POKER =====
function loadTexasHoldemGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🃏 Texas Hold'em Poker</h2>
            <p>Lawan 3 AI - Best hand wins!</p>
        </div>
        
        <div style="background: rgba(0, 100, 0, 0.3); border-radius: 20px; padding: 30px 20px; margin: 20px 0;">
            <!-- Community Cards -->
            <div style="text-align: center; margin-bottom: 30px;">
                <h4 style="color: #ffd700; margin-bottom: 15px;">Community Cards</h4>
                <div id="holdemCommunity" style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; min-height: 120px;">
                    <div class="poker-card-back">🂠</div>
                    <div class="poker-card-back">🂠</div>
                    <div class="poker-card-back">🂠</div>
                    <div class="poker-card-back">🂠</div>
                    <div class="poker-card-back">🂠</div>
                </div>
            </div>
            
            <!-- Your Hand -->
            <div style="text-align: center; margin-bottom: 20px;">
                <h4 style="color: #00ff88; margin-bottom: 15px;">Your Hand</h4>
                <div id="holdemYourHand" style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                    <div class="poker-card-back">🂠</div>
                    <div class="poker-card-back">🂠</div>
                </div>
                <div id="holdemYourHandName" style="margin-top: 10px; font-size: 1.2em; color: #ffd700; font-weight: bold; min-height: 30px;"></div>
            </div>
            
            <!-- Pot & Players Info -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="color: #ffd700; font-weight: bold;">POT</div>
                    <div id="holdemPot" style="font-size: 1.3em; color: #00ff88;">Rp 0</div>
                </div>
                <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="color: #aaa;">AI 1</div>
                    <div id="holdemAI1" style="font-size: 1em; color: #fff;">Active</div>
                </div>
                <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="color: #aaa;">AI 2</div>
                    <div id="holdemAI2" style="font-size: 1em; color: #fff;">Active</div>
                </div>
                <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="color: #aaa;">AI 3</div>
                    <div id="holdemAI3" style="font-size: 1em; color: #fff;">Active</div>
                </div>
            </div>
        </div>
        
        <style>
            .poker-card-back {
                width: 70px;
                height: 100px;
                background: linear-gradient(145deg, #4a4a4a, #2a2a2a);
                border: 2px solid #ffd700;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2em;
            }
        </style>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Buy-in (Taruhan):</label>
                <input type="number" id="holdemBet" class="bet-input" value="50000" min="10000" step="10000">
            </div>
            <div class="bet-presets" style="margin-top: 15px;">
                <button class="preset-btn" onclick="document.getElementById('holdemBet').value = 25000">Rp 25K</button>
                <button class="preset-btn" onclick="document.getElementById('holdemBet').value = 50000">Rp 50K</button>
                <button class="preset-btn" onclick="document.getElementById('holdemBet').value = 100000">Rp 100K</button>
                <button class="preset-btn" onclick="document.getElementById('holdemBet').value = 250000">Rp 250K</button>
            </div>
        </div>
        
        <div class="result-message" id="holdemResult"></div>
        
        <div style="text-align: center; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button class="game-btn" id="holdemDealBtn" onclick="dealHoldem()">🃏 DEAL</button>
            <button class="game-btn" id="holdemFoldBtn" onclick="foldHoldem()" style="display: none; background: linear-gradient(45deg, #ff4444, #cc0000);">❌ FOLD</button>
            <button class="game-btn" id="holdemCallBtn" onclick="callHoldem()" style="display: none;">✅ CALL</button>
        </div>
    `;
}

let holdemDeck = [];
let holdemCommunityCards = [];
let holdemYourCards = [];
let holdemAIHands = [[], [], []];
let holdemPot = 0;
let holdemGameActive = false;
let holdemBet = 0;
let holdemAIActive = [true, true, true];

function dealHoldem() {
    const bet = parseInt(document.getElementById('holdemBet').value);
    
    if (bet < 10000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    balance -= bet;
    updateBalance();
    
    holdemBet = bet;
    holdemGameActive = true;
    holdemPot = bet * 4; // You + 3 AI
    holdemAIActive = [true, true, true];
    
    // Create deck and deal
    holdemDeck = createPokerDeck();
    holdemYourCards = [drawPokerCard(), drawPokerCard()];
    holdemAIHands = [
        [drawPokerCard(), drawPokerCard()],
        [drawPokerCard(), drawPokerCard()],
        [drawPokerCard(), drawPokerCard()]
    ];
    holdemCommunityCards = [];
    
    // Deal flop (3 cards)
    setTimeout(() => {
        holdemCommunityCards.push(drawPokerCard(), drawPokerCard(), drawPokerCard());
        displayHoldemGame();
        document.getElementById('holdemResult').textContent = 'Flop dealt! Call or Fold?';
    }, 500);
    
    displayHoldemGame();
    updateHoldemPot();
    
    document.getElementById('holdemDealBtn').style.display = 'none';
    document.getElementById('holdemFoldBtn').style.display = 'inline-block';
    document.getElementById('holdemCallBtn').style.display = 'inline-block';
}

function displayHoldemGame() {
    const cardEmojis = { 'A': '🂡', '2': '🂢', '3': '🂣', '4': '🂤', '5': '🂥', '6': '🂦', '7': '🂧', '8': '🂨', '9': '🂩', '10': '🂪', 'J': '🂫', 'Q': '🂭', 'K': '🂮' };
    
    // Display your hand
    const yourHandDiv = document.getElementById('holdemYourHand');
    yourHandDiv.innerHTML = holdemYourCards.map(card => {
        const isRed = card.suit === '♥' || card.suit === '♦';
        return `
            <div style="width: 70px; height: 100px; background: #fff; border: 2px solid #333; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: ${isRed ? '#ff0000' : '#000'}; font-size: 1.3em; font-weight: bold;">
                <div>${card.rank}</div>
                <div style="font-size: 1.5em;">${card.suit}</div>
            </div>
        `;
    }).join('');
    
    // Display community cards
    const communityDiv = document.getElementById('holdemCommunity');
    communityDiv.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < holdemCommunityCards.length) {
            const card = holdemCommunityCards[i];
            const isRed = card.suit === '♥' || card.suit === '♦';
            communityDiv.innerHTML += `
                <div style="width: 70px; height: 100px; background: #fff; border: 2px solid #ffd700; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: ${isRed ? '#ff0000' : '#000'}; font-size: 1.3em; font-weight: bold;">
                    <div>${card.rank}</div>
                    <div style="font-size: 1.5em;">${card.suit}</div>
                </div>
            `;
        } else {
            communityDiv.innerHTML += '<div class="poker-card-back">🂠</div>';
        }
    }
    
    // Evaluate your hand
    if (holdemCommunityCards.length >= 3) {
        const yourFullHand = [...holdemYourCards, ...holdemCommunityCards];
        const result = evaluatePokerHand(yourFullHand);
        document.getElementById('holdemYourHandName').textContent = result.name;
    }
}

function updateHoldemPot() {
    document.getElementById('holdemPot').textContent = formatRupiah(holdemPot);
    
    // Update AI status
    holdemAIActive.forEach((active, i) => {
        const elem = document.getElementById(`holdemAI${i + 1}`);
        elem.textContent = active ? 'Active' : 'Folded';
        elem.style.color = active ? '#00ff88' : '#ff4444';
    });
}

function callHoldem() {
    if (!holdemGameActive) return;
    
    // AI decisions
    holdemAIActive.forEach((active, i) => {
        if (active && Math.random() < 0.3) {
            holdemAIActive[i] = false;
            showNotification(`🤖 AI ${i + 1} fold!`, 'info');
        }
    });
    
    updateHoldemPot();
    
    // Deal turn or river
    if (holdemCommunityCards.length === 3) {
        holdemCommunityCards.push(drawPokerCard());
        displayHoldemGame();
        document.getElementById('holdemResult').textContent = 'Turn dealt! Call or Fold?';
    } else if (holdemCommunityCards.length === 4) {
        holdemCommunityCards.push(drawPokerCard());
        displayHoldemGame();
        document.getElementById('holdemResult').textContent = 'River dealt! Showdown!';
        
        setTimeout(() => {
            showdownHoldem();
        }, 1500);
    }
}

function foldHoldem() {
    holdemGameActive = false;
    
    document.getElementById('holdemResult').textContent = '❌ You folded!';
    document.getElementById('holdemResult').className = 'result-message loss';
    
    document.getElementById('holdemFoldBtn').style.display = 'none';
    document.getElementById('holdemCallBtn').style.display = 'none';
    document.getElementById('holdemDealBtn').style.display = 'inline-block';
    
    addToHistory('Texas Hold\'em', holdemBet, 'loss', 0);
}

function showdownHoldem() {
    holdemGameActive = false;
    
    // Evaluate all hands
    const yourFullHand = [...holdemYourCards, ...holdemCommunityCards];
    const yourResult = evaluatePokerHand(yourFullHand);
    
    let bestAIResult = { multiplier: 0 };
    let winnerAI = -1;
    
    holdemAIActive.forEach((active, i) => {
        if (active) {
            const aiFullHand = [...holdemAIHands[i], ...holdemCommunityCards];
            const aiResult = evaluatePokerHand(aiFullHand);
            
            if (aiResult.multiplier > bestAIResult.multiplier) {
                bestAIResult = aiResult;
                winnerAI = i;
            }
        }
    });
    
    const resultDiv = document.getElementById('holdemResult');
    
    if (yourResult.multiplier > bestAIResult.multiplier) {
        // You win!
        let winAmount = holdemPot;
        winAmount = applyRoleBonus(winAmount);
        balance += winAmount;
        updateBalance();
        
        resultDiv.textContent = `🎉 YOU WIN! ${yourResult.name} - +${formatRupiah(winAmount)}`;
        resultDiv.className = 'result-message win';
        addToHistory('Texas Hold\'em', holdemBet, 'win', winAmount);
    } else if (yourResult.multiplier === bestAIResult.multiplier) {
        // Tie
        balance += holdemBet;
        updateBalance();
        resultDiv.textContent = `🤝 TIE! ${yourResult.name} - Taruhan dikembalikan`;
        resultDiv.className = 'result-message';
    } else {
        // AI wins
        resultDiv.textContent = `😢 AI ${winnerAI + 1} WINS! ${bestAIResult.name}`;
        resultDiv.className = 'result-message loss';
        addToHistory('Texas Hold\'em', holdemBet, 'loss', 0);
    }
    
    document.getElementById('holdemFoldBtn').style.display = 'none';
    document.getElementById('holdemCallBtn').style.display = 'none';
    document.getElementById('holdemDealBtn').style.display = 'inline-block';
}


// ===== TOGEL 4D/3D/2D GAME =====
function loadTogelGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎰 Togel 4D/3D/2D</h2>
            <p>Tebak angka dan menangkan hadiah besar!</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 20px; padding: 30px 20px; margin: 20px 0;">
            <!-- Result Display -->
            <div style="text-align: center; margin-bottom: 30px;">
                <h3 style="color: #ffd700; margin-bottom: 15px;">🎯 Hasil Undian</h3>
                <div id="togelResult" style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                    <div class="togel-ball">?</div>
                    <div class="togel-ball">?</div>
                    <div class="togel-ball">?</div>
                    <div class="togel-ball">?</div>
                </div>
            </div>
            
            <!-- Bet Type Selection -->
            <div style="margin-bottom: 20px;">
                <h4 style="text-align: center; color: #ffd700; margin-bottom: 15px;">Pilih Jenis Taruhan:</h4>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button class="preset-btn togel-type-btn" onclick="selectTogelType('4d', 3000)" data-type="4d">
                        4D<br><small>3000x</small>
                    </button>
                    <button class="preset-btn togel-type-btn" onclick="selectTogelType('3d', 400)" data-type="3d">
                        3D<br><small>400x</small>
                    </button>
                    <button class="preset-btn togel-type-btn" onclick="selectTogelType('2d', 70)" data-type="2d">
                        2D<br><small>70x</small>
                    </button>
                </div>
            </div>
            
            <!-- Number Input -->
            <div style="text-align: center; margin: 20px 0;">
                <label style="display: block; margin-bottom: 10px; color: #fff; font-size: 1.1em;">Masukkan Angka:</label>
                <input type="number" id="togelNumber" class="bet-input" placeholder="Contoh: 1234" min="0" max="9999" style="width: 200px; text-align: center; font-size: 1.5em;">
                <div style="margin-top: 10px; color: #aaa; font-size: 0.9em;">
                    <span id="togelHint">Pilih jenis taruhan terlebih dahulu</span>
                </div>
            </div>
            
            <style>
                .togel-ball {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(145deg, #ffd700, #ffed4e);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2em;
                    font-weight: bold;
                    color: #000;
                    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.5);
                }
                
                .togel-type-btn.selected {
                    background: rgba(255, 215, 0, 0.3);
                    border-color: #ffd700;
                    transform: scale(1.1);
                }
            </style>
            
            <!-- Paytable -->
            <div style="background: rgba(255, 215, 0, 0.1); border-radius: 10px; padding: 15px; margin-top: 20px;">
                <div style="text-align: center; color: #ffd700; font-weight: bold; margin-bottom: 10px;">
                    💰 PAYTABLE 💰
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9em;">
                    <div style="color: #fff;">4D (Exact)</div><div style="color: #ff4444; text-align: right;">= 3000x</div>
                    <div style="color: #fff;">3D (Last 3)</div><div style="color: #ffd700; text-align: right;">= 400x</div>
                    <div style="color: #fff;">2D (Last 2)</div><div style="color: #00ff88; text-align: right;">= 70x</div>
                </div>
            </div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="togelBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
            <div class="bet-presets" style="margin-top: 15px;">
                <button class="preset-btn" onclick="document.getElementById('togelBet').value = 5000">Rp 5K</button>
                <button class="preset-btn" onclick="document.getElementById('togelBet').value = 10000">Rp 10K</button>
                <button class="preset-btn" onclick="document.getElementById('togelBet').value = 25000">Rp 25K</button>
                <button class="preset-btn" onclick="document.getElementById('togelBet').value = 50000">Rp 50K</button>
            </div>
        </div>
        
        <div class="result-message" id="togelResultMsg"></div>
        
        <div style="text-align: center;">
            <button class="game-btn" onclick="drawTogel()">🎰 UNDIAN!</button>
        </div>
    `;
}

let togelType = '';
let togelMultiplier = 0;

function selectTogelType(type, multiplier) {
    togelType = type;
    togelMultiplier = multiplier;
    
    document.querySelectorAll('.togel-type-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    event.target.closest('.togel-type-btn').classList.add('selected');
    
    const hints = {
        '4d': '4 digit (0000-9999)',
        '3d': '3 digit (000-999)',
        '2d': '2 digit (00-99)'
    };
    
    document.getElementById('togelHint').textContent = hints[type];
    document.getElementById('togelNumber').placeholder = type === '4d' ? '1234' : type === '3d' ? '123' : '12';
}

function drawTogel() {
    if (!togelType) {
        showNotification('❌ Pilih jenis taruhan terlebih dahulu!', 'error');
        return;
    }
    
    const bet = parseInt(document.getElementById('togelBet').value);
    const userNumber = document.getElementById('togelNumber').value;
    
    if (!userNumber) {
        showNotification('❌ Masukkan angka tebakan!', 'error');
        return;
    }
    
    // Validate number length
    const expectedLength = togelType === '4d' ? 4 : togelType === '3d' ? 3 : 2;
    if (userNumber.length !== expectedLength) {
        showNotification(`❌ Masukkan ${expectedLength} digit angka!`, 'error');
        return;
    }
    
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    balance -= bet;
    updateBalance();
    
    // Generate random 4D number
    const drawnNumber = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    
    // Animate balls
    const balls = document.querySelectorAll('.togel-ball');
    let animCount = 0;
    
    const animInterval = setInterval(() => {
        balls.forEach(ball => {
            ball.textContent = Math.floor(Math.random() * 10);
        });
        
        animCount++;
        
        if (animCount >= 20) {
            clearInterval(animInterval);
            
            // Show final result
            balls.forEach((ball, i) => {
                ball.textContent = drawnNumber[i];
            });
            
            // Check win
            checkTogelWin(userNumber, drawnNumber, bet);
        }
    }, 100);
}

function checkTogelWin(userNumber, drawnNumber, bet) {
    let won = false;
    let matchType = '';
    
    if (togelType === '4d') {
        won = userNumber === drawnNumber;
        matchType = '4D EXACT';
    } else if (togelType === '3d') {
        won = userNumber === drawnNumber.slice(-3);
        matchType = '3D (Last 3)';
    } else if (togelType === '2d') {
        won = userNumber === drawnNumber.slice(-2);
        matchType = '2D (Last 2)';
    }
    
    const resultDiv = document.getElementById('togelResultMsg');
    
    if (won) {
        let winAmount = bet * togelMultiplier;
        winAmount = applyRoleBonus(winAmount);
        balance += winAmount;
        updateBalance();
        
        resultDiv.textContent = `🎉 JACKPOT ${matchType}! Menang: ${formatRupiah(winAmount)}`;
        resultDiv.className = 'result-message win';
        addToHistory('Togel ' + togelType.toUpperCase(), bet, 'win', winAmount);
        
        // Celebration
        showNotification(`🎊 JACKPOT ${matchType}! ${formatRupiah(winAmount)}`, 'success');
    } else {
        resultDiv.textContent = `😢 Tidak menang. Angka: ${drawnNumber} | Tebakan: ${userNumber}`;
        resultDiv.className = 'result-message loss';
        addToHistory('Togel ' + togelType.toUpperCase(), bet, 'loss', 0);
    }
}


// ===== MPL ID BETTING (BO3 & BO5) =====
function loadSportsBettingGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎮 MPL ID Betting</h2>
            <p>Mobile Legends Pro League Indonesia</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #1a0a2e, #2d1b4e, #1a0a2e); border-radius: 20px; padding: 30px 20px; margin: 20px 0; border: 2px solid #9b59b6;">
            <!-- Match Type Selection -->
            <div style="text-align: center; margin-bottom: 20px;">
                <h4 style="color: #ffd700; margin-bottom: 15px;">Pilih Jenis Match:</h4>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button class="preset-btn match-type-btn" onclick="selectMatchType('bo3')" data-type="bo3" style="margin: 5px;">
                        🎮 REGULAR SEASON (BO3)<br><small>Best of 3</small>
                    </button>
                    <button class="preset-btn match-type-btn" onclick="selectMatchType('bo5')" data-type="bo5" style="margin: 5px;">
                        � PLAYOFF (BO5)<br><small>Best of 5</small>
                    </button>
                </div>
            </div>
            
            <!-- Match Display -->
            <div id="mplMatchDisplay" style="background: rgba(0, 0, 0, 0.3); border-radius: 15px; padding: 20px; margin: 20px 0; border: 2px solid #9b59b6;">
                <div style="text-align: center; color: #aaa;">
                    Pilih jenis match terlebih dahulu
                </div>
            </div>
            
            <!-- Betting Options -->
            <div id="mplBettingOptions" style="display: none;">
                <h4 style="text-align: center; color: #ffd700; margin-bottom: 15px;">Pilih Taruhan:</h4>
                
                <!-- Winner -->
                <div style="margin-bottom: 20px;">
                    <div style="text-align: center; color: #00ff88; margin-bottom: 10px; font-weight: bold;">Pemenang:</div>
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button class="preset-btn bet-option-btn" onclick="selectMPLBet('team1', 2.2)" data-bet="team1">
                            <span id="team1Bet">Team 1</span><br><small>2.2x</small>
                        </button>
                        <button class="preset-btn bet-option-btn" onclick="selectMPLBet('team2', 2.2)" data-bet="team2">
                            <span id="team2Bet">Team 2</span><br><small>2.2x</small>
                        </button>
                    </div>
                </div>
                
                <!-- Exact Score (BO3) -->
                <div id="bo3Scores" style="display: none; margin-bottom: 20px;">
                    <div style="text-align: center; color: #00ff88; margin-bottom: 10px; font-weight: bold;">Tebak Skor Exact (BO3):</div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px;">
                        <button class="preset-btn bet-option-btn" onclick="selectMPLBet('score_2-0', 5)" data-bet="score">2-0<br><small>5x</small></button>
                        <button class="preset-btn bet-option-btn" onclick="selectMPLBet('score_2-1', 3.5)" data-bet="score">2-1<br><small>3.5x</small></button>
                        <button class="preset-btn bet-option-btn" onclick="selectMPLBet('score_0-2', 5)" data-bet="score">0-2<br><small>5x</small></button>
                        <button class="preset-btn bet-option-btn" onclick="selectMPLBet('score_1-2', 3.5)" data-bet="score">1-2<br><small>3.5x</small></button>
                    </div>
                </div>
                
                <!-- Exact Score (BO5) -->
                <div id="bo5Scores" style="display: none; margin-bottom: 20px;">
                    <div style="text-align: center; color: #00ff88; margin-bottom: 10px; font-weight: bold;">Tebak Skor Exact (BO5):</div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px;">
                        <button class="preset-btn bet-option-btn" onclick="selectMPLBet('score_3-0', 8)" data-bet="score">3-0<br><small>8x</small></button>
                        <button class="preset-btn bet-option-btn" onclick="selectMPLBet('score_3-1', 5)" data-bet="score">3-1<br><small>5x</small></button>
                        <button class="preset-btn bet-option-btn" onclick="selectMPLBet('score_3-2', 4)" data-bet="score">3-2<br><small>4x</small></button>
                        <button class="preset-btn bet-option-btn" onclick="selectMPLBet('score_0-3', 8)" data-bet="score">0-3<br><small>8x</small></button>
                        <button class="preset-btn bet-option-btn" onclick="selectMPLBet('score_1-3', 5)" data-bet="score">1-3<br><small>5x</small></button>
                        <button class="preset-btn bet-option-btn" onclick="selectMPLBet('score_2-3', 4)" data-bet="score">2-3<br><small>4x</small></button>
                    </div>
                </div>
            </div>
            
            <style>
                .match-type-btn.selected {
                    background: rgba(155, 89, 182, 0.4);
                    border-color: #9b59b6;
                    transform: scale(1.05);
                }
                
                .bet-option-btn.selected {
                    background: rgba(255, 215, 0, 0.3);
                    border-color: #ffd700;
                    transform: scale(1.05);
                }
            </style>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="mplBet" class="bet-input" value="50000" min="10000" step="10000">
            </div>
            <div class="bet-presets" style="margin-top: 15px;">
                <button class="preset-btn" onclick="document.getElementById('mplBet').value = 25000">Rp 25K</button>
                <button class="preset-btn" onclick="document.getElementById('mplBet').value = 50000">Rp 50K</button>
                <button class="preset-btn" onclick="document.getElementById('mplBet').value = 100000">Rp 100K</button>
                <button class="preset-btn" onclick="document.getElementById('mplBet').value = 250000">Rp 250K</button>
            </div>
        </div>
        
        <div class="result-message" id="mplResult"></div>
        
        <div style="text-align: center;">
            <button class="game-btn" onclick="playMPLMatch()">🎮 MULAI MATCH!</button>
        </div>
    `;
}

let mplMatchType = ''; // bo3 or bo5
let mplBetOption = '';
let mplBetMultiplier = 0;
let currentMPLMatch = null;

const mplTeams = [
    'Alter Ego',
    'Bigetron by Vitality',
    'Dewa United Esports',
    'EVOS',
    'Geek Fam',
    'Natus Vincere',
    'ONIC',
    'RRQ Hoshi',
    'Team Liquid ID'
];

function selectMatchType(type) {
    mplMatchType = type;
    
    document.querySelectorAll('.match-type-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    event.target.closest('.match-type-btn').classList.add('selected');
    
    // Generate random match
    const team1 = mplTeams[Math.floor(Math.random() * mplTeams.length)];
    let team2 = mplTeams[Math.floor(Math.random() * mplTeams.length)];
    while (team2 === team1) {
        team2 = mplTeams[Math.floor(Math.random() * mplTeams.length)];
    }
    
    currentMPLMatch = [team1, team2];
    
    const matchDisplay = document.getElementById('mplMatchDisplay');
    matchDisplay.innerHTML = `
        <div style="text-align: center; margin-bottom: 15px;">
            <div style="display: inline-block; padding: 8px 20px; background: rgba(155, 89, 182, 0.3); border-radius: 20px; border: 2px solid #9b59b6;">
                <span style="color: #ffd700; font-weight: bold;">${type === 'bo3' ? '🎮 REGULAR SEASON - BO3' : '🏆 PLAYOFF - BO5'}</span>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 20px;">
            <div style="text-align: center; flex: 1; min-width: 150px;">
                <div style="font-size: 3em; margin-bottom: 10px;">🎮</div>
                <div style="font-size: 1.2em; font-weight: bold; color: #00ff88; padding: 10px; background: rgba(0, 255, 136, 0.1); border-radius: 10px;">${team1}</div>
            </div>
            <div style="font-size: 2em; color: #ffd700; font-weight: bold;">VS</div>
            <div style="text-align: center; flex: 1; min-width: 150px;">
                <div style="font-size: 3em; margin-bottom: 10px;">🎮</div>
                <div style="font-size: 1.2em; font-weight: bold; color: #ff4444; padding: 10px; background: rgba(255, 68, 68, 0.1); border-radius: 10px;">${team2}</div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #aaa; font-size: 0.9em;">
            ${type === 'bo3' ? 'First to win 2 games' : 'First to win 3 games'}
        </div>
    `;
    
    // Update team names in betting options
    document.getElementById('team1Bet').textContent = team1;
    document.getElementById('team2Bet').textContent = team2;
    
    // Show/hide score options based on match type
    if (type === 'bo3') {
        document.getElementById('bo3Scores').style.display = 'block';
        document.getElementById('bo5Scores').style.display = 'none';
    } else {
        document.getElementById('bo3Scores').style.display = 'none';
        document.getElementById('bo5Scores').style.display = 'block';
    }
    
    document.getElementById('mplBettingOptions').style.display = 'block';
}

function selectMPLBet(option, multiplier) {
    mplBetOption = option;
    mplBetMultiplier = multiplier;
    
    document.querySelectorAll('.bet-option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    event.target.closest('.bet-option-btn').classList.add('selected');
}

function playMPLMatch() {
    if (!mplMatchType) {
        showNotification('❌ Pilih jenis match terlebih dahulu!', 'error');
        return;
    }
    
    if (!mplBetOption) {
        showNotification('❌ Pilih jenis taruhan terlebih dahulu!', 'error');
        return;
    }
    
    const bet = parseInt(document.getElementById('mplBet').value);
    
    if (bet < 10000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    balance -= bet;
    updateBalance();
    
    // Simulate match
    document.getElementById('mplResult').textContent = '🎮 Match berlangsung...';
    document.getElementById('mplResult').className = 'result-message';
    
    setTimeout(() => {
        // Generate score based on match type
        let team1Score = 0;
        let team2Score = 0;
        
        if (mplMatchType === 'bo3') {
            // BO3: First to 2 wins
            while (team1Score < 2 && team2Score < 2) {
                if (Math.random() > 0.5) {
                    team1Score++;
                } else {
                    team2Score++;
                }
            }
        } else {
            // BO5: First to 3 wins
            while (team1Score < 3 && team2Score < 3) {
                if (Math.random() > 0.5) {
                    team1Score++;
                } else {
                    team2Score++;
                }
            }
        }
        
        let won = false;
        let resultText = `Skor Akhir: ${currentMPLMatch[0]} ${team1Score} - ${team2Score} ${currentMPLMatch[1]}`;
        
        // Check win conditions
        if (mplBetOption === 'team1') {
            won = team1Score > team2Score;
        } else if (mplBetOption === 'team2') {
            won = team2Score > team1Score;
        } else if (mplBetOption.startsWith('score_')) {
            const predictedScore = mplBetOption.replace('score_', '');
            const actualScore = `${team1Score}-${team2Score}`;
            won = predictedScore === actualScore;
        }
        
        const resultDiv = document.getElementById('mplResult');
        
        if (won) {
            let winAmount = Math.floor(bet * mplBetMultiplier);
            winAmount = applyRoleBonus(winAmount);
            balance += winAmount;
            updateBalance();
            
            resultDiv.textContent = `🎉 MENANG! ${resultText} - +${formatRupiah(winAmount)}`;
            resultDiv.className = 'result-message win';
            addToHistory('MPL ID Betting', bet, 'win', winAmount);
        } else {
            resultDiv.textContent = `😢 KALAH! ${resultText}`;
            resultDiv.className = 'result-message loss';
            addToHistory('MPL ID Betting', bet, 'loss', 0);
        }
    }, 3000);
}


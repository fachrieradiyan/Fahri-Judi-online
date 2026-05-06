// ===== AUTHENTICATION SYSTEM =====

// Demo accounts
const DEMO_ACCOUNTS = {
    member: { username: 'member', email: 'member@erpeel336.com', password: '123456', role: 'member' },
    vip: { username: 'vip', email: 'vip@erpeel336.com', password: '123456', role: 'vip' },
    staff: { username: 'staff', email: 'staff@erpeel336.com', password: '123456', role: 'staff' },
    admin: { username: 'admin', email: 'admin@erpeel336.com', password: '123456', role: 'admin' },
    developer: { username: 'developer', email: 'dev@erpeel336.com', password: '123456', role: 'developer' }
};

// Role configurations
const ROLES = {
    member: {
        name: 'MEMBER',
        icon: '👤',
        startBalance: 100000,
        dailyClaim: 10000,
        winBonus: 0
    },
    vip: {
        name: 'VIP',
        icon: '⭐',
        startBalance: 500000,
        dailyClaim: 50000,
        winBonus: 0.2
    },
    staff: {
        name: 'STAFF',
        icon: '🛡️',
        startBalance: 1000000,
        dailyClaim: 100000,
        winBonus: 0.3
    },
    admin: {
        name: 'ADMIN',
        icon: '👑',
        startBalance: 5000000,
        dailyClaim: 500000,
        winBonus: 0.5
    },
    developer: {
        name: 'DEVELOPER',
        icon: '💻',
        startBalance: 10000000,
        dailyClaim: 1000000,
        winBonus: 1.0
    }
};

// Initialize demo accounts in localStorage
function initializeDemoAccounts() {
    const users = JSON.parse(localStorage.getItem('rupiahplay_users') || '{}');
    
    Object.keys(DEMO_ACCOUNTS).forEach(key => {
        const demo = DEMO_ACCOUNTS[key];
        if (!users[demo.username]) {
            const roleConfig = ROLES[demo.role];
            users[demo.username] = {
                username: demo.username,
                email: demo.email,
                password: demo.password,
                role: demo.role,
                balance: roleConfig.startBalance,
                history: [],
                lastClaim: null,
                createdAt: new Date().toISOString()
            };
        }
    });
    
    localStorage.setItem('rupiahplay_users', JSON.stringify(users));
}

// Initialize on page load
initializeDemoAccounts();

// Tab switching
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        tabs[0].classList.add('active');
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        tabs[1].classList.add('active');
    }
}

// Quick login for demo accounts
function quickLogin(role) {
    const demo = DEMO_ACCOUNTS[role];
    if (demo) {
        document.getElementById('loginUsername').value = demo.username;
        document.getElementById('loginPassword').value = demo.password;
        
        // Add visual feedback
        const btn = event.target.closest('.demo-btn');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
            document.getElementById('loginForm').dispatchEvent(new Event('submit'));
        }, 100);
    }
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('rupiahplay_users') || '{}');
    const user = Object.values(users).find(u => 
        (u.username === username || u.email === username) && u.password === password
    );
    
    if (user) {
        // Save current user
        localStorage.setItem('rupiahplay_currentUser', JSON.stringify(user));
        
        // Show success notification
        showNotification('✅ Login berhasil! Redirecting...', 'success');
        
        // Smooth transition to dashboard
        const loginScreen = document.querySelector('.login-screen');
        loginScreen.style.animation = 'fadeOut 0.5s ease';
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
    } else {
        showNotification('❌ Username/email atau password salah!', 'error');
    }
});

// Register form handler
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    
    if (password.length < 6) {
        showNotification('❌ Password minimal 6 karakter!', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('rupiahplay_users') || '{}');
    
    // Check if username or email already exists
    if (users[username]) {
        showNotification('❌ Username sudah digunakan!', 'error');
        return;
    }
    
    if (Object.values(users).some(u => u.email === email)) {
        showNotification('❌ Email sudah terdaftar!', 'error');
        return;
    }
    
    // Create new user
    const roleConfig = ROLES.member;
    const newUser = {
        username,
        email,
        password,
        role: 'member',
        balance: roleConfig.startBalance,
        history: [],
        lastClaim: null,
        createdAt: new Date().toISOString()
    };
    
    users[username] = newUser;
    localStorage.setItem('rupiahplay_users', JSON.stringify(users));
    
    // Auto login
    localStorage.setItem('rupiahplay_currentUser', JSON.stringify(newUser));
    
    showNotification('✅ Registrasi berhasil! Redirecting...', 'success');
    
    // Smooth transition to dashboard
    const loginScreen = document.querySelector('.login-screen');
    loginScreen.style.animation = 'fadeOut 0.5s ease';
    
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 500);
});

// Notification system
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #00ff88, #00cc6a)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #ff4444, #cc0000)';
    }
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.95);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

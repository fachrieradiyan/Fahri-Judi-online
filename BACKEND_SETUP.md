# 🚀 ERPEEL336 - BACKEND SETUP GUIDE

## 📋 OVERVIEW

Website ERPEEL336 sekarang menggunakan **Full Stack Architecture**:
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: PHP 7.4+ dengan PDO
- **Database**: MySQL 5.7+ / MariaDB 10.3+
- **API**: RESTful API dengan JSON responses
- **Communication**: AJAX dengan Fetch API

## 🏗️ ARCHITECTURE

```
ERPEEL336/
├── Frontend (Client-Side)
│   ├── index.html              # Main HTML
│   ├── styles-new.css          # Professional CSS
│   ├── main.js                 # Game logic (18 games)
│   ├── games-extra.js          # Extra games (6 games)
│   └── api-client.js           # API communication layer
│
├── Backend (Server-Side)
│   ├── api/
│   │   ├── config.php          # Database config & helpers
│   │   ├── auth.php            # Authentication API
│   │   ├── game.php            # Game operations API
│   │   └── leaderboard.php     # Leaderboard API
│   │
│   └── database/
│       └── schema.sql          # Database schema
│
└── Documentation
    ├── README.md
    ├── REDESIGN_COMPLETE.md
    └── BACKEND_SETUP.md        # This file
```

## 🔧 INSTALLATION STEPS

### 1. **Install XAMPP / WAMP / LAMP**

#### Windows (XAMPP):
1. Download XAMPP: https://www.apachefriends.org/
2. Install XAMPP (pilih Apache + MySQL + PHP)
3. Start Apache dan MySQL dari XAMPP Control Panel

#### Alternative (WAMP):
1. Download WAMP: https://www.wampserver.com/
2. Install dan start services

### 2. **Setup Database**

#### A. Buka phpMyAdmin:
```
http://localhost/phpmyadmin
```

#### B. Import Database Schema:
1. Klik tab "SQL"
2. Copy paste isi file `database/schema.sql`
3. Klik "Go" / "Jalankan"

#### C. Atau via Command Line:
```bash
# Login ke MySQL
mysql -u root -p

# Jalankan schema
source /path/to/database/schema.sql
```

### 3. **Configure Database Connection**

Edit file `api/config.php`:

```php
// Database Configuration
define('DB_HOST', 'localhost');      // Biasanya localhost
define('DB_NAME', 'erpeel336_casino'); // Nama database
define('DB_USER', 'root');            // Username MySQL
define('DB_PASS', '');                // Password MySQL (kosong di XAMPP)
```

### 4. **Copy Files ke Web Server**

#### XAMPP:
```
Copy semua file ke: C:\xampp\htdocs\erpeel336\
```

#### WAMP:
```
Copy semua file ke: C:\wamp64\www\erpeel336\
```

#### Linux:
```bash
sudo cp -r * /var/www/html/erpeel336/
sudo chown -R www-data:www-data /var/www/html/erpeel336/
sudo chmod -R 755 /var/www/html/erpeel336/
```

### 5. **Test Installation**

Buka browser dan akses:
```
http://localhost/erpeel336/
```

## 📡 API ENDPOINTS

### Authentication APIs

#### 1. Login
```
POST /api/auth.php?action=login
Body: {
    "username": "member",
    "password": "123456"
}
Response: {
    "success": true,
    "message": "Login berhasil",
    "user": {...},
    "roleConfig": {...}
}
```

#### 2. Register
```
POST /api/auth.php?action=register
Body: {
    "username": "newuser",
    "email": "user@example.com",
    "password": "password123"
}
```

#### 3. Logout
```
POST /api/auth.php?action=logout
```

#### 4. Check Auth
```
GET /api/auth.php?action=check
```

### Game APIs

#### 1. Record Game
```
POST /api/game.php?action=play
Body: {
    "gameName": "Slot Machine",
    "betAmount": 10000,
    "result": "win",
    "winAmount": 50000
}
```

#### 2. Get Balance
```
GET /api/game.php?action=balance
```

#### 3. Get History
```
GET /api/game.php?action=history&limit=50
```

#### 4. Daily Claim
```
POST /api/game.php?action=claim
```

#### 5. Reset Balance
```
POST /api/game.php?action=reset
```

#### 6. Deposit
```
POST /api/game.php?action=deposit
Body: {
    "amount": 100000,
    "paymentMethod": "gopay"
}
```

### Leaderboard APIs

#### 1. Get Leaderboard
```
GET /api/leaderboard.php?action=get&limit=10
```

#### 2. Get Global Stats
```
GET /api/leaderboard.php?action=stats
```

## 🗄️ DATABASE SCHEMA

### Tables:

#### 1. **users**
- Menyimpan data user (username, email, password, role, balance)
- Password di-hash dengan bcrypt
- Tracking last_login dan last_claim

#### 2. **game_history**
- Menyimpan riwayat semua game yang dimainkan
- Tracking bet_amount, result, win_amount
- Balance before & after untuk audit

#### 3. **deposits**
- Menyimpan riwayat deposit
- Status: pending, completed, failed

#### 4. **daily_claims**
- Menyimpan riwayat daily claim
- Tracking claim_amount dan timestamp

#### 5. **user_sessions**
- Menyimpan session tokens
- Security: IP address, user agent tracking

### Views:

#### 1. **leaderboard_view**
- Optimized view untuk leaderboard
- Pre-calculated statistics

#### 2. **user_statistics**
- User stats: total games, wins, losses

## 🔐 SECURITY FEATURES

### 1. **Password Security**
- Bcrypt hashing dengan cost 10
- Salt otomatis per password
- Demo password: `123456` (hashed)

### 2. **SQL Injection Prevention**
- Prepared statements dengan PDO
- Parameter binding
- Input sanitization

### 3. **XSS Prevention**
- htmlspecialchars() pada semua output
- strip_tags() pada input
- Content-Type headers

### 4. **Session Security**
- Session timeout (24 hours)
- Session regeneration
- Secure session name

### 5. **CSRF Protection**
- Same-origin policy
- Credentials: 'same-origin'

## 🎮 DEMO ACCOUNTS

All demo accounts password: **123456**

| Username  | Role      | Balance      | Daily Claim  | Win Bonus |
|-----------|-----------|--------------|--------------|-----------|
| member    | MEMBER    | Rp 100.000   | Rp 50.000    | +0%       |
| vip       | VIP       | Rp 500.000   | Rp 150.000   | +20%      |
| staff     | STAFF     | Rp 1.000.000 | Rp 200.000   | +30%      |
| admin     | ADMIN     | Rp 5.000.000 | Rp 500.000   | +50%      |
| developer | DEVELOPER | Rp 10.000.000| Rp 1.000.000 | +100%     |

## 🚀 DEPLOYMENT

### Local Development:
```
http://localhost/erpeel336/
```

### Production (Shared Hosting):
1. Upload semua file via FTP
2. Import database via phpMyAdmin
3. Update `api/config.php` dengan credentials hosting
4. Set permissions: `chmod 755` untuk folders, `644` untuk files
5. Akses via domain: `https://yourdomain.com`

### Production (VPS):
```bash
# Install LAMP Stack
sudo apt update
sudo apt install apache2 mysql-server php php-mysql

# Configure Apache
sudo nano /etc/apache2/sites-available/erpeel336.conf

# Enable site
sudo a2ensite erpeel336
sudo systemctl reload apache2

# Setup SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d yourdomain.com
```

## 📊 PERFORMANCE OPTIMIZATION

### 1. **Database Indexes**
- Composite indexes pada frequently queried columns
- Index pada foreign keys
- Covering indexes untuk views

### 2. **Query Optimization**
- Prepared statements (cached)
- Views untuk complex queries
- LIMIT clauses

### 3. **Caching**
- PHP OPcache enabled
- Query result caching
- Session caching

### 4. **Connection Pooling**
- Singleton pattern untuk database connection
- Persistent connections

## 🔧 TROUBLESHOOTING

### Error: "Database connection failed"
**Solution:**
1. Check MySQL service is running
2. Verify credentials in `api/config.php`
3. Check database exists: `SHOW DATABASES;`

### Error: "Access denied for user"
**Solution:**
```sql
GRANT ALL PRIVILEGES ON erpeel336_casino.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Call to undefined function password_hash"
**Solution:**
- Upgrade PHP to 7.4+
- Check `php -v`

### Error: "Headers already sent"
**Solution:**
- Remove any whitespace before `<?php`
- Check for BOM in files
- Use `ob_start()` if needed

### Error: "CORS policy"
**Solution:**
- Check CORS headers in `config.php`
- Ensure same-origin requests

## 📈 MONITORING

### Check Database Size:
```sql
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES
WHERE table_schema = "erpeel336_casino"
ORDER BY (data_length + index_length) DESC;
```

### Check Active Sessions:
```sql
SELECT COUNT(*) FROM user_sessions WHERE is_active = TRUE;
```

### Check Game Statistics:
```sql
SELECT 
    game_name,
    COUNT(*) as plays,
    SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
    SUM(bet_amount) as total_bets
FROM game_history
GROUP BY game_name
ORDER BY plays DESC;
```

## 🎯 NEXT STEPS

### Recommended Enhancements:
1. ✅ Add Redis for caching
2. ✅ Implement rate limiting
3. ✅ Add email verification
4. ✅ Add 2FA authentication
5. ✅ Add admin dashboard
6. ✅ Add real-time notifications (WebSocket)
7. ✅ Add payment gateway integration
8. ✅ Add mobile app (React Native / Flutter)

## 📝 NOTES

- **Development Mode**: Error reporting enabled
- **Production Mode**: Disable error reporting in `config.php`
- **Backup**: Regular database backups recommended
- **Security**: Change SECRET_KEY in production
- **SSL**: Use HTTPS in production

## 🆘 SUPPORT

Jika ada masalah:
1. Check error logs: `xampp/apache/logs/error.log`
2. Check PHP errors: `error_log`
3. Check MySQL logs: `xampp/mysql/data/*.err`
4. Enable debug mode in `config.php`

---

## ✅ CHECKLIST

- [ ] XAMPP/WAMP installed
- [ ] MySQL running
- [ ] Database created & imported
- [ ] Files copied to htdocs
- [ ] config.php configured
- [ ] Test login works
- [ ] Test game recording works
- [ ] Test leaderboard loads
- [ ] All 24 games functional

**Backend setup complete! Website now has professional database-backed functionality! 🎉**

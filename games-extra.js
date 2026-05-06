// ===== EXTRA GAMES WITH AUTO PLAY =====

// Global auto play variables
let autoPlayActive = false;
let autoPlayRounds = 0;
let autoPlayCompleted = 0;
let autoPlayStopOnWin = false;
let autoPlayStopOnLoss = false;

// ===== BACCARAT GAME =====
function loadBaccaratGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎴 Baccarat</h2>
            <p>Player vs Banker - Classic casino game!</p>
        </div>
        
        <div style="background: rgba(139, 0, 0, 0.3); border-radius: 20px; padding: 30px 20px; margin: 20px 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 20px; background: rgba(0, 100, 255, 0.2); border-radius: 15px;">
                    <h4 style="color: #00ff88;">PLAYER</h4>
                    <div id="baccaratPlayerCards" style="font-size: 2em; margin: 15px 0; min-height: 60px;">🂠 🂠</div>
                    <div id="baccaratPlayerScore" style="font-size: 1.5em; color: #ffd700;">0</div>
                </div>
                <div style="text-align: center; padding: 20px; background: rgba(255, 0, 0, 0.2); border-radius: 15px;">
                    <h4 style="color: #ff4444;">BANKER</h4>
                    <div id="baccaratBankerCards" style="font-size: 2em; margin: 15px 0; min-height: 60px;">🂠 🂠</div>
                    <div id="baccaratBankerScore" style="font-size: 1.5em; color: #ffd700;">0</div>
                </div>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
                <h4 style="color: #ffd700; margin-bottom: 15px;">Pilih Taruhan:</h4>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button class="preset-btn baccarat-bet-btn" onclick="selectBaccaratBet('player', 2)" data-bet="player">
                        PLAYER<br><small>2x</small>
                    </button>
                    <button class="preset-btn baccarat-bet-btn" onclick="selectBaccaratBet('banker', 1.95)" data-bet="banker">
                        BANKER<br><small>1.95x</small>
                    </button>
                    <button class="preset-btn baccarat-bet-btn" onclick="selectBaccaratBet('tie', 8)" data-bet="tie">
                        TIE<br><small>8x</small>
                    </button>
                </div>
            </div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="baccaratBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
            
            <!-- Auto Play -->
            <div style="margin-top: 20px; padding: 20px; background: rgba(0, 255, 136, 0.1); border-radius: 15px;">
                <label style="display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; margin-bottom: 15px;">
                    <input type="checkbox" id="baccaratAutoPlay" style="width: 20px; height: 20px;">
                    <span style="font-weight: bold; color: #00ff88;">🤖 AUTO PLAY</span>
                </label>
                <div id="baccaratAutoSettings" style="display: none;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 10px;">
                        <button class="preset-btn" onclick="setBaccaratAuto(10)">10x</button>
                        <button class="preset-btn" onclick="setBaccaratAuto(25)">25x</button>
                        <button class="preset-btn" onclick="setBaccaratAuto(50)">50x</button>
                        <button class="preset-btn" onclick="setBaccaratAuto(100)">100x</button>
                    </div>
                    <div style="text-align: center; color: #aaa; font-size: 0.9em;">
                        Rounds: <span id="baccaratAutoCount">0</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="result-message" id="baccaratResult"></div>
        
        <div style="text-align: center; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button class="game-btn" id="baccaratDealBtn" onclick="dealBaccarat()">🎴 DEAL</button>
            <button class="game-btn" id="baccaratStopBtn" onclick="stopBaccaratAuto()" style="display: none; background: linear-gradient(45deg, #ff4444, #cc0000);">⏹️ STOP</button>
        </div>
    `;
    
    document.getElementById('baccaratAutoPlay').onchange = function() {
        document.getElementById('baccaratAutoSettings').style.display = this.checked ? 'block' : 'none';
    };
}

let baccaratBetType = '';
let baccaratMultiplier = 0;
let baccaratAutoRounds = 0;
let baccaratAutoActive = false;

function selectBaccaratBet(type, multiplier) {
    baccaratBetType = type;
    baccaratMultiplier = multiplier;
    
    document.querySelectorAll('.baccarat-bet-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.background = '';
    });
    
    event.target.closest('.baccarat-bet-btn').classList.add('selected');
    event.target.closest('.baccarat-bet-btn').style.background = 'rgba(255, 215, 0, 0.3)';
}

function setBaccaratAuto(rounds) {
    baccaratAutoRounds = rounds;
    document.getElementById('baccaratAutoCount').textContent = `0/${rounds}`;
}

function dealBaccarat() {
    if (!baccaratBetType) {
        showNotification('❌ Pilih jenis taruhan!', 'error');
        return;
    }
    
    const bet = parseInt(document.getElementById('baccaratBet').value);
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    const autoPlay = document.getElementById('baccaratAutoPlay').checked;
    
    if (autoPlay && baccaratAutoRounds > 0 && !baccaratAutoActive) {
        baccaratAutoActive = true;
        autoPlayCompleted = 0;
        document.getElementById('baccaratStopBtn').style.display = 'inline-block';
        document.getElementById('baccaratDealBtn').style.display = 'none';
    }
    
    balance -= bet;
    updateBalance();
    
    // Deal cards
    const playerCard1 = Math.floor(Math.random() * 10);
    const playerCard2 = Math.floor(Math.random() * 10);
    const bankerCard1 = Math.floor(Math.random() * 10);
    const bankerCard2 = Math.floor(Math.random() * 10);
    
    let playerScore = (playerCard1 + playerCard2) % 10;
    let bankerScore = (bankerCard1 + bankerCard2) % 10;
    
    // Third card rules (simplified)
    if (playerScore <= 5) {
        const playerCard3 = Math.floor(Math.random() * 10);
        playerScore = (playerScore + playerCard3) % 10;
    }
    
    if (bankerScore <= 5) {
        const bankerCard3 = Math.floor(Math.random() * 10);
        bankerScore = (bankerScore + bankerCard3) % 10;
    }
    
    document.getElementById('baccaratPlayerScore').textContent = playerScore;
    document.getElementById('baccaratBankerScore').textContent = bankerScore;
    
    // Determine winner
    let won = false;
    let result = '';
    
    if (playerScore > bankerScore) {
        result = 'PLAYER WINS';
        won = baccaratBetType === 'player';
    } else if (bankerScore > playerScore) {
        result = 'BANKER WINS';
        won = baccaratBetType === 'banker';
    } else {
        result = 'TIE';
        won = baccaratBetType === 'tie';
    }
    
    const resultDiv = document.getElementById('baccaratResult');
    
    if (won) {
        let winAmount = Math.floor(bet * baccaratMultiplier);
        winAmount = applyRoleBonus(winAmount);
        balance += winAmount;
        updateBalance();
        resultDiv.textContent = `🎉 ${result}! +${formatRupiah(winAmount)}`;
        resultDiv.className = 'result-message win';
        addToHistory('Baccarat', bet, 'win', winAmount);
    } else {
        resultDiv.textContent = `😢 ${result}`;
        resultDiv.className = 'result-message loss';
        addToHistory('Baccarat', bet, 'loss', 0);
    }
    
    // Auto play logic
    if (baccaratAutoActive) {
        autoPlayCompleted++;
        document.getElementById('baccaratAutoCount').textContent = `${autoPlayCompleted}/${baccaratAutoRounds}`;
        
        if (autoPlayCompleted < baccaratAutoRounds) {
            setTimeout(() => {
                if (baccaratAutoActive) dealBaccarat();
            }, 1500);
        } else {
            stopBaccaratAuto();
        }
    }
}

function stopBaccaratAuto() {
    baccaratAutoActive = false;
    autoPlayCompleted = 0;
    document.getElementById('baccaratStopBtn').style.display = 'none';
    document.getElementById('baccaratDealBtn').style.display = 'inline-block';
    showNotification('⏹️ Auto play stopped', 'info');
}

// ===== CRAPS GAME =====
function loadCrapsGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎲 Craps</h2>
            <p>Classic dice betting game!</p>
        </div>
        
        <div style="background: rgba(0, 100, 0, 0.3); border-radius: 20px; padding: 30px 20px; margin: 20px 0;">
            <div style="display: flex; justify-content: center; gap: 20px; margin: 30px 0;">
                <div id="craps1" style="width: 80px; height: 80px; background: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 3em; color: #000;">1</div>
                <div id="craps2" style="width: 80px; height: 80px; background: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 3em; color: #000;">1</div>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
                <div style="font-size: 1.5em; color: #ffd700; font-weight: bold;">
                    Total: <span id="crapsTotal">2</span>
                </div>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
                <h4 style="color: #ffd700; margin-bottom: 15px;">Pilih Taruhan:</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px;">
                    <button class="preset-btn craps-bet-btn" onclick="selectCrapsBet('pass', 2)">PASS LINE<br><small>2x</small></button>
                    <button class="preset-btn craps-bet-btn" onclick="selectCrapsBet('dontpass', 2)">DON'T PASS<br><small>2x</small></button>
                    <button class="preset-btn craps-bet-btn" onclick="selectCrapsBet('seven', 5)">SEVEN<br><small>5x</small></button>
                    <button class="preset-btn craps-bet-btn" onclick="selectCrapsBet('eleven', 16)">ELEVEN<br><small>16x</small></button>
                    <button class="preset-btn craps-bet-btn" onclick="selectCrapsBet('craps', 8)">CRAPS (2,3,12)<br><small>8x</small></button>
                </div>
            </div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="crapsBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
            
            <!-- Auto Play -->
            <div style="margin-top: 20px; padding: 20px; background: rgba(0, 255, 136, 0.1); border-radius: 15px;">
                <label style="display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; margin-bottom: 15px;">
                    <input type="checkbox" id="crapsAutoPlay" style="width: 20px; height: 20px;">
                    <span style="font-weight: bold; color: #00ff88;">🤖 AUTO PLAY</span>
                </label>
                <div id="crapsAutoSettings" style="display: none;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 10px;">
                        <button class="preset-btn" onclick="setCrapsAuto(10)">10x</button>
                        <button class="preset-btn" onclick="setCrapsAuto(25)">25x</button>
                        <button class="preset-btn" onclick="setCrapsAuto(50)">50x</button>
                        <button class="preset-btn" onclick="setCrapsAuto(100)">100x</button>
                    </div>
                    <div style="text-align: center; color: #aaa; font-size: 0.9em;">
                        Rounds: <span id="crapsAutoCount">0</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="result-message" id="crapsResult"></div>
        
        <div style="text-align: center; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button class="game-btn" id="crapsRollBtn" onclick="rollCraps()">🎲 ROLL!</button>
            <button class="game-btn" id="crapsStopBtn" onclick="stopCrapsAuto()" style="display: none; background: linear-gradient(45deg, #ff4444, #cc0000);">⏹️ STOP</button>
        </div>
    `;
    
    document.getElementById('crapsAutoPlay').onchange = function() {
        document.getElementById('crapsAutoSettings').style.display = this.checked ? 'block' : 'none';
    };
}

let crapsBetType = '';
let crapsMultiplier = 0;
let crapsAutoRounds = 0;
let crapsAutoActive = false;
let crapsAutoCompleted = 0;

function selectCrapsBet(type, multiplier) {
    crapsBetType = type;
    crapsMultiplier = multiplier;
    
    document.querySelectorAll('.craps-bet-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.background = '';
    });
    
    event.target.closest('.craps-bet-btn').classList.add('selected');
    event.target.closest('.craps-bet-btn').style.background = 'rgba(255, 215, 0, 0.3)';
}

function setCrapsAuto(rounds) {
    crapsAutoRounds = rounds;
    document.getElementById('crapsAutoCount').textContent = `0/${rounds}`;
}

function rollCraps() {
    if (!crapsBetType) {
        showNotification('❌ Pilih jenis taruhan!', 'error');
        return;
    }
    
    const bet = parseInt(document.getElementById('crapsBet').value);
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    const autoPlay = document.getElementById('crapsAutoPlay').checked;
    
    if (autoPlay && crapsAutoRounds > 0 && !crapsAutoActive) {
        crapsAutoActive = true;
        crapsAutoCompleted = 0;
        document.getElementById('crapsStopBtn').style.display = 'inline-block';
        document.getElementById('crapsRollBtn').style.display = 'none';
    }
    
    balance -= bet;
    updateBalance();
    
    // Roll dice
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    
    document.getElementById('craps1').textContent = d1;
    document.getElementById('craps2').textContent = d2;
    document.getElementById('crapsTotal').textContent = total;
    
    // Check win
    let won = false;
    
    if (crapsBetType === 'pass') {
        won = [7, 11].includes(total);
    } else if (crapsBetType === 'dontpass') {
        won = [2, 3, 12].includes(total);
    } else if (crapsBetType === 'seven') {
        won = total === 7;
    } else if (crapsBetType === 'eleven') {
        won = total === 11;
    } else if (crapsBetType === 'craps') {
        won = [2, 3, 12].includes(total);
    }
    
    const resultDiv = document.getElementById('crapsResult');
    
    if (won) {
        let winAmount = Math.floor(bet * crapsMultiplier);
        winAmount = applyRoleBonus(winAmount);
        balance += winAmount;
        updateBalance();
        resultDiv.textContent = `🎉 WIN! Total: ${total} - +${formatRupiah(winAmount)}`;
        resultDiv.className = 'result-message win';
        addToHistory('Craps', bet, 'win', winAmount);
    } else {
        resultDiv.textContent = `😢 LOSE! Total: ${total}`;
        resultDiv.className = 'result-message loss';
        addToHistory('Craps', bet, 'loss', 0);
    }
    
    // Auto play logic
    if (crapsAutoActive) {
        crapsAutoCompleted++;
        document.getElementById('crapsAutoCount').textContent = `${crapsAutoCompleted}/${crapsAutoRounds}`;
        
        if (crapsAutoCompleted < crapsAutoRounds) {
            setTimeout(() => {
                if (crapsAutoActive) rollCraps();
            }, 1500);
        } else {
            stopCrapsAuto();
        }
    }
}

function stopCrapsAuto() {
    crapsAutoActive = false;
    crapsAutoCompleted = 0;
    document.getElementById('crapsStopBtn').style.display = 'none';
    document.getElementById('crapsRollBtn').style.display = 'inline-block';
    showNotification('⏹️ Auto play stopped', 'info');
}

// Continue with other games...
// (Darts, Fortune Wheel, Bingo, Keno will be added similarly)

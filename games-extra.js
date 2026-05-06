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

// ===== DARTS GAME =====
function loadDartsGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎯 Darts</h2>
            <p>Hit the bullseye for big wins!</p>
        </div>
        
        <div style="background: linear-gradient(145deg, #2c3e50, #34495e); border-radius: 20px; padding: 30px 20px; margin: 20px 0;">
            <div style="text-align: center; margin: 30px 0;">
                <div id="dartBoard" style="width: 250px; height: 250px; margin: 0 auto; background: radial-gradient(circle, #ffd700 0%, #ffd700 8%, #ff0000 8%, #ff0000 16%, #000 16%, #000 24%, #fff 24%, #fff 32%, #000 32%, #000 40%, #ff0000 40%, #ff0000 48%, #000 48%); border-radius: 50%; border: 5px solid #000; position: relative; display: flex; align-items: center; justify-content: center;">
                    <div style="width: 40px; height: 40px; background: #ffd700; border-radius: 50%; border: 3px solid #000; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #000;">BULL</div>
                </div>
                <div id="dartResult" style="font-size: 2em; color: #ffd700; font-weight: bold; margin-top: 20px; min-height: 60px;">
                    Klik THROW untuk melempar!
                </div>
            </div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="dartsBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
            
            <!-- Auto Play -->
            <div style="margin-top: 20px; padding: 20px; background: rgba(0, 255, 136, 0.1); border-radius: 15px;">
                <label style="display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; margin-bottom: 15px;">
                    <input type="checkbox" id="dartsAutoPlay" style="width: 20px; height: 20px;">
                    <span style="font-weight: bold; color: #00ff88;">🤖 AUTO PLAY</span>
                </label>
                <div id="dartsAutoSettings" style="display: none;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 10px;">
                        <button class="preset-btn" onclick="setDartsAuto(10)">10x</button>
                        <button class="preset-btn" onclick="setDartsAuto(25)">25x</button>
                        <button class="preset-btn" onclick="setDartsAuto(50)">50x</button>
                        <button class="preset-btn" onclick="setDartsAuto(100)">100x</button>
                    </div>
                    <div style="text-align: center; color: #aaa; font-size: 0.9em;">
                        Rounds: <span id="dartsAutoCount">0</span>
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(255, 215, 0, 0.1); border-radius: 10px; padding: 15px; margin-top: 15px;">
                <div style="text-align: center; color: #ffd700; font-weight: bold; margin-bottom: 10px;">
                    💰 PAYTABLE 💰
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9em;">
                    <div style="color: #fff;">Bullseye 🎯</div><div style="color: #ff4444; text-align: right;">= 50x</div>
                    <div style="color: #fff;">Inner Ring</div><div style="color: #ffd700; text-align: right;">= 10x</div>
                    <div style="color: #fff;">Middle Ring</div><div style="color: #00ff88; text-align: right;">= 5x</div>
                    <div style="color: #fff;">Outer Ring</div><div style="color: #00ff88; text-align: right;">= 2x</div>
                    <div style="color: #fff;">Miss</div><div style="color: #aaa; text-align: right;">= 0x</div>
                </div>
            </div>
        </div>
        
        <div class="result-message" id="dartsResultMsg"></div>
        
        <div style="text-align: center; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button class="game-btn" id="dartsThrowBtn" onclick="throwDart()">🎯 THROW!</button>
            <button class="game-btn" id="dartsStopBtn" onclick="stopDartsAuto()" style="display: none; background: linear-gradient(45deg, #ff4444, #cc0000);">⏹️ STOP</button>
        </div>
    `;
    
    document.getElementById('dartsAutoPlay').onchange = function() {
        document.getElementById('dartsAutoSettings').style.display = this.checked ? 'block' : 'none';
    };
}

let dartsAutoRounds = 0;
let dartsAutoActive = false;
let dartsAutoCompleted = 0;

function setDartsAuto(rounds) {
    dartsAutoRounds = rounds;
    document.getElementById('dartsAutoCount').textContent = `0/${rounds}`;
}

function throwDart() {
    const bet = parseInt(document.getElementById('dartsBet').value);
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    const autoPlay = document.getElementById('dartsAutoPlay').checked;
    
    if (autoPlay && dartsAutoRounds > 0 && !dartsAutoActive) {
        dartsAutoActive = true;
        dartsAutoCompleted = 0;
        document.getElementById('dartsStopBtn').style.display = 'inline-block';
        document.getElementById('dartsThrowBtn').style.display = 'none';
    }
    
    balance -= bet;
    updateBalance();
    
    document.getElementById('dartResult').textContent = '🎯 Throwing...';
    document.getElementById('dartsResultMsg').textContent = '';
    
    setTimeout(() => {
        // Random hit zone
        const random = Math.random() * 100;
        let zone, multiplier, zoneName;
        
        if (random < 5) {
            zone = 'bullseye';
            multiplier = 50;
            zoneName = '🎯 BULLSEYE!';
        } else if (random < 20) {
            zone = 'inner';
            multiplier = 10;
            zoneName = '🔴 Inner Ring!';
        } else if (random < 45) {
            zone = 'middle';
            multiplier = 5;
            zoneName = '⚪ Middle Ring!';
        } else if (random < 75) {
            zone = 'outer';
            multiplier = 2;
            zoneName = '⚫ Outer Ring!';
        } else {
            zone = 'miss';
            multiplier = 0;
            zoneName = '❌ Miss!';
        }
        
        document.getElementById('dartResult').textContent = zoneName;
        
        const resultDiv = document.getElementById('dartsResultMsg');
        
        if (multiplier > 0) {
            let winAmount = Math.floor(bet * multiplier);
            winAmount = applyRoleBonus(winAmount);
            balance += winAmount;
            updateBalance();
            resultDiv.textContent = `🎉 WIN! +${formatRupiah(winAmount)}`;
            resultDiv.className = 'result-message win';
            addToHistory('Darts', bet, 'win', winAmount);
        } else {
            resultDiv.textContent = `😢 MISS! -${formatRupiah(bet)}`;
            resultDiv.className = 'result-message loss';
            addToHistory('Darts', bet, 'loss', 0);
        }
        
        // Auto play logic
        if (dartsAutoActive) {
            dartsAutoCompleted++;
            document.getElementById('dartsAutoCount').textContent = `${dartsAutoCompleted}/${dartsAutoRounds}`;
            
            if (dartsAutoCompleted < dartsAutoRounds) {
                setTimeout(() => {
                    if (dartsAutoActive) throwDart();
                }, 1500);
            } else {
                stopDartsAuto();
            }
        }
    }, 1000);
}

function stopDartsAuto() {
    dartsAutoActive = false;
    dartsAutoCompleted = 0;
    document.getElementById('dartsStopBtn').style.display = 'none';
    document.getElementById('dartsThrowBtn').style.display = 'inline-block';
    showNotification('⏹️ Auto play stopped', 'info');
}


// ===== WHEEL OF FORTUNE GAME =====
function loadFortuneWheelGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎪 Wheel of Fortune</h2>
            <p>Spin the big wheel and win big!</p>
        </div>
        
        <div style="background: linear-gradient(180deg, #8e44ad 0%, #9b59b6 100%); border-radius: 20px; padding: 30px 20px; margin: 20px 0;">
            <div style="text-align: center; margin: 30px 0;">
                <div id="fortuneWheel" style="width: 300px; height: 300px; margin: 0 auto; background: conic-gradient(
                    from 0deg,
                    #ff0000 0deg 45deg,
                    #ffd700 45deg 90deg,
                    #00ff00 90deg 135deg,
                    #00ffff 135deg 180deg,
                    #0000ff 180deg 225deg,
                    #ff00ff 225deg 270deg,
                    #ff8800 270deg 315deg,
                    #ffffff 315deg 360deg
                ); border-radius: 50%; border: 8px solid #ffd700; position: relative; transition: transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99); box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: #000; border-radius: 50%; border: 4px solid #ffd700; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #ffd700; font-size: 1.2em;">SPIN</div>
                    <!-- Pointer -->
                    <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent; border-top: 30px solid #ffd700;"></div>
                </div>
                <div id="fortuneResult" style="font-size: 2em; color: #ffd700; font-weight: bold; margin-top: 30px; min-height: 60px;">
                    Klik SPIN untuk bermain!
                </div>
            </div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="fortuneBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
            
            <!-- Auto Play -->
            <div style="margin-top: 20px; padding: 20px; background: rgba(0, 255, 136, 0.1); border-radius: 15px;">
                <label style="display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; margin-bottom: 15px;">
                    <input type="checkbox" id="fortuneAutoPlay" style="width: 20px; height: 20px;">
                    <span style="font-weight: bold; color: #00ff88;">🤖 AUTO PLAY</span>
                </label>
                <div id="fortuneAutoSettings" style="display: none;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 10px;">
                        <button class="preset-btn" onclick="setFortuneAuto(10)">10x</button>
                        <button class="preset-btn" onclick="setFortuneAuto(25)">25x</button>
                        <button class="preset-btn" onclick="setFortuneAuto(50)">50x</button>
                        <button class="preset-btn" onclick="setFortuneAuto(100)">100x</button>
                    </div>
                    <div style="text-align: center; color: #aaa; font-size: 0.9em;">
                        Rounds: <span id="fortuneAutoCount">0</span>
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(255, 215, 0, 0.1); border-radius: 10px; padding: 15px; margin-top: 15px;">
                <div style="text-align: center; color: #ffd700; font-weight: bold; margin-bottom: 10px;">
                    💰 PRIZES 💰
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9em;">
                    <div style="color: #ff0000;">🔴 Red</div><div style="color: #ff4444; text-align: right;">= 100x</div>
                    <div style="color: #ffd700;">🟡 Gold</div><div style="color: #ffd700; text-align: right;">= 50x</div>
                    <div style="color: #00ff00;">🟢 Green</div><div style="color: #00ff88; text-align: right;">= 20x</div>
                    <div style="color: #00ffff;">🔵 Cyan</div><div style="color: #00ffff; text-align: right;">= 10x</div>
                    <div style="color: #0000ff;">🔵 Blue</div><div style="color: #4444ff; text-align: right;">= 5x</div>
                    <div style="color: #ff00ff;">🟣 Purple</div><div style="color: #ff44ff; text-align: right;">= 3x</div>
                    <div style="color: #ff8800;">🟠 Orange</div><div style="color: #ff8800; text-align: right;">= 2x</div>
                    <div style="color: #ffffff;">⚪ White</div><div style="color: #aaa; text-align: right;">= 1x</div>
                </div>
            </div>
        </div>
        
        <div class="result-message" id="fortuneResultMsg"></div>
        
        <div style="text-align: center; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button class="game-btn" id="fortuneSpinBtn" onclick="spinFortune()">🎪 SPIN!</button>
            <button class="game-btn" id="fortuneStopBtn" onclick="stopFortuneAuto()" style="display: none; background: linear-gradient(45deg, #ff4444, #cc0000);">⏹️ STOP</button>
        </div>
    `;
    
    document.getElementById('fortuneAutoPlay').onchange = function() {
        document.getElementById('fortuneAutoSettings').style.display = this.checked ? 'block' : 'none';
    };
}

let fortuneAutoRounds = 0;
let fortuneAutoActive = false;
let fortuneAutoCompleted = 0;
let fortuneSpinning = false;

function setFortuneAuto(rounds) {
    fortuneAutoRounds = rounds;
    document.getElementById('fortuneAutoCount').textContent = `0/${rounds}`;
}

function spinFortune() {
    if (fortuneSpinning) return;
    
    const bet = parseInt(document.getElementById('fortuneBet').value);
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    const autoPlay = document.getElementById('fortuneAutoPlay').checked;
    
    if (autoPlay && fortuneAutoRounds > 0 && !fortuneAutoActive) {
        fortuneAutoActive = true;
        fortuneAutoCompleted = 0;
        document.getElementById('fortuneStopBtn').style.display = 'inline-block';
        document.getElementById('fortuneSpinBtn').style.display = 'none';
    }
    
    fortuneSpinning = true;
    balance -= bet;
    updateBalance();
    
    const wheel = document.getElementById('fortuneWheel');
    document.getElementById('fortuneResult').textContent = '🎪 Spinning...';
    document.getElementById('fortuneResultMsg').textContent = '';
    
    // Random spin
    const spins = 5 + Math.random() * 3;
    const degrees = spins * 360 + Math.random() * 360;
    wheel.style.transform = `rotate(${degrees}deg)`;
    
    setTimeout(() => {
        const normalizedDegrees = degrees % 360;
        const segment = Math.floor(normalizedDegrees / 45);
        
        const prizes = [
            { name: '🔴 RED - JACKPOT!', multiplier: 100, color: '#ff0000' },
            { name: '🟡 GOLD - MEGA WIN!', multiplier: 50, color: '#ffd700' },
            { name: '🟢 GREEN - BIG WIN!', multiplier: 20, color: '#00ff00' },
            { name: '🔵 CYAN - GREAT!', multiplier: 10, color: '#00ffff' },
            { name: '🔵 BLUE - NICE!', multiplier: 5, color: '#0000ff' },
            { name: '🟣 PURPLE - GOOD!', multiplier: 3, color: '#ff00ff' },
            { name: '🟠 ORANGE - WIN!', multiplier: 2, color: '#ff8800' },
            { name: '⚪ WHITE - SMALL WIN', multiplier: 1, color: '#ffffff' }
        ];
        
        const prize = prizes[segment];
        document.getElementById('fortuneResult').textContent = prize.name;
        document.getElementById('fortuneResult').style.color = prize.color;
        
        let winAmount = Math.floor(bet * prize.multiplier);
        winAmount = applyRoleBonus(winAmount);
        balance += winAmount;
        updateBalance();
        
        const resultDiv = document.getElementById('fortuneResultMsg');
        resultDiv.textContent = `🎉 ${prize.multiplier}x! WIN: +${formatRupiah(winAmount)}`;
        resultDiv.className = 'result-message win';
        addToHistory('Wheel of Fortune', bet, 'win', winAmount);
        
        fortuneSpinning = false;
        
        // Auto play logic
        if (fortuneAutoActive) {
            fortuneAutoCompleted++;
            document.getElementById('fortuneAutoCount').textContent = `${fortuneAutoCompleted}/${fortuneAutoRounds}`;
            
            if (fortuneAutoCompleted < fortuneAutoRounds) {
                setTimeout(() => {
                    if (fortuneAutoActive) spinFortune();
                }, 2000);
            } else {
                stopFortuneAuto();
            }
        }
    }, 3000);
}

function stopFortuneAuto() {
    fortuneAutoActive = false;
    fortuneAutoCompleted = 0;
    document.getElementById('fortuneStopBtn').style.display = 'none';
    document.getElementById('fortuneSpinBtn').style.display = 'inline-block';
    showNotification('⏹️ Auto play stopped', 'info');
}


// ===== BINGO GAME =====
function loadBingoGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎱 Bingo</h2>
            <p>Match the numbers and win!</p>
        </div>
        
        <div style="background: linear-gradient(145deg, #1e3c72, #2a5298); border-radius: 20px; padding: 30px 20px; margin: 20px 0;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 1.5em; color: #ffd700; font-weight: bold;">
                    Called Number: <span id="bingoCalledNumber" style="font-size: 1.5em; color: #00ff88;">-</span>
                </div>
                <div style="font-size: 1em; color: #aaa; margin-top: 10px;">
                    Matched: <span id="bingoMatched">0</span> / 25
                </div>
            </div>
            
            <div id="bingoCard" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; max-width: 400px; margin: 20px auto;">
                <!-- Bingo card will be generated here -->
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <div id="bingoStatus" style="font-size: 1.2em; color: #ffd700; font-weight: bold; min-height: 40px;">
                    Klik START untuk bermain!
                </div>
            </div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="bingoBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
            
            <div style="background: rgba(255, 215, 0, 0.1); border-radius: 10px; padding: 15px; margin-top: 15px;">
                <div style="text-align: center; color: #ffd700; font-weight: bold; margin-bottom: 10px;">
                    💰 PAYTABLE 💰
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9em;">
                    <div style="color: #fff;">Full Card (25)</div><div style="color: #ff4444; text-align: right;">= 100x</div>
                    <div style="color: #fff;">20-24 Numbers</div><div style="color: #ffd700; text-align: right;">= 20x</div>
                    <div style="color: #fff;">15-19 Numbers</div><div style="color: #00ff88; text-align: right;">= 10x</div>
                    <div style="color: #fff;">10-14 Numbers</div><div style="color: #00ff88; text-align: right;">= 5x</div>
                    <div style="color: #fff;">5-9 Numbers</div><div style="color: #00ff88; text-align: right;">= 2x</div>
                    <div style="color: #fff;">< 5 Numbers</div><div style="color: #aaa; text-align: right;">= 0x</div>
                </div>
            </div>
        </div>
        
        <div class="result-message" id="bingoResult"></div>
        
        <div style="text-align: center;">
            <button class="game-btn" id="bingoStartBtn" onclick="startBingo()">🎱 START GAME</button>
        </div>
    `;
}

let bingoCard = [];
let bingoCalledNumbers = [];
let bingoMatched = 0;
let bingoGameActive = false;
let bingoInterval = null;

function startBingo() {
    const bet = parseInt(document.getElementById('bingoBet').value);
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    balance -= bet;
    updateBalance();
    
    bingoGameActive = true;
    bingoMatched = 0;
    bingoCalledNumbers = [];
    
    // Generate bingo card (5x5 with random numbers 1-75)
    bingoCard = [];
    for (let i = 0; i < 25; i++) {
        let num;
        do {
            num = Math.floor(Math.random() * 75) + 1;
        } while (bingoCard.includes(num));
        bingoCard.push(num);
    }
    
    // Display card
    const cardContainer = document.getElementById('bingoCard');
    cardContainer.innerHTML = '';
    bingoCard.forEach((num, index) => {
        const cell = document.createElement('div');
        cell.id = `bingoCell${index}`;
        cell.textContent = num;
        cell.style.cssText = `
            background: linear-gradient(145deg, #fff, #e0e0e0);
            border: 2px solid #333;
            border-radius: 8px;
            padding: 15px;
            font-size: 1.3em;
            font-weight: bold;
            color: #000;
            text-align: center;
            transition: all 0.3s;
        `;
        cardContainer.appendChild(cell);
    });
    
    document.getElementById('bingoStartBtn').disabled = true;
    document.getElementById('bingoStatus').textContent = 'Calling numbers...';
    document.getElementById('bingoResult').textContent = '';
    
    // Start calling numbers
    let callCount = 0;
    const maxCalls = 40; // Call 40 numbers
    
    bingoInterval = setInterval(() => {
        if (callCount >= maxCalls || !bingoGameActive) {
            clearInterval(bingoInterval);
            endBingo(bet);
            return;
        }
        
        // Call a random number
        let calledNum;
        do {
            calledNum = Math.floor(Math.random() * 75) + 1;
        } while (bingoCalledNumbers.includes(calledNum));
        
        bingoCalledNumbers.push(calledNum);
        document.getElementById('bingoCalledNumber').textContent = calledNum;
        
        // Check if it's on the card
        const cardIndex = bingoCard.indexOf(calledNum);
        if (cardIndex !== -1) {
            bingoMatched++;
            const cell = document.getElementById(`bingoCell${cardIndex}`);
            cell.style.background = 'linear-gradient(145deg, #00ff88, #00cc6a)';
            cell.style.color = '#fff';
            cell.style.transform = 'scale(1.1)';
            cell.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.8)';
            
            document.getElementById('bingoMatched').textContent = bingoMatched;
            
            // Check for full card
            if (bingoMatched === 25) {
                clearInterval(bingoInterval);
                endBingo(bet);
            }
        }
        
        callCount++;
    }, 800);
}

function endBingo(bet) {
    bingoGameActive = false;
    document.getElementById('bingoStartBtn').disabled = false;
    
    let multiplier = 0;
    let message = '';
    
    if (bingoMatched === 25) {
        multiplier = 100;
        message = '🎉 FULL CARD! JACKPOT!';
    } else if (bingoMatched >= 20) {
        multiplier = 20;
        message = '🌟 AMAZING! 20+ Numbers!';
    } else if (bingoMatched >= 15) {
        multiplier = 10;
        message = '✨ GREAT! 15+ Numbers!';
    } else if (bingoMatched >= 10) {
        multiplier = 5;
        message = '👍 GOOD! 10+ Numbers!';
    } else if (bingoMatched >= 5) {
        multiplier = 2;
        message = '😊 Nice! 5+ Numbers!';
    } else {
        message = '😢 Better luck next time!';
    }
    
    document.getElementById('bingoStatus').textContent = message;
    
    const resultDiv = document.getElementById('bingoResult');
    
    if (multiplier > 0) {
        let winAmount = Math.floor(bet * multiplier);
        winAmount = applyRoleBonus(winAmount);
        balance += winAmount;
        updateBalance();
        resultDiv.textContent = `🎉 ${bingoMatched} Matched! ${multiplier}x - WIN: +${formatRupiah(winAmount)}`;
        resultDiv.className = 'result-message win';
        addToHistory('Bingo', bet, 'win', winAmount);
    } else {
        resultDiv.textContent = `😢 Only ${bingoMatched} matched. Try again!`;
        resultDiv.className = 'result-message loss';
        addToHistory('Bingo', bet, 'loss', 0);
    }
}


// ===== KENO GAME =====
function loadKenoGame(container) {
    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">🎰 Keno</h2>
            <p>Pick your lucky numbers and win!</p>
        </div>
        
        <div style="background: linear-gradient(145deg, #0f2027, #203a43, #2c5364); border-radius: 20px; padding: 30px 20px; margin: 20px 0;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 1.2em; color: #ffd700; font-weight: bold;">
                    Pick 10 Numbers (1-80)
                </div>
                <div style="font-size: 1em; color: #00ff88; margin-top: 10px;">
                    Selected: <span id="kenoSelected">0</span> / 10 | Matched: <span id="kenoMatched">0</span>
                </div>
            </div>
            
            <div id="kenoBoard" style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 5px; max-width: 600px; margin: 20px auto;">
                <!-- Keno board will be generated here -->
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <div id="kenoStatus" style="font-size: 1.2em; color: #ffd700; font-weight: bold; min-height: 40px;">
                    Pilih 10 angka lalu klik PLAY!
                </div>
            </div>
        </div>
        
        <div class="bet-section">
            <div class="bet-controls">
                <label>Taruhan:</label>
                <input type="number" id="kenoBet" class="bet-input" value="10000" min="1000" step="1000">
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px; flex-wrap: wrap;">
                <button class="preset-btn" onclick="kenoQuickPick()">🎲 QUICK PICK</button>
                <button class="preset-btn" onclick="kenoClear()">🗑️ CLEAR</button>
            </div>
            
            <div style="background: rgba(255, 215, 0, 0.1); border-radius: 10px; padding: 15px; margin-top: 15px;">
                <div style="text-align: center; color: #ffd700; font-weight: bold; margin-bottom: 10px;">
                    💰 PAYTABLE 💰
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9em;">
                    <div style="color: #fff;">10/10 Match</div><div style="color: #ff4444; text-align: right;">= 1000x</div>
                    <div style="color: #fff;">9/10 Match</div><div style="color: #ff4444; text-align: right;">= 100x</div>
                    <div style="color: #fff;">8/10 Match</div><div style="color: #ffd700; text-align: right;">= 50x</div>
                    <div style="color: #fff;">7/10 Match</div><div style="color: #ffd700; text-align: right;">= 20x</div>
                    <div style="color: #fff;">6/10 Match</div><div style="color: #00ff88; text-align: right;">= 10x</div>
                    <div style="color: #fff;">5/10 Match</div><div style="color: #00ff88; text-align: right;">= 3x</div>
                    <div style="color: #fff;">4/10 Match</div><div style="color: #00ff88; text-align: right;">= 1x</div>
                    <div style="color: #fff;">< 4 Match</div><div style="color: #aaa; text-align: right;">= 0x</div>
                </div>
            </div>
        </div>
        
        <div class="result-message" id="kenoResult"></div>
        
        <div style="text-align: center;">
            <button class="game-btn" id="kenoPlayBtn" onclick="playKeno()">🎰 PLAY!</button>
        </div>
    `;
    
    // Generate keno board (80 numbers)
    const board = document.getElementById('kenoBoard');
    for (let i = 1; i <= 80; i++) {
        const cell = document.createElement('div');
        cell.id = `kenoNum${i}`;
        cell.textContent = i;
        cell.dataset.number = i;
        cell.style.cssText = `
            background: linear-gradient(145deg, #fff, #e0e0e0);
            border: 2px solid #333;
            border-radius: 6px;
            padding: 8px 4px;
            font-size: 0.9em;
            font-weight: bold;
            color: #000;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
        `;
        cell.onclick = () => toggleKenoNumber(i);
        board.appendChild(cell);
    }
}

let kenoSelectedNumbers = [];
let kenoDrawnNumbers = [];

function toggleKenoNumber(num) {
    const cell = document.getElementById(`kenoNum${num}`);
    
    if (kenoSelectedNumbers.includes(num)) {
        // Deselect
        kenoSelectedNumbers = kenoSelectedNumbers.filter(n => n !== num);
        cell.style.background = 'linear-gradient(145deg, #fff, #e0e0e0)';
        cell.style.color = '#000';
        cell.style.transform = 'scale(1)';
    } else {
        // Select
        if (kenoSelectedNumbers.length >= 10) {
            showNotification('❌ Maksimal 10 angka!', 'error');
            return;
        }
        kenoSelectedNumbers.push(num);
        cell.style.background = 'linear-gradient(145deg, #4a90e2, #357abd)';
        cell.style.color = '#fff';
        cell.style.transform = 'scale(1.1)';
    }
    
    document.getElementById('kenoSelected').textContent = kenoSelectedNumbers.length;
}

function kenoQuickPick() {
    kenoClear();
    
    while (kenoSelectedNumbers.length < 10) {
        const num = Math.floor(Math.random() * 80) + 1;
        if (!kenoSelectedNumbers.includes(num)) {
            toggleKenoNumber(num);
        }
    }
}

function kenoClear() {
    kenoSelectedNumbers.forEach(num => {
        const cell = document.getElementById(`kenoNum${num}`);
        cell.style.background = 'linear-gradient(145deg, #fff, #e0e0e0)';
        cell.style.color = '#000';
        cell.style.transform = 'scale(1)';
    });
    kenoSelectedNumbers = [];
    document.getElementById('kenoSelected').textContent = '0';
}

function playKeno() {
    if (kenoSelectedNumbers.length !== 10) {
        showNotification('❌ Pilih 10 angka terlebih dahulu!', 'error');
        return;
    }
    
    const bet = parseInt(document.getElementById('kenoBet').value);
    if (bet < 1000 || balance < bet) {
        showNotification('❌ Saldo tidak cukup!', 'error');
        return;
    }
    
    balance -= bet;
    updateBalance();
    
    document.getElementById('kenoPlayBtn').disabled = true;
    document.getElementById('kenoStatus').textContent = 'Drawing numbers...';
    document.getElementById('kenoResult').textContent = '';
    
    // Draw 20 random numbers
    kenoDrawnNumbers = [];
    while (kenoDrawnNumbers.length < 20) {
        const num = Math.floor(Math.random() * 80) + 1;
        if (!kenoDrawnNumbers.includes(num)) {
            kenoDrawnNumbers.push(num);
        }
    }
    
    // Animate drawing
    let drawIndex = 0;
    const drawInterval = setInterval(() => {
        if (drawIndex >= kenoDrawnNumbers.length) {
            clearInterval(drawInterval);
            endKeno(bet);
            return;
        }
        
        const num = kenoDrawnNumbers[drawIndex];
        const cell = document.getElementById(`kenoNum${num}`);
        
        if (kenoSelectedNumbers.includes(num)) {
            // Matched!
            cell.style.background = 'linear-gradient(145deg, #00ff88, #00cc6a)';
            cell.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.8)';
        } else {
            // Drawn but not selected
            cell.style.background = 'linear-gradient(145deg, #ff4444, #cc0000)';
            cell.style.color = '#fff';
        }
        
        drawIndex++;
    }, 200);
}

function endKeno(bet) {
    // Count matches
    const matches = kenoSelectedNumbers.filter(num => kenoDrawnNumbers.includes(num)).length;
    document.getElementById('kenoMatched').textContent = matches;
    
    let multiplier = 0;
    let message = '';
    
    if (matches === 10) {
        multiplier = 1000;
        message = '🎉 PERFECT! 10/10 JACKPOT!';
    } else if (matches === 9) {
        multiplier = 100;
        message = '🌟 AMAZING! 9/10!';
    } else if (matches === 8) {
        multiplier = 50;
        message = '✨ EXCELLENT! 8/10!';
    } else if (matches === 7) {
        multiplier = 20;
        message = '🎯 GREAT! 7/10!';
    } else if (matches === 6) {
        multiplier = 10;
        message = '👍 GOOD! 6/10!';
    } else if (matches === 5) {
        multiplier = 3;
        message = '😊 Nice! 5/10!';
    } else if (matches === 4) {
        multiplier = 1;
        message = '🙂 OK! 4/10!';
    } else {
        message = `😢 Only ${matches}/10. Try again!`;
    }
    
    document.getElementById('kenoStatus').textContent = message;
    
    const resultDiv = document.getElementById('kenoResult');
    
    if (multiplier > 0) {
        let winAmount = Math.floor(bet * multiplier);
        winAmount = applyRoleBonus(winAmount);
        balance += winAmount;
        updateBalance();
        resultDiv.textContent = `🎉 ${matches}/10 Matched! ${multiplier}x - WIN: +${formatRupiah(winAmount)}`;
        resultDiv.className = 'result-message win';
        addToHistory('Keno', bet, 'win', winAmount);
    } else {
        resultDiv.textContent = `😢 Only ${matches}/10 matched. Try again!`;
        resultDiv.className = 'result-message loss';
        addToHistory('Keno', bet, 'loss', 0);
    }
    
    document.getElementById('kenoPlayBtn').disabled = false;
    
    // Reset after 3 seconds
    setTimeout(() => {
        kenoClear();
        // Reset drawn numbers display
        kenoDrawnNumbers.forEach(num => {
            if (!kenoSelectedNumbers.includes(num)) {
                const cell = document.getElementById(`kenoNum${num}`);
                cell.style.background = 'linear-gradient(145deg, #fff, #e0e0e0)';
                cell.style.color = '#000';
                cell.style.boxShadow = 'none';
            }
        });
        document.getElementById('kenoMatched').textContent = '0';
    }, 3000);
}

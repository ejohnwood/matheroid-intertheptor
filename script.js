const gameContainer = document.getElementById('game-container');
const laserContainer = document.getElementById('laser-container');
const flashOverlay = document.getElementById('flash-overlay');
const answerInput = document.getElementById('answer-input');
const scoreValue = document.getElementById('score-value');
const streakValue = document.getElementById('streak-value');
const shieldBar = document.getElementById('shield-bar');
const driveMode = document.getElementById('drive-mode');
const systemStatus = document.getElementById('system-status');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const opSelect = document.getElementById('op-select');
const diffSelect = document.getElementById('diff-select');
const speedSelect = document.getElementById('speed-select');

let score = 0;
let streak = 0;
let shield = 100;
let baseFallTime = 8;
let currentFallTime = 8;
let spawnInterval = 2500; // ms between spawns
let spawnTimer = null;
let gameActive = false; // Start paused for menu
let isHyperMode = false;
let asteroids = [];
let spawnCount = 0;
let nextGoldScore = 10;

// Game Settings
let currentOps = ['add'];
let currentDiff = 'easy';
let currentSpeed = 'cruise';

// --- Setup Spaceship ---
const ship = document.createElement('div');
ship.className = 'spaceship';
const thruster = document.createElement('div');
thruster.className = 'thruster';
ship.appendChild(thruster);
gameContainer.appendChild(ship);

// --- Menu Logic ---
function setupMenu() {
    // Difficulty and speed remain single-select groups.
    function handleSingleSelect(group) {
        group.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-btn')) {
                Array.from(group.children).forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    }

    const operationButtons = Array.from(opSelect.querySelectorAll('.menu-btn:not([data-value="all"])'));
    const allOperationsButton = opSelect.querySelector('[data-value="all"]');

    function setOperationButtonState(button, isActive) {
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive.toString());
    }

    function syncAllOperationsButton() {
        const allSelected = operationButtons.every(btn => btn.classList.contains('active'));
        setOperationButtonState(allOperationsButton, allSelected);
    }

    opSelect.addEventListener('click', (e) => {
        const button = e.target.closest('.menu-btn');
        if (!button || !opSelect.contains(button)) return;

        if (button === allOperationsButton) {
            const allSelected = operationButtons.every(opButton => opButton.classList.contains('active'));

            // Clicking ALL again returns to the initial Addition-only setting.
            operationButtons.forEach(opButton => {
                setOperationButtonState(opButton, allSelected ? opButton.dataset.value === 'add' : true);
            });
        } else {
            const activeCount = operationButtons.filter(opButton => opButton.classList.contains('active')).length;
            const isActive = button.classList.contains('active');

            // Always keep at least one operation selected.
            if (!(isActive && activeCount === 1)) {
                setOperationButtonState(button, !isActive);
            }
        }

        syncAllOperationsButton();
    });

    handleSingleSelect(diffSelect);
    handleSingleSelect(speedSelect);

    startBtn.addEventListener('click', startGame);
}

function startGame() {
    // Read selections
    currentOps = Array.from(opSelect.querySelectorAll('.menu-btn.active:not([data-value="all"])'))
        .map(button => button.dataset.value);
    currentDiff = diffSelect.querySelector('.active').dataset.value;
    currentSpeed = speedSelect.querySelector('.active').dataset.value;

    spawnCount = 0;
    nextGoldScore = 10;

    // Apply Speed Settings
    if (currentSpeed === 'beginner') {
        baseFallTime = 18; // Extra time for early learners
        spawnInterval = 6000; // One every 6s
    } else if (currentSpeed === 'eco') {
        baseFallTime = 12; // Very slow fall
        spawnInterval = 4000; // One every 4s
    } else if (currentSpeed === 'warp') {
        baseFallTime = 4; // Fast fall
        spawnInterval = 1200; // Fast spawn
    } else {
        baseFallTime = 8; // Normal
        spawnInterval = 2500; // Normal spawn
    }

    currentFallTime = baseFallTime; // Reset current fall time

    // Hide Menu / Show Game
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameActive = true;

    // Reset Game State
    resetGameState();

    // Start Loops
    update();
    spawnLoop();
}

function resetGameState() {
    asteroids.forEach(a => {
        if (a.element && a.element.parentNode) a.element.remove();
    });
    asteroids = [];
    score = 0;
    streak = 0;
    shield = 100;
    isHyperMode = false;

    scoreValue.innerText = "000";
    streakValue.innerText = "0";
    shieldBar.style.width = "100%";
    systemStatus.innerText = "ONLINE";
    updateStreakUI();

    answerInput.value = "";
    answerInput.disabled = false;
    answerInput.focus();
}

// --- Permanent Focus ---
function maintainFocus() {
    if (gameActive) answerInput.focus();
}
answerInput.addEventListener('blur', () => setTimeout(maintainFocus, 10));
document.addEventListener('mousedown', (e) => {
    if (gameActive && e.target !== answerInput && !startScreen.contains(e.target) && !gameOverScreen.contains(e.target)) {
        e.preventDefault();
        maintainFocus();
    }
});


// --- Math Generation Logic ---
function generateProblem() {
    // Choose randomly from the operations selected in the mission menu.
    const op = currentOps[Math.floor(Math.random() * currentOps.length)];

    let a, b, problem, answer;

    switch (op) {
        case 'add':
            // Easy: Single Digit Facts (Sums 0-12)
            if (currentDiff === 'easy') {
                a = Math.floor(Math.random() * 7); // 0-6
                b = Math.floor(Math.random() * (13 - a));
            }
            // Medium: Sums 12-50
            else if (currentDiff === 'medium') {
                a = Math.floor(Math.random() * 38) + 2;
                b = Math.floor(Math.random() * (50 - a));
            }
            // Hard: Sums 20-100 (Double Digit)
            else {
                a = Math.floor(Math.random() * 80) + 10;
                b = Math.floor(Math.random() * (100 - a));
            }
            problem = `${a} + ${b}`;
            answer = a + b;
            break;

        case 'sub':
            // Easy: Minuends 0-12
            if (currentDiff === 'easy') {
                a = Math.floor(Math.random() * 13);
                b = Math.floor(Math.random() * (a + 1));
            }
            // Medium: Minuends 12-50
            else if (currentDiff === 'medium') {
                a = Math.floor(Math.random() * 38) + 12;
                b = Math.floor(Math.random() * a);
            }
            // Hard: Minuends 20-100
            else {
                a = Math.floor(Math.random() * 80) + 20;
                b = Math.floor(Math.random() * a);
            }
            problem = `${a} - ${b}`;
            answer = a - b;
            break;

        case 'mult':
            if (currentDiff === 'easy') { // K-2: 0-5 tables
                a = Math.floor(Math.random() * 6);
                b = Math.floor(Math.random() * 11);
            } else if (currentDiff === 'medium') { // 3-4: 0-12 tables
                a = Math.floor(Math.random() * 13);
                b = Math.floor(Math.random() * 13);
            } else { // Hard: 2-digit x 1-digit
                a = Math.floor(Math.random() * 16) + 4; // 4 to 20
                b = Math.floor(Math.random() * 8) + 2; // 2 to 9
            }
            problem = `${a} × ${b}`;
            answer = a * b;
            break;

        case 'div':
            if (currentDiff === 'easy') { // K-2: Divisors 1-5, Quotients 1-5
                answer = Math.floor(Math.random() * 6);
                b = Math.floor(Math.random() * 5) + 1;
                a = answer * b;
            } else if (currentDiff === 'medium') { // 3-4: Basic Facts (up to 12)
                answer = Math.floor(Math.random() * 13);
                b = Math.floor(Math.random() * 12) + 1;
                a = answer * b;
            } else { // Hard: Larger numbers
                answer = Math.floor(Math.random() * 16) + 5;
                b = Math.floor(Math.random() * 9) + 2;
                a = answer * b;
            }
            problem = `${a} ÷ ${b}`;
            break;
    }

    return { problem, answer };
}

function spawnAsteroid(forceType = null) {
    if (!gameActive) return;

    const { problem, answer } = generateProblem();
    const asteroid = document.createElement('div');
    asteroid.className = 'asteroid';

    spawnCount++;

    let isGolden = false;
    let isBoss = false;

    if (forceType === 'golden') {
        isGolden = true;
    } else if (forceType === 'boss') {
        isBoss = true;
    } else {
        // Standard Check
        // Boss every 5th spawn (if not forced otherwise)
        if (spawnCount % 5 === 0) {
            isBoss = true;
        }
    }

    if (isGolden) {
        asteroid.classList.add('golden');
    } else if (isBoss) {
        asteroid.classList.add('boss');
    }

    asteroid.innerText = problem;

    const xPos = Math.random() * (window.innerWidth - 130) + 10;
    asteroid.style.left = `${xPos}px`;
    asteroid.style.top = '-120px';

    gameContainer.appendChild(asteroid);

    // Use Web Animations API for smooth control
    const animation = asteroid.animate([
        { transform: 'translateY(0)' },
        { transform: `translateY(${window.innerHeight + 150}px)` }
    ], {
        duration: currentFallTime * 1000,
        easing: 'linear'
    });

    const asteroidObj = {
        element: asteroid,
        animation: animation,
        answer: answer.toString(),
        id: Date.now() + Math.random(),
        isGolden: isGolden,
        isBoss: isBoss,
        dangerThresholdHit: false
    };

    asteroids.push(asteroidObj);

    animation.onfinish = () => {
        if (gameActive && asteroids.includes(asteroidObj)) {
            takeDamage();
        }
        removeAsteroid(asteroidObj);
    };
}

function removeAsteroid(asteroidObj) {
    if (asteroidObj.element.parentNode) {
        asteroidObj.element.remove();
    }
    asteroids = asteroids.filter(a => a.id !== asteroidObj.id);
}

// --- Effects & Feedback ---
function triggerScreenShake(heavy = false) {
    gameContainer.classList.add('shake');
    setTimeout(() => gameContainer.classList.remove('shake'), 300);
}

function flashScreen(type) {
    flashOverlay.className = '';
    if (type === 'red') flashOverlay.classList.add('flash-red');
    if (type === 'white') flashOverlay.classList.add('flash-white');
}

function drawLaser(targetX, targetY) {
    const shipRect = ship.getBoundingClientRect();
    const startX = shipRect.left + shipRect.width / 2;
    const startY = shipRect.top;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", startX);
    line.setAttribute("y1", startY);
    line.setAttribute("x2", targetX);
    line.setAttribute("y2", targetY);
    line.setAttribute("class", "laser-beam");

    laserContainer.appendChild(line);
    setTimeout(() => line.remove(), 150);
}

function createShatterEffect(x, y, color = '#555') {
    for (let i = 0; i < 15; i++) {
        const frag = document.createElement('div');
        frag.className = 'fragment';
        frag.style.left = `${x}px`;
        frag.style.top = `${y}px`;
        frag.style.backgroundColor = color;

        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 150 + 50;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;

        gameContainer.appendChild(frag);

        frag.animate([
            { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) rotate(360deg)`, opacity: 0 }
        ], {
            duration: 800,
            easing: 'ease-out'
        }).onfinish = () => frag.remove();
    }
}

// --- Gamer Logic ---

function takeDamage() {
    shield -= 25;
    if (shield <= 0) {
        shield = 0;
        endGame();
    }
    shieldBar.style.width = `${shield}%`;
    streak = 0;
    updateStreakUI();

    flashScreen('red');
    triggerScreenShake(true);
}

function triggerSmartBomb() {
    flashScreen('white');
    triggerScreenShake(true);

    // Clear all asteroids
    [...asteroids].forEach(a => {
        const rect = a.element.getBoundingClientRect();
        createShatterEffect(rect.left + 50, rect.top + 50, a.isGolden ? '#ffcc00' : '#555');
        removeAsteroid(a);
    });
}

function updateStreakUI() {
    streakValue.innerText = streak;

    if (streak >= 5) {
        if (!isHyperMode) {
            isHyperMode = true;
            ship.classList.add('hyper');
            gameContainer.classList.add('hyper-mode');
            driveMode.innerText = "HYPER-DRIVE";
            driveMode.classList.add('hyper-text');
        }
    } else {
        if (isHyperMode) {
            isHyperMode = false;
            ship.classList.remove('hyper');
            gameContainer.classList.remove('hyper-mode');
            driveMode.innerText = "NORMAL";
            driveMode.classList.remove('hyper-text');
        }
    }
}

function checkAnswer() {
    const inputVal = answerInput.value.trim();
    if (inputVal === "") return;

    const matchIndex = asteroids.findIndex(a => a.answer === inputVal);

    if (matchIndex !== -1) {
        // Correct Answer
        const matched = asteroids[matchIndex];
        const rect = matched.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        drawLaser(centerX, centerY);
        triggerScreenShake();
        createShatterEffect(centerX, centerY, matched.isGolden ? '#ffcc00' : (matched.isBoss ? '#b56cff' : '#555'));

        if (matched.isGolden) {
            triggerSmartBomb();
        }

        removeAsteroid(matched);

        // Scoring Logic
        let points = 1;
        if (matched.isBoss) points = 3;
        if (isHyperMode) points += 1; // Bonus for Hyper Mode

        score += points;
        scoreValue.innerText = score.toString().padStart(3, '0');

        streak++;
        updateStreakUI();

        answerInput.value = "";

        // Slight optimization: Increase difficulty slightly over time based on score
        // Limit difficulty scaling to avoid impossible speeds
        if (score > 0 && score % 10 === 0) {
            // Beginner and Eco retain a gentler pace.
            // For Warp, we speed up a little.
            let minFall = 2;
            if (currentSpeed === 'beginner') minFall = 14;
            if (currentSpeed === 'eco') minFall = 8;
            if (currentSpeed === 'cruise') minFall = 5;

            if (currentFallTime > minFall) {
                currentFallTime -= 0.5;
            }
        }
    } else {
        // Smart Input Rejection
        // Check if the current input matches the START of ANY answer
        const isPartialMatch = asteroids.some(a => a.answer.startsWith(inputVal));

        if (!isPartialMatch) {
            // Shake and Clear Immediately
            answerInput.classList.add('input-error');
            setTimeout(() => answerInput.classList.remove('input-error'), 300);
            answerInput.value = ""; // Clear bad input
        }
    }
}

function update() {
    if (!gameActive) return;

    const bottomLine = window.innerHeight - 300;
    asteroids.forEach(a => {
        const rect = a.element.getBoundingClientRect();
        if (rect.top > bottomLine && !a.dangerThresholdHit) {
            a.element.classList.add('danger');
            a.dangerThresholdHit = true;
        }
    });

    requestAnimationFrame(update);
}

function endGame() {
    gameActive = false;
    gameOverScreen.classList.remove('hidden');
    systemStatus.innerText = "CRITICAL";
    answerInput.disabled = true;

    const p = gameOverScreen.querySelector('p');
    p.innerHTML = `SYSTEM OFFLINE<br><span class="final-score">ASTEROIDS INTERCEPTED: ${score}</span>`;
}

// Hook up "Reboot System" to just go back to menu or restart?
// Let's make it go back to Menu for re-config as per plan.
restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    // Don't start game yet, let user pick config again
});

// Event Listeners
answerInput.addEventListener('input', checkAnswer);

// Spawn Loop
// Spawn Loop
function spawnLoop() {
    if (gameActive) {
        // Calculate Logic for Next Spawn
        const isBossTurn = ((spawnCount + 1) % 5 === 0);
        const isGoldTurn = (score >= nextGoldScore);

        if (isBossTurn && isGoldTurn) {
            // CONFLICT: Drop Both -> Boss First, Gold Second
            spawnAsteroid('boss');
            setTimeout(() => {
                if (gameActive) spawnAsteroid('golden');
            }, 800);
            nextGoldScore += 10;
        } else if (isGoldTurn) {
            spawnAsteroid('golden');
            nextGoldScore += 10;
        } else {
            spawnAsteroid(); // Normal (or natural Boss)
        }

        // Speed up spawn slightly as score increases, but cap it
        let currentInterval = spawnInterval;
        if (score > 50) currentInterval = Math.max(1000, spawnInterval * 0.9);
        if (score > 100) currentInterval = Math.max(800, spawnInterval * 0.8);

        spawnTimer = setTimeout(spawnLoop, currentInterval);
    }
}

// Initial Launch
setupMenu();
maintainFocus();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const mainMenu = document.getElementById('main-menu');
const gameOverMenu = document.getElementById('game-over-menu');
const pauseMenu = document.getElementById('pause-menu');
const pauseBtn = document.getElementById('pause-button');
const startBtn = document.getElementById('start-button');
const restartBtn = document.getElementById('restart-button');
const restartPauseBtn = document.getElementById('restart-pause-button');
const continueBtn = document.getElementById('continue-button');
const homeBtn = document.getElementById('home-button');
const exitToMainBtn = document.getElementById('exit-to-main-button');
const finalScoreText = document.getElementById('final-score-val');

// --- [게임 시스템 설정] ---
let score = 0;           
let obstaclesPassed = 0; 
let highScore = 0;
const BASE_CITY_SPEED = 3.86;  
let citySpeed = BASE_CITY_SPEED;
let isGameOver = false;
let isGameStarted = false;
let isPaused = false;
let keys = {};
let roadOffset = 0;

// --- [환경 및 낮밤 변수] ---
let targetEnv = 0; let currentEnv = 0; 

// --- [스폰 시스템 변수] ---
let spawnTimer = 0; let nextSpawnTime = 150; let longGapEnforceCount = 0; 
let fastEventActive = false; let fastEventTimer = 0; const EVENT_DURATION = 360; 
let fastCarSpawnFrame = 0; let lastFastMilestone = 0;

// --- [매 습격 시스템 변수] ---
let hawkState = 'none'; // 'none', 'patrolling', 'attacking', 'carrying', 'leaving'
let lastHawkCheckScore = 800; 
let isShortCarMode = false; 
let hawkX = 0, hawkY = 0;
let hawkSpeed = 5; 

// ==========================================
// [이미지 로딩 설정]
// ==========================================
const hawkImage = new Image();
hawkImage.src = 'hawk.png'; 

let isHawkLoaded = false;
hawkImage.onload = function() {
    isHawkLoaded = true;
    console.log("매 이미지 로딩 성공!");
};
hawkImage.onerror = function() {
    console.log("매 이미지 로딩 실패! hawk.png 파일을 확인하세요.");
};

let wasInAir = false; 
let buildings = []; let backBuildings = []; let stars = []; let clouds = []; let cars = [];
const cloudShapes = [[[0,0,120,40],[30,-20,80,40]],[[0,0,150,30],[20,20,100,25]],[[0,0,80,50],[15,-25,50,40]],[[0,0,60,30],[40,15,50,25]],[[0,0,130,45],[25,-25,90,35]]];

let penguin = { 
    x: 0, y: 0, width: 45, height: 45, dy: 0, 
    jumpPower: 5.3,  
    gravity: 0.6,    
    floatGravity: 0.1, 
    onRoad: true, visible: true 
};

function getGroundY() {
    const limitedHeight = Math.min(canvas.height, 1440);
    return limitedHeight * 0.7 + (canvas.height > 1440 ? (canvas.height - 1440) : 0);
}

function resizeCanvas() {
    const container = document.getElementById('game-container') || document.body;
    canvas.width = container.clientWidth || window.innerWidth;
    canvas.height = container.clientHeight || window.innerHeight;

    const groundY = getGroundY();
    const penguinSize = Math.max(20, Math.min(60, Math.floor(canvas.height * 0.035)));
    penguin.width = penguin.height = penguinSize;
    penguin.x = canvas.width * 0.20;
    if (penguin.onRoad) penguin.y = groundY - penguin.height;
    initBackground();
}
window.addEventListener('resize', resizeCanvas);

function initBackground() {
    const groundY = getGroundY();
    backBuildings = []; buildings = []; stars = []; clouds = [];
    for (let i = 0; i < Math.ceil(canvas.width / 80) + 5; i++) addBackBuilding(i * 80);
    for (let i = 0; i < Math.ceil(canvas.width / 50) + 5; i++) addForegroundObject(i * 60);
    for (let i = 0; i < 60; i++) stars.push({ x: Math.random() * canvas.width, y: Math.random() * groundY, size: Math.random() * 2 + 1, phase: Math.random() * Math.PI * 2 });
    for (let i = 0; i < 8; i++) spawnCloud(Math.random() * canvas.width);
}

function addBackBuilding(startX) {
    const groundY = getGroundY();
    let w = 100 + Math.random() * 60, h = 100 + Math.random() * Math.max(100, groundY - 300), ld = [];
    for (let r = 30; r < h - 20; r += 35) for (let c = 15; c < w - 20; c += 25) if (Math.random() > 0.6) ld.push({ r, c });
    backBuildings.push({ x: startX, width: w, height: h, nightColor: [15, 20, 35], dayColor: [80, 90, 110], lightData: ld });
}

function addForegroundObject(startX) {
    const groundY = getGroundY(), rand = Math.random();
    if (rand < 0.6) {
        let w = 120 + Math.random() * 80, h = 80 + Math.random() * Math.max(100, groundY - 320), ld = [];
        for (let r = 40; r < h - 20; r += 45) for (let c = 20; c < w - 30; c += 35) if (Math.random() > 0.4) ld.push({ r, c });
        buildings.push({ type: 'building', x: startX, width: w, height: h, nightColor: [25, 30, 45], dayColor: [70, 85, 100], lightData: ld });
    } else if (rand < 0.85) {
        buildings.push({ type: 'tree', x: startX, width: 25, height: 50 });
    } else {
        buildings.push({ type: 'crosswalk', x: startX, width: 160, stripes: 7 });
    }
}

function spawnCloud(startX) {
    clouds.push({ x: startX, y: 50 + Math.random() * 120, speed: 0.4 + Math.random() * 0.6, shapeIndex: Math.floor(Math.random() * cloudShapes.length) });
}

class Car {
    constructor(isFast = false, isShort = false, isMotorcycle = false) {
        this.carWidth = isMotorcycle ? 60 : (isFast ? 100 : (Math.random() > 0.5 ? 130 : 80));
        this.height = 40; 
        this.x = canvas.width + 100; 
        this.y = getGroundY() - this.height;
        this.color = isFast ? '#ffffff' : ['#e74c3c', '#f1c40f', '#3498db', '#9b59b6'][Math.floor(Math.random() * 4)];
        this.passed = false;
        this.isFast = isFast;
        this.extraSpeed = isFast ? 8.0 : 0;
        this.isMotorcycle = isMotorcycle; 
    }
    draw(env) {
        this.y = getGroundY() - this.height;
        if (this.isMotorcycle) {
            ctx.save(); ctx.translate(this.x, this.y);
            ctx.fillStyle = '#333';
            ctx.beginPath(); ctx.arc(10, 30, 10, 0, Math.PI*2); ctx.fill(); 
            ctx.beginPath(); ctx.arc(50, 30, 10, 0, Math.PI*2); ctx.fill(); 
            ctx.fillStyle = '#3498db';
            ctx.beginPath(); ctx.moveTo(10, 30); ctx.lineTo(30, 15); ctx.lineTo(50, 30); ctx.fill();
            ctx.fillStyle = '#2c3e50'; ctx.fillRect(20, 10, 25, 8); 
            ctx.restore();
        } else {
            if (env.lightOpacity > 0.1 || this.isFast) {
                ctx.save();
                let grad = ctx.createLinearGradient(this.x + 5, this.y + 25, this.x - 150, this.y + 100);
                let alpha = this.isFast ? 0.9 : env.lightOpacity * 0.5;
                grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = grad; ctx.beginPath(); ctx.moveTo(this.x + 5, this.y + 25); ctx.lineTo(this.x - 140, this.y + 75); ctx.lineTo(this.x - 120, this.y + 100); ctx.lineTo(this.x + 5, this.y + 40); ctx.fill();
                ctx.restore();
            }
            ctx.fillStyle = this.color; ctx.fillRect(this.x, this.y, this.carWidth, this.height);
            ctx.fillStyle = '#abdcfb'; ctx.fillRect(this.x + 12, this.y + 10, 35, 15);
            ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(this.x + 25, this.y + this.height, 10, 0, Math.PI * 2); ctx.arc(this.x + this.carWidth - 25, this.y + this.height, 10, 0, Math.PI * 2); ctx.fill();
        }
    }
}

function requestFullScreen() {
    const doc = window.document; const docEl = doc.documentElement;
    const requestFS = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    if (requestFS) requestFS.call(docEl);
}

function goToMain() {
    isGameStarted = false; isGameOver = false; isPaused = false;
    mainMenu.classList.remove('hidden'); gameOverMenu.classList.add('hidden'); pauseMenu.classList.add('hidden'); pauseBtn.classList.add('hidden');
    if (score > highScore) highScore = score; 
}

function togglePause() {
    if (!isGameStarted || isGameOver) return;
    isPaused = !isPaused;
    if (isPaused) pauseMenu.classList.remove('hidden');
    else pauseMenu.classList.add('hidden');
}

function startGame() {
    if (window.innerWidth <= 768) requestFullScreen();
    mainMenu.classList.add('hidden'); gameOverMenu.classList.add('hidden'); pauseMenu.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    isGameStarted = true; isPaused = false; resetCityGame();
}

function resetCityGame() {
    score = 0; obstaclesPassed = 0; cars = []; roadOffset = 0;
    spawnTimer = 0; fastEventTimer = 0; fastEventActive = false; lastFastMilestone = 0;
    targetEnv = 0; currentEnv = 0;
    nextSpawnTime = 150; longGapEnforceCount = 0;
    citySpeed = BASE_CITY_SPEED; 
    
    // 매 초기화
    hawkState = 'none'; hawkTimer = 0; isShortCarMode = false; lastHawkCheckScore = 800; 
    hawkSpeed = 6; 

    penguin.visible = true;
    isGameOver = false; isPaused = false; wasInAir = false; resizeCanvas();
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
restartPauseBtn.addEventListener('click', startGame);
continueBtn.addEventListener('click', () => { isPaused = false; pauseMenu.classList.add('hidden'); });
pauseBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePause(); });
homeBtn.addEventListener('click', goToMain);
exitToMainBtn.addEventListener('click', goToMain);

function lerpColor(c1, c2, f) { return [Math.floor(c1[0] + (c2[0] - c1[0]) * f), Math.floor(c1[1] + (c2[1] - c1[1]) * f), Math.floor(c1[2] + (c2[2] - c1[2]) * f)]; }

function getEnvironmentState() {
    targetEnv = Math.floor(obstaclesPassed / 20) % 2;
    currentEnv += (targetEnv - currentEnv) * 0.05;
    const DAY_C = [135, 206, 235], NIGHT_C = [15, 20, 45];
    const skyH = getGroundY();
    let bgColor = `rgb(${lerpColor(DAY_C, NIGHT_C, currentEnv).join(',')})`;
    let sunY = (skyH * 0.2) + (skyH * 1.5 * currentEnv);
    let moonY = (skyH * 1.2) - (skyH * 1.0 * currentEnv);
    return { bg: bgColor, lightOpacity: currentEnv, isDay: currentEnv < 0.5, sunY, moonY };
}

function updateEnvironment() {
    if (isPaused) return;
    roadOffset = (roadOffset + (citySpeed * 0.7)) % 80;
    clouds.forEach(c => { c.x -= c.speed; if (c.x < -250) c.x = canvas.width + 100; });
    backBuildings.forEach(b => { b.x -= citySpeed * 0.08; if (b.x < -200) b.x = canvas.width + 100; });
    buildings.forEach(b => { b.x -= citySpeed * 0.2; if (b.x < -200) b.x = canvas.width + 200; });
}

function drawRoadDetails() {
    const groundY = getGroundY();
    const centerY = groundY + (canvas.height - groundY) * 0.45;
    ctx.save(); ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.lineWidth = 12; ctx.setLineDash([40, 40]); 
    ctx.beginPath(); ctx.moveTo(-roadOffset, centerY); ctx.lineTo(canvas.width + 80, centerY); ctx.stroke(); ctx.restore();
}

function drawBackground(env) {
    const groundY = getGroundY();
    ctx.fillStyle = env.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (env.lightOpacity > 0.1) stars.forEach(s => {
        ctx.fillStyle = `rgba(255, 255, 255, ${env.lightOpacity * (0.3 + Math.abs(Math.sin(Date.now()/1000 + s.phase)*0.6))})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(canvas.width - 200, env.sunY, 60, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(canvas.width - 200, env.moonY, 65, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = env.bg; ctx.beginPath(); ctx.arc(canvas.width - 160, env.moonY - 20, 65, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    clouds.forEach(c => {
        ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = 'white'; ctx.beginPath();
        cloudShapes[c.shapeIndex].forEach(rect => ctx.rect(c.x + rect[0], c.y + rect[1], rect[2], rect[3]));
        ctx.fill(); ctx.restore();
    });
    backBuildings.forEach(b => {
        ctx.fillStyle = `rgb(${lerpColor(b.dayColor, b.nightColor, env.lightOpacity).join(',')})`; ctx.fillRect(b.x, groundY - b.height, b.width, b.height);
    });
    buildings.forEach(b => {
        if (b.type === 'building') {
            ctx.fillStyle = `rgb(${lerpColor(b.dayColor, b.nightColor, env.lightOpacity).join(',')})`; ctx.fillRect(b.x, groundY - b.height, b.width, b.height);
            if (env.lightOpacity > 0.3) {
                ctx.save(); ctx.fillStyle = 'hsl(48, 70%, 50%)'; ctx.globalAlpha = env.lightOpacity * 0.7;
                b.lightData.forEach(pos => ctx.fillRect(b.x + pos.c, groundY - b.height + pos.r, 15, 20)); ctx.restore();
            }
        } else if (b.type === 'tree') {
            const DAY_LEAF = [39, 174, 96], NIGHT_LEAF = [10, 40, 20], DAY_TRUNK = [141, 110, 99], NIGHT_TRUNK = [98, 77, 69];
            ctx.fillStyle = `rgb(${lerpColor(DAY_TRUNK, NIGHT_TRUNK, env.lightOpacity).join(',')})`; ctx.fillRect(b.x, groundY - b.height, b.width, b.height);
            ctx.fillStyle = `rgb(${lerpColor(DAY_LEAF, NIGHT_LEAF, env.lightOpacity).join(',')})`; ctx.fillRect(b.x - 20, groundY - b.height - 30, b.width + 40, 40);
        } else if (b.type === 'crosswalk') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; for(let i=0; i<b.stripes; i++) ctx.fillRect(b.x + i * 25, groundY + 5, 12, 30);
        }
    });
}

function triggerGameOver() {
    isGameOver = true; cars = []; if (score > highScore) highScore = score;
    gameOverMenu.classList.remove('hidden'); finalScoreText.innerText = score; pauseBtn.classList.add('hidden');
}

// ==========================================
// [로직 수정] 공격 조건(좌우 판정) 및 돌진
// ==========================================
function updateHawk() {
    if (isGameOver || isPaused || !isGameStarted) return;
    const gy = getGroundY();

    if (hawkState === 'none' && score >= lastHawkCheckScore) {
        let isGuaranteed = (lastHawkCheckScore === 800); 
        let spawnChance = isGuaranteed ? 1.0 : 0.4;

        if (Math.random() < spawnChance) {
            hawkState = 'patrolling'; 
            hawkX = canvas.width + 50; 
            hawkY = gy * 0.2; 
            
            hawkSpeed = (canvas.width + 200) / 360; 
            
            citySpeed *= 1.2; 
            isShortCarMode = true; 
        }
        lastHawkCheckScore += 100; 
    } 
    
    else if (hawkState === 'patrolling') {
        hawkX -= hawkSpeed; // 순찰 이동

        // [공격 트리거]
        // 1. 플레이어가 매보다 높거나 같음 (penguin.y <= hawkY)
        // 2. ★중요: 매가 플레이어보다 오른쪽(혹은 겹침)에 있어야 함 (hawkX >= penguin.x)
        if (penguin.y <= hawkY && penguin.visible && hawkX >= penguin.x) {
            hawkState = 'attacking'; // 공격 모드 전환
            hawkSpeed *= 1.5;        // [속도 50% 증가]
        }

        // 왼쪽 끝으로 사라지면 퇴장
        if (hawkX < -150) {
            hawkState = 'leaving';
        }
    } 
    
    // [돌진 모드] 플레이어 쪽으로 유도되어 날아감
    else if (hawkState === 'attacking') {
        // 플레이어 방향 벡터 계산
        let dx = penguin.x - hawkX;
        let dy = penguin.y - hawkY;
        let dist = Math.sqrt(dx*dx + dy*dy);

        // 해당 방향으로 가속된 속도로 이동
        hawkX += (dx / dist) * hawkSpeed;
        hawkY += (dy / dist) * hawkSpeed;

        // 플레이어와 충돌 시 납치
        if (dist < 40 && penguin.visible) {
            hawkState = 'carrying';
            penguin.visible = false;
        }
    }

    else if (hawkState === 'carrying') {
        hawkX -= hawkSpeed; 
        if (hawkX < -200) {
            triggerGameOver();
        }
    }

    else if (hawkState === 'leaving') {
        hawkState = 'none';
        isShortCarMode = false;
        citySpeed = BASE_CITY_SPEED;
    }
}

// ==========================================
// [그리기]
// ==========================================
function drawHawk() {
    if (hawkState === 'none') return;
    
    ctx.save(); 
    ctx.translate(hawkX, hawkY);
    
    const hawkWidth = 60;
    const hawkHeight = 40;

    // 공격 중(attacking)이거나 납치 중(carrying)일 때 회전
    if (hawkState === 'carrying' || hawkState === 'attacking') {
         let angle = Math.atan2(penguin.y - hawkY, penguin.x - hawkX);
         ctx.rotate(angle);
         if (Math.abs(angle) > Math.PI / 2) ctx.scale(1, -1);
    } 

    if (isHawkLoaded) {
        ctx.drawImage(hawkImage, -hawkWidth/2, -hawkHeight/2, hawkWidth, hawkHeight);
    } else {
        ctx.fillStyle = 'red';
        ctx.fillRect(-hawkWidth/2, -hawkHeight/2, hawkWidth, hawkHeight);
    }

    ctx.restore();
}

function updateCity() {
    if (isGameOver || !isGameStarted || isPaused) return;
    const gy = getGroundY();

    if (keys['Space'] && penguin.onRoad) { 
        penguin.dy = -penguin.jumpPower; 
        penguin.onRoad = false; 
        wasInAir = true; 

        // 점프 시 매 하강 폭 25픽셀
        if (hawkState === 'patrolling') {
            hawkY += 25; 
        }
    }
    
    penguin.dy += (keys['Space'] ? penguin.floatGravity : penguin.gravity);
    penguin.y += penguin.dy;
    if (penguin.y >= gy - penguin.height) { penguin.y = gy - penguin.height; penguin.dy = 0; penguin.onRoad = true; if (wasInAir) { score += 5; wasInAir = false; } }
    
    updateHawk();

    let fastMilestone = Math.floor(score / 500);
    if (fastMilestone > lastFastMilestone && !fastEventActive) {
        fastEventActive = true; lastFastMilestone = fastMilestone; fastEventTimer = 0;
        fastCarSpawnFrame = Math.floor(Math.random() * 60) + 120; 
    }

    if (fastEventActive) {
        fastEventTimer++;
        if (fastEventTimer === fastCarSpawnFrame) {
            cars.push(new Car(true, false, false)); 
        }
        if (fastEventTimer >= EVENT_DURATION) fastEventActive = false;
    } else {
        spawnTimer++;
        if (spawnTimer >= nextSpawnTime) {
            cars.push(new Car(false, isShortCarMode, isShortCarMode));
            spawnTimer = 0;
            let baseInterval = (longGapEnforceCount > 0) ? (Math.random() * 50 + 160) : (Math.random() * 120 + 90);
            if (baseInterval < 120) longGapEnforceCount = 2; else longGapEnforceCount = Math.max(0, longGapEnforceCount - 1);
            nextSpawnTime = baseInterval / (citySpeed / BASE_CITY_SPEED);
        }
    }

    cars.forEach((car, i) => {
        car.x -= (citySpeed + car.extraSpeed);
        if (!car.passed && car.x < penguin.x) { 
            car.passed = true; score += 5; obstaclesPassed++; 
            if(obstaclesPassed % 20 === 0 && score < 800) citySpeed *= 1.12; 
        }
        if (car.x < -200) cars.splice(i, 1);
        if (penguin.visible && penguin.x < car.x + car.carWidth - 10 && penguin.x + penguin.width > car.x + 10 && penguin.y + penguin.height > gy - 35) triggerGameOver();
    });
}

function drawPenguin() {
    if (!penguin.visible) return;
    const p = penguin, s = p.width / 8; 
    ctx.fillStyle = '#2c3e50'; ctx.fillRect(p.x, p.y, p.width, p.height);
    ctx.fillStyle = '#ecf0f1'; ctx.fillRect(p.x + s, p.y + s * 3, p.width - s * 2, p.height - s * 3.5);
    ctx.fillStyle = '#f39c12'; ctx.fillRect(p.x + p.width - s, p.y + s * 2.5, s * 1.5, s);
    ctx.fillStyle = 'white'; ctx.fillRect(p.x + p.width - s * 3, p.y + s * 1.5, s, s);
}

function animate() {
    const env = getEnvironmentState(); drawBackground(env);
    const groundY = getGroundY();
    let rc = lerpColor([149, 165, 166], [28, 40, 51], env.lightOpacity);
    ctx.fillStyle = `rgb(${rc.join(',')})`; ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    updateEnvironment(); drawRoadDetails();
    if (isGameStarted) {
        if (!isGameOver) { updateCity(); drawPenguin(); drawHawk(); cars.forEach(c => c.draw(env)); }
        ctx.save(); const scoreText = `점수: ${score}`;
        ctx.font = 'bold 30px Arial'; ctx.textAlign = 'left'; ctx.strokeStyle = 'black'; ctx.lineWidth = 5; 
        ctx.strokeText(scoreText, 20, 50); ctx.fillStyle = 'white'; ctx.fillText(scoreText, 20, 50); ctx.restore();
    }
    requestAnimationFrame(animate);
}

function handleInput(down) { if (isGameStarted && !isGameOver && !isPaused) keys['Space'] = down; }
window.addEventListener('keydown', (e) => { if (e.code === 'Space') { handleInput(true); e.preventDefault(); } if (e.code === 'Escape') togglePause(); });
window.addEventListener('keyup', (e) => { if (e.code === 'Space') handleInput(false); });
window.addEventListener('mousedown', (e) => { if(e.target === canvas) handleInput(true); });
window.addEventListener('mouseup', () => handleInput(false));
canvas.addEventListener('touchstart', (e) => { if(e.target === canvas) { handleInput(true); e.preventDefault(); } }, { passive: false });
window.addEventListener('touchend', () => handleInput(false));
resizeCanvas(); animate();
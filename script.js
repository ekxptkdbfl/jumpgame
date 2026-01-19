const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI 요소
const mainMenu = document.getElementById('main-menu');
const gameOverMenu = document.getElementById('game-over-menu');
const pauseMenu = document.getElementById('pause-menu');
const settingsMenu = document.getElementById('settings-menu');
const pauseBtn = document.getElementById('pause-button');
const soundBtn = document.getElementById('sound-button');
const finalScoreText = document.getElementById('final-score-val');

// 설정 버튼들
const toggleBgmBtn = document.getElementById('toggle-bgm-btn');
const toggleSfxBtn = document.getElementById('toggle-sfx-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');

// 언어 설정 요소
const languageBtn = document.getElementById('language-button');
const languageMenu = document.getElementById('language-menu');
const closeLanguageBtn = document.getElementById('close-language-btn');

// --- [다국어 지원 시스템] ---
const translations = {
    ko: {
        gameTitle1: '도시 탈출',
        gameTitle2: '펭귄',
        startButton: '게임 시작',
        landscapeHint: '가로 화면 장려',
        pauseTitle: '일시정지',
        continueButton: '이어하기',
        restartButton: '재시작',
        homeButton: '메인으로',
        gameOverTitle: '게임 오버',
        scoreLabel: '점수:',
        restartButtonAlt: '다시 시작',
        exitButton: '메인으로',
        soundSettingsTitle: '소리 설정',
        bgmToggle: '배경음악:',
        sfxToggle: '효과음:',
        closeButton: '닫기',
        onText: 'ON',
        offText: 'OFF',
        languageSettingsTitle: '언어 설정',
        highScoreLabel: '최고기록:'
    },
    en: {
        gameTitle1: 'Penguin',
        gameTitle2: 'Run',
        startButton: 'Start Game',
        landscapeHint: 'Landscape mode recommended',
        pauseTitle: 'Paused',
        continueButton: 'Continue',
        restartButton: 'Restart',
        homeButton: 'Main Menu',
        gameOverTitle: 'Game Over',
        scoreLabel: 'Score:',
        restartButtonAlt: 'Play Again',
        exitButton: 'Main Menu',
        soundSettingsTitle: 'Sound Settings',
        bgmToggle: 'BGM:',
        sfxToggle: 'SFX:',
        closeButton: 'Close',
        onText: 'ON',
        offText: 'OFF',
        languageSettingsTitle: 'Language',
        highScoreLabel: 'Best:'
    },
    ja: {
        gameTitle1: 'ペンギン',
        gameTitle2: 'ラン',
        startButton: 'スタート',
        landscapeHint: '横画面推奨',
        pauseTitle: '一時停止',
        continueButton: '続ける',
        restartButton: 'やり直し',
        homeButton: 'ホーム画面',
        gameOverTitle: 'ゲームオーバー',
        scoreLabel: 'スコア:',
        restartButtonAlt: 'もう一度',
        exitButton: 'ホーム画面',
        soundSettingsTitle: 'サウンド',
        bgmToggle: 'BGM:',
        sfxToggle: '効果音:',
        closeButton: '閉じる',
        onText: 'ON',
        offText: 'OFF',
        languageSettingsTitle: '言語',
        highScoreLabel: 'ベスト:'
    }
};

// 현재 언어 (localStorage에서 불러오기, 기본값: 영어)
let currentLanguage = localStorage.getItem('penguinLanguage') || 'en';

function updateLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('penguinLanguage', lang);
    const t = translations[lang];

    // 메인 메뉴
    document.getElementById('game-title-1').innerText = t.gameTitle1;
    document.getElementById('game-title-2').innerText = t.gameTitle2;
    document.getElementById('start-button').innerText = t.startButton;
    document.getElementById('landscape-hint').innerText = t.landscapeHint;

    // 일시정지 메뉴
    document.getElementById('pause-title').innerText = t.pauseTitle;
    document.getElementById('continue-button').innerText = t.continueButton;
    document.getElementById('restart-pause-button').innerText = t.restartButton;
    document.getElementById('home-button-text').innerText = t.homeButton;

    // 게임 오버 메뉴
    document.getElementById('game-over-title').innerText = t.gameOverTitle;
    document.getElementById('score-label').innerText = t.scoreLabel;
    document.getElementById('restart-button').innerText = t.restartButtonAlt;
    document.getElementById('exit-to-main-button').innerText = t.exitButton;

    // 소리 설정 메뉴
    document.getElementById('sound-settings-title').innerText = t.soundSettingsTitle;
    toggleBgmBtn.innerText = `${t.bgmToggle} ${isBgmMuted ? t.offText : t.onText}`;
    toggleSfxBtn.innerText = `${t.sfxToggle} ${isSfxMuted ? t.offText : t.onText}`;
    document.getElementById('close-settings-btn').innerText = t.closeButton;

    // 언어 설정 메뉴
    document.getElementById('language-menu-title').innerText = t.languageSettingsTitle;
    document.getElementById('close-language-btn').innerText = t.closeButton;
}

// 언어 메뉴 이벤트
languageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    languageMenu.classList.remove('hidden');
});

closeLanguageBtn.addEventListener('click', () => {
    languageMenu.classList.add('hidden');
});

document.getElementById('lang-ko').addEventListener('click', () => {
    updateLanguage('ko');
    languageMenu.classList.add('hidden');
});

document.getElementById('lang-en').addEventListener('click', () => {
    updateLanguage('en');
    languageMenu.classList.add('hidden');
});

document.getElementById('lang-ja').addEventListener('click', () => {
    updateLanguage('ja');
    languageMenu.classList.add('hidden');
});

// --- [오디오 시스템] ---
const bgmAudio = new Audio('bgm.mp3');
bgmAudio.loop = true;
bgmAudio.volume = 0.5;

const jumpAudio = new Audio('jump.mp3');
const gameOverAudio = new Audio('gameover.mp3');
const hawkAudio = new Audio('hawk.mp3');

// 오디오 상태 변수
let isBgmMuted = false;
let isSfxMuted = false;

// --- [초기화: 메인 화면 소리 재생] ---
function initAudioContext() {
    if (!isBgmMuted && bgmAudio.paused) {
        bgmAudio.play().catch(e => { });
    }
    document.removeEventListener('click', initAudioContext);
    document.removeEventListener('keydown', initAudioContext);
}
document.addEventListener('click', initAudioContext);
document.addEventListener('keydown', initAudioContext);

// --- [화면 가시성 변경 시 배경음악 제어] ---
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        bgmAudio.pause();
    } else {
        if (!isBgmMuted && isGameStarted && !isGameOver) {
            bgmAudio.play().catch(e => { });
        } else if (!isBgmMuted && !isGameStarted) {
            bgmAudio.play().catch(e => { });
        }
    }
});


// --- [UI 이벤트 리스너] ---
document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('restart-button').addEventListener('click', startGame);
document.getElementById('restart-pause-button').addEventListener('click', startGame);
document.getElementById('continue-button').addEventListener('click', () => {
    isPaused = false;
    pauseMenu.classList.add('hidden');
    soundBtn.classList.add('hidden');
});
document.getElementById('home-button').addEventListener('click', goToMain);
document.getElementById('exit-to-main-button').addEventListener('click', goToMain);
pauseBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePause(); });

// [소리 설정 관련 로직]
soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsMenu.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
    settingsMenu.classList.add('hidden');
});

toggleBgmBtn.addEventListener('click', () => {
    isBgmMuted = !isBgmMuted;
    bgmAudio.muted = isBgmMuted;

    if (!isBgmMuted && bgmAudio.paused) {
        bgmAudio.play().catch(e => { });
    }

    const t = translations[currentLanguage];
    toggleBgmBtn.innerText = `${t.bgmToggle} ${isBgmMuted ? t.offText : t.onText}`;
    toggleBgmBtn.style.backgroundColor = isBgmMuted ? '#e74c3c' : '#f39c12';
});

toggleSfxBtn.addEventListener('click', () => {
    isSfxMuted = !isSfxMuted;
    jumpAudio.muted = isSfxMuted;
    gameOverAudio.muted = isSfxMuted;
    hawkAudio.muted = isSfxMuted;
    const t = translations[currentLanguage];
    toggleSfxBtn.innerText = `${t.sfxToggle} ${isSfxMuted ? t.offText : t.onText}`;
    toggleSfxBtn.style.backgroundColor = isSfxMuted ? '#e74c3c' : '#f39c12';
});

// --- [게임 변수] ---
let score = 0;
let obstaclesPassed = 0;

// [최고점수 불러오기]
let highScore = Number(localStorage.getItem('penguinHighScore')) || 0;

const BASE_CITY_SPEED = 4.632; // 20% 증가 (3.86 → 4.632)
let citySpeed = BASE_CITY_SPEED;
let isGameOver = false;
let isGameStarted = false;
let isPaused = false;
let keys = {};
let jumpReleased = true; // 점프 입력 해제 여부 (연속 점프 방지)
let roadOffset = 0;

let targetEnv = 0; let currentEnv = 0;
let spawnTimer = 0; let nextSpawnTime = 150; let longGapEnforceCount = 0;
let fastEventActive = false; let fastEventTimer = 0; const EVENT_DURATION = 360;
let fastCarSpawnFrame = 0; let lastFastMilestone = 0;

// --- [매 습격 시스템 변수] ---
let hawkState = 'none';
let lastHawkCheckScore = 800;
let isShortCarMode = false;
let hawkX = 0, hawkY = 0;
let hawkSpeed = 5;
// [추가됨] 매 활동 시간 타이머 (반응 지연용)
let hawkActiveTimer = 0;

const hawkImage = new Image();
hawkImage.src = 'hawk.png';
let isHawkLoaded = false;
hawkImage.onload = function () { isHawkLoaded = true; };

let wasInAir = false;
let buildings = []; let backBuildings = []; let stars = []; let clouds = []; let cars = [];
const cloudShapes = [[[0, 0, 120, 40], [30, -20, 80, 40]], [[0, 0, 150, 30], [20, 20, 100, 25]], [[0, 0, 80, 50], [15, -25, 50, 40]], [[0, 0, 60, 30], [40, 15, 50, 25]], [[0, 0, 130, 45], [25, -25, 90, 35]]];

let penguin = {
    x: 0, y: 0, width: 40, height: 40, dy: 0,
    jumpPower: 8.36,    // 체공 시간 10% 증가 (9.2 -> 8.36)
    gravity: 0.384,     // 체공 시간 10% 증가 (0.465 -> 0.384)
    floatGravity: 0.256, // 부유감 조정 (0.31 -> 0.256)
    onRoad: true, visible: true
};

// [화면 크기 비례 스케일링 변수]
let gameScale = 1;
let logicalWidth = 0;
let logicalHeight = 0;
const BASE_HEIGHT = 450; // 기준 높이 (모바일 가로 모드 기준)

function getGroundY() {
    // 논리적 높이 기준으로 바닥 위치 계산
    const limitedHeight = Math.min(logicalHeight, 1440);
    return limitedHeight * 0.7 + (logicalHeight > 1440 ? (logicalHeight - 1440) : 0);
}

function resizeCanvas() {
    const container = document.body;

    // [모바일 선명도 개선] devicePixelRatio 적용
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    // [스케일 계산]
    gameScale = displayHeight / BASE_HEIGHT;
    // 너무 작아지거나 커지지 않도록 최소/최대 제한 (선택사항, 일단 제한 없이 적용)

    logicalWidth = displayWidth / gameScale;
    logicalHeight = displayHeight / gameScale;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // 변환 초기화
    ctx.scale(dpr * gameScale, dpr * gameScale); // DPR * 게임 스케일 적용

    // [모바일 화질 개선] 캔버스 렌더링 품질 설정
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 펭귄 크기 고정 (40px) - 스케일이 적용되므로 시각적으로는 커짐
    penguin.width = penguin.height = 40;

    // 펭귄 초기 위치 (논리적 좌표계 사용)
    penguin.x = logicalWidth * 0.20;
    const groundY = getGroundY();
    if (penguin.onRoad) penguin.y = groundY - penguin.height;

    initBackground();
}
window.addEventListener('resize', resizeCanvas);

function initBackground() {
    const groundY = getGroundY();
    backBuildings = []; buildings = []; stars = []; clouds = [];
    // 화면 너비 대신 logicalWidth 사용
    for (let i = 0; i < Math.ceil(logicalWidth / 80) + 5; i++) addBackBuilding(i * 80);
    for (let i = 0; i < Math.ceil(logicalWidth / 50) + 5; i++) addForegroundObject(i * 60);
    for (let i = 0; i < 60; i++) stars.push({ x: Math.random() * logicalWidth, y: Math.random() * groundY, size: Math.random() * 2 + 1, phase: Math.random() * Math.PI * 2 });
    for (let i = 0; i < 8; i++) spawnCloud(Math.random() * logicalWidth);
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
        // [크기는 고정, 속도만 스케일]
        this.carWidth = isMotorcycle ? 60 : (isFast ? 100 : (Math.random() > 0.5 ? 130 : 80));
        this.height = 40;
        this.x = logicalWidth + 100;
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
            ctx.beginPath(); ctx.arc(10, 30, 10, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(50, 30, 10, 0, Math.PI * 2); ctx.fill();
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
    soundBtn.classList.remove('hidden');
    languageBtn.classList.remove('hidden');

    if (score > highScore) highScore = score;

    if (!isBgmMuted && bgmAudio.paused) {
        bgmAudio.play().catch(e => { });
    }
}

function togglePause() {
    if (!isGameStarted || isGameOver) return;
    isPaused = !isPaused;
    if (isPaused) {
        pauseMenu.classList.remove('hidden');
        soundBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
    } else {
        pauseMenu.classList.add('hidden');
        soundBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
    }
}

function startGame() {
    if (window.innerWidth <= 768) requestFullScreen();
    mainMenu.classList.add('hidden'); gameOverMenu.classList.add('hidden'); pauseMenu.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    soundBtn.classList.add('hidden');
    languageBtn.classList.add('hidden');

    isGameStarted = true; isPaused = false;

    if (!isBgmMuted && bgmAudio.paused) {
        bgmAudio.play().catch(e => console.log("재생 정책 확인"));
    }

    resetCityGame();
}

function resetCityGame() {
    score = 0; obstaclesPassed = 0; cars = []; roadOffset = 0;
    spawnTimer = 0; fastEventTimer = 0; fastEventActive = false; lastFastMilestone = 0;
    targetEnv = 0; currentEnv = 0;
    nextSpawnTime = 150; longGapEnforceCount = 0;
    citySpeed = BASE_CITY_SPEED;

    hawkState = 'none'; hawkTimer = 0; isShortCarMode = false; lastHawkCheckScore = 800;
    hawkActiveTimer = 0; // [추가됨] 타이머 초기화
    hawkSpeed = 6;

    penguin.visible = true;
    isGameOver = false; isPaused = false; wasInAir = false;
    keys = {}; jumpReleased = true; // 입력 상태 초기화
    resizeCanvas();
}

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
    clouds.forEach(c => { c.x -= c.speed; if (c.x < -250) c.x = logicalWidth + 100; });
    backBuildings.forEach(b => { b.x -= citySpeed * 0.08; if (b.x < -200) b.x = logicalWidth + 100; });
    buildings.forEach(b => { b.x -= citySpeed * 0.2; if (b.x < -200) b.x = logicalWidth + 200; });
}

function drawRoadDetails() {
    const groundY = getGroundY();
    const centerY = groundY + (logicalHeight - groundY) * 0.45;
    ctx.save(); ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.lineWidth = 12; ctx.setLineDash([40, 40]);
    ctx.beginPath(); ctx.moveTo(-roadOffset, centerY); ctx.lineTo(logicalWidth + 80, centerY); ctx.stroke(); ctx.restore();
}

function drawBackground(env) {
    const groundY = getGroundY();
    ctx.fillStyle = env.bg; ctx.fillRect(0, 0, logicalWidth, logicalHeight);
    if (env.lightOpacity > 0.1) stars.forEach(s => {
        ctx.fillStyle = `rgba(255, 255, 255, ${env.lightOpacity * (0.3 + Math.abs(Math.sin(Date.now() / 1000 + s.phase) * 0.6))})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(logicalWidth - 200, env.sunY, 60, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(logicalWidth - 200, env.moonY, 65, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = env.bg; ctx.beginPath(); ctx.arc(logicalWidth - 160, env.moonY - 20, 65, 0, Math.PI * 2); ctx.fill(); ctx.restore();
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
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; for (let i = 0; i < b.stripes; i++) ctx.fillRect(b.x + i * 25, groundY + 5, 12, 30);
        }
    });
}

function triggerGameOver() {
    isGameOver = true; cars = [];

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('penguinHighScore', highScore);
    }

    gameOverMenu.classList.remove('hidden'); finalScoreText.innerText = score; pauseBtn.classList.add('hidden');
    soundBtn.classList.remove('hidden');

    if (!isSfxMuted) {
        gameOverAudio.currentTime = 0;
        gameOverAudio.play();
    }
}

// ==========================================
// [로직] 매: 계산된 높이 + 4번째 점프 필살
// ==========================================
function updateHawk() {
    if (isGameOver || isPaused || !isGameStarted) return;
    const gy = getGroundY();

    if (hawkState === 'none' && score >= lastHawkCheckScore) {
        let isGuaranteed = (lastHawkCheckScore === 800);
        let spawnChance = isGuaranteed ? 1.0 : 0.4;

        if (Math.random() < spawnChance) {
            hawkState = 'patrolling';

            // [X 위치]
            hawkX = logicalWidth + 50;

            // [Y 위치 계산]
            const maxJumpHeight = (penguin.jumpPower * penguin.jumpPower) / (2 * penguin.gravity);
            const playerApexY = gy - penguin.height - maxJumpHeight;
            hawkY = playerApexY - 102; // 100 → 102 (점프 높이 변경 보정, 매 절대 위치 유지)

            hawkSpeed = (logicalWidth + 200) / 360;
            citySpeed *= 1.2;
            isShortCarMode = true;

            // [추가됨] 스폰 시 타이머 초기화
            hawkActiveTimer = 0;
        }
        lastHawkCheckScore += 100;
    }

    else if (hawkState === 'patrolling') {
        hawkX -= hawkSpeed;

        // [추가됨] 매 활동 타이머 증가
        hawkActiveTimer++;

        // [공격 트리거] 매가 화면에 보이고, 플레이어 높이가 매 높이 이상일 때만 공격
        if (penguin.y <= hawkY && penguin.visible && hawkX >= penguin.x && hawkX < logicalWidth) {
            hawkState = 'attacking';
            hawkSpeed *= 1.5;

            if (!isSfxMuted) {
                hawkAudio.currentTime = 0;
                hawkAudio.play();
            }
        }

        if (hawkX < -150) {
            hawkState = 'leaving';
        }
    }

    else if (hawkState === 'attacking') {
        let dx = penguin.x - hawkX;
        let dy = penguin.y - hawkY;
        let dist = Math.sqrt(dx * dx + dy * dy);

        hawkX += (dx / dist) * hawkSpeed;
        hawkY += (dy / dist) * hawkSpeed;

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

function drawHawk() {
    if (hawkState === 'none') return;

    const displayWidth = window.innerWidth;

    // [레이저 경고선] 매가 순찰 중일 때 앞쪽에 깜빡이는 레이저 표시
    if (hawkState === 'patrolling') {
        ctx.save();
        // 깜빡임 효과 (sin 함수로 투명도 변화)
        const blink = 0.2 + Math.abs(Math.sin(Date.now() / 100)) * 0.3;
        ctx.strokeStyle = `rgba(255, 30, 30, ${blink})`;
        ctx.lineWidth = 8;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(0, hawkY);
        ctx.lineTo(hawkX - 30, hawkY); // 매 앞쪽까지만
        ctx.stroke();
        ctx.restore();
    }

    ctx.save();
    ctx.translate(hawkX, hawkY);

    const hawkWidth = 60;
    const hawkHeight = 40;

    if (hawkState === 'carrying' || hawkState === 'attacking') {
        let angle = Math.atan2(penguin.y - hawkY, penguin.x - hawkX);
        ctx.rotate(angle);
        if (Math.abs(angle) > Math.PI / 2) ctx.scale(1, -1);
    }

    if (isHawkLoaded) {
        ctx.drawImage(hawkImage, -hawkWidth / 2, -hawkHeight / 2, hawkWidth, hawkHeight);
    } else {
        ctx.fillStyle = 'red';
        ctx.fillRect(-hawkWidth / 2, -hawkHeight / 2, hawkWidth, hawkHeight);
    }

    ctx.restore();
}

function updateCity() {
    if (isGameOver || !isGameStarted || isPaused) return;
    const gy = getGroundY();

    if (keys['Space'] && penguin.onRoad && jumpReleased) {
        penguin.dy = -penguin.jumpPower;
        penguin.onRoad = false;
        wasInAir = true;
        jumpReleased = false; // 점프 후 해제 필요

        if (!isSfxMuted) {
            jumpAudio.currentTime = 0;
            jumpAudio.play();
        }

        // [점프 로직 수정] 매가 화면에 보이고, 플레이어보다 오른쪽에 있을 때만 반응
        if (hawkState === 'patrolling' && hawkX < logicalWidth && hawkX > penguin.x) {
            hawkY += 8; // 8픽셀 하강
        }
    }

    penguin.dy += (keys['Space'] ? penguin.floatGravity : penguin.gravity);
    penguin.y += penguin.dy;
    if (penguin.y >= gy - penguin.height) { penguin.y = gy - penguin.height; penguin.dy = 0; penguin.onRoad = true; if (wasInAir) { score += 5; wasInAir = false; } }

    updateHawk();

    let fastMilestone = Math.floor(score / 500);
    if (fastMilestone > lastFastMilestone && !fastEventActive) {
        fastEventActive = true; lastFastMilestone = fastMilestone; fastEventTimer = 0;
        fastCarSpawnFrame = Math.floor(Math.random() * 60) + 180;
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
            if (obstaclesPassed % 20 === 0 && score < 800) citySpeed *= 1.12;
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
    ctx.fillStyle = `rgb(${rc.join(',')})`; ctx.fillRect(0, groundY, logicalWidth, logicalHeight - groundY);
    updateEnvironment(); drawRoadDetails();
    if (isGameStarted) {
        if (!isGameOver) { updateCity(); drawPenguin(); drawHawk(); cars.forEach(c => c.draw(env)); }
        ctx.save();
        const t = translations[currentLanguage];
        const scoreText = `${t.scoreLabel} ${score}`;
        ctx.font = 'bold 30px Arial'; ctx.textAlign = 'left'; ctx.strokeStyle = 'black'; ctx.lineWidth = 5;
        ctx.strokeText(scoreText, 20, 50); ctx.fillStyle = 'white'; ctx.fillText(scoreText, 20, 50);

        // [최고점수 표시]
        const highScoreText = `${t.highScoreLabel} ${highScore}`;
        ctx.font = 'bold 20px Arial';
        ctx.strokeText(highScoreText, 20, 80);
        ctx.fillStyle = 'white';
        ctx.fillText(highScoreText, 20, 80);

        ctx.restore();
    }
    requestAnimationFrame(animate);
}

function handleInput(down) {
    if (isGameStarted && !isGameOver && !isPaused) {
        keys['Space'] = down;
        if (!down) jumpReleased = true; // 키를 떼면 다시 점프 가능
    }
}
window.addEventListener('keydown', (e) => { if (e.code === 'Space') { handleInput(true); e.preventDefault(); } if (e.code === 'Escape') togglePause(); });
window.addEventListener('keyup', (e) => { if (e.code === 'Space') handleInput(false); });
canvas.addEventListener('mousedown', (e) => { handleInput(true); e.preventDefault(); });
canvas.addEventListener('mouseup', (e) => { handleInput(false); e.preventDefault(); });
canvas.addEventListener('touchstart', (e) => { if (e.target === canvas) { handleInput(true); e.preventDefault(); } }, { passive: false });
canvas.addEventListener('touchend', () => handleInput(false), { passive: false });
resizeCanvas(); updateLanguage(currentLanguage); animate();
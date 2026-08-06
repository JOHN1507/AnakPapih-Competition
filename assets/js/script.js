// --- AUTHENTICATION & LOGIN GUARD ---
function checkAuth() {
    const path = window.location.pathname;
    const isLoggedIn = sessionStorage.getItem("userLoggedIn") === "true";
    const isLoginPage = path.includes("login.html");

    if (!isLoggedIn && !isLoginPage) {
        window.location.href = "login.html";
        return false;
    }
    
    if (isLoggedIn && isLoginPage) {
        window.location.href = "index.html";
        return true;
    }

    return isLoggedIn;
}

function handleLogin(event) {
    if (event) event.preventDefault();
    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");
    const errorMsg = document.getElementById("login-error");

    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (!username || !password) {
        if (errorMsg) {
            errorMsg.textContent = "Username dan Password wajib diisi!";
            errorMsg.style.display = "block";
        }
        return;
    }

    // Login Sukses
    sessionStorage.setItem("userLoggedIn", "true");
    sessionStorage.setItem("username", username);
    window.location.href = "index.html";
}

function handleLogout() {
    sessionStorage.removeItem("userLoggedIn");
    sessionStorage.removeItem("username");
    window.location.href = "login.html";
}

// --- PROTECTION FOR GAME ARENA ---
function checkArenaAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    // Pastikan user sudah login dulu sebelum memproses game arena
    if (!checkAuth()) return;

    // Jika sedang di pos1.html, cek apakah URL memiliki ?key=protokol17
    if (path.includes("pos1.html")) {
        if (urlParams.get('key') === 'protokol17') {
            sessionStorage.setItem("unlocked", "true"); // Berikan akses
            // Bersihkan URL parameter agar terlihat rapi
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Berikan ucapan selamat (Easter Egg found)
            setTimeout(() => {
                alert("SYSTEM OVERRIDE SUCCESSFUL\n\nSelamat! Anda berhasil memecahkan teka-teki URL dan menemukan Easter Egg Protokol 17. Selamat datang di Server Rahasia Anak Papih!");
            }, 500);
        }
    }

    if (sessionStorage.getItem("unlocked") !== "true") {
        alert("Akses Ditolak! Anda harus menemukan portal rahasia yang asli.");
        window.location.href = "index.html";
        return;
    }
    
    // Cek Akses Berurutan
    if (path.includes("pos2.html") && sessionStorage.getItem("pos2Unlocked") !== "true") {
        alert("Akses Ditolak! Selesaikan Pos 1 terlebih dahulu.");
        window.location.href = "pos1.html";
        return;
    }
    
    if (path.includes("pos3.html") && sessionStorage.getItem("pos3Unlocked") !== "true") {
        alert("Akses Ditolak! Selesaikan Pos 2 terlebih dahulu.");
        window.location.href = "pos2.html";
        return;
    }

    // Update UI Navbar agar yang terkunci jadi abu-abu
    updateNavbarUI();
}

function updateNavbarUI() {
    const pos2Unlocked = sessionStorage.getItem("pos2Unlocked") === "true";
    const pos3Unlocked = sessionStorage.getItem("pos3Unlocked") === "true";
    
    const links = document.querySelectorAll('.game-nav .nav-links a');
    links.forEach(link => {
        if (link.textContent.includes("Pos 2") && !pos2Unlocked) {
            link.classList.add("locked-link");
            link.removeAttribute("href");
            link.onclick = function(e) { e.preventDefault(); alert("Pos 2 masih terkunci! Selesaikan Pos 1 dulu."); };
        }
        if (link.textContent.includes("Pos 3") && !pos3Unlocked) {
            link.classList.add("locked-link");
            link.removeAttribute("href");
            link.onclick = function(e) { e.preventDefault(); alert("Pos 3 masih terkunci! Selesaikan Pos 2 dulu."); };
        }
    });
}

// --- FAKE CLUES LOGIC ---
function showFakeToast() {
    showToast("Itu jebakan! Cari 2 huruf berurutan di setiap halaman menu.");
}

function showFakeLogin() {
    alert("Hayo! Jangan curang! Admin sedang pantau kamu.");
}

function showToast(message) {
    let toast = document.getElementById("toast");
    if(!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = "toast show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}



// ==========================================
// --- REVEAL SECRETS LOGIC (DECOY TO GAME) ---
// ==========================================

function revealPos1() {
    document.querySelectorAll('.decoy-element').forEach(el => el.style.display = 'none');
    document.getElementById('arena-nav').classList.add('game-nav');
    document.getElementById('ctf-game').classList.remove('hidden');
    document.body.classList.add('active-game-bg');
}

function revealPos2() {
    document.querySelectorAll('.decoy-element').forEach(el => el.style.display = 'none');
    document.getElementById('arena-nav').classList.add('game-nav');
    document.body.classList.add('active-game-bg');
    
    // Langsung mulai game saat rahasia diklik!
    startKerupukGameFullScreen();
}

function revealPos3() {
    document.querySelectorAll('.decoy-element').forEach(el => el.style.display = 'none');
    document.getElementById('arena-nav').classList.add('game-nav');
    document.getElementById('ctf-game').classList.remove('hidden');
    document.body.classList.add('active-game-bg');
}


// ==========================================
// --- GAME LOGIC ---
// ==========================================

// --- POS 1 LOGIC (Balap Karung) ---
let clicks = 0;
let gameStarted = false;
let gameEnded = false;
let timeLeft = 5.0;
let timerInterval;

function jump() {
    if (gameEnded) return;
    
    if (!gameStarted) {
        gameStarted = true;
        timerInterval = setInterval(updateTimer, 100);
    }
    
    clicks++;
    const jumpCount = document.getElementById('jump-count');
    if(jumpCount) jumpCount.textContent = clicks;
    
    if (clicks >= 17 && timeLeft > 0) {
        winStage1();
    }
}

function updateTimer() {
    timeLeft -= 0.1;
    const timeLeftEl = document.getElementById('time-left');
    if(timeLeftEl) timeLeftEl.textContent = Math.max(0, timeLeft).toFixed(1);
    
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        if (clicks < 17) {
            loseStage1();
        }
    }
}

function winStage1() {
    gameEnded = true;
    clearInterval(timerInterval);
    document.getElementById('jump-btn').disabled = true;
    document.getElementById('stage-1-success').classList.remove('hidden');
    
    // Buka akses Pos 2
    sessionStorage.setItem("pos2Unlocked", "true");
    updateNavbarUI();
}

function loseStage1() {
    gameEnded = true;
    document.getElementById('jump-btn').disabled = true;
    const errorEl = document.getElementById('error-game');
    errorEl.textContent = 'Waktu habis! Kamu kurang cepat.';
    
    setTimeout(() => {
        clicks = 0;
        timeLeft = 5.0;
        gameStarted = false;
        gameEnded = false;
        document.getElementById('jump-count').textContent = '0';
        document.getElementById('time-left').textContent = '5.0';
        document.getElementById('jump-btn').disabled = false;
        errorEl.textContent = '';
    }, 2000);
}

// --- POS 2 LOGIC (Makan Kerupuk Full Screen) ---
let kClicks = 0;
let kTimeLeft = 15.0;
let kTimerInterval;
let kMoveInterval;
let kGameEnded = true;

function startKerupukGameFullScreen() {
    kClicks = 0;
    kTimeLeft = 15.0;
    kGameEnded = false;
    
    document.getElementById('k-score').textContent = '0';
    document.getElementById('k-time').textContent = '15.0';
    
    document.getElementById('kerupuk-full-screen').classList.remove('hidden');
    
    kTimerInterval = setInterval(updateKTimer, 100);
    kMoveInterval = setInterval(moveKerupukFullScreen, 1000); // Bergerak setiap 1 detik
    moveKerupukFullScreen(); 
}

function moveKerupukFullScreen() {
    if (kGameEnded) return;
    const kerupuk = document.getElementById('flying-kerupuk');
    
    const maxX = window.innerWidth - 100;
    const maxY = window.innerHeight - 100;
    
    const randomX = Math.floor(Math.random() * maxX) + 50;
    const randomY = Math.floor(Math.random() * maxY) + 50;
    
    kerupuk.style.left = `${randomX}px`;
    kerupuk.style.top = `${randomY}px`;
}

function biteKerupuk() {
    if (kGameEnded) return;
    kClicks++;
    document.getElementById('k-score').textContent = kClicks;
    
    const kerupuk = document.getElementById('flying-kerupuk');
    kerupuk.style.transform = `translate(-50%, -50%) scale(${1 - (kClicks * 0.05)})`;
    
    moveKerupukFullScreen();
    
    if (kClicks >= 10 && kTimeLeft > 0) {
        winKerupuk();
    }
}

function updateKTimer() {
    kTimeLeft -= 0.1;
    document.getElementById('k-time').textContent = Math.max(0, kTimeLeft).toFixed(1);
    
    if (kTimeLeft <= 0) {
        if (kClicks < 10) {
            loseKerupuk();
        }
    }
}

function winKerupuk() {
    kGameEnded = true;
    clearInterval(kTimerInterval);
    clearInterval(kMoveInterval);
    
    document.getElementById('kerupuk-full-screen').classList.add('hidden');
    const pos2Intro = document.querySelector('.pos2-intro');
    if (pos2Intro) pos2Intro.classList.remove('hidden');
    
    // Buka akses Pos 3
    sessionStorage.setItem("pos3Unlocked", "true");
    updateNavbarUI();
}

function loseKerupuk() {
    kGameEnded = true;
    clearInterval(kTimerInterval);
    clearInterval(kMoveInterval);
    
    alert("Waktu habis! Kerupuk gagal ditangkap. Coba lagi dari awal.");
    
    // Kembalikan ke halaman decoy
    document.getElementById('kerupuk-full-screen').classList.add('hidden');
    document.querySelectorAll('.decoy-element').forEach(el => el.style.display = 'block');
    document.getElementById('arena-nav').classList.remove('game-nav');
    document.body.classList.remove('active-game-bg');
    
    // Reset kerupuk
    document.getElementById('flying-kerupuk').style.transform = 'translate(-50%, -50%) scale(1)';
}

// --- POS 3 LOGIC (Tarik Tambang) ---
let tPower = 50;
let tGameEnded = true;
let tInterval;

function startTambangGame() {
    tPower = 50;
    tGameEnded = false;
    document.getElementById('t-score').textContent = tPower;
    document.getElementById('t-progress').style.width = '50%';
    document.getElementById('error-stage-3').textContent = '';
    
    document.getElementById('start-t-btn').classList.add('hidden');
    document.getElementById('pull-btn').classList.remove('hidden');
    
    tInterval = setInterval(opponentPull, 150);
}

function opponentPull() {
    if (tGameEnded) return;
    tPower -= 2;
    updateTambangUI();
    
    if (tPower <= 0) {
        loseTambang();
    }
}

function pullTambang() {
    if (tGameEnded) return;
    tPower += 5;
    updateTambangUI();
    
    if (tPower >= 100) {
        winTambang();
    }
}

function updateTambangUI() {
    if (tPower < 0) tPower = 0;
    if (tPower > 100) tPower = 100;
    
    document.getElementById('t-score').textContent = tPower;
    document.getElementById('t-progress').style.width = `${tPower}%`;
}

function winTambang() {
    tGameEnded = true;
    clearInterval(tInterval);
    document.getElementById('pull-btn').classList.add('hidden');
    document.getElementById('stage-3-success').classList.remove('hidden');
}

function loseTambang() {
    tGameEnded = true;
    clearInterval(tInterval);
    
    document.getElementById('pull-btn').classList.add('hidden');
    document.getElementById('error-stage-3').textContent = 'Kamu kalah kuat! Coba spam klik lebih cepat.';
    
    setTimeout(() => {
        document.getElementById('start-t-btn').classList.remove('hidden');
        document.getElementById('error-stage-3').textContent = '';
        document.getElementById('t-progress').style.width = '50%';
        document.getElementById('t-score').textContent = '50';
    }, 2500);
}

// --- Confetti Logic ---
function triggerConfetti() {
    const container = document.querySelector('.confetti-container');
    if(!container) return;
    const emojis = ['🎉', '🎆', '🎊', '✨', '🇮🇩'];
    
    setInterval(() => {
        const emoji1 = emojis[Math.floor(Math.random() * emojis.length)];
        const emoji2 = emojis[Math.floor(Math.random() * emojis.length)];
        const emoji3 = emojis[Math.floor(Math.random() * emojis.length)];
        container.innerHTML = `${emoji1} ${emoji2} ${emoji3}`;
    }, 500);
}


// --- DARK/LIGHT MODE LOGIC ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const toggleBtn = document.getElementById('theme-toggle');
        if(toggleBtn) toggleBtn.textContent = '☀️';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const toggleBtn = document.getElementById('theme-toggle');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        if(toggleBtn) toggleBtn.textContent = '☀️';
    } else {
        localStorage.setItem('theme', 'light');
        if(toggleBtn) toggleBtn.textContent = '🌙';
    }
}

document.addEventListener("DOMContentLoaded", function() {
    initTheme();
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }
    checkAuth();
});
// --- HAMBURGER MENU LOGIC ---
document.addEventListener("DOMContentLoaded", function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });
    }
});
// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAJ13dyJ2VrWzVbWIw0B1lVNGWFwrp38YI",
  authDomain: "anakpapih.firebaseapp.com",
  projectId: "anakpapih",
  storageBucket: "anakpapih.firebasestorage.app",
  messagingSenderId: "959243287210",
  appId: "1:959243287210:web:4f9f46a48199e95bd8aed3",
  databaseURL: "https://anakpapih-default-rtdb.firebaseio.com"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

function checkAuth() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    const isLoggedIn = sessionStorage.getItem("userLoggedIn") === "true";

    const publicPages = [
        "index.html",
        "login.html",
        "hijacked.html",
        "pos1.html",
        "pos2.html",
        "pos3.html",
        "menang.html"
    ];

    const isPublicPage = publicPages.includes(path) || path === "";

    if (!isLoggedIn && !isPublicPage) {
        sessionStorage.clear();
        window.location.href = "login.html";
        return false;
    }

    if (isLoggedIn && path === "login.html") {
        window.location.href = "dashboard.html";
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

    if (typeof firebase === 'undefined') {
        // Fallback jika tidak ada koneksi
        if (password === "anakpapih2026") {
            const cleanName = username.length > 15 ? username.substring(0, 15) + ".." : username;
            sessionStorage.setItem("userLoggedIn", "true");
            sessionStorage.setItem("username", cleanName);
            if (typeof window.onLoginSuccess === 'function') window.onLoginSuccess();
            else window.location.href = "dashboard.html";
        }
        return;
    }

    // Login via Firebase
    const btn = document.querySelector('#login-form .login-submit-btn');
    if(btn) btn.innerHTML = "Memverifikasi... <span class='btn-arrow'>&rarr;</span>";

    firebase.database().ref('users/' + username).once('value').then(snapshot => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.password === password) {
                const cleanName = username.length > 15 ? username.substring(0, 15) + ".." : username;
                sessionStorage.setItem("userLoggedIn", "true");
                sessionStorage.setItem("username", cleanName);
                if (typeof window.onLoginSuccess === 'function') window.onLoginSuccess();
                else window.location.href = "dashboard.html";
            } else {
                if (errorMsg) {
                    errorMsg.textContent = "Password salah!";
                    errorMsg.style.display = "block";
                }
                if(btn) btn.innerHTML = "Masuk ke Dashboard <span class='btn-arrow'>&rarr;</span>";
            }
        } else {
            // Tetap izinkan kunci master jika user blm daftar, sebagai fallback darurat
            if (password === "anakpapih2026") {
                const cleanName = username.length > 15 ? username.substring(0, 15) + ".." : username;
                sessionStorage.setItem("userLoggedIn", "true");
                sessionStorage.setItem("username", cleanName);
                if (typeof window.onLoginSuccess === 'function') window.onLoginSuccess();
                else window.location.href = "dashboard.html";
            } else {
                if (errorMsg) {
                    errorMsg.textContent = "Akun tidak ditemukan. Silakan daftar dulu.";
                    errorMsg.style.display = "block";
                }
                if(btn) btn.innerHTML = "Masuk ke Dashboard <span class='btn-arrow'>&rarr;</span>";
            }
        }
    }).catch(err => {
        if (errorMsg) {
            errorMsg.textContent = "Terjadi kesalahan koneksi database.";
            errorMsg.style.display = "block";
        }
        if(btn) btn.innerHTML = "Masuk ke Dashboard <span class='btn-arrow'>&rarr;</span>";
    });
}

function handleRegister(event) {
    if (event) event.preventDefault();
    const usernameInput = document.getElementById("reg-username");
    const passwordInput = document.getElementById("reg-password");
    const confirmInput = document.getElementById("reg-password-confirm");
    const errorMsg = document.getElementById("reg-error");
    const successMsg = document.getElementById("reg-success");

    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";
    const confirm = confirmInput ? confirmInput.value.trim() : "";

    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    if (!username || !password || !confirm) {
        errorMsg.textContent = "Semua kolom wajib diisi!";
        errorMsg.style.display = "block";
        return;
    }

    if (password !== confirm) {
        errorMsg.textContent = "Password dan Konfirmasi tidak cocok!";
        errorMsg.style.display = "block";
        return;
    }

    if (password.length < 5) {
        errorMsg.textContent = "Password minimal 5 karakter!";
        errorMsg.style.display = "block";
        return;
    }

    if (typeof firebase === 'undefined') {
        errorMsg.textContent = "Gagal terhubung ke database registrasi.";
        errorMsg.style.display = "block";
        return;
    }

    const btn = document.querySelector('#register-form .login-submit-btn');
    if(btn) btn.innerHTML = "Membuat Akun... <span class='btn-arrow'>&rarr;</span>";

    const dbRef = firebase.database().ref('users/' + username);
    dbRef.once('value').then(snapshot => {
        if (snapshot.exists()) {
            errorMsg.textContent = "Username ini sudah dipakai oleh orang lain!";
            errorMsg.style.display = "block";
            if(btn) btn.innerHTML = "Buat Akun Baru <span class='btn-arrow'>&rarr;</span>";
        } else {
            dbRef.set({
                password: password,
                createdAt: Date.now()
            }).then(() => {
                successMsg.textContent = "Akun berhasil dibuat! Silakan masuk.";
                successMsg.style.display = "block";
                usernameInput.value = "";
                passwordInput.value = "";
                confirmInput.value = "";
                if(btn) btn.innerHTML = "Buat Akun Baru <span class='btn-arrow'>&rarr;</span>";
                
                // Auto switch to login after 1.5 seconds
                setTimeout(() => toggleForm('login'), 1500);
            });
        }
    }).catch(err => {
        errorMsg.textContent = "Terjadi kesalahan koneksi database.";
        errorMsg.style.display = "block";
        if(btn) btn.innerHTML = "Buat Akun Baru <span class='btn-arrow'>&rarr;</span>";
    });
}

function handleLogout() {
    sessionStorage.removeItem("userLoggedIn");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("unlocked");
    sessionStorage.removeItem("pos2Unlocked");
    sessionStorage.removeItem("pos3Unlocked");
    sessionStorage.removeItem("hasSeenWelcomeV3");
    sessionStorage.removeItem("hasSeenWelcomeV2");
    sessionStorage.removeItem("hasSeenWelcome");
    window.location.href = "login.html";
}

function checkArenaAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const path = window.location.pathname.split("/").pop();

    if (path.includes("pos1.html")) {
        if (urlParams.get('key') === 'protokol17') {
            sessionStorage.setItem("unlocked", "true");
            window.history.replaceState({}, document.title, window.location.pathname);
            
            setTimeout(() => {
                alert("SYSTEM OVERRIDE SUCCESSFUL\n\nSelamat! Anda berhasil memecahkan teka-teki URL dan menemukan Easter Egg Protokol 17. Selamat datang di Server Rahasia Anak Papih!");
            }, 500);
        }
    }

    if (sessionStorage.getItem("unlocked") !== "true") {
        alert("Akses Ditolak! Anda harus menemukan portal rahasia yang asli.");
        window.location.href = "dashboard.html";
        return;
    }
    
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

    updateNavbarUI();

    if (path.includes('pos1.html') && sessionStorage.getItem('unlocked') === 'true') { revealPos1(); }
    if (path.includes('pos2.html') && sessionStorage.getItem('pos2Unlocked') === 'true') { revealPos2(); }
    if (path.includes('pos3.html') && sessionStorage.getItem('pos3Unlocked') === 'true') { revealPos3(); }
}

function updateNavbarUI() {
    const pos2Unlocked = sessionStorage.getItem("pos2Unlocked") === "true";
    const pos3Unlocked = sessionStorage.getItem("pos3Unlocked") === "true";
    
    const links = document.querySelectorAll('.sidebar-left .nav-menu a');
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

    // Fitur "Kembali ke Arena" untuk halaman non-arena jika sudah unlocked
    if (sessionStorage.getItem("unlocked") === "true") {
        const path = window.location.pathname.split("/").pop();
        const isArenaPage = path.includes("pos1") || path.includes("pos2") || path.includes("pos3") || path.includes("menang") || path.includes("hijacked");
        
        if (!isArenaPage) {
            const menus = document.querySelectorAll('.sidebar-left .nav-menu');
            if (menus.length > 0) {
                // Cari menu pertama, tambahkan di bagian bawah menu utama
                const mainMenu = menus[0];
                if (!document.getElementById('kembali-arena-btn')) {
                    const arenaLink = document.createElement('li');
                    arenaLink.innerHTML = `<a href="pos1.html" id="kembali-arena-btn" style="color: #10b981; font-weight: bold; background: rgba(16, 185, 129, 0.1);">🎮 <span class="nav-text">Kembali ke Arena</span></a>`;
                    mainMenu.appendChild(arenaLink);
                }
            }
        }
    }
}

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

function revealPos1() {
    document.querySelectorAll('.decoy-element').forEach(el => el.style.display = 'none');
    const ctf = document.getElementById('ctf-game');
    if (ctf) ctf.classList.remove('hidden');
    document.body.classList.add('active-game-bg');
}

function revealPos2() {
    document.querySelectorAll('.decoy-element').forEach(el => el.style.display = 'none');
    document.body.classList.add('active-game-bg');
    const ctf = document.getElementById('ctf-game');
    if (ctf) ctf.classList.remove('hidden');
}

function revealPos3() {
    document.querySelectorAll('.decoy-element').forEach(el => el.style.display = 'none');
    const ctf = document.getElementById('ctf-game');
    if (ctf) ctf.classList.remove('hidden');
    document.body.classList.add('active-game-bg');
}

// --- POS 1 LOGIC (Binary Decryption) ---
function checkPos1Password() {
    const input = document.getElementById('pos1-password');
    const errorEl = document.getElementById('error-game');
    const successEl = document.getElementById('stage-1-success');
    const btn = document.getElementById('submit-pos1-btn');
    
    if(!input) return;
    const val = input.value.trim().toUpperCase();
    
    if (val === "LOMBAKARUNG") {
        if(errorEl) errorEl.textContent = '';
        if(successEl) successEl.classList.remove('hidden');
        if(btn) btn.disabled = true;
        input.disabled = true;
        
        sessionStorage.setItem("pos2Unlocked", "true");
        updateNavbarUI();
    } else {
        if(errorEl) {
            errorEl.textContent = '> ERROR: KATA SANDI SALAH. AKSES DITOLAK.';
            setTimeout(() => {
                if (errorEl.textContent.includes('DITOLAK')) {
                    errorEl.textContent = '';
                }
            }, 3000);
        }
    }
}

// --- POS 2 LOGIC (Digital Forensics) ---
function checkPos2Password() {
    const input = document.getElementById('pos2-password');
    const errorEl = document.getElementById('error-game');
    const successEl = document.getElementById('stage-2-success');
    const btn = document.getElementById('submit-pos2-btn');
    
    if(!input) return;
    const val = input.value.trim().toUpperCase();
    
    if (val === "DIRGAHAYU81") {
        if(errorEl) errorEl.textContent = '';
        if(successEl) successEl.classList.remove('hidden');
        if(btn) btn.disabled = true;
        input.disabled = true;
        
        sessionStorage.setItem("pos3Unlocked", "true");
        updateNavbarUI();
    } else {
        if(errorEl) {
            errorEl.textContent = '> ERROR: PASSCODE TIDAK DITEMUKAN PADA DATABASE.';
            setTimeout(() => {
                if (errorEl.textContent.includes('TIDAK DITEMUKAN')) {
                    errorEl.textContent = '';
                }
            }, 3000);
        }
    }
}

// --- POS 3 LOGIC (Base64 & Morse) ---
function checkPos3Password() {
    const input = document.getElementById('pos3-passcode');
    const errorEl = document.getElementById('error-stage-3');
    const successEl = document.getElementById('stage-3-success');
    const btn = document.getElementById('pos3-btn');
    
    if(!input) return;
    const val = input.value.trim().toUpperCase();
    
    if (val === "PAPIHCOUNCIL") {
        if(errorEl) errorEl.textContent = '';
        if(successEl) successEl.classList.remove('hidden');
        if(btn) btn.disabled = true;

        // Push data ke Firebase Realtime Database
        if (typeof firebase !== 'undefined') {
            const username = sessionStorage.getItem('username') || 'Unknown';
            
            // Cek jika user sudah ada di leaderboard untuk mencegah double submit
            const dbRef = firebase.database().ref('leaderboard');
            dbRef.orderByChild('username').equalTo(username).once('value', snapshot => {
                if (!snapshot.exists()) {
                    const finishTime = Date.now();
                    // Randomize a finish duration to simulate gameplay time (e.g. 5 to 15 minutes in milliseconds)
                    const completionDuration = Math.floor(Math.random() * 600000) + 300000; 
                    
                    dbRef.push({
                        username: username,
                        timestamp: finishTime,
                        duration: completionDuration
                    });
                }
            });
        }
    } else {
        if(errorEl) {
            errorEl.textContent = "Sandi salah! Dekripsi lagi.";
            errorEl.style.color = "#ef4444";
        }
        input.value = '';
    }
}

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

function openPortalPanitia(event) {
    if (event) event.preventDefault();

    let modal = document.getElementById("portal-lock-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "portal-lock-modal";
        modal.className = "modal";
        modal.style.display = "block";
        modal.innerHTML = `
            <div class="modal-content portal-modal-card">
                <span class="close-btn" onclick="closePortalModal()">&times;</span>
                
                <div class="portal-badge">🔒 OTORISASI RESTRUKTURISASI</div>
                <h2 class="portal-title">Portal Panitia</h2>
                
                <div class="sec-note-box">
                    <div class="sec-header">[SEC_NOTE_#17]</div>
                    <div class="sec-item"><span class="sec-label">REF_AUDIO:</span> <em>INDONESIA_NATION_ANTHEM_3STANZAS.wav</em></div>
                    <div class="sec-item"><span class="sec-label">INDEX_MARK:</span> <code>01:05</code></div>
                </div>

                <div class="input-group" style="margin-top: 1.25rem;">
                    <input type="password" id="portal-password-input" placeholder="Kata Kunci Akses..." autocomplete="off">
                    <button onclick="verifyPortalPassword()" class="portal-submit-btn">
                        <span>Verifikasi Akses</span>
                        <span>&rarr;</span>
                    </button>
                </div>
                
                <p id="portal-error-msg" class="error-msg" style="margin-top: 12px; font-size: 0.85rem; min-height: 20px;"></p>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.style.display = "block";
    }

    const pwdInput = document.getElementById("portal-password-input");
    const errorMsg = document.getElementById("portal-error-msg");
    if (pwdInput) {
        pwdInput.value = "";
        pwdInput.focus();
    }
    if (errorMsg) errorMsg.textContent = "";
}

function closePortalModal() {
    const modal = document.getElementById("portal-lock-modal");
    if (modal) modal.style.display = "none";
}

function verifyPortalPassword() {
    const pwdInput = document.getElementById("portal-password-input");
    const errorMsg = document.getElementById("portal-error-msg");
    const password = pwdInput ? pwdInput.value.trim().toLowerCase() : "";

    // Password kunci: merdeka
    if (password === "merdeka") {
        closePortalModal();
        showToast("🔓 Otorisasi Berhasil! Membuka jalur komunikasi...");
        
        const targetUrl = "hijacked.html?route=https://www.youtube.com/watch?v=gT5c0zP1h2s&target=pos1.html?key=protokol17";
        setTimeout(() => {
            window.open(targetUrl, "_blank");
        }, 800);
    } else {
        if (errorMsg) {
            errorMsg.textContent = "❌ ACCESS_DENIED: Kata kunci tidak valid. Periksa catatan indeks audio.";
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    checkAuth();
    initTheme();
    updateNavbarUI();

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });
    }

    const hamburgerDash = document.querySelector('.hamburger-dashboard');
    const sidebarLeft = document.querySelector('.sidebar-left');
    const closeSidebar = document.querySelector('.close-sidebar');
    
    if (hamburgerDash && sidebarLeft) {
        hamburgerDash.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebarLeft.classList.add('active');
            } else {
                sidebarLeft.classList.toggle('collapsed');
            }
        });
    }
    
    if (closeSidebar && sidebarLeft) {
        closeSidebar.addEventListener('click', () => {
            sidebarLeft.classList.remove('active');
        });
    }

    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('login-password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }

    const currentPath = window.location.pathname.split('/').pop() || "index.html";
    const menuLinks = document.querySelectorAll('.sidebar-left .nav-menu a');
    
    menuLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});


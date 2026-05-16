// Structură completă salvată
let game = {
    coins: 0,
    cps: 0,
    totalClicks: 0,
    quantum: 0,
    prestigeMult: 1.0,
    boostActive: false,
    boostMultiplier: 1,
    upgrades: {
        bot: { count: 0, cost: 15, income: 1 },
        gpu: { count: 0, cost: 100, income: 12 },
        mainframe: { count: 0, cost: 1100, income: 95 }
    },
    achievements: {
        firstClick: false,
        tenBots: false,
        anomalyCaught: false,
        firstPrestige: false
    }
};

// Încărcare din LocalStorage
if (localStorage.getItem("cyberOS_Save")) {
    game = JSON.parse(localStorage.getItem("cyberOS_Save"));
    // Forțăm stările de boost la resetare ca să nu rămână blocate
    game.boostActive = false;
    game.boostMultiplier = 1;
}

// Elemente UI
const balanceUI = document.getElementById("balance");
const cpsUI = document.getElementById("cps-display");
const clickBox = document.getElementById("clickBox");
const prestigeBtn = document.getElementById("prestigeBtn");
const quantumCountUI = document.getElementById("quantum-count");
const prestigeMultUI = document.getElementById("prestige-multiplier");
const anomalyNode = document.getElementById("anomaly-node");

function updateUI() {
    balanceUI.textContent = Math.floor(game.coins);
    
    let currentSpeed = game.cps * game.prestigeMult * game.boostMultiplier;
    cpsUI.textContent = `NET_GENERATION: ${currentSpeed.toFixed(1)} BC/s`;

    // Upgrade-uri
    for (let key in game.upgrades) {
        document.getElementById(`${key}-cost`).textContent = Math.floor(game.upgrades[key].cost);
        document.getElementById(`${key}-count`).textContent = game.upgrades[key].count;
    }

    // Prestitgiu
    quantumCountUI.textContent = game.quantum;
    prestigeMultUI.textContent = game.prestigeMult.toFixed(1);
    
    let pendingQuantum = Math.floor(Math.sqrt(game.coins / 5000));
    if (pendingQuantum > 0) {
        prestigeBtn.classList.remove("locked");
        prestigeBtn.textContent = `REPORNEȘTE PENTRU +${pendingQuantum} CIPURI`;
    } else {
        prestigeBtn.classList.add("locked");
        prestigeBtn.textContent = `REPORNEȘTE PENTRU +0 CIPURI`;
    }

    // Realizări (Vizual)
    if (game.achievements.firstClick) document.getElementById("ach-1").classList.remove("locked");
    if (game.achievements.tenBots) document.getElementById("ach-2").classList.remove("locked");
    if (game.achievements.anomalyCaught) document.getElementById("ach-3").classList.remove("locked");
    if (game.achievements.firstPrestige) document.getElementById("ach-4").classList.remove("locked");
}

function saveGame() {
    localStorage.setItem("cyberOS_Save", JSON.stringify(game));
}

// Creare Text Zburător
function createFloatingNumber(x, y, text, isCritic) {
    const el = document.createElement("div");
    el.className = `floating-number ${isCritic ? 'critic' : ''}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.textContent = text;
    document.body.appendChild(el);
    
    setTimeout(() => el.remove(), 600);
}

// Click-ul Principal Manual
clickBox.addEventListener("click", (e) => {
    game.totalClicks++;
    
    // Verifică Realizarea 1
    if (!game.achievements.firstClick) {
        game.achievements.firstClick = true;
    }

    // Șansă Critică de 10%
    let isCritic = Math.random() < 0.10;
    let baseClickValue = 1 * game.prestigeMult * game.boostMultiplier;
    let earned = isCritic ? baseClickValue * 8 : baseClickValue;

    game.coins += earned;

    createFloatingNumber(e.clientX, e.clientY, `+${Math.floor(earned)} ${isCritic ? 'CRITIC!' : ''}`, isCritic);
    updateUI();
});

// Cumpărare Upgrade
function buyUpgrade(type) {
    const up = game.upgrades[type];
    if (game.coins >= up.cost) {
        game.coins -= up.cost;
        up.count++;
        up.cost = Math.floor(up.cost * 1.15);
        
        // Verifică Realizarea 2
        if (type === 'bot' && up.count >= 10) {
            game.achievements.tenBots = true;
        }

        recalculateCPS();
        updateUI();
        saveGame();
    }
}

function recalculateCPS() {
    let baseCPS = 0;
    for (let key in game.upgrades) {
        baseCPS += game.upgrades[key].count * game.upgrades[key].income;
    }
    game.cps = baseCPS;
}

document.getElementById("upgrade-bot").addEventListener("click", () => buyUpgrade("bot"));
document.getElementById("upgrade-gpu").addEventListener("click", () => buyUpgrade("gpu"));
document.getElementById("upgrade-mainframe").addEventListener("click", () => buyUpgrade("mainframe"));

// Mecanica de Prestigiu / Rebirth
prestigeBtn.addEventListener("click", () => {
    let pendingQuantum = Math.floor(Math.sqrt(game.coins / 5000));
    if (pendingQuantum > 0) {
        game.quantum += pendingQuantum;
        game.prestigeMult = 1.0 + (game.quantum * 0.15); // +15% per cip permanent
        
        // Resetăm valorile la starea inițială
        game.coins = 0;
        game.cps = 0;
        game.upgrades.bot = { count: 0, cost: 15, income: 1 };
        game.upgrades.gpu = { count: 0, cost: 100, income: 12 };
        game.upgrades.mainframe = { count: 0, cost: 1100, income: 95 };
        game.achievements.firstPrestige = true;

        recalculateCPS();
        updateUI();
        saveGame();
    }
});

// GESTIONAR ANOMALIE ALEATORIE (Pop-up Node)
function spawnAnomaly() {
    if (game.boostActive) return; // Nu spawnăm dacă avem deja boost

    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    
    // Poziție complet random pe ecran
    anomalyNode.style.left = `${Math.random() * maxX}px`;
    anomalyNode.style.top = `${Math.random() * maxY}px`;
    anomalyNode.classList.remove("hidden");

    // Dispare după 8 secunde dacă nu dai click
    setTimeout(() => {
        anomalyNode.classList.add("hidden");
    }, 8000);
}

// Click pe Anomalia Roșie (Declanșare Boost)
anomalyNode.addEventListener("click", () => {
    anomalyNode.classList.add("hidden");
    game.achievements.anomalyCaught = true;
    
    // Pornim Boost-ul 3x viteză
    game.boostActive = true;
    game.boostMultiplier = 3;
    document.body.classList.add("boost-active");
    
    // Oprim boost-ul după 15 secunde
    setTimeout(() => {
        game.boostActive = false;
        game.boostMultiplier = 1;
        document.body.classList.remove("boost-active");
        updateUI();
    }, 15000);

    updateUI();
});

// Spawn-er de anomalii: Încearcă la fiecare 35 de secunde
setInterval(spawnAnomaly, 35000);

// LOOP-UL CENTRAL: Rulează la fiecare secundă
setInterval(() => {
    let currentSpeed = game.cps * game.prestigeMult * game.boostMultiplier;
    game.coins += currentSpeed;
    updateUI();
    saveGame();
}, 1000);

// Butonul de Reset Complet
document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("ATENȚIE: Ștergi complet serverul și baza de date? Pierzi tot.")) {
        localStorage.removeItem("cyberOS_Save");
        location.reload();
    }
});

// Inițializare joc
recalculateCPS();
updateUI();

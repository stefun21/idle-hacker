const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particlesArray = [];
let isDrawing = false;

// Elemente din Panoul de Control
const sizeSlider = document.getElementById('sizeSlider');
const speedSlider = document.getElementById('speedSlider');
const colorPicker = document.getElementById('colorPicker');
const trailSlider = document.getElementById('trailSlider');

const mouse = { x: undefined, y: undefined };

// Funcție ajutătoare pentru a converti HEX în HSL (pentru nuanțe neon)
function hexToHSL(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max == min) { h = s = 0; } 
    else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Detecție Click
window.addEventListener('mousedown', (e) => {
    // Să nu deseneze dacă dăm click pe panoul de control
    if (e.target.closest('.controls')) return; 
    isDrawing = true;
    updateMousePos(e);
    generateParticles();
});

window.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    updateMousePos(e);
    generateParticles();
});

window.addEventListener('mouseup', () => isDrawing = false);

function updateMousePos(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

function generateParticles() {
    const maxSpeed = parseFloat(speedSlider.value);
    const baseSize = parseFloat(sizeSlider.value);
    const hsl = hexToHSL(colorPicker.value);

    // Generăm 4 particule la fiecare mișcare cu click apasat
    for (let i = 0; i < 4; i++) {
        particlesArray.push(new Particle(baseSize, maxSpeed, hsl));
    }
}

class Particle {
    constructor(baseSize, maxSpeed, hsl) {
        this.x = mouse.x;
        this.y = mouse.y;
        this.size = Math.random() * baseSize + 1;
        
        // Direcție și viteză bazate pe slider
        this.speedX = Math.random() * maxSpeed - (maxSpeed / 2);
        this.speedY = Math.random() * maxSpeed - (maxSpeed / 2);
        
        // Adăugăm o ușoară variație de nuanță în jurul culorii alese pentru efect organic
        const hVariation = hsl.h + Math.floor(Math.random() * 30 - 15);
        this.color = `hsl(${hVariation}, ${hsl.s}%, ${hsl.l}%)`;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.1) this.size -= 0.05;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate() {
    // Controlăm intensitatea cozii. Valoare mai mică = coadă mai lungă.
    const trailOpacity = (11 - trailSlider.value) * 0.05; 
    ctx.fillStyle = `rgba(0, 0, 0, ${trailOpacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        
        if (particlesArray[i].size <= 0.1) {
            particlesArray.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}

// Pornim animația
animate();

document.getElementById('clearBtn').addEventListener('click', () => {
    particlesArray.length = 0;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

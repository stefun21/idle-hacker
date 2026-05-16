const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Forțăm fundal negru la resize
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
const trailSlider = document.getElementById('trailSlider');
const clearBtn = document.getElementById('clearBtn');

// Adunăm toate color pickers într-un array
const colorPickers = [
    document.getElementById('colorPicker1'),
    document.getElementById('colorPicker2'),
    document.getElementById('colorPicker3'),
    document.getElementById('colorPicker4'),
    document.getElementById('colorPicker5')
];

const mouse = { x: undefined, y: undefined };

// Detecție Evenimente Mouse (Desenare la click)
window.addEventListener('mousedown', (e) => {
    // Verificăm dacă nu dăm click pe panoul de control
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

// Obține lista de culori active (cele care nu sunt negre)
function getActiveColors() {
    const activeColors = [];
    colorPickers.forEach(picker => {
        const color = picker.value;
        // Ignorăm negrul complet (#000000)
        if (color !== '#000000') {
            activeColors.push(color);
        }
    });
    
    // Fallback în caz că toate sunt negre
    if (activeColors.length === 0) return ['#00ffcc'];
    return activeColors;
}

function generateParticles() {
    const maxSpeed = parseFloat(speedSlider.value);
    const baseSize = parseFloat(sizeSlider.value);
    const activeColors = getActiveColors();

    // Generăm 4 particule la fiecare mișcare
    for (let i = 0; i < 4; i++) {
        // Alegem o culoare aleatorie din cele active
        const randomColor = activeColors[Math.floor(Math.random() * activeColors.length)];
        particlesArray.push(new Particle(baseSize, maxSpeed, randomColor));
    }
}

class Particle {
    constructor(baseSize, maxSpeed, color) {
        this.x = mouse.x;
        this.y = mouse.y;
        
        // Variație de mărime organică
        this.size = Math.random() * baseSize + (baseSize / 2);
        
        // Viteză și împrăștiere bazate pe slider
        this.speedX = Math.random() * maxSpeed - (maxSpeed / 2);
        this.speedY = Math.random() * maxSpeed - (maxSpeed / 2);
        
        this.color = color;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Micșorăm particula în timp
        if (this.size > 0.1) this.size -= 0.08;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Desenăm cercuri perfecte
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate() {
    // Problemă rezolvată: Forțăm fundal negru. 
    // Coada (Trail) este determinată de opacitatea culorii negre desenate peste.
    // Slider valoare mică (0) = fără coadă, șterge instant.
    // Slider valoare mare (10) = coadă lungă.
    const trailOpacity = (11 - trailSlider.value) * 0.05; 
    ctx.fillStyle = `rgba(0, 0, 0, ${trailOpacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        
        // Dacă particula e invizibilă, o ștergem
        if (particlesArray[i].size <= 0.1) {
            particlesArray.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}

animate();

// Butonul de ștergere instant
clearBtn.addEventListener('click', () => {
    particlesArray.length = 0;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

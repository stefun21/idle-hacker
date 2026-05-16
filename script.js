const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

// Ajustăm canvas-ul la dimensiunea ecranului
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particlesArray = [];
const hue = 180; // Cyan (schimbă valoarea între 0 și 360 pentru alte culori)

// Obiectul pentru mouse
const mouse = {
    x: undefined,
    y: undefined
};

// Ascultăm mișcarea mouse-ului
window.addEventListener('mousemove', function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    
    // Generăm 3 particule la fiecare mișcare
    for (let i = 0; i < 3; i++) {
        particlesArray.push(new Particle());
    }
});

// Clasa care definește o particulă
class Particle {
    constructor() {
        this.x = mouse.x;
        this.y = mouse.y;
        this.size = Math.random() * 5 + 1; // Dimensiune între 1 și 6 pixeli
        
        // Viteza de mișcare (direcție random pe axele X și Y)
        this.speedX = Math.random() * 4 - 2; // Între -2 și 2
        this.speedY = Math.random() * 4 - 2;
        
        // Culoare cu transparență (efect de strălucire)
        this.color = `hsl(${hue + Math.random() * 40 - 20}, 100%, 50%)`;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Particula se micșorează în timp (dispare treptat)
        if (this.size > 0.1) this.size -= 0.05;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Funcția de animație care rulează în buclă infinită
function animate() {
    // Truc: în loc să ștergem complet ecranul cu clearRect, 
    // desenăm un fundal negru foarte transparent. Asta creează efectul de "coadă" (trail).
    ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        
        // Dacă particula a devenit prea mică, o ștergem din memorie
        if (particlesArray[i].size <= 0.1) {
            particlesArray.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}

animate();

// Resetare ecran din buton
document.getElementById('clearBtn').addEventListener('click', () => {
    particlesArray.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
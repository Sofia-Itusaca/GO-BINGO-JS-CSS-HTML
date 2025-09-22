// script.js — estética original restaurada + conexión activa
const spinButton = document.getElementById('spinButton');
const resultDisplay = document.getElementById('result');
const wheel = document.getElementById('wheel');
const campanaSound = document.getElementById('campanaSound');

// Sonidos de ruleta
const ruletaSounds = [
    { audio: new Audio('sonido_de_ruleta.mp3'), duration: 3500 },
    { audio: new Audio('sonido_de_ruleta2.mp3'), duration: 3000 },
    { audio: new Audio('sonido_de_ruleta3.mp3'), duration: 5000 }
];

// === números de bingo (B,I,N,G,O) ===
function generateBingoNumbers() {
    const letterRanges = ['B', 'I', 'N', 'G', 'O'];
    const numbersPerRange = [15, 15, 15, 15, 15];
    const all = [];
    letterRanges.forEach((letter, i) => {
        const start = i * 15 + 1;
        const end = start + numbersPerRange[i] - 1;
        for (let n = start; n <= end; n++) {
            all.push(`${letter} ${n.toString().padStart(2, '0')}`);
        }
    });
    return all;
}

// === DIBUJO DE LA RULETA (estilo original) ===
// -> ángulo por sector y radio *fijo* 255; SOLO rotate + translateY
function displayWheel(numbers) {
    const wheelAngle = 360 / numbers.length;
    const radius = 255;                  // <- valor original
    wheel.innerHTML = '';

    numbers.forEach((txt, idx) => {
        const numberElement = document.createElement('div');
        numberElement.classList.add('number');

        const [letter, num] = txt.split(' ');

        const letterEl = document.createElement('div');
        letterEl.textContent = letter;
        letterEl.classList.add('letter');

        const numEl = document.createElement('div');
        numEl.textContent = num;
        numEl.classList.add('num');

        numberElement.appendChild(letterEl);
        numberElement.appendChild(numEl);

        // Colores tal como llevabas (alterno rojo/negro; si quieres B 01 verde, déjalo aquí)
        const isRed = idx % 2 === 0;
        numberElement.style.backgroundColor = isRed ? 'red' : 'black';

        // **IMPORTANTE**: sin rotate de compensación
        const angle = wheelAngle * idx;
        numberElement.style.transform = `rotate(${angle}deg) translateY(-${radius}px)`;

        wheel.appendChild(numberElement);
    });
}

// === lógica de giro (sin cambios visuales) ===
let isClockwise = true;
let isFirstSpin = true;

function spinWheel() {
    try {
        const numbers = wheel.querySelectorAll('.number');
        if (!numbers || numbers.length === 0) {
            spinButton.disabled = true;
            return;
        }

        spinButton.disabled = true;

        const randomSound = ruletaSounds[Math.floor(Math.random() * ruletaSounds.length)];
        const ruletaSound = randomSound.audio;
        let duration = randomSound.duration;
        if (!isFirstSpin) duration = Math.round(duration * 1.15); // mismo comportamiento

        const rotations = 360 * 2;
        const randomAngle = Math.floor(Math.random() * 360);
        const directionMultiplier = isClockwise ? 1 : -1;
        const totalRotation = directionMultiplier * (rotations + randomAngle);

        // alternar sentido
        isClockwise = !isClockwise;

        try { ruletaSound.currentTime = 0; ruletaSound.play().catch(() => { }); } catch { }

        // transición/curva originales
        wheel.style.transition = `transform ${duration / 1000}s cubic-bezier(0.1, 0.8, 0.2, 1)`;
        wheel.style.transform = `rotate(${totalRotation}deg)`;

        setTimeout(() => {
            try {
                try { ruletaSound.pause(); ruletaSound.currentTime = 0; } catch { }

                const numbersNow = wheel.querySelectorAll('.number');
                const wheelAngle = 360 / numbersNow.length;

                // índice seleccionado (misma fórmula robusta)
                const normalized = ((totalRotation % 360) + 360) % 360;
                const rawIndex = Math.round((360 - normalized) / wheelAngle);
                const n = numbersNow.length;
                let selectedIndex = ((rawIndex % n) + n) % n;

                let selectedNumberElement = numbersNow[selectedIndex];
                if (!selectedNumberElement) {
                    selectedIndex = 0;
                    selectedNumberElement = numbersNow[0];
                }

                const letter = selectedNumberElement.querySelector('.letter')?.textContent ?? '';
                const num = selectedNumberElement.querySelector('.num')?.textContent ?? '';

                // Mostrar en el centro
                resultDisplay.textContent = `${letter} ${num}`;

                // === CONEXIÓN: publicar al puente y emitir evento (ambos) ===
                try { window.Conexion && window.Conexion.publish({ letter, num, ts: Date.now() }); } catch { }
                try { window.dispatchEvent(new CustomEvent('bingo:drawn', { detail: { letter, num } })); } catch { }

                // Sonido campana
                if (campanaSound) {
                    try { campanaSound.currentTime = 0; campanaSound.play().catch(() => { }); } catch { }
                }

                // Quitar el número de la ruleta
                selectedNumberElement.remove();

                const remaining = wheel.querySelectorAll('.number').length;
                spinButton.disabled = remaining === 0;
                isFirstSpin = false;
            } catch (innerErr) {
                console.error('error al resolver selección:', innerErr);
                spinButton.disabled = false;
            }
        }, duration + 50);
    } catch (err) {
        console.error('spinWheel fallo:', err);
        spinButton.disabled = false;
    }
}

// Inicializar como antes
let bingoNumbers = generateBingoNumbers();
displayWheel(bingoNumbers);

// Click / teclado
spinButton.addEventListener('click', spinWheel);
spinButton.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !spinButton.disabled) {
        e.preventDefault();
        spinWheel();
    }
});

// script.js — ruleta estética original + filtro por letra con ángulo actual
const spinButton = document.getElementById('spinButton');
const resultDisplay = document.getElementById('result');
const wheel = document.getElementById('wheel');
const campanaSound = document.getElementById('campanaSound');

const ruletaSounds = [
    { audio: new Audio('sonido_de_ruleta.mp3'), duration: 3500 },
    { audio: new Audio('sonido_de_ruleta2.mp3'), duration: 3000 },
    { audio: new Audio('sonido_de_ruleta3.mp3'), duration: 5000 }
];

// Generar lista de números de bingo
function generateBingoNumbers() {
    const letters = ['B', 'I', 'N', 'G', 'O'];
    const all = [];
    letters.forEach((letter, i) => {
        const start = i * 15 + 1;
        const end = start + 14;
        for (let n = start; n <= end; n++) {
            all.push(`${letter} ${n.toString().padStart(2, '0')}`);
        }
    });
    return all;
}

// Dibujar la ruleta (estilo original)
function displayWheel(numbers) {
    const wheelAngle = 360 / numbers.length;
    const radius = 255; // valor original
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

        // Colores (B 01 en verde)
        if (txt === 'B 01') {
            numberElement.style.backgroundColor = 'green';
        } else {
            const isRed = idx % 2 === 0;
            numberElement.style.backgroundColor = isRed ? 'red' : 'black';
        }

        const angle = wheelAngle * idx;
        numberElement.style.transform = `rotate(${angle}deg) translateY(-${radius}px)`;
        wheel.appendChild(numberElement);
    });
}

let isClockwise = true;
let isFirstSpin = true;
let currentAngleDeg = 0; // ← ángulo acumulado actual de la rueda (mod 360)

// Devuelve un índice aleatorio que cumpla el filtro; -1 si no hay
function pickTargetIndexByFilter(elements, filterLetter) {
    const indices = [];
    elements.forEach((el, i) => {
        const letter = el.querySelector('.letter')?.textContent || '';
        if (!filterLetter || letter === filterLetter) indices.push(i);
    });
    if (indices.length === 0) return -1;
    return indices[Math.floor(Math.random() * indices.length)];
}

function mod360(x) {
    return ((x % 360) + 360) % 360;
}

function spinWheel() {
    // Tomamos snapshot del estado actual
    const numbersNow = Array.from(wheel.querySelectorAll('.number'));
    if (!numbersNow.length) {
        spinButton.disabled = true;
        return;
    }
    spinButton.disabled = true;

    const { audio: ruletaSound, duration: baseDuration } =
        ruletaSounds[Math.floor(Math.random() * ruletaSounds.length)];
    let duration = isFirstSpin ? baseDuration : Math.round(baseDuration * 1.15);

    const wheelAngle = 360 / numbersNow.length;

    // Filtro actual
    const filterLetter = (window.Conexion && typeof window.Conexion.getFilter === 'function')
        ? window.Conexion.getFilter()
        : null;

    // Elegimos índice objetivo que cumpla filtro
    const targetIndex = pickTargetIndexByFilter(numbersNow, filterLetter);
    if (filterLetter && targetIndex === -1) {
        // No quedan números de esa letra
        spinButton.disabled = false;
        // Si quieres, muestra un aviso aquí.
        return;
    }

    const k = (targetIndex === -1)
        ? Math.floor(Math.random() * numbersNow.length) // sin filtro
        : targetIndex;

    // --- Cálculo de rotación en función del ángulo ACTUAL ---
    // Posición angular actual del índice k respecto al puntero:
    const cur = mod360(currentAngleDeg);
    const posK = mod360(k * wheelAngle + cur);

    // Si giramos en sentido horario, para que k llegue al puntero (0°):
    const deltaCW = (360 - posK) % 360;
    // Si giramos en sentido antihorario:
    const deltaCCW = -posK; // negativo

    // Vueltas completas para que se vea natural (2 a 4)
    const fullSpins = 2 + Math.floor(Math.random() * 3); // 2,3,4

    const directionMultiplier = isClockwise ? 1 : -1;
    isClockwise = !isClockwise;

    let delta;
    if (directionMultiplier === 1) {
        delta = fullSpins * 360 + deltaCW;     // horario
    } else {
        delta = -(fullSpins * 360) + deltaCCW; // antihorario (deltaCCW ya es negativo o 0)
    }

    // Reproducir sonido
    try { ruletaSound.currentTime = 0; ruletaSound.play().catch(() => { }); } catch { }

    // Animar desde el ángulo actual
    wheel.style.transition = `transform ${duration / 1000}s cubic-bezier(0.1, 0.8, 0.2, 1)`;
    wheel.style.transform = `rotate(${currentAngleDeg + delta}deg)`;

    setTimeout(() => {
        try { ruletaSound.pause(); ruletaSound.currentTime = 0; } catch { }

        // Actualizamos ángulo actual acumulado
        currentAngleDeg = currentAngleDeg + delta;

        // Resultado: usamos el MISMO índice k que elegimos al inicio
        const selectedNumberElement = numbersNow[k] || numbersNow[0];
        const letter = selectedNumberElement.querySelector('.letter')?.textContent ?? '';
        const num = selectedNumberElement.querySelector('.num')?.textContent ?? '';

        resultDisplay.textContent = `${letter} ${num}`;

        // Notificar a la tabla / historial
        try { window.Conexion && window.Conexion.publish({ letter, num, ts: Date.now() }); } catch { }
        try { window.dispatchEvent(new CustomEvent('bingo:drawn', { detail: { letter, num } })); } catch { }

        if (campanaSound) {
            try { campanaSound.currentTime = 0; campanaSound.play().catch(() => { }); } catch { }
        }

        // Quitar el número de la ruleta
        selectedNumberElement.remove();

        spinButton.disabled = wheel.querySelectorAll('.number').length === 0;
        isFirstSpin = false;
    }, duration + 50);
}

// Inicializar
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



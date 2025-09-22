// script.js — ruleta estética original + conexión con la tabla
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

// Dibujar la ruleta (estilo original: solo rotate + translateY)
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

        if (txt === 'B 01') {
            numberElement.style.backgroundColor = 'green';  // ✅ tu color especial
        } else {
            const isRed = idx % 2 === 0;
            numberElement.style.backgroundColor = isRed ? 'red' : 'black';
        }


        const angle = wheelAngle * idx;
        numberElement.style.transform = `rotate(${angle}deg) translateY(-${radius}px)`;

        wheel.appendChild(numberElement);
    });
}

// Girar la ruleta
let isClockwise = true;
let isFirstSpin = true;

function spinWheel() {
    const numbers = wheel.querySelectorAll('.number');
    if (!numbers.length) {
        spinButton.disabled = true;
        return;
    }
    spinButton.disabled = true;

    const { audio: ruletaSound, duration: baseDuration } =
        ruletaSounds[Math.floor(Math.random() * ruletaSounds.length)];
    let duration = isFirstSpin ? baseDuration : Math.round(baseDuration * 1.15);

    const rotations = 360 * 2;
    const randomAngle = Math.floor(Math.random() * 360);
    const directionMultiplier = isClockwise ? 1 : -1;
    const totalRotation = directionMultiplier * (rotations + randomAngle);

    isClockwise = !isClockwise;

    try { ruletaSound.currentTime = 0; ruletaSound.play().catch(() => { }); } catch { }

    wheel.style.transition = `transform ${duration / 1000}s cubic-bezier(0.1, 0.8, 0.2, 1)`;
    wheel.style.transform = `rotate(${totalRotation}deg)`;

    setTimeout(() => {
        try { ruletaSound.pause(); ruletaSound.currentTime = 0; } catch { }

        const numbersNow = wheel.querySelectorAll('.number');
        const wheelAngle = 360 / numbersNow.length;
        const normalized = ((totalRotation % 360) + 360) % 360;
        const rawIndex = Math.round((360 - normalized) / wheelAngle);
        const n = numbersNow.length;
        let selectedIndex = ((rawIndex % n) + n) % n;

        let selectedNumberElement = numbersNow[selectedIndex] || numbersNow[0];
        const letter = selectedNumberElement.querySelector('.letter')?.textContent ?? '';
        const num = selectedNumberElement.querySelector('.num')?.textContent ?? '';

        resultDisplay.textContent = `${letter} ${num}`;

        // Conexión con la tabla (bridge + evento)
        try { window.Conexion && window.Conexion.publish({ letter, num, ts: Date.now() }); } catch { }
        try { window.dispatchEvent(new CustomEvent('bingo:drawn', { detail: { letter, num } })); } catch { }

        if (campanaSound) {
            try { campanaSound.currentTime = 0; campanaSound.play().catch(() => { }); } catch { }
        }

        selectedNumberElement.remove();
        spinButton.disabled = wheel.querySelectorAll('.number').length === 0;
        isFirstSpin = false;
    }, duration + 50);
}

// Inicializar
let bingoNumbers = generateBingoNumbers();
displayWheel(bingoNumbers);
spinButton.addEventListener('click', spinWheel);
spinButton.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !spinButton.disabled) {
        e.preventDefault();
        spinWheel();
    }
});

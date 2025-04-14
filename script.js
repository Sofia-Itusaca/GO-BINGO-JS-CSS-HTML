const spinButton = document.getElementById('spinButton');
const resultDisplay = document.getElementById('result');
const wheel = document.getElementById('wheel');
const campanaSound = document.getElementById('campanaSound'); // Sonido de la campana

// Lista de sonidos de la ruleta con sus duraciones
const ruletaSounds = [
    { audio: new Audio('sonido_de_ruleta.mp3'), duration: 3500 },
    { audio: new Audio('sonido_de_ruleta2.mp3'), duration: 3000 },
    { audio: new Audio('sonido_de_ruleta3.mp3'), duration: 5000 }
];

// Función para generar los números de bingo
function generateBingoNumbers() {
    const letterRanges = ['B', 'I', 'N', 'G', 'O'];
    const numbersPerRange = [15, 15, 15, 15, 15];
    let allNumbers = [];

    letterRanges.forEach((letter, index) => {
        const start = index * 15 + 1;
        const end = start + numbersPerRange[index] - 1;

        for (let i = start; i <= end; i++) {
            allNumbers.push(`${letter} ${i.toString().padStart(2, '0')}`);
        }
    });

    return allNumbers;
}

// Función para mostrar los números en la rueda
function displayWheel(numbers) {
    const wheelAngle = 360 / numbers.length;
    const radius = 255;
    wheel.innerHTML = '';

    numbers.forEach((number, index) => {
        const numberElement = document.createElement('div');
        numberElement.classList.add('number');

        const [letter, num] = number.split(' ');

        const letterElement = document.createElement('div');
        letterElement.textContent = letter;
        letterElement.classList.add('letter');

        const numberElementText = document.createElement('div');
        numberElementText.textContent = num;
        numberElementText.classList.add('num');

        numberElement.appendChild(letterElement);
        numberElement.appendChild(numberElementText);

        if (number === 'B 01') {
            numberElement.style.backgroundColor = 'green';
        } else {
            const isRed = index % 2 === 0;
            numberElement.style.backgroundColor = isRed ? 'red' : 'black';
        }

        const cellPosition = `rotate(${wheelAngle * index}deg) translateY(-${radius}px)`;
        numberElement.style.transform = cellPosition;

        wheel.appendChild(numberElement);
    });
}

// Función para girar la rueda
// Función para girar la rueda
let isClockwise = true; // Variable para alternar la dirección
let isFirstSpin = true; // Variable para identificar si es el primer giro

function spinWheel() {
    // Seleccionar un sonido de la ruleta aleatoriamente
    const randomSound = ruletaSounds[Math.floor(Math.random() * ruletaSounds.length)];
    const ruletaSound = randomSound.audio;
    let duration = randomSound.duration; // Duración específica del sonido seleccionado (en ms)

    // Reducir un 15% de velocidad en los intentos después del primero
    if (!isFirstSpin) {
        duration = duration * 1; // Incrementar duración en un 15%
    }

    const rotations = 360 * 2; // Exactamente 2 vueltas completas
    const randomAngle = Math.floor(Math.random() * 360); // Ángulo adicional aleatorio
    const directionMultiplier = isClockwise ? 1 : -1; // Alternar sentido
    const totalRotation = directionMultiplier * (rotations + randomAngle);

    // Alternar la dirección para el siguiente intento
    isClockwise = !isClockwise;

    // Configurar el sonido de la ruleta
    ruletaSound.currentTime = 0;
    ruletaSound.play();

    // Configurar la animación de la rueda (rápido al inicio, luego desacelerado)
    wheel.style.transition = `transform ${duration / 1000}s cubic-bezier(0.1, 0.8, 0.2, 1)`; // Misma curva
    wheel.style.transform = `rotate(${totalRotation}deg)`; // Giro calculado

    setTimeout(() => {
        const numbers = wheel.querySelectorAll('.number');
        const wheelAngle = 360 / numbers.length;

        // Detener el sonido de la ruleta
        ruletaSound.pause();
        ruletaSound.currentTime = 0;

        const angle = (Math.abs(totalRotation) % 360) * (isClockwise ? 1 : -1); // Ángulo relativo a las vueltas completas
        const selectedIndex = Math.floor((360 + angle) % 360 / wheelAngle); // Ajuste del índice según dirección
        const selectedNumberElement = numbers[selectedIndex]; // Elemento seleccionado

        // Obtener la letra y el número del elemento seleccionado
        const letter = selectedNumberElement.querySelector('.letter').textContent;
        const num = selectedNumberElement.querySelector('.num').textContent;

        // Mostrar la letra y el número separados
        resultDisplay.textContent = `${letter} ${num}`;

        // Reproducir el sonido de la campana
        campanaSound.currentTime = 0;
        campanaSound.play();

        // Eliminar el número de la rueda
        selectedNumberElement.remove();

        // Deshabilitar el botón cuando no queden más números
        if (wheel.querySelectorAll('.number').length === 0) {
            spinButton.disabled = true;
        }

        // Indicar que el primer giro ya se ha realizado
        isFirstSpin = false;
    }, duration);
}


// Inicializar y mostrar los números en la rueda
let bingoNumbers = generateBingoNumbers();
displayWheel(bingoNumbers);

// Evento para girar la rueda
spinButton.addEventListener('click', spinWheel);

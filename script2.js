<<<<<<< HEAD
// script2.js (tabla en 2 columnas + conexión con puente)
document.addEventListener('DOMContentLoaded', () => {
    const content2 = document.querySelector('.content2');
    if (!content2) return;

    const table = document.createElement('table');
    table.classList.add('table');
    table.setAttribute('role', 'table');
    table.setAttribute('aria-label', 'Tabla de numeros de bingo');

    // encabezado: cada letra ocupa 2 columnas
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['B', 'I', 'N', 'G', 'O'].forEach(letter => {
        const th = document.createElement('th');
        th.textContent = letter;
        th.setAttribute('scope', 'col');
        th.colSpan = 2;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
=======
document.addEventListener('DOMContentLoaded', () => {
    const content2 = document.querySelector('.content2');
    const table = document.createElement('table');
    table.classList.add('table');

    // Crear el encabezado
    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['B', 'I', 'N', 'G', 'O'];
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    header.appendChild(headerRow);
    table.appendChild(header);

    const body = document.createElement('tbody');
>>>>>>> 967a32f48a2898982eb996056d402cabb28e39ea
    const ranges = {
        B: Array.from({ length: 15 }, (_, i) => i + 1),
        I: Array.from({ length: 15 }, (_, i) => i + 16),
        N: Array.from({ length: 15 }, (_, i) => i + 31),
        G: Array.from({ length: 15 }, (_, i) => i + 46),
        O: Array.from({ length: 15 }, (_, i) => i + 61)
    };

<<<<<<< HEAD
    const colors = ['#4CAF50', '#00BCD4', '#F44336', '#FF4081', '#FFEB3B', '#9C27B0'];
    const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

    const ROWS = 8;
    const COLS_PER_LETTER = 2;

    for (let r = 0; r < ROWS; r++) {
        const tr = document.createElement('tr');
        ['B', 'I', 'N', 'G', 'O'].forEach(letter => {
            for (let sub = 0; sub < COLS_PER_LETTER; sub++) {
                const idx = r + sub * ROWS;
                const arr = ranges[letter];
                const num = (idx < arr.length) ? arr[idx] : null;

                const td = document.createElement('td');
                td.setAttribute('role', 'gridcell');
                td.tabIndex = 0;

                if (num !== null) {
                    td.dataset.letter = letter;
                    td.dataset.num = String(num).padStart(2, '0');

                    const circle = document.createElement('div');
                    circle.classList.add('circle');

                    const whiteCircle = document.createElement('div');
                    whiteCircle.classList.add('white-circle');
                    whiteCircle.textContent = num;

                    circle.style.backgroundColor = getRandomColor();
                    circle.appendChild(whiteCircle);
                    td.appendChild(circle);
                    td.classList.add('clickable');
                } else {
                    td.innerHTML = '&nbsp;';
                    td.setAttribute('aria-hidden', 'true');
                }

                tr.appendChild(td);
            }
        });
        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    content2.appendChild(table);

    // interacción manual
    table.addEventListener('click', (e) => {
        const td = e.target.closest('td[data-letter]');
        if (!td) return;
        toggle(td);
    });
    table.addEventListener('keydown', (e) => {
        const td = e.target.closest('td[data-letter]');
        if (!td) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle(td);
        }
    });
    function toggle(td) {
        if (td.classList.contains('active')) {
            td.classList.remove('active', 'clicked');
            td.setAttribute('aria-pressed', 'false');
        } else {
            td.classList.add('active', 'clicked');
            td.setAttribute('aria-pressed', 'true');
        }
    }

    // función para marcar desde la ruleta/puente
    function mark(letter, num) {
        const selector =
            `td[data-letter="${letter}"][data-num="${String(num).padStart(2, '0')}"]`;
        const cell = table.querySelector(selector);
        if (!cell) return;
        cell.classList.add('active', 'clicked');
        cell.setAttribute('aria-pressed', 'true');
        // opcional: centrar en vista
        // cell.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }

    // suscripción vía puente (reproduce historial al cargar)
    if (window.Conexion && typeof window.Conexion.subscribe === 'function') {
        // true = reenvía todo historial (para que se marquen los que ya salieron)
        window.Conexion.subscribe(({ letter, num }) => mark(letter, num), true);
    } else {
        // fallback: evento global
        window.addEventListener('bingo:drawn', (e) => {
            const { letter, num } = e.detail || {};
            if (letter && num) mark(letter, num);
        });
    }
=======
    // Función para obtener un color aleatorio
    function getRandomColor() {
        const colors = ['#4CAF50', '#00BCD4', '#F44336', '#FF4081', '#FFEB3B', '#9C27B0'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Generar filas con números
    for (let i = 0; i < 15; i++) {
        const row = document.createElement('tr');
        ['B', 'I', 'N', 'G', 'O'].forEach(letter => {
            const cell = document.createElement('td');
            const num = ranges[letter][i];
            const circle = document.createElement('div');
            circle.classList.add('circle');
            const whiteCircle = document.createElement('div'); // Círculo blanco dentro
            whiteCircle.classList.add('white-circle');
            whiteCircle.textContent = num; // Agregar el número al círculo blanco
            circle.style.backgroundColor = getRandomColor();
            circle.appendChild(whiteCircle); // Colocar el círculo blanco dentro
            cell.appendChild(circle);
            row.appendChild(cell);
        });
        body.appendChild(row);
    }
    table.appendChild(body);
    content2.appendChild(table);

    // Obtenemos todas las celdas de la tabla
    const cells = document.querySelectorAll('table.table td');

    // Agregamos el evento de clic a cada celda
    cells.forEach(cell => {
        cell.addEventListener('click', function() {
            // Si la celda tiene la clase "active", la apagamos (la desactivamos)
            if (cell.classList.contains('active')) {
                // Eliminamos la clase "active" para apagar la iluminación
                cell.classList.remove('active');
                cell.classList.remove('clicked');
            } else {
                // Agregamos la clase "active" para encender la iluminación en la celda clickeada
                cell.classList.add('active');
                cell.classList.add('clicked');
            }
        });
    });
>>>>>>> 967a32f48a2898982eb996056d402cabb28e39ea
});

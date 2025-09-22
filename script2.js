// script2.js — tabla 2 columnas + encabezados "botón" con filtro
document.addEventListener('DOMContentLoaded', () => {
    const content2 = document.querySelector('.content2');
    if (!content2) return;

    const table = document.createElement('table');
    table.classList.add('table');
    table.setAttribute('role', 'table');
    table.setAttribute('aria-label', 'Tabla de números de bingo');

    // Encabezado: cada letra ocupa 2 columnas y actúa como botón
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    const heads = {};
    ['B', 'I', 'N', 'G', 'O'].forEach(letter => {
        const th = document.createElement('th');
        th.textContent = letter;
        th.colSpan = 2;
        th.style.cursor = 'pointer';
        th.style.userSelect = 'none';
        th.setAttribute('tabindex', '0');
        // transición suave para el efecto de activo
        th.style.transition = 'transform 0.2s ease, color 0.2s ease';
        heads[letter] = th;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const ranges = {
        B: Array.from({ length: 15 }, (_, i) => i + 1),
        I: Array.from({ length: 15 }, (_, i) => i + 16),
        N: Array.from({ length: 15 }, (_, i) => i + 31),
        G: Array.from({ length: 15 }, (_, i) => i + 46),
        O: Array.from({ length: 15 }, (_, i) => i + 61),
    };
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

    // Interacción manual en celdas
    function toggle(td) {
        if (td.classList.contains('active')) {
            td.classList.remove('active', 'clicked');
            td.setAttribute('aria-pressed', 'false');
        } else {
            td.classList.add('active', 'clicked');
            td.setAttribute('aria-pressed', 'true');
        }
    }
    table.addEventListener('click', e => {
        const td = e.target.closest('td[data-letter]');
        if (td) toggle(td);
    });
    table.addEventListener('keydown', e => {
        const td = e.target.closest('td[data-letter]');
        if (td && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            toggle(td);
        }
    });

    // Marcar desde la ruleta
    function mark(letter, num) {
        const selector = `td[data-letter="${letter}"][data-num="${String(num).padStart(2, '0')}"]`;
        const cell = table.querySelector(selector);
        if (cell) {
            cell.classList.add('active', 'clicked');
            cell.setAttribute('aria-pressed', 'true');
        }
    }
    if (window.Conexion && typeof window.Conexion.subscribe === 'function') {
        window.Conexion.subscribe(({ letter, num }) => mark(letter, num), true);
    } else {
        window.addEventListener('bingo:drawn', e => {
            const { letter, num } = e.detail || {};
            if (letter && num) mark(letter, num);
        });
    }

    // ===== Encabezados como botones de filtro (crecen 5% + naranja) =====
    let activeLetter = null; // cuál está activa

    function applyHeaderStyles() {
        ['B', 'I', 'N', 'G', 'O'].forEach(letter => {
            const th = heads[letter];
            if (letter === activeLetter) {
                th.style.transform = 'scale(1.05)';    // crecer 5%
                th.style.color = '#ff9800';            // naranja activo
            } else {
                th.style.transform = 'scale(1)';       // tamaño base
                th.style.color = '';                   // limpiar: vuelve al dorado del CSS
            }
        });
    }

    function setFilter(letterOrNull) {
        activeLetter = letterOrNull;
        applyHeaderStyles();
        if (window.Conexion && typeof window.Conexion.setFilter === 'function') {
            window.Conexion.setFilter(letterOrNull);
        }
    }

    // click / teclado
    Object.entries(heads).forEach(([letter, th]) => {
        th.addEventListener('click', () => {
            setFilter(activeLetter === letter ? null : letter);
        });
        th.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFilter(activeLetter === letter ? null : letter);
            }
        });
    });

    // si alguien más cambia el filtro, refleja el estado
    if (window.Conexion && typeof window.Conexion.subscribeFilter === 'function') {
        window.Conexion.subscribeFilter((flt) => {
            activeLetter = flt || null;
            applyHeaderStyles();
        }, true);
    }

    // Al cargar, limpia celdas (arranque apagado)
    document.querySelectorAll('table.table td').forEach(td => {
        td.classList.remove('active', 'clicked');
        td.setAttribute('aria-pressed', 'false');
    });
});

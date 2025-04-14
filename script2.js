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
    const ranges = {
        B: Array.from({ length: 15 }, (_, i) => i + 1),
        I: Array.from({ length: 15 }, (_, i) => i + 16),
        N: Array.from({ length: 15 }, (_, i) => i + 31),
        G: Array.from({ length: 15 }, (_, i) => i + 46),
        O: Array.from({ length: 15 }, (_, i) => i + 61)
    };

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
});

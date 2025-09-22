// conexion/bridge.js
// Pequeño bus + almacenamiento para conectar ruleta <-> tabla
(function () {
    const KEY = 'bingo_history_v1';
    const subs = new Set();

    function load() {
        try { return JSON.parse(localStorage.getItem(KEY)) || []; }
        catch { return []; }
    }
    let history = load();

    function save() {
        try { localStorage.setItem(KEY, JSON.stringify(history)); }
        catch { }
    }

    // Publica un número y notifica a suscriptores + dispara evento global
    function publish(draw) {
        // draw: { letter: 'B'|'I'|'N'|'G'|'O', num: '01'..'75', ts: number }
        history.push(draw);
        save();

        // avisar a suscriptores
        subs.forEach(fn => { try { fn(draw); } catch { } });

        // por compatibilidad, también emitimos el customEvent
        try {
            window.dispatchEvent(new CustomEvent('bingo:drawn', { detail: draw }));
        } catch { }
    }

    // Suscribirse; si replay=true, reenvía historial al suscriptor
    function subscribe(fn, replay = true) {
        subs.add(fn);
        if (replay) history.forEach(d => { try { fn(d); } catch { } });
        return () => subs.delete(fn);
    }

    function getHistory() { return history.slice(); }
    function clear() { history = []; save(); }

    // Exponer en global
    window.Conexion = { publish, subscribe, getHistory, clear };
})();

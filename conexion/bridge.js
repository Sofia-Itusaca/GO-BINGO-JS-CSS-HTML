// conexion/bridge.js
// Bus de eventos + historial + filtro por letra

(function () {
    const KEY = 'bingo_history_v1';
    const subs = new Set();

    function load() {
        try { return JSON.parse(localStorage.getItem(KEY)) || []; }
        catch { return []; }
    }
    let history = load();

    function save() {
        try { localStorage.setItem(KEY, JSON.stringify(history)); } catch { }
    }

    // --- PUBLICAR SORTEO ---
    function publish(draw) {
        // draw: { letter: 'B'|'I'|'N'|'G'|'O', num: '01'..'75', ts: number }
        history.push(draw);
        save();

        subs.forEach(fn => { try { fn(draw); } catch { } });
        try { window.dispatchEvent(new CustomEvent('bingo:drawn', { detail: draw })); } catch { }
    }

    function subscribe(fn, replay = true) {
        subs.add(fn);
        if (replay) history.forEach(d => { try { fn(d); } catch { } });
        return () => subs.delete(fn);
    }

    function getHistory() { return history.slice(); }
    function clear() { history = []; save(); }

    // --- FILTRO POR LETRA (NUEVO) ---
    let currentFilter = null; // null | 'B'|'I'|'N'|'G'|'O'
    const filterSubs = new Set();

    function setFilter(letterOrNull) {
        const valid = [null, 'B', 'I', 'N', 'G', 'O'];
        if (!valid.includes(letterOrNull)) return;
        currentFilter = letterOrNull;

        // notificar suscriptores + evento
        filterSubs.forEach(fn => { try { fn(currentFilter); } catch { } });
        try { window.dispatchEvent(new CustomEvent('bingo:filter', { detail: { filter: currentFilter } })); } catch { }
    }
    function getFilter() { return currentFilter; }
    function subscribeFilter(fn, emitNow = true) {
        filterSubs.add(fn);
        if (emitNow) { try { fn(currentFilter); } catch { } }
        return () => filterSubs.delete(fn);
    }

    // Exponer API
    window.Conexion = {
        publish, subscribe, getHistory, clear,
        setFilter, getFilter, subscribeFilter
    };
})();


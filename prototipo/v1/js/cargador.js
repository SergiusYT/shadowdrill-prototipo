// Pantalla de carga (basada en el Spinner de ec-cargo-technical-test):
// baja desde arriba, cicla la fuente del texto «Cargando», se mantiene un mínimo y sube.
// El contenido se renderiza justo cuando empieza a subir, así las animaciones de entrada
// de cada componente corren al revelarse (no se tocan: se disparan igual que siempre).
//
// Dos usos:
//   new Cargador()                      → arranque: espera a que cargue la página.
//   Cargador.transicion(render, opts)   → cambio principal (sección, rol): más corto.

const CARGA_FUENTES = [
  "'Bricolage Grotesque', sans-serif", "'JetBrains Mono', monospace", "'Public Sans', sans-serif",
  'Georgia, serif', 'Impact, sans-serif', "'Courier New', monospace", 'Verdana, sans-serif', "'Arial Black', sans-serif"
];
let cargadorActivo = false;

class Cargador {
  static get activo() { return cargadorActivo; }

  // Loader corto para un cambio dentro de la app. render() corre al levantarse el overlay.
  static transicion(render, opts = {}) {
    if (cargadorActivo) { render(); return null; }
    return new Cargador({ esperarCarga: false, minMs: 850, render, ...opts });
  }

  constructor({ minMs = 1700, esperarCarga = true, sub = 'Preparando el panel…', render = null } = {}) {
    cargadorActivo = true;
    this.reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.minDone = false; this.bootDone = !esperarCarga; this.salio = false;
    this.sub = sub; this.alSalir = render ? [render] : [];
    this.listo = new Promise(r => (this._resolver = r));
    this._montar();
    this._ciclarFuentes();
    setTimeout(() => this.el.classList.replace('cargador--enter', 'cargador--hold'), this.reducir ? 0 : 450);
    setTimeout(() => { this.minDone = true; this._intentarSalir(); }, this.reducir ? 260 : minMs);
    if (esperarCarga) {
      if (document.readyState === 'complete') this._boot();
      else window.addEventListener('load', () => this._boot(), { once: true });
    }
  }

  _boot() { this.bootDone = true; this._intentarSalir(); }
  cuandoSalga(fn) { this.alSalir.push(fn); }

  _intentarSalir() {
    if (this.salio || !this.minDone || !this.bootDone) return;
    this.salio = true;
    clearInterval(this._int);
    this.alSalir.forEach(fn => fn());          // renderiza el contenido ahora: sus entradas animan al revelarse
    requestAnimationFrame(() => {
      this.el.classList.remove('cargador--hold');
      this.el.classList.add('cargador--exit');
    });
    const quitar = () => { if (this.el.isConnected) this.el.remove(); cargadorActivo = false; this._resolver(); };
    if (this.reducir) setTimeout(quitar, 60);
    else { this.el.addEventListener('animationend', e => { if (e.target === this.el) quitar(); }, { once: true }); setTimeout(quitar, 1000); }
  }

  _montar() {
    const o = document.createElement('div');
    o.className = 'cargador cargador--enter';
    o.setAttribute('role', 'status');
    o.setAttribute('aria-label', 'Cargando ShadowDrill');
    o.innerHTML = `
      <div class="cargador-marca">${marcaSVG()}<span>ShadowDrill</span></div>
      <div class="cargador-txt-cont">
        <span class="cargador-txt">Cargando</span>
        <div class="cargador-scan"></div>
        <span class="cargador-sub">${this.sub}</span>
      </div>
      <div class="cargador-barra" aria-hidden="true"></div>`;
    document.body.appendChild(o);
    this.el = o;
  }

  _ciclarFuentes() {
    if (this.reducir) return;
    const t = this.el.querySelector('.cargador-txt');
    let i = 0;
    this._int = setInterval(() => { t.style.fontFamily = CARGA_FUENTES[i++ % CARGA_FUENTES.length]; }, 80);
  }
}

// Carpetas de vidrio: una por escenario, con sus campañas como hojas.
// Adaptación vanilla del componente GlassFolder (React). Tres capas: panel trasero con arte,
// las hojas, y un frente de vidrio esmerilado que difumina lo que tiene detrás.
// Reposo: cerrada. Hover/foco: el frente se inclina. Clic/Enter: las hojas salen en abanico.

const CP_TRAS = 'M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z';
const CP_FRENTE = 'M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 176A22 22 0 0 1 318 198L22 198A22 22 0 0 1 0 176Z';
const CP_MAX = 4;

// Arte del panel trasero: degradados en tonos tech, distinto por escenario.
const CP_ARTE = {
  phishing: 'radial-gradient(60% 70% at 18% 30%, #22D3EE 0%, transparent 60%), radial-gradient(55% 60% at 85% 75%, #4F46E5 0%, transparent 65%), conic-gradient(from 210deg at 60% 40%, #0B2447, #0E7490, #1E1B4B, #0B2447)',
  ingenieria: 'radial-gradient(60% 70% at 80% 25%, #A78BFA 0%, transparent 60%), radial-gradient(55% 60% at 15% 80%, #0EA5C6 0%, transparent 65%), conic-gradient(from 90deg at 40% 60%, #1E1B4B, #4C1D95, #0F172A, #1E1B4B)',
  archivo: 'radial-gradient(60% 70% at 25% 70%, #2DD4BF 0%, transparent 60%), radial-gradient(55% 60% at 80% 20%, #38BDF8 0%, transparent 65%), conic-gradient(from 300deg at 50% 50%, #042F2E, #0F766E, #0C4A6E, #042F2E)',
  pagina: 'radial-gradient(60% 70% at 70% 65%, #60A5FA 0%, transparent 60%), radial-gradient(55% 60% at 20% 20%, #E879F9 0%, transparent 60%), conic-gradient(from 30deg at 50% 40%, #172554, #1D4ED8, #312E81, #172554)'
};

function carpeta(esc, campanas, admin) {
  const lista = campanas.slice().sort((a, b) => a.creada - b.creada);
  const visibles = lista.slice(-CP_MAX); // las más nuevas van adelante, cerca del vidrio
  const n = visibles.length;
  let f = 0, t = 0;
  lista.forEach(c => Object.values(c.resultados).forEach(r => { t++; if (r === 'fallo') f++; }));
  const nombre = ESCENARIOS[esc].nombre;
  const hojas = visibles.map((c, v) => {
    const res = Object.values(c.resultados), fc = res.filter(r => r === 'fallo').length;
    const slot = n <= 1 ? 0 : (v / (n - 1)) * 2 - 1;
    const jit = ((c.id.charCodeAt(2) * 37) % 10 - 5);
    return `<a class="cp-hoja" href="#/campana/${c.id}" role="listitem" tabindex="-1"
      style="--slot:${slot.toFixed(2)};--prof:${n - 1 - v};--jx:${jit}px;--jr:${(jit * .3).toFixed(1)}deg;z-index:${v + 1}">
      <span class="cp-hoja-cab"><span class="cp-hoja-nombre">${c.nombre}</span><span class="cp-hoja-meta">${res.length ? pct(fc, res.length) + ' %' : 'en curso'}</span></span>
      <span class="cp-hoja-sub">${c.canal === 'correo' ? 'Correo' : 'Teams'} · ${fecha(c.creada)}</span>
      <span class="cp-lineas" aria-hidden="true"><i style="width:86%"></i><i style="width:92%"></i><i style="width:64%"></i><i style="width:78%"></i></span>
    </a>`;
  }).join('');
  return `<div class="cp" data-esc="${esc}">
    <div class="cp-escena">
      <div class="cp-tilt">
        <div class="cp-sombra" aria-hidden="true"></div>
        <div class="cp-tras" style="clip-path:path('${CP_TRAS}')" aria-hidden="true"><div class="cp-arte" style="background:${CP_ARTE[esc]}"></div><div class="cp-brillo"></div></div>
        <svg class="cp-borde cp-borde-tras" viewBox="0 0 340 272" aria-hidden="true"><path d="${CP_TRAS}"/></svg>
        <div class="cp-hojas" role="list" aria-label="Campañas de ${nombre}">${hojas || ''}</div>
        <div class="cp-frente" style="clip-path:path('${CP_FRENTE}')">
          <div class="cp-tinte" aria-hidden="true"></div>
          <div class="cp-luz" aria-hidden="true"></div>
          <svg class="cp-borde cp-borde-frente" viewBox="0 0 340 198" aria-hidden="true"><path d="${CP_FRENTE}"/></svg>
          <button type="button" class="cp-hit" aria-expanded="false" aria-label="Abrir ${nombre}, ${lista.length} campañas"></button>
          <div class="cp-label">
            <span class="cp-titulo">${nombre}</span>
            <span class="cp-meta">${lista.length} ${lista.length === 1 ? 'campaña' : 'campañas'} · ${t ? pct(f, t) : 0} % fallo</span>
          </div>
        </div>
        ${admin ? `<a class="cp-tecla" href="#/nueva" data-accion="nueva-esc" data-esc="${esc}" aria-label="Nueva campaña de ${nombre}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5v15M4.5 12h15"/></svg></a>` : ''}
      </div>
    </div>
  </div>`;
}

function vistaCarpetas() {
  const admin = estado.rol === 'admin';
  return `<div class="carpetas">${Object.keys(ESCENARIOS).map(e => carpeta(e, estado.campanas.filter(c => c.escenario === e), admin)).join('')}</div>`;
}

function abrirCarpeta(cp, abrir) {
  cp.toggleAttribute('data-abierta', abrir);
  const hit = cp.querySelector('.cp-hit');
  hit.setAttribute('aria-expanded', abrir);
  hit.setAttribute('aria-label', hit.getAttribute('aria-label').replace(/^(Abrir|Cerrar)/, abrir ? 'Cerrar' : 'Abrir'));
  cp.querySelectorAll('.cp-hoja').forEach(h => h.tabIndex = abrir ? 0 : -1);
}

document.addEventListener('click', ev => {
  const hit = ev.target.closest('.cp-hit');
  const abierta = document.querySelector('.cp[data-abierta]');
  if (hit) {
    const cp = hit.closest('.cp'), abrir = !cp.hasAttribute('data-abierta');
    if (abierta && abierta !== cp) abrirCarpeta(abierta, false);
    abrirCarpeta(cp, abrir);
    return;
  }
  if (abierta && !ev.target.closest('.cp')) abrirCarpeta(abierta, false);
});
document.addEventListener('keydown', ev => {
  const abierta = document.querySelector('.cp[data-abierta]');
  if (ev.key === 'Escape' && abierta) { abrirCarpeta(abierta, false); abierta.querySelector('.cp-hit').focus(); }
});
// La luz y una leve inclinación siguen al puntero, sin re-renderizar.
document.addEventListener('pointermove', ev => {
  const cp = ev.target.closest?.('.cp');
  document.querySelectorAll('.cp[style*="--px"]').forEach(o => { if (o !== cp) { o.style.removeProperty('--px'); o.style.removeProperty('--py'); } });
  if (!cp || ev.pointerType === 'touch') return;
  const r = cp.getBoundingClientRect();
  cp.style.setProperty('--px', (((ev.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
  cp.style.setProperty('--py', (((ev.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
}, { passive: true });

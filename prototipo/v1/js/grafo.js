// Mapa de relaciones del panel: un grafo de fuerzas en SVG vanilla, sin librerías.
// Une canales, campañas, amenazas, áreas y resultados. Todo es agregado; la capa
// «personas» solo existe para el administrador (el responsable nunca ve individuos).

const GRAFO_COL = { canal: .06, campana: .25, escenario: .45, area: .66, persona: .79, resultado: .9 };
const GRAFO_RES = {
  fallo: { nombre: 'Cayó', color: 'var(--g-fallo)' },
  reporto: { nombre: 'Reportó', color: 'var(--g-reporto)' },
  ignoro: { nombre: 'Ignoró', color: 'var(--g-neutro)' }
};

// ---- Datos: nodos y aristas a partir de las campañas ----
function datosGrafo(capas, admin) {
  const nodos = [], aristas = [], idx = {};
  const nodo = n => { idx[n.id] = n; nodos.push(n); return n; };
  const arista = (a, b, tipo, w, extra = {}) => aristas.push({ a, b, tipo, w, ...extra });
  const camps = estado.campanas.filter(c => Object.keys(c.resultados).length);
  const conteo = filtro => { const r = { fallo: 0, reporto: 0, ignoro: 0 }; camps.forEach(c => Object.entries(c.resultados).forEach(([id, x]) => { if (filtro(c, id)) r[x]++; })); return r; };
  const tot = r => r.fallo + r.reporto + r.ignoro;

  // Resultados
  const rTodo = conteo(() => true);
  Object.entries(GRAFO_RES).forEach(([k, v]) => nodo({ id: 'r-' + k, tipo: 'resultado', clave: k, etiqueta: v.nombre, color: v.color, r: 15,
    info: [['decisiones', rTodo[k]], ['del total', pct(rTodo[k], tot(rTodo)) + ' %']] }));

  // Canales
  ['correo', 'teams'].forEach(k => {
    const cs = camps.filter(c => c.canal === k); if (!cs.length) return;
    const r = conteo(c => c.canal === k);
    nodo({ id: 'k-' + k, tipo: 'canal', etiqueta: k === 'correo' ? 'Correo' : 'Teams', icono: k === 'correo' ? 'correo' : 'chat', r: 15,
      info: [['campañas', cs.length], ['decisiones', tot(r)], ['fallo', pct(r.fallo, tot(r)) + ' %'], ['reporte', pct(r.reporto, tot(r)) + ' %']] });
    if (capas.resultados) Object.keys(GRAFO_RES).forEach(x => r[x] && arista('k-' + k, 'r-' + x, 'resultado', r[x], { res: x }));
  });

  // Escenarios
  Object.entries(ESCENARIOS).forEach(([k, e]) => {
    const r = conteo(c => c.escenario === k);
    nodo({ id: 'e-' + k, tipo: 'escenario', etiqueta: e.nombre, icono: ESC_ICO[k], r: 17,
      info: [['decisiones', tot(r)], ['fallo', pct(r.fallo, tot(r)) + ' %'], ['reporte', pct(r.reporto, tot(r)) + ' %'], ['regla', e.reglaFallo.split(':')[0]]] });
    if (capas.resultados) Object.keys(GRAFO_RES).forEach(x => r[x] && arista('e-' + k, 'r-' + x, 'resultado', r[x], { res: x }));
  });

  // Áreas: resultados, punto débil y similitud de perfil entre áreas
  const perfil = {};
  AREAS.forEach(a => {
    const r = conteo((c, id) => emp(id).area === a);
    perfil[a] = Object.keys(ESCENARIOS).map(k => tasaFallo(x => x.area === a, k).p);
    const peor = Object.keys(ESCENARIOS)[perfil[a].indexOf(Math.max(...perfil[a]))];
    nodo({ id: 'a-' + a, tipo: 'area', etiqueta: a, r: 14,
      info: [['personas', EMPLEADOS.filter(e => e.area === a).length], ['fallo', pct(r.fallo, tot(r)) + ' %'], ['reporte', pct(r.reporto, tot(r)) + ' %'], ['más débil', ESCENARIOS[peor].nombre]] });
    if (capas.resultados) Object.keys(GRAFO_RES).forEach(x => r[x] && arista('a-' + a, 'r-' + x, 'resultado', r[x], { res: x }));
    if (capas.similitud) Object.keys(ESCENARIOS).forEach((k, i) => perfil[a][i] >= 50 && arista('e-' + k, 'a-' + a, 'debil', perfil[a][i], { tip: `<b>${a}</b> cae ${perfil[a][i]} % en ${ESCENARIOS[k].nombre.toLowerCase()}` }));
  });
  if (capas.similitud) {
    // cada área se une con la de perfil de fallo más parecido (100 % = idénticos)
    const vistos = new Set();
    AREAS.forEach(a => {
      const sim = b => 100 - Math.round(perfil[a].reduce((s, v, i) => s + Math.abs(v - perfil[b][i]), 0) / perfil[a].length);
      const otra = AREAS.filter(b => b !== a).sort((x, y) => sim(y) - sim(x))[0];
      const clave = [a, otra].sort().join('|');
      if (vistos.has(clave)) return; vistos.add(clave);
      arista('a-' + a, 'a-' + otra, 'similitud', sim(otra), { tip: `<b>${a} ↔ ${otra}</b><br>Perfil de fallo ${sim(otra)} % parecido` });
    });
  }

  // Campañas
  if (capas.estructura) camps.forEach(c => {
    const v = Object.values(c.resultados), f = pct(v.filter(x => x === 'fallo').length, v.length);
    nodo({ id: 'c-' + c.id, tipo: 'campana', etiqueta: c.nombre, r: 6, enlace: '#/campana/' + c.id,
      info: [['fecha', fecha(c.creada)], ['decisiones', v.length], ['fallo', f + ' %'], ['estado', c.estado === 'en-curso' ? 'en curso' : 'cerrada']] });
    arista('k-' + c.canal, 'c-' + c.id, 'estructura', 1);
    arista('c-' + c.id, 'e-' + c.escenario, 'estructura', 1);
  });

  // Personas (solo administrador)
  if (admin && capas.personas) EMPLEADOS.forEach(e => {
    const s = sugerencia(e.id);
    nodo({ id: 'p-' + e.id, tipo: 'persona', etiqueta: e.nombre, r: 6, tono: tonoAva(e.nombre), enlace: '#/empleado/' + e.id,
      info: [['área', e.area], ['cargo', e.cargo], ['más débil', ESCENARIOS[s].nombre]] });
    arista('a-' + e.area, 'p-' + e.id, 'estructura', 1);
    arista('p-' + e.id, 'e-' + s, 'sugerencia', 1, { tip: `<b>${e.nombre.split(' ')[0]}</b>: amenaza más débil, ${ESCENARIOS[s].nombre.toLowerCase()}` });
  });

  const validas = aristas.filter(x => idx[x.a] && idx[x.b]);
  return { nodos, aristas: validas, idx };
}

// ---- Fuerzas: repulsión, resortes y una columna suave por tipo ----
function simularGrafo(g, W, H, pasos = 320) {
  const tipos = {};
  g.nodos.forEach(n => (tipos[n.tipo] ||= []).push(n));
  Object.values(tipos).forEach(lista => lista.forEach((n, i) => {
    n.x ??= W * GRAFO_COL[n.tipo] + (i % 2 ? 14 : -14);
    n.y ??= H * (i + 1) / (lista.length + 1);
    n.vx = 0; n.vy = 0;
    // anclas: resultados y canales quedan quietos y repartidos para que el resto se ordene entre ellos
    if (n.tipo === 'resultado' || n.tipo === 'canal') { n.y = H * (i + 1) / (lista.length + 1); n.x = W * GRAFO_COL[n.tipo]; n.fijo = true; }
  }));
  const wMax = Math.max(1, ...g.aristas.filter(a => a.tipo === 'resultado').map(a => a.w));
  for (let t = 0; t < pasos; t++) {
    const k = 1 - t / pasos;
    for (let i = 0; i < g.nodos.length; i++) for (let j = i + 1; j < g.nodos.length; j++) {
      const a = g.nodos[i], b = g.nodos[j];
      let dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy || 1;
      const min = a.r + b.r + 26;
      const f = (d2 < min * min ? 9000 : 3200) / d2;
      const d = Math.sqrt(d2); dx /= d; dy /= d;
      a.vx -= dx * f; a.vy -= dy * f; b.vx += dx * f; b.vy += dy * f;
    }
    g.aristas.forEach(e => {
      const a = g.idx[e.a], b = g.idx[e.b];
      const largo = e.tipo === 'estructura' ? 70 : e.tipo === 'resultado' ? 200 : 150;
      const fuerza = e.tipo === 'resultado' ? .004 * (.3 + e.w / wMax) : .012;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, f = (d - largo) * fuerza;
      a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f;
    });
    g.nodos.forEach(n => {
      if (n.fijo) { n.vx = n.vy = 0; return; }
      n.vx += (W * GRAFO_COL[n.tipo] - n.x) * .06;      // columna por tipo: se lee de izquierda a derecha
      n.vy += (H / 2 - n.y) * .0015;
      n.x += n.vx * k * .5; n.y += n.vy * k * .5;
      n.vx *= .55; n.vy *= .55;
      n.x = Math.max(n.r + 30, Math.min(W - n.r - 30, n.x));
      n.y = Math.max(n.r + 22, Math.min(H - n.r - 22, n.y));
    });
  }
}

// ---- Dibujo ----
function svgGrafo(g, W, H) {
  const wMax = Math.max(1, ...g.aristas.filter(a => a.tipo === 'resultado').map(a => a.w));
  const curva = (a, b) => { const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * .08; return `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`; };
  const aristas = g.aristas.map((e, i) => {
    const a = g.idx[e.a], b = g.idx[e.b];
    const ancho = e.tipo === 'resultado' ? (1 + e.w / wMax * 7).toFixed(1) : e.tipo === 'debil' ? 1.6 : e.tipo === 'similitud' ? 1.4 : 1;
    const color = e.tipo === 'resultado' ? GRAFO_RES[e.res].color : '';
    const tip = e.tip || (e.tipo === 'resultado' ? `<b>${a.etiqueta} → ${GRAFO_RES[e.res].nombre}</b><br>${e.w} decisiones` : '');
    return `<path id="ga-${i}" class="gr-arista gr-${e.tipo}" d="${curva(a, b)}" data-a="${e.a}" data-b="${e.b}" style="stroke-width:${ancho}${color ? ';stroke:' + color : ''}" ${tip ? `data-tip="${tip}"` : ''}/>`;
  }).join('');
  const nodos = g.nodos.map(n => {
    const lado = n.tipo === 'resultado' || n.tipo === 'persona' ? 'start' : n.tipo === 'canal' ? 'start' : 'middle';
    const tx = lado === 'start' ? n.x + n.r + 8 : n.x, ty = lado === 'start' ? n.y + 4 : n.y + n.r + 15;
    const etq = n.tipo === 'campana' || n.tipo === 'persona' ? '' : `<text class="gr-etq gr-etq-${n.tipo}" x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${lado}">${n.etiqueta}</text>`;
    const icono = n.icono ? `<svg class="gr-ico" x="${(n.x - 8).toFixed(1)}" y="${(n.y - 8).toFixed(1)}" width="16" height="16" viewBox="0 0 24 24">${ICONOS[n.icono]}</svg>` : '';
    const estilo = n.tipo === 'resultado' ? `--c:${n.color}` : n.tipo === 'persona' ? `--h:${n.tono}` : '';
    return `<g class="gr-nodo gr-n-${n.tipo}" data-id="${n.id}" style="${estilo}" tabindex="0" role="button" aria-label="${n.tipo}: ${n.etiqueta}" data-tip="<b>${n.etiqueta}</b>${n.info.slice(0, 2).map(([k, v]) => `<br>${k}: ${v}`).join('')}">
      <circle class="gr-halo" cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r + 6}"/>
      <circle class="gr-disco" cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r}"/>${icono}${etq}</g>`;
  }).join('');
  const columnas = [['canal', 'canales'], ['campana', 'campañas'], ['escenario', 'amenazas'], ['area', 'áreas'], ['resultado', 'resultados']]
    .filter(([t]) => g.nodos.some(n => n.tipo === t))
    .map(([t, txt]) => `<text class="gr-col" x="${W * GRAFO_COL[t]}" y="14" text-anchor="middle">${txt}</text>`).join('');
  return `<svg class="gr-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mapa de relaciones entre canales, campañas, amenazas, áreas y resultados">
    <defs><filter id="gr-brillo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <pattern id="gr-rejilla" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="rgba(125,211,252,.08)"/></pattern></defs>
    <rect width="${W}" height="${H}" fill="url(#gr-rejilla)"/>
    ${columnas}<g class="gr-aristas">${aristas}</g><g class="gr-nodos">${nodos}</g></svg>`;
}

// ---- Tarjeta completa ----
function tarjetaGrafo(admin) {
  const capas = estado.grafoCapas ||= { estructura: true, resultados: true, similitud: true, personas: false };
  if (!admin) capas.personas = false;
  const W = 1000, H = 560;
  const g = datosGrafo(capas, admin);
  simularGrafo(g, W, H);
  estado.grafo = g;
  const boton = (k, txt) => `<button type="button" class="seg-btn ${capas[k] ? 'activo' : ''}" data-capa="${k}" aria-pressed="${capas[k]}">${txt}</button>`;
  return `<section class="tarjeta grafo d-12">
    ${hud('mapa_relaciones')}
    <div class="fila-entre"><div><h2>Mapa de relaciones</h2>
      <p class="sub-t">Cómo se conectan canales, campañas, amenazas, áreas y resultados. El grosor de cada línea es la cantidad de decisiones. Pasa el mouse sobre un nodo para aislar sus conexiones. Haz clic para fijarlo.</p></div>
      <div class="segmentado" role="group" aria-label="Capas del mapa">${boton('estructura', 'Campañas')}${boton('resultados', 'Resultados')}${boton('similitud', 'Similitudes')}${admin ? boton('personas', 'Personas') : ''}</div>
    </div>
    <div class="gr-cuerpo">
      <div class="gr-lienzo">${svgGrafo(g, W, H)}</div>
      <aside class="gr-inspector tm" aria-live="polite">
        ${barraTerminal('admin@shadowdrill: ~/indicadores/mapa')}
        <div class="tm-cuerpo" id="gr-info">${infoGrafo(null)}</div>
      </aside>
    </div>
    <ul class="gr-leyenda">
      <li><i class="lg-res" style="background:var(--g-fallo)"></i>Cayó</li>
      <li><i class="lg-res" style="background:var(--g-reporto)"></i>Reportó</li>
      <li><i class="lg-res" style="background:var(--g-neutro)"></i>Ignoró</li>
      <li><i class="lg-debil"></i>Punto débil (área cae ≥ 50 % en esa amenaza)</li>
      <li><i class="lg-sim"></i>Áreas con perfil de fallo parecido</li>
      ${admin && capas.personas ? '<li><i class="lg-sug"></i>Amenaza más débil de cada persona (solo administrador)</li>' : ''}
    </ul>
  </section>`;
}

function infoGrafo(n) {
  const ps = `<span class="tm-ps"><b>admin@shadowdrill</b>:<i>~/mapa</i>$</span>`;
  if (!n) {
    const g = estado.grafo;
    return `<p class="tm-l tm-cmd">${ps} <span class="tm-c">mapa --resumen</span></p>
      <p class="tm-l tm-kv"><span>nodos</span><span><b>${g.nodos.length}</b></span></p>
      <p class="tm-l tm-kv"><span>enlaces</span><span><b>${g.aristas.length}</b></span></p>
      <p class="tm-l tm-meta"># pasa el mouse o toca un nodo para inspeccionarlo</p>
      <p class="tm-l tm-cmd">${ps} <span class="tm-cursor" aria-hidden="true"></span></p>`;
  }
  const g = estado.grafo;
  const vecinos = g.aristas.filter(e => e.a === n.id || e.b === n.id).map(e => g.idx[e.a === n.id ? e.b : e.a]);
  const tipo = { canal: 'canal', campana: 'campaña', escenario: 'amenaza', area: 'área', resultado: 'resultado', persona: 'persona' }[n.tipo];
  return `<p class="tm-l tm-cmd">${ps} <span class="tm-c">inspeccionar ${n.id}</span></p>
    <p class="tm-l gr-i-tit"><span class="gr-i-tipo">[${tipo}]</span> <b>${n.etiqueta}</b></p>
    ${n.info.map(([k, v]) => `<p class="tm-l tm-kv"><span>${k}</span><span><b>${v}</b></span></p>`).join('')}
    <p class="tm-l tm-meta"># ${vecinos.length} conexiones</p>
    <p class="tm-l gr-i-vec">${[...new Set(vecinos.map(v => v.etiqueta))].slice(0, 8).map(t => `<span>${t}</span>`).join('')}</p>
    ${n.enlace ? `<p class="tm-l"><a class="gr-i-ir" href="${n.enlace}">→ abrir ${tipo}</a></p>` : ''}
    <p class="tm-l tm-cmd">${ps} <span class="tm-cursor" aria-hidden="true"></span></p>`;
}

// ---- Interacción: foco, fijar, capas y arrastre ----
function iniciarGrafo() {
  const caja = document.querySelector('.grafo');
  if (!caja || caja.dataset.listo) return;
  caja.dataset.listo = '1';
  const svg = caja.querySelector('.gr-svg'), info = caja.querySelector('#gr-info');
  let fijo = null;
  const enfocar = id => {
    svg.classList.toggle('gr-foco', !!id);
    svg.querySelectorAll('.vecino, .activo').forEach(x => x.classList.remove('vecino', 'activo'));
    if (!id) { info.innerHTML = infoGrafo(null); return; }
    svg.querySelectorAll(`.gr-arista[data-a="${id}"], .gr-arista[data-b="${id}"]`).forEach(p => {
      p.classList.add('activo');
      svg.querySelector(`.gr-nodo[data-id="${p.dataset.a === id ? p.dataset.b : p.dataset.a}"]`)?.classList.add('vecino');
    });
    svg.querySelector(`.gr-nodo[data-id="${id}"]`)?.classList.add('activo');
    info.innerHTML = infoGrafo(estado.grafo.idx[id]);
  };
  svg.addEventListener('pointerover', e => { const n = e.target.closest('.gr-nodo'); if (n && !fijo) enfocar(n.dataset.id); });
  svg.addEventListener('pointerleave', () => { if (!fijo) enfocar(null); });
  svg.addEventListener('click', e => {
    const n = e.target.closest('.gr-nodo');
    fijo = n && fijo !== n.dataset.id ? n.dataset.id : null;
    enfocar(fijo || (n && n.dataset.id));
    svg.classList.toggle('gr-fijo', !!fijo);
  });
  svg.addEventListener('keydown', e => { const n = e.target.closest('.gr-nodo'); if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); n.dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
  svg.addEventListener('focusin', e => { const n = e.target.closest('.gr-nodo'); if (n && !fijo) enfocar(n.dataset.id); });
  caja.querySelectorAll('[data-capa]').forEach(b => b.addEventListener('click', () => {
    estado.grafoCapas[b.dataset.capa] = !estado.grafoCapas[b.dataset.capa];
    const nueva = document.createElement('div');
    nueva.innerHTML = tarjetaGrafo(estado.rol === 'admin');
    caja.replaceWith(nueva.firstElementChild);
    iniciarGrafo();
    if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) animarGrafo();
  }));
}

// Entrada: las conexiones se trazan y los nodos aparecen por columnas.
function animarGrafo() {
  const svg = document.querySelector('.gr-svg'); if (!svg || !window.gsap) return;
  svg.querySelectorAll('.gr-arista').forEach(p => {
    const l = p.getTotalLength();
    gsap.fromTo(p, { strokeDasharray: `${l} ${l}`, strokeDashoffset: l }, { strokeDashoffset: 0, duration: 1.1, delay: .2 + Math.random() * .5, ease: 'power2.out', onComplete: () => gsap.set(p, { clearProps: 'strokeDasharray,strokeDashoffset' }) });
  });
  gsap.from(svg.querySelectorAll('.gr-nodo'), { opacity: 0, duration: .5, stagger: .015, ease: 'power1.out', clearProps: 'opacity' });
}

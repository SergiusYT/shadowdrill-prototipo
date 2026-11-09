// Gráficas en SVG vanilla para el panel. Sin librerías.
// Colores de series validados en modo oscuro (dataviz validate_palette: todo PASS):
// reportó #0EA5C6, cayó #E5484D; "ignoró" es un gris neutro con etiqueta.

const SERIE = { reporto: '#0EA5C6', fallo: '#E5484D', ignoro: '#4B5A70' };
const NOMBRE_RES = { fallo: 'Cayó', reporto: 'Reportó', ignoro: 'Ignoró' };

// ---- Línea en el tiempo (una sola escala: porcentaje 0–100) ----
// series: [{ id, nombre, color, valores: [n...] }], etiquetas: ['10 jun', ...], detalle: ['Prima de junio', ...]
function graficaLinea({ series, etiquetas, detalle = [], alto = 240 }) {
  const W = 680, H = alto, iz = 40, de = 96, ar = 14, ab = 30;
  const n = etiquetas.length;
  const x = i => iz + (n === 1 ? (W - iz - de) / 2 : i * (W - iz - de) / (n - 1));
  const y = v => ar + (100 - v) * (H - ar - ab) / 100;
  const grilla = [0, 25, 50, 75, 100].map(v => `
    <line x1="${iz}" x2="${W - de}" y1="${y(v)}" y2="${y(v)}" class="g-grilla"/>
    <text x="${iz - 8}" y="${y(v) + 4}" class="g-eje" text-anchor="end">${v}%</text>`).join('');
  const ejeX = etiquetas.map((e, i) => `<text x="${x(i)}" y="${H - 8}" class="g-eje" text-anchor="middle">${e}</text>`).join('');
  // etiquetas directas al final, separadas al menos 16 px para que no se pisen
  const yEt = series.map((s, k) => ({ k, y: y(s.valores[n - 1]) })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < yEt.length; k++) if (yEt[k].y - yEt[k - 1].y < 16) yEt[k].y = yEt[k - 1].y + 16;
  const yDe = k => yEt.find(e => e.k === k).y;
  const trazos = series.map((s, k) => {
    const pts = s.valores.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    const area = `M${x(0)},${y(0)} L${pts.join(' L')} L${x(n - 1)},${y(0)} Z`;
    const ult = s.valores[n - 1];
    return `
      <defs><linearGradient id="ga-${s.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.color}" stop-opacity=".16"/><stop offset="1" stop-color="${s.color}" stop-opacity="0"/></linearGradient></defs>
      <path d="${area}" fill="url(#ga-${s.id})" class="g-area"/>
      <polyline points="${pts.join(' ')}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" class="g-trazo" filter="url(#g-brillo)"/>
      ${s.valores.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="var(--papel)" style="stroke:${s.color}" class="g-punto" data-i="${i}"/>`).join('')}
      <text x="${x(n - 1) + 12}" y="${yDe(k) + 4}" class="g-directa">${s.nombre} ${ult}%</text>`;
  }).join('');
  const datos = encodeURIComponent(JSON.stringify({ series: series.map(s => ({ nombre: s.nombre, color: s.color, valores: s.valores })), etiquetas, detalle, xs: etiquetas.map((_, i) => x(i)), ys: series.map(s => s.valores.map(y)) }));
  return `<div class="graf graf-linea" data-graf="${datos}">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución por campaña: ${series.map(s => s.nombre + ' de ' + s.valores[0] + '% a ' + s.valores[n - 1] + '%').join('; ')}">
      <defs><filter id="g-brillo" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <pattern id="g-scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="rgba(125,211,252,.035)"/></pattern></defs>
      <rect x="${iz}" y="${ar}" width="${W - iz - de}" height="${H - ar - ab}" fill="url(#g-scan)"/>
      ${grilla}${ejeX}${trazos}
      <line class="g-cursor" x1="0" x2="0" y1="${ar}" y2="${H - ab}" visibility="hidden"/>
      <rect class="g-captura" x="${iz}" y="0" width="${W - iz - de}" height="${H - ab}" fill="transparent"/>
    </svg>
  </div>`;
}

// Reparte n celdas entre las partes por el método del mayor residuo (suma exacta).
function repartir(partes, orden, n) {
  const total = orden.reduce((s, k) => s + (partes[k] || 0), 0) || 1;
  const crudo = orden.map(k => (partes[k] || 0) / total * n);
  const ent = crudo.map(Math.floor);
  let falta = n - ent.reduce((s, x) => s + x, 0);
  crudo.map((c, k) => [c - ent[k], k]).sort((a, b) => b[0] - a[0]).forEach(([, k]) => { if (falta > 0) { ent[k]++; falta--; } });
  return { cuenta: Object.fromEntries(orden.map((k, i) => [k, ent[i]])), total };
}

// ---- Barras LED al 100 % (una fila por grupo, 50 celdas = 2 % cada una) ----
// filas: [{ nombre, partes: { fallo, reporto, ignoro } }]
function graficaApilada(filas) {
  const orden = ['fallo', 'reporto', 'ignoro'], N = 50;
  return `<div class="graf graf-led">
    ${filas.map(f => {
      const { cuenta, total } = repartir(f.partes, orden, N);
      const pc = k => Math.round((f.partes[k] || 0) / total * 100);
      const celdas = orden.map(k => {
        const tip = `<b>${f.nombre}</b><br>${NOMBRE_RES[k]}: ${pc(k)}% (${f.partes[k] || 0} de ${total})`;
        return Array.from({ length: cuenta[k] }, () => `<i class="led led-${k}" data-tip="${tip}"></i>`).join('');
      }).join('');
      return `<div class="led-fila" aria-label="${f.nombre}: ${orden.map(k => NOMBRE_RES[k] + ' ' + pc(k) + '%').join(', ')}">
        <span class="led-nombre">${f.nombre}</span>
        <span class="led-barra">${celdas}</span>
        <span class="led-vals"><b class="v-fallo">${pc('fallo')}</b><b class="v-reporto">${pc('reporto')}</b><b class="v-ignoro">${pc('ignoro')}</b></span>
      </div>`;
    }).join('')}
    <div class="led-fila led-escala" aria-hidden="true"><span></span><span class="esc"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></span><span class="led-vals"><b>cayó</b><b>rep.</b><b>sin</b></span></div>
  </div>`;
}

// ---- Dial de decisiones: anillo de 72 marcas, cada una ≈ 1,4 % ----
function graficaDona(partes, centro, sub) {
  const orden = ['fallo', 'reporto', 'ignoro'], N = 72, C = 80;
  const { cuenta, total } = repartir(partes, orden, N);
  const pc = k => Math.round(partes[k] / total * 100);
  let i = 0;
  const marcas = orden.map(k => Array.from({ length: cuenta[k] }, () => {
    const a = -Math.PI / 2 + (i++ + .5) * 2 * Math.PI / N, c = Math.cos(a), s = Math.sin(a);
    return `<line class="dl-marca dl-${k}" x1="${(C + c * 52).toFixed(1)}" y1="${(C + s * 52).toFixed(1)}" x2="${(C + c * 68).toFixed(1)}" y2="${(C + s * 68).toFixed(1)}" data-tip="<b>${NOMBRE_RES[k]}</b><br>${pc(k)}% · ${partes[k]} decisiones"/>`;
  }).join('')).join('');
  const reloj = Array.from({ length: 24 }, (_, k) => { const a = k * Math.PI / 12, c = Math.cos(a), s = Math.sin(a); return `<line x1="${(C + c * 74).toFixed(1)}" y1="${(C + s * 74).toFixed(1)}" x2="${(C + c * (k % 6 ? 76 : 79)).toFixed(1)}" y2="${(C + s * (k % 6 ? 76 : 79)).toFixed(1)}"/>`; }).join('');
  return `<div class="graf graf-dona">
    <svg viewBox="0 0 160 160" role="img" aria-label="${orden.map(k => NOMBRE_RES[k] + ' ' + pc(k) + '%').join(', ')}">
      <g class="dl-reloj">${reloj}</g>
      <circle r="44" cx="${C}" cy="${C}" class="dn-anillo"/>
      ${marcas}
      <circle r="38" cx="${C}" cy="${C}" class="dn-centro"/>
      <text x="${C}" y="${C + 2}" text-anchor="middle" class="dn-num">${centro}</text>
      <text x="${C}" y="${C + 17}" text-anchor="middle" class="dn-sub">${sub}</text>
    </svg>
    <ul class="leyenda-dial">${orden.map(k => `<li><span class="ld-cab"><i class="ld-${k}"></i>${NOMBRE_RES[k]}</span><b>${pc(k)}<small>%</small></b><span class="ld-n">${partes[k]} decisiones</span></li>`).join('')}</ul>
  </div>`;
}

// ---- Medidor VU: 40 segmentos con zonas de riesgo rotuladas ----
function medidorVU(p) {
  const N = 40, lit = Math.round(p / 100 * N);
  const zona = k => k < N * .3 ? 'bajo' : k < N * .5 ? 'medio' : 'alto';
  return `<div class="vu" role="img" aria-label="Tasa de fallo ${p} %, zona ${zona(Math.max(lit - 1, 0))}">
    <span class="vu-segs">${Array.from({ length: N }, (_, k) => `<i class="vu-${zona(k)} ${k < lit ? 'on' : ''}"></i>`).join('')}</span>
    <span class="vu-zonas" aria-hidden="true"><span style="flex:30">bajo</span><span style="flex:20">medio</span><span style="flex:50">alto</span></span>
  </div>`;
}

// ---- Sparkline sin ejes: trazo neutro, último punto con el color de la serie ----
function sparkline(valores, color) {
  const W = 120, H = 36, mx = Math.max(...valores), mn = Math.min(...valores), r = mx - mn || 1;
  const xy = valores.map((v, i) => [i * W / (valores.length - 1), H - 5 - (v - mn) / r * (H - 10)]);
  const pts = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`);
  const [ux, uy] = xy[xy.length - 1];
  return `<div class="spark-caja"><svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts.join(' ')}" fill="none" stroke="var(--tinta-2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg><i class="spark-fin" style="left:${(ux / W * 100).toFixed(1)}%;top:${(uy / H * 100).toFixed(1)}%;background:${color}"></i></div>`;
}

function leyendaG(items) {
  return `<ul class="leyenda-g">${items.map(([c, t]) => `<li><i style="background:${c}"></i>${t}</li>`).join('')}</ul>`;
}

// ---- Capa de interacción: tooltip y cursor ----
function tip() {
  let t = document.getElementById('tip-graf');
  if (!t) { t = document.createElement('div'); t.id = 'tip-graf'; t.className = 'tip-graf'; t.setAttribute('role', 'tooltip'); document.body.appendChild(t); }
  return t;
}
function mostrarTip(html, ev) {
  const t = tip(); t.innerHTML = html; t.classList.add('visible');
  const w = t.offsetWidth, x = Math.min(ev.clientX + 14, innerWidth - w - 8);
  t.style.transform = `translate(${x}px, ${ev.clientY - t.offsetHeight - 12}px)`;
}
function ocultarTip() { document.getElementById('tip-graf')?.classList.remove('visible'); }

document.addEventListener('pointermove', ev => {
  const seg = ev.target.closest?.('[data-tip]');
  if (seg) { mostrarTip(seg.dataset.tip, ev); return; }
  const cap = ev.target.closest?.('.g-captura');
  if (cap) {
    const caja = cap.closest('.graf-linea'), d = JSON.parse(decodeURIComponent(caja.dataset.graf));
    const svg = caja.querySelector('svg'), pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
    let i = 0; d.xs.forEach((xx, k) => { if (Math.abs(xx - loc.x) < Math.abs(d.xs[i] - loc.x)) i = k; });
    const cur = caja.querySelector('.g-cursor');
    cur.setAttribute('x1', d.xs[i]); cur.setAttribute('x2', d.xs[i]); cur.setAttribute('visibility', 'visible');
    caja.querySelectorAll('.g-punto').forEach(p => p.classList.toggle('activo', +p.dataset.i === i));
    mostrarTip(`<b>${d.detalle[i] || d.etiquetas[i]}</b><span class="tip-fecha">${d.etiquetas[i]}</span>${d.series.map(s => `<span class="tip-fila"><i style="background:${s.color}"></i>${s.nombre}<b>${s.valores[i]}%</b></span>`).join('')}`, ev);
    return;
  }
  ocultarTip();
  document.querySelectorAll('.g-cursor[visibility="visible"]').forEach(c => c.setAttribute('visibility', 'hidden'));
  document.querySelectorAll('.g-punto.activo').forEach(p => p.classList.remove('activo'));
}, { passive: true });

// ---- Radar del perfil: un eje por escenario, 0–100 ----
// valores: { 'Phishing': 42, ... } (null = sin datos, se dibuja en 0)
function graficaRadar(valores) {
  const C = 120, R = 84, ks = Object.keys(valores), n = ks.length;
  const pto = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [C + Math.cos(a) * R * v / 100, C + Math.sin(a) * R * v / 100]; };
  const anillos = [25, 50, 75, 100].map(v => `<polygon class="rd-anillo" points="${ks.map((_, i) => pto(i, v).join(',')).join(' ')}"/>`).join('');
  const ejes = ks.map((_, i) => { const [x, y] = pto(i, 100); return `<line class="rd-eje" x1="${C}" y1="${C}" x2="${x}" y2="${y}"/>`; }).join('');
  const forma = ks.map((k, i) => pto(i, valores[k] ?? 0).join(',')).join(' ');
  const color = v => v === null ? 'var(--tinta-3)' : v < 50 ? 'var(--fallo)' : v < 80 ? 'var(--medio)' : 'var(--acierto)';
  const puntos = ks.map((k, i) => { const [x, y] = pto(i, valores[k] ?? 0); return `<circle class="rd-punto" cx="${x}" cy="${y}" r="5" fill="${color(valores[k])}" data-tip="<b>${k}</b><br>${valores[k] ?? 'sin datos'}${valores[k] === null ? '' : ' puntos'}"/>`; }).join('');
  const etiquetas = ks.map((k, i) => { const [x, y] = pto(i, 124); const anc = Math.abs(x - C) < 4 ? 'middle' : x > C ? 'start' : 'end'; return `<text class="rd-etq" x="${x}" y="${y + 4}" text-anchor="${anc}">${k}<tspan class="rd-val" x="${x}" dy="14">${valores[k] ?? '–'}</tspan></text>`; }).join('');
  return `<div class="graf graf-radar"><svg viewBox="-40 -10 320 270" role="img" aria-label="Perfil: ${ks.map(k => k + ' ' + (valores[k] ?? 'sin datos')).join(', ')}">
    <defs><radialGradient id="rd-g"><stop offset="0" stop-color="#22D3EE" stop-opacity=".45"/><stop offset="1" stop-color="#22D3EE" stop-opacity=".12"/></radialGradient></defs>
    ${anillos}${ejes}<polygon class="rd-forma" points="${forma}" fill="url(#rd-g)"/>${puntos}${etiquetas}</svg></div>`;
}

function leyendaNiveles() {
  return `<ul class="leyenda-g"><li><i style="background:var(--fallo)"></i>Bajo 0–49</li><li><i style="background:var(--medio)"></i>Medio 50–79</li><li><i style="background:var(--acierto)"></i>Alto 80–100</li></ul>`;
}

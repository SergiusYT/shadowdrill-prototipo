// Portada con parallax. Adaptación vanilla del componente ParallaxComponent (React)
// con GSAP + ScrollTrigger + Lenis. Si las librerías no cargan, la portada queda estática.

const ICONOS = {
  panel: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  campanas: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  empleados: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  salir: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  enviar: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  reloj: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  perfil: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  correo: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  archivo: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M12 18v-6M9 15l3 3 3-3"/>',
  web: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  flecha: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  cruz: '<path d="M18 6 6 18M6 6l12 12"/>',
  medio: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
  candado: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  codigo: '<path d="m8 8-5 4 5 4M16 8l5 4-5 4M13.5 5l-3 14"/>',
  ojo: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 4l16 16"/>',
  firma: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 16c1.5-2 2.5-2 3 0s1.5 2 3 0"/>',
  regla: '<path d="M4 6h16M4 12h10M4 18h6"/><path d="m16 16 2 2 4-4"/>',
  escudo: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
};
const ico = (n, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[n]}</svg>`;

const SVG = contenido => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${contenido}</svg>`;

// Fondo: rejilla de señales (el radar es el barrido del plano). Cada punto es una persona; los ámbar acaban de decidir.
function escenaFondo() {
  const puntos = [[560, 330], [1050, 280], [1180, 610], [430, 640], [900, 720], [700, 200], [1290, 420], [330, 460]]
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 3 : 4.5}" fill="${i % 3 ? '#7DD3FC' : '#22D3EE'}" opacity="${i % 3 ? .45 : .9}"${i % 3 ? '' : ' class="ping"'}/>`).join('');
  return SVG(`
    <defs>
      <radialGradient id="fondo" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#0E1A2C"/><stop offset="1" stop-color="#04070C"/></radialGradient>
      <radialGradient id="halo" cx=".5" cy=".5" r=".35"><stop offset="0" stop-color="#22D3EE" stop-opacity=".16"/><stop offset="1" stop-color="#22D3EE" stop-opacity="0"/></radialGradient>
      <pattern id="rejilla" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#7DD3FC" opacity=".12"/></pattern>
    </defs>
    <rect width="1600" height="900" fill="url(#fondo)"/>
    <rect width="1600" height="900" fill="url(#rejilla)"/>
    <rect width="1600" height="900" fill="url(#halo)"/>
    ${puntos}`);
}

// ---------- Escena de la historia: un portátil y un celular reciben las 4 amenazas ----------

// Fondo: plano de una oficina visto en perspectiva (gerencia, sala de juntas, TI, puestos de trabajo).
// Un barrido de radar recorre el piso; los monitores se encienden cuando les llega una simulación.
function planoOficina() {
  const desks = [], monitores = [];
  let k = 0;
  for (let cx = 470; cx <= 1150; cx += 170) for (let cy = 360; cy <= 800; cy += 150) {
    [[-38, -22], [38, -22], [-38, 22], [38, 22]].forEach(([dx, dy]) => {
      const x = cx + dx, y = cy + dy, arriba = dy < 0;
      desks.push(`<rect x="${x - 32}" y="${y - 16}" width="64" height="32" rx="3"/><circle cx="${x}" cy="${y + (arriba ? -27 : 27)}" r="8"/>`);
      const tipo = k % 7 === 3 ? ' pl-f' : k % 7 === 5 ? ' pl-o' : '';
      monitores.push(`<rect class="pl-mon${tipo}" x="${x - 14}" y="${y + (arriba ? -12 : 7)}" width="28" height="5" rx="1.5" style="animation-delay:${((k * 1.7) % 9).toFixed(1)}s"/>`);
      k++;
    });
  }
  const sala = (x, y, w, h, nombre) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="pl-sala"/>`;
  const sillasMesa = Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return `<circle cx="${560 + Math.cos(a) * 120}" cy="${170 + Math.sin(a) * 52}" r="9"/>`; }).join('');
  const racks = [0, 1, 2, 3].map(i => `<rect x="${1290 + i * 62}" y="${110}" width="44" height="120" rx="3"/><line x1="${1296 + i * 62}" x2="${1328 + i * 62}" y1="140" y2="140"/><line x1="${1296 + i * 62}" x2="${1328 + i * 62}" y1="170" y2="170"/><line x1="${1296 + i * 62}" x2="${1328 + i * 62}" y1="200" y2="200"/>`).join('');
  return `<div class="h-plano"><svg viewBox="0 0 1600 1000" aria-hidden="true">
    <g class="pl-lineas">
      <rect x="40" y="40" width="1520" height="920" rx="10" class="pl-muro"/>
      ${sala(40, 40, 320, 260, 'GERENCIA')}${sala(360, 40, 420, 260, 'SALA DE JUNTAS')}${sala(1200, 40, 360, 260, 'TI Y SEGURIDAD')}${sala(40, 700, 320, 260, 'RECEPCIÓN')}
      <rect x="120" y="140" width="150" height="56" rx="4"/><circle cx="195" cy="226" r="10"/>
      <ellipse cx="560" cy="170" rx="95" ry="34"/>${sillasMesa}
      ${racks}
      <rect x="110" y="800" width="180" height="40" rx="20"/>
      ${desks.join('')}
    </g>
    ${monitores.join('')}
    ${ZONAS.map(([n, , x, y]) => `<circle class="pl-ancla" data-zona="${n}" cx="${x}" cy="${y}" r="1"/>`).join('')}
  </svg><div class="pl-barrido"></div></div>
  <div class="h-zonas" aria-hidden="true">${ZONAS.map(([n, i]) => `<span class="h-zona${i ? '' : ' h-zona-sede'}" data-zona="${n}">${i ? ico(i) : marcaSVG().replace('width="28" height="28"', 'width="16" height="16"')}${n}</span>`).join('')}</div>`;
}

// Áreas de la empresa sobre el plano: [nombre, ícono, x, y en el plano]. La primera es la sede.
const ZONAS = [
  ['Sede principal de la empresa', '', 800, 40],
  ['Gerencia', 'perfil', 200, 170], ['Sala de juntas', 'empleados', 570, 120], ['TI y Seguridad', 'escudo', 1380, 170],
  ['Talento Humano', 'empleados', 200, 480], ['Contabilidad', 'archivo', 555, 330], ['Operaciones', 'panel', 895, 330],
  ['Atención al cliente', 'chat', 1150, 330], ['Recepción', 'campanas', 200, 830]
];
// Ubica cada etiqueta sobre su zona proyectada (el plano está en perspectiva).
function ubicarZonas() {
  const capa = document.querySelector('.h-red');
  if (!capa) return;
  const cr = capa.getBoundingClientRect();
  document.querySelectorAll('.pl-ancla').forEach(a => {
    const r = a.getBoundingClientRect(), pin = capa.querySelector(`.h-zona[data-zona="${a.dataset.zona}"]`);
    if (pin) { pin.style.left = (r.left + r.width / 2 - cr.left) + 'px'; pin.style.top = (r.top + r.height / 2 - cr.top) + 'px'; }
  });
}

// Personas que van recibiendo simulaciones. Rotan cada pocos segundos (solo nombres de pila, sin resultados).
const GENTE = [
  ['LG', 'Laura', 'Contadora', 'correo', 'Correo recibido'],
  ['DR', 'Diego', 'Jefe de operaciones', 'chat', 'Mensaje nuevo'],
  ['MP', 'Marta', 'Talento Humano', 'archivo', 'Adjunto recibido'],
  ['JC', 'Juan', 'Atención al cliente', 'web', 'Enlace recibido'],
  ['AV', 'Ana', 'Tesorera', 'correo', 'Correo recibido'],
  ['CM', 'Carlos', 'Gerente general', 'chat', 'Mensaje nuevo'],
  ['SR', 'Sofía', 'Analista de nómina', 'archivo', 'Adjunto recibido'],
  ['FH', 'Felipe', 'Soporte TI', 'web', 'Enlace recibido'],
  ['VT', 'Valentina', 'Asesora comercial', 'correo', 'Correo recibido'],
  ['AM', 'Andrés', 'Auxiliar contable', 'web', 'Enlace recibido'],
  ['PC', 'Paula', 'Coordinadora de RR. HH.', 'chat', 'Mensaje nuevo'],
  ['NG', 'Nicolás', 'Cajero', 'archivo', 'Adjunto recibido'],
  ['IR', 'Isabel', 'Directora financiera', 'correo', 'Correo recibido'],
  ['ST', 'Santiago', 'Analista de datos', 'chat', 'Mensaje nuevo']
];
const PUESTOS = [[10, 22, 'i'], [9, 22, 'd'], [4, 50, 'i'], [4, 47, 'd'], [9, 76, 'i'], [8, 74, 'd']]; // [x, y, lado]
const horaAhora = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`; };
function contenidoPersona([ini, nombre, cargo, canal, estado]) {
  return `<span class="hp-ava">${ini}</span><span class="hp-txt"><b>${nombre}</b><small>${cargo}</small><em>${estado} · ${horaAhora()}</em></span><span class="hp-canal">${ico(canal)}</span>`;
}
function personas() {
  return PUESTOS.map(([x, y, lado], i) => `<div class="h-persona" style="${lado === 'i' ? 'left' : 'right'}:${x}%;top:${y}%" data-dx="${lado === 'i' ? -1 : 1}">
    <div class="hp-in">${contenidoPersona(GENTE[i])}</div>
  </div>`).join('');
}
function rotarPersonas() {
  const slots = [...document.querySelectorAll('.hp-in')];
  if (!slots.length) return null;
  let sig = slots.length, ultimo = -1;
  return setInterval(() => {
    let i; do i = Math.floor(Math.random() * slots.length); while (i === ultimo);
    ultimo = i;
    const el = slots[i];
    el.classList.add('cambia');
    setTimeout(() => { el.innerHTML = contenidoPersona(GENTE[sig++ % GENTE.length]); el.classList.remove('cambia'); }, 450);
  }, 1800);
}

function cursor() {
  return '<svg class="h-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#060A11" stroke-width="1.5" stroke-linejoin="round"/></svg>';
}

// Outlook (nuevo Outlook para Windows): rail de apps, cinta, carpetas, lista y panel de lectura.
const OL_COLOR = ['#C239B3', '#0F6CBD', '#E3008C', '#498205', '#CA5010', '#8764B8'];
function olAva(nombre, i) {
  const ini = nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  return `<span class="ol-av" style="background:${OL_COLOR[i % OL_COLOR.length]}">${ini}</span>`;
}
// opc.yo: iniciales de quien usa Outlook; opc.reportar: correo del buzón si el botón «Reportar» es interactivo.
function outlook(lista, lectura, opc = {}) {
  const svg = p => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  const rail = [ICONOS.correo, '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>', ICONOS.empleados, '<path d="m5 12 4 4 10-10"/>'];
  return `<div class="ol">
    <div class="ol-top">
      <span class="ol-marca"><i class="ol-o">O</i>Outlook</span>
      <span class="ol-buscar">${svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>')}Buscar</span>
      <span class="ol-top-ico">${svg('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21h4"/>')}${svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>')}</span>
      <span class="ol-yo">${opc.yo || 'LG'}</span>
    </div>
    <div class="ol-main">
      <nav class="ol-rail">${rail.map((p, i) => `<span${i === 0 ? ' class="act"' : ''}>${svg(p)}</span>`).join('')}<span class="ol-w">W</span><span class="ol-x">X</span></nav>
      <div class="ol-app">
        <div class="ol-cinta">
          <div class="ol-tabs"><span class="act">Inicio</span><span>Vista</span><span>Ayuda</span></div>
          <div class="ol-herr"><span class="ol-nuevo">${svg('<path d="M12 5v14M5 12h14"/>')}Correo nuevo</span><i></i><span>${svg('<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>')}Eliminar</span><span>${svg('<path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>')}Archivar</span>${opc.reportar ? `<button type="button" class="ol-reportar" data-accion="reportar" title="Envía el mensaje a ${opc.reportar}">${svg(ICONOS.escudo)}Reportar</button>` : `<span class="ol-reportar">${svg(ICONOS.escudo)}Reportar</span>`}<span>${svg('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-1"/>')}Responder</span></div>
        </div>
        <div class="ol-cuerpo">
          <div class="ol-carpetas">
            <p class="ol-grupo">⌄ Favoritos</p>
            <p class="act">${svg(ICONOS.correo)}Bandeja de entrada<b>9</b></p>
            <p>${svg('<path d="m22 2-7 20-4-9-9-4Z"/>')}Elementos enviados</p>
            <p class="ol-grupo">⌄ ${opc.correo || 'lgarcia@miempresa.co'}</p>
            <p>${svg(ICONOS.correo)}Bandeja de entrada<b>9</b></p>
            <p>${svg('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>')}Borradores</p>
            <p>${svg('<path d="M3 6h18M6 6l1 15h10l1-15"/>')}Elementos eliminados</p>
            <p>${svg('<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>')}Correo no deseado</p>
            <p>${svg('<path d="M21 8v13H3V8M1 3h22v5H1z"/>')}Archivo</p>
          </div>
          <div class="ol-lista">
            <div class="ol-foco"><span class="act">Prioritarios</span><span>Otros</span></div>
            <p class="ol-grupo">⌄ Hoy</p>
            ${lista.map(([de, asunto, prev, hora, act], i) => `${i === 2 ? '<p class="ol-grupo">⌄ Ayer</p>' : ''}<div class="ol-msj${act ? ' act' : ''}${i < 2 ? ' nuevo' : ''}">${olAva(de, i + (act ? 0 : 2))}<span class="ol-msj-txt"><b>${de}</b><span class="ol-asunto">${asunto}</span><small>${prev}</small></span><time>${hora}</time></div>`).join('')}
          </div>
          <div class="ol-lectura">${lectura}</div>
        </div>
      </div>
    </div>
  </div>`;
}
function olLectura(asunto, de, correo, hora, cuerpo, accion, para = 'Laura García') {
  return `<h4>${asunto}</h4>
    <div class="ol-remite">${olAva(de, 0)}<span><b>${de}</b> &lt;${correo}&gt;<small>Para: ${para}</small></span><time>${hora}</time></div>
    <div class="ol-texto"><p>Buen día, ${para.split(' ')[0]}:</p><p>${cuerpo}</p>${accion}<p class="ol-firma">Cordialmente,<br>${de}</p></div>`;
}
function pantallaCorreo() {
  const p = ESCENARIOS.phishing.plantilla;
  return outlook([
    ['Área de Nómina', p.asunto, 'Buen día. Para recibir la prima de servicios…', '9:12', true],
    ['Talento Humano', 'Pausas activas de noviembre', 'Les compartimos el horario de…', '8:40'],
    ['Operaciones', 'Turnos de la semana', 'Adjunto la programación de…', 'Ayer'],
    ['Comité de seguridad', 'Acta de la reunión', 'Quedan los compromisos del…', 'Ayer']
  ], olLectura(p.asunto, 'Área de Nómina', 'nomina@miempresa-pagos.co', 'Hoy 9:12', p.cuerpo, `<span class="ol-boton" data-objetivo="correo">${p.accion}</span><span class="ol-vinculo" data-vinculo="correo">https://miempresa-pagos.co/c/<b>8f3a2c91</b><small>Clic o pulse aquí para seguir el vínculo.</small></span>`));
}
function pantallaArchivo() {
  const p = ESCENARIOS.archivo.plantilla;
  return outlook([
    ['Facturación Proveedor', p.asunto, 'Adjuntamos la factura FE-2291 por…', '11:03', true],
    ['Área de Nómina', ESCENARIOS.phishing.plantilla.asunto, 'Buen día. Para recibir la prima…', '9:12'],
    ['Talento Humano', 'Pausas activas de noviembre', 'Les compartimos el horario de…', 'Ayer'],
    ['Operaciones', 'Turnos de la semana', 'Adjunto la programación de…', 'Ayer']
  ], olLectura(p.asunto, 'Facturación Proveedor', 'facturas@proveedor-fe.com', 'Hoy 11:03', p.cuerpo,
    `<div class="ol-adjunto"><span class="ol-pdf">PDF</span><span><b>Factura_FE-2291.pdf</b><small>Enlace de descarga · 248 KB</small></span><span class="ol-boton ol-boton-chico" data-objetivo="archivo">Descargar</span></div><span class="ol-vinculo" data-vinculo="archivo">https://proveedor-fe.com/d/<b>5b7e01d4</b><small>Clic o pulse aquí para seguir el vínculo.</small></span>`))
    + `<div class="hl-descarga" data-objetivo="descarga"><span class="ol-pdf">PDF</span>Factura_FE-2291.pdf<small>Abrir archivo</small></div>`;
}

function pantallaLogin() {
  return `<div class="nav-web">
    <div class="nw-pestanas"><span>Intranet corporativa</span></div>
    <div class="nw-url"><b>⚠ No seguro</b> miempresa-intranet.net/login?t=<u>c41d07ae</u></div>
    <div class="nw-pagina">
      <div class="nw-caja">
        <p class="nw-marca">${marcaSVG().replace('width="28" height="28"', 'width="18" height="18"')} Intranet corporativa</p>
        <h4>Su sesión expira hoy</h4>
        <label>Usuario<span class="nw-campo">lgarcia@miempresa.co</span></label>
        <label>Contraseña<span class="nw-campo"><i class="h-clave">••••••••••</i></span></label>
        <span class="ol-boton nw-boton" data-objetivo="login">Iniciar sesión</span>
      </div>
    </div>
  </div>`;
}

// PDF generado por el servidor después de registrar DESCARGA. Lleva una imagen de 1×1 px:
// si el visor la carga, se registra APERTURA (dato complementario, no es la decisión).
function visorPDF() {
  const filas = [['Servicio de mantenimiento', '2.150.000'], ['Repuestos y materiales', '1.530.000'], ['Transporte', '700.000']];
  return `<div class="hl-pdf">
    <div class="hp-barra"><span>Factura_FE-2291.pdf</span><span>1 / 1</span><span>100 %</span></div>
    <div class="hp-hoja">
      <div class="hp-cab"><b>FACTURA ELECTRÓNICA</b><span>N.º FE-2291 · Vence: 28 oct.</span></div>
      <p class="hp-prov">Proveedor S.A.S. · NIT 900.000.000-0</p>
      <table>${filas.map(([d, v]) => `<tr><td>${d}</td><td>$ ${v}</td></tr>`).join('')}<tr class="hp-total"><td>Total vencido</td><td>$ 4.380.000</td></tr></table>
      <p class="hp-nota">Documento de simulación. No contiene macros ni código ejecutable.</p>
      <span class="hp-baliza"><i></i>baliza 1×1 px</span>
    </div>
  </div>`;
}

function portatil() {
  return `<div class="h-laptop">
    <div class="hl-tapa"><div class="hl-pantalla">
      <div class="hl-app" data-pant="correo">${pantallaCorreo()}</div>
      <div class="hl-app" data-pant="archivo">${pantallaArchivo()}</div>
      <div class="hl-app" data-pant="login">${pantallaLogin()}</div>
      ${visorPDF()}
      ${cursor()}
    </div></div>
    <div class="hl-base"></div>
  </div>`;
}

// Celular: primero bloqueado; llega la notificación de Teams, se abre la app y aparece el chat.
// El mensaje trae un enlace único (propuesta, p. 9). Si la persona escribe el código en esa página,
// se registra RESPUESTA (fallo, R-EV-ING-1). El código no se guarda.
function celular() {
  const svg = p => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  const estado = `<div class="hc-estado"><b>10:02</b><span>${svg('<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor"/>')}<i class="tm-bat"></i></span></div>`;
  return `<div class="h-cel"><div class="hc-marco"><div class="hc-pantalla">
    <div class="hc-bloqueo">
      ${estado}
      <p class="hb-hora">10:02</p><p class="hb-fecha">martes, 10 de noviembre</p>
      <div class="hc-noti">
        <span class="tm-logo">T</span>
        <span><b>Andrés Mesa de Ayuda <small>(Externo)</small></b>Hola, te escribo de mesa de ayuda.</span>
        <time>ahora</time>
      </div>
    </div>
    <div class="hc-teams">
      ${estado}
      <div class="hc-cab">
        <span class="tm-ico">${svg('<path d="M19 12H5M11 18l-6-6 6-6"/>')}</span>
        <span class="hc-ava">AM<i></i></span>
        <span class="wa-quien"><b>Andrés Mesa de Ayuda</b><small>Externo</small></span>
        <span class="tm-ico">${svg('<rect x="2" y="7" width="13" height="10" rx="2"/><path d="m15 12 7-4v8z"/>')}</span>
        <span class="tm-ico">${svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>')}</span>
        <span class="tm-ico">${svg('<circle cx="12" cy="5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="19" r="1.3" fill="currentColor"/>')}</span>
      </div>
      <div class="hc-chat">
        <div class="tm-hilo">
        <span class="tm-aviso">Andrés es externo a tu organización.</span>
        <span class="tm-nombre">Andrés Mesa de Ayuda · 10:01</span>
        <div class="tm-fila"><span class="tm-av">AM</span><div class="tm-burbujas">
          <p class="hc-burbuja" data-b="1">Hola Laura, te escribo de Mesa de Ayuda.</p>
          <p class="hc-burbuja" data-b="2">Hoy estamos migrando los equipos de tu área.</p>
        </div></div>
        <p class="tm-mia">Hola, ¿qué tengo que hacer?</p>
        <span class="tm-nombre tm-n2">Andrés Mesa de Ayuda · 10:02</span>
        <div class="tm-fila tm-f2"><span class="tm-av">AM</span><div class="tm-burbujas">
          <p class="hc-burbuja" data-b="3">Valida tu cuenta con el código que te llegó por SMS, si no se borra tu perfil:</p>
          <p class="hc-burbuja tm-enlace" data-b="4"><span class="tm-url">migracion-miempresa.net/v/2e9b47f0</span><span class="tm-tarjeta"><b>Portal de migración</b><small>Mesa de Ayuda · TI</small></span></p>
        </div></div>
        </div>
        <span class="tm-escribiendo">Andrés está escribiendo <i></i><i></i><i></i></span>
      </div>
      <div class="tm-entrada">
        <i class="tm-mas">${svg('<path d="M12 5v14M5 12h14"/>')}</i>
        <span class="tm-campo"><em>Escribe un mensaje</em><b class="tm-escribe">Hola, ¿qué tengo que hacer?</b>${svg('<circle cx="12" cy="12" r="9"/><path d="M8.5 14a4 4 0 0 0 7 0"/><circle cx="9" cy="10" r=".8" fill="currentColor"/><circle cx="15" cy="10" r=".8" fill="currentColor"/>')}</span>
        ${svg('<path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/>')}
        ${svg('<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/>')}
      </div>
    </div>
    <div class="hc-web">
      <div class="hw-barra"><span>✕</span><span><b>migracion-miempresa.net</b><small>/v/2e9b47f0</small></span></div>
      <div class="hw-pag">
        <p class="hw-marca">Mesa de Ayuda · TI</p>
        <h5>Verificación de migración</h5>
        <p>Ingresa el código que recibiste por SMS para conservar tu perfil.</p>
        <span class="hw-campo"><i class="hw-codigo">482 913</i></span>
        <span class="hw-boton">Validar</span>
      </div>
    </div>
  </div></div></div>`;
}

const SELLOS = [
  ['fallo', 'Enlace único /c/8f3a2c91 → CLIC registrado · 38 ms'],
  ['fallo', 'Enlace único /v/2e9b47f0 → RESPUESTA registrada · el código no se guarda'],
  ['fallo', '/api/descarga/5b7e01d4 → DESCARGA registrada (41 ms) · después se entrega el PDF'],
  ['fallo', 'Enlace único ?t=c41d07ae → FORMULARIO registrado · la contraseña no se guarda'],
  ['info', 'Baliza 1×1 px → /api/beacon/5b7e01d4 · APERTURA registrada (complementaria)']
];

const FRASES = [
  ['01 · Phishing', 'Un correo de nómina, igual a los de cada mes.', 'El botón lleva un enlace único por empleado y campaña. El clic llega al servidor y queda registrado en 38 ms.'],
  ['02 · Ingeniería social', 'Soporte pide un código. Nadie llamó a soporte.', 'Llega por Teams con un enlace único. Si escribe ahí el código, cae: el envío queda registrado y el código nunca se guarda.'],
  ['03 · Archivo sospechoso', 'Una factura vencida que nadie esperaba.', 'El correo no trae adjunto: trae un enlace. El servidor registra el clic en «Descargar» y solo después entrega el PDF. Si lo abre, una baliza de 1×1 px registra la apertura.'],
  ['04 · Página falsa', 'Idéntica a la intranet. Hasta el último píxel.', 'La página llega por un enlace único. Se registra el envío del formulario; lo que se escribe nunca se guarda.'],
  ['El resultado', 'Cada decisión se vuelve un perfil.', 'Reglas explícitas y auditables, sin IA. Seguridad ve agregados: nadie queda expuesto.']
];

function perfilFinal() {
  const filas = [['Phishing', 42], ['Ingeniería social', 71], ['Archivo sospechoso', 38], ['Página falsa', 55]];
  return `<div class="h-perfil">
    <p class="hpf-ceja">Perfil de competencias · Contabilidad (agregado)</p>
    ${filas.map(([n, v]) => `<div class="hpf-fila"><span>${n}</span><span class="hpf-barra"><i style="width:${v}%;background:${v < 50 ? 'var(--fallo)' : v < 65 ? 'var(--medio)' : 'var(--acierto)'}"></i></span><b>${v}</b></div>`).join('')}
    <p class="hpf-sig">${ico('perfil')}<span>Siguiente simulación: <b>Archivo sospechoso</b></span><small>Regla R-SEL-1 · el escenario con menor puntaje</small></p>
  </div>`;
}

function historia() {
  return `<section class="h-historia" id="historia" aria-label="Cómo llega una simulación">
    <div class="h-escena" data-acto="0">
      <div class="h-capa h-fondo">${escenaFondo()}</div>
      <div class="h-capa h-red">${planoOficina()}</div>
      <div class="h-capa h-personas" aria-hidden="true">${personas()}</div>

      <div class="h-hero">
        <h1 class="parallax__title">Shadow<span>Drill</span></h1>
        <p class="parallax__def">Plataforma de Capacitación en Ciberseguridad mediante Simulaciones</p>
        <p class="parallax__lema"><b>Los atacantes no rompen sistemas. Engañan personas.</b> Simulamos las 4 amenazas en el correo y el Teams reales de tu equipo, sin aviso, y medimos cada decisión en el instante en que ocurre.</p>
      </div>

      <div class="h-textos">
        ${FRASES.map(([c, h, p], i) => `<article class="h-frase" data-acto="${i + 1}"><b>${c}</b><h2>${h}</h2><p>${p}</p></article>`).join('')}
      </div>

      <div class="h-equipos"><div class="h-equipos-in">
        ${portatil()}
        ${celular()}
        ${SELLOS.map(([t, txt], i) => `<div class="h-sello h-sello-${t}" data-sello="${i + 1}"><i></i>${txt}</div>`).join('')}
        ${perfilFinal()}
      </div></div>

      <div class="h-cierre">
        <p>Phishing · Ingeniería social · Archivo sospechoso · Página falsa</p>
        <h2>Cuatro formas de caer.<span>Cuatro formas de aprender.</span></h2>
      </div>

      <ol class="h-progreso" aria-hidden="true">
        ${['Phishing', 'Ingeniería', 'Archivo', 'Página'].map((n, i) => `<li><span>0${i + 1}</span>${n}<i></i></li>`).join('')}
      </ol>
      <div class="parallax__pista" aria-hidden="true">Desliza<i></i></div>
    </div>
  </section>`;
}

// ---------- Recorrido después del parallax: capítulos encadenados ----------
// Cada capítulo cierra con una pregunta que lleva al siguiente.
const CAPITULOS = [['problema', 'El problema'], ['cambio', 'El cambio'], ['como-funciona', 'Cómo funciona'], ['arquitectura', 'Por qué el dato es real'],
  ['para-quien', 'Para quién'], ['por-que', 'Por qué ShadowDrill'], ['confianza', 'Ética y confianza']];
const sigue = (id, texto) => `<button type="button" class="p-sigue revelar" data-ir="${id}">${texto}<i>${ico('flecha')}</i></button>`;
const capitulos = () => `<nav class="p-capitulos" aria-label="Capítulos">${CAPITULOS.map(([id, n], i) =>
  `<button type="button" data-ir="${id}" data-cap="${id}"><span>${n}</span><i>${String(i + 1).padStart(2, '0')}</i></button>`).join('')}</nav>`;

// ---------- Carrusel «Cómo funciona»: el ciclo TO-BE de la propuesta en 8 pasos ----------
// [número, lado (A = plataforma, B = entorno del empleado), ícono, título, texto, etiqueta, mini vista]
const cvFila = (a, b, cls = '') => `<div class="cv-fila"><span>${a}</span><b${cls ? ` class="${cls}"` : ''}>${b}</b></div>`;
const CICLO = [
  ['01', 'B', 'campanas', 'Anuncio general', 'La organización comunica el periodo de simulaciones a todos. Nadie sabe la fecha ni el escenario.', 'Organización · ética',
    cvFila('Periodo', '2026-II') + cvFila('Anunciado', '1 de junio') + cvFila('Fecha exacta', '•• / ••', 'cv-oculto')],
  ['02', 'A', 'mas', 'Configura la campaña', 'El administrador carga la base de empleados y elige escenario, destinatarios, canal y ventana.', 'Mundo A · panel',
    cvFila('Escenario', 'Archivo sospechoso') + cvFila('Destinatarios', 'Contabilidad · 4') + cvFila('Canal', 'Correo') + cvFila('Ventana', '3 días, sin aviso')],
  ['03', 'A', 'enviar', 'Puente de entrega', 'Al activar la campaña, el SMTP transaccional y el conector de Teams llevan el mensaje al canal real.', 'ADR 1 · canal real',
    '<div class="cv-ruta"><span>SMTP</span><i></i><span>Exchange / M365</span></div><div class="cv-ruta"><span>Conector</span><i></i><span>Teams</span></div><div class="cv-token">token único · /d/5b7e01d4</div>'],
  ['04', 'B', 'empleados', 'El empleado decide', 'Le llega en medio de su trabajo. Nunca entra a la plataforma: hace clic, lo ignora o lo reporta.', 'Mundo B · su bandeja',
    '<div class="cv-chips"><span class="cv-chip cv-mal">Descarga</span><span class="cv-chip">Ignora</span><span class="cv-chip cv-bien">Reporta</span></div>'],
  ['05', 'A', 'reloj', 'Registro antes que contenido', 'El enlace intermediario guarda el evento con marca de tiempo y solo después entrega el archivo.', 'ADR 2 · < 1 s',
    '<div class="cv-log"><span>09:14:03.171</span>GET /api/descarga/…</div><div class="cv-log cv-log-ok"><span>09:14:03.212</span>DESCARGA · 41 ms</div><div class="cv-log cv-tenue"><span>09:16:47.004</span>APERTURA · complementaria</div>'],
  ['06', 'A', 'escudo', 'Reglas auditables', 'Cada decisión suma puntos con reglas explícitas, sin IA. Cualquier puntaje se puede explicar.', 'ADR 3 · sin IA',
    cvFila('Fallo', '0', 'cv-mal-t') + cvFila('Ignora', '60', 'cv-medio-t') + cvFila('Reporta', '100', 'cv-bien-t')],
  ['07', 'A', 'perfil', 'Perfil y siguiente simulación', 'La competencia por escenario es el promedio de puntos. La regla R-SEL-1 elige el escenario más débil.', 'R-SEL-1',
    [['Phishing', 42], ['Ingeniería', 71], ['Archivo', 38], ['Página', 55]].map(([n, v]) => `<div class="cv-barra"><span>${n}</span><i><em style="width:${v}%;background:${v < 50 ? 'var(--fallo)' : v < 65 ? 'var(--medio)' : 'var(--acierto)'}"></em></i></div>`).join('') + '<div class="cv-sig">Siguiente → Archivo sospechoso</div>'],
  ['08', 'A', 'panel', 'Seguimiento agregado', 'El responsable ve indicadores por área, periodo y amenaza, y prioriza el refuerzo. Nadie queda expuesto.', 'Solo agregados',
    '<div class="cv-calor">' + [['Contab.', 38], ['T. Humano', 61], ['Operac.', 55], ['Atención', 47]].map(([n, v]) => `<span style="--v:${v}"><b>${v}</b>${n}</span>`).join('') + '</div>']
];

function carrusel() {
  const tarjeta = ([num, lado, icono, titulo, texto, tag, vis], copia) => `<li class="cr-card" data-lado="${lado}"${copia ? ' aria-hidden="true"' : ''}>
      <div class="cr-cab"><span class="cr-num">${num}</span><span class="cr-ico">${ico(icono)}</span></div>
      <span class="cr-tag">${tag}</span><h3>${titulo}</h3><p>${texto}</p><div class="cr-vis">${vis}</div>
    </li>`;
  // Las tarjetas van dos veces: el bucle continuo necesita al menos 10 elementos.
  return `<div class="cr" role="region" aria-roledescription="carrusel" aria-label="Cómo funciona ShadowDrill, paso a paso">
    <ul class="cr-pista">${CICLO.map(p => tarjeta(p)).join('')}${CICLO.map(p => tarjeta(p, true)).join('')}</ul>
    <div class="cr-proxy"></div>
    <div class="cr-controles">
      <button type="button" class="btn-redondo" data-cr="-1" aria-label="Paso anterior">${ico('flecha', 'ico cr-izq')}</button>
      <div class="cr-puntos">${CICLO.map((p, i) => `<button type="button" data-paso="${i}" aria-label="Ir al paso ${i + 1}: ${p[3]}"><i></i></button>`).join('')}</div>
      <button type="button" class="btn-redondo" data-cr="1" aria-label="Paso siguiente">${ico('flecha')}</button>
    </div>
    <p class="cr-actual" aria-live="polite"></p>
  </div>`;
}

// Bucle continuo basado en el carrusel de GSAP (buildSeamlessLoop). Avanza solo cada ESPERA segundos,
// se detiene con el cursor o el foco, y se puede arrastrar si Draggable cargó.
function iniciarCarrusel() {
  const raiz = document.querySelector('.cr');
  if (!raiz) return null;
  const cards = gsap.utils.toArray('.cr-card'), n = CICLO.length, total = cards.length;
  const puntos = [...raiz.querySelectorAll('.cr-puntos button')], barras = puntos.map(b => b.querySelector('i'));
  const etiqueta = raiz.querySelector('.cr-actual');
  const ESPACIO = .1, ESPERA = 4.2, snap = gsap.utils.snap(ESPACIO);
  const modulo = (a, m) => ((a % m) + m) % m;

  gsap.set(cards, { xPercent: 400, opacity: 0, scale: 0 });
  const loop = bucleContinuo(cards, ESPACIO, el => gsap.timeline()
    .fromTo(el, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, zIndex: 100, duration: .5, yoyo: true, repeat: 1, ease: 'power1.in', immediateRender: false })
    .fromTo(el, { xPercent: 400 }, { xPercent: -400, duration: 1, ease: 'none', immediateRender: false }, 0));
  const envolver = gsap.utils.wrap(0, loop.duration()), cabeza = { offset: 0 };

  let actual = -1;
  const marcar = () => {
    const i = modulo(Math.round(cabeza.offset / ESPACIO), total), paso = i % n;
    if (i === actual) return;
    actual = i;
    cards.forEach((c, k) => c.classList.toggle('act', k === i));
    puntos.forEach((b, k) => { b.classList.toggle('act', k === paso); b.setAttribute('aria-current', k === paso ? 'step' : 'false'); });
    etiqueta.textContent = `Paso ${paso + 1} de ${n} · ${CICLO[paso][3]}`;
  };
  const scrub = gsap.to(cabeza, { offset: 0, duration: 1.6, ease: 'power3.inOut', paused: true, onUpdate() { loop.time(envolver(cabeza.offset)); marcar(); } });

  let reloj = null, pausado = false, visible = false; // arranca quieto hasta que se ve
  const programar = () => {
    if (reloj) reloj.kill();
    gsap.set(barras, { scaleX: 0 });
    reloj = gsap.fromTo(barras[modulo(Math.round(scrub.vars.offset / ESPACIO), n)], { scaleX: 0 },
      { scaleX: 1, duration: ESPERA, ease: 'none', paused: pausado || !visible, onComplete: () => ir(snap(scrub.vars.offset) + ESPACIO) });
  };
  const ir = offset => { scrub.vars.offset = offset; scrub.invalidate().restart(); programar(); };
  const pausar = si => { pausado = si; raiz.classList.toggle('pausa', si); if (reloj) si || !visible ? reloj.pause() : reloj.resume(); };

  // Vuelve al paso 1 sin animar. Se llama cada vez que el carrusel entra en pantalla.
  const reiniciar = () => {
    scrub.pause(); cabeza.offset = 0; scrub.vars.offset = 0; scrub.invalidate();
    loop.time(.001); loop.time(0); actual = -1; marcar(); programar();
  };
  reiniciar();

  // Pausa solo si el mouse se mueve de verdad sobre el carrusel. Al hacer scroll con el cursor quieto
  // el navegador también dispara eventos de puntero, y eso lo dejaba detenido al llegar.
  raiz.addEventListener('pointermove', ev => ev.pointerType === 'mouse' && (ev.movementX || ev.movementY) && !pausado && pausar(true));
  raiz.addEventListener('pointerleave', ev => ev.pointerType === 'mouse' && pausado && pausar(false));
  raiz.addEventListener('focusin', () => pausar(true));
  raiz.addEventListener('focusout', ev => !raiz.contains(ev.relatedTarget) && pausar(false));
  raiz.addEventListener('click', ev => {
    const flecha = ev.target.closest('[data-cr]'), punto = ev.target.closest('[data-paso]');
    if (flecha) ir(snap(scrub.vars.offset) + ESPACIO * +flecha.dataset.cr);
    if (punto) {
      const cur = Math.round(scrub.vars.offset / ESPACIO);
      let d = modulo(+punto.dataset.paso - cur, n);
      if (d > n / 2) d -= n;
      ir((cur + d) * ESPACIO);
    }
  });
  raiz.addEventListener('keydown', ev => {
    if (ev.key === 'ArrowRight') ir(snap(scrub.vars.offset) + ESPACIO);
    if (ev.key === 'ArrowLeft') ir(snap(scrub.vars.offset) - ESPACIO);
  });
  // Solo corre cuando las tarjetas están a la vista; al entrar siempre empieza en el paso 1.
  ScrollTrigger.create({
    trigger: raiz.querySelector('.cr-pista') || raiz, start: 'top 80%', end: 'bottom 20%',
    onToggle: st => {
      const antes = visible; visible = st.isActive;
      if (visible && !antes) { pausado = false; raiz.classList.remove('pausa'); reiniciar(); }
      else pausar(pausado);
    }
  });

  let arrastre = null;
  if (window.Draggable) {
    gsap.registerPlugin(Draggable);
    arrastre = Draggable.create(raiz.querySelector('.cr-proxy'), {
      type: 'x', trigger: raiz.querySelector('.cr-pista'),
      onPress() { this.inicio = scrub.vars.offset; if (reloj) reloj.pause(); },
      onDrag() { scrub.vars.offset = this.inicio + (this.startX - this.x) * .0012; scrub.invalidate().restart(); },
      onRelease() { ir(snap(scrub.vars.offset)); }
    })[0];
  }
  return { destruir() { if (reloj) reloj.kill(); scrub.kill(); loop.kill(); if (arrastre) arrastre.kill(); } };
}

// Línea de tiempo que recorre las animaciones de los elementos en bucle sin cortes (patrón de GSAP).
function bucleContinuo(items, espacio, animar) {
  const extra = Math.ceil(1 / espacio),
    inicio = items.length * espacio + .5,
    vuelta = (items.length + extra) * espacio + 1,
    crudo = gsap.timeline({ paused: true }),
    bucle = gsap.timeline({ paused: true, repeat: -1, onRepeat() { this._time === this._dur && (this._tTime += this._dur - .01); } });
  for (let i = 0; i < items.length + extra * 2; i++) crudo.add(animar(items[i % items.length]), i * espacio);
  crudo.time(inicio);
  bucle.to(crudo, { time: vuelta, duration: vuelta - inicio, ease: 'none' })
    .fromTo(crudo, { time: extra * espacio + 1 }, { time: inicio, duration: inicio - (extra * espacio + 1), immediateRender: false, ease: 'none' });
  return bucle;
}

function vistaPortada() {
  return `
  <header class="p-nav" id="p-nav">
    <a class="marca" href="#/inicio" aria-label="ShadowDrill, inicio">${marcaSVG()}<span>ShadowDrill</span></a>
    <a class="btn btn-primario btn-chico" href="#/panel" data-accion="entrar" data-rol="admin">Entrar al panel ${ico('flecha')}</a>
  </header>

  ${historia()}
  ${capitulos()}

  <section class="p-seccion" id="problema">
    <p class="ceja revelar">01 / 07 · El problema</p>
    <h2 class="revelar">Aprobar el cuestionario no es dejar de caer.</h2>
    <p class="p-lead revelar">Hoy la capacitación es igual para todos: un video o una charla, un cuestionario de opción múltiple y una nota que certifica el cumplimiento. Eso mide lo que el empleado recuerda, no lo que hace cuando el ataque llega en medio de su trabajo.</p>
    ${terminalProblema()}
    ${sigue('cambio', '¿Y si en lugar de preguntar, se observara la decisión?')}
  </section>

  <section class="p-seccion" id="cambio">
    <p class="ceja revelar">02 / 07 · El cambio</p>
    <h2 class="revelar">De medir lo que se sabe a medir lo que se hace.</h2>
    <p class="p-lead revelar">La misma empresa, el mismo equipo y la misma meta. Cambia el método: ya no se pregunta qué haría el empleado, se observa qué hace.</p>
    <div class="ad">
      ${[['antes', 'Capacitación tradicional', 'Antes', 'Mide lo que el empleado recuerda.', [
           ['Cómo se entrena', 'Contenido teórico idéntico para toda la población.'],
           ['Qué se mide', 'Un cuestionario de opción múltiple.'],
           ['Qué se obtiene', 'Una nota que certifica el cumplimiento.'],
           ['Qué sigue', 'Un nuevo ciclo genérico, igual para todos.']]],
         ['despues', 'Con ShadowDrill', 'Después', 'Mide lo que el empleado hace.', [
           ['Cómo se entrena', 'Simulaciones por el correo y el Teams reales, en una ventana no anunciada.'],
           ['Qué se mide', 'La decisión, registrada en el instante en que ocurre.'],
           ['Qué se obtiene', 'Un perfil de competencias por empleado y por escenario.'],
           ['Qué sigue', 'Refuerzo según el área y el tipo de error de cada persona.']]]]
        .map(([k, kicker, titulo, resumen, filas], i) => `${i ? `<span class="ad-eje" aria-hidden="true">${ico('flecha')}</span>` : ''}
      <article class="ad-t ad-${k} revelar" tabindex="0" aria-label="${titulo}: ${resumen}">
        <div class="ad-portada"><small>${kicker}</small><b>${titulo}</b><p>${resumen}</p><span class="ad-pista">Pasa el cursor para ver el detalle</span></div>
        <div class="ad-info"><small>${kicker}</small><dl>${filas.map(([e, t]) => `<div><dt>${e}</dt><dd>${t}</dd></div>`).join('')}</dl></div>
      </article>`).join('')}
    </div>
    ${sigue('como-funciona', 'Así funciona, paso a paso.')}
  </section>

  <section class="p-seccion p-ciclo" id="como-funciona">
    <p class="ceja revelar">03 / 07 · Cómo funciona</p>
    <h2 class="revelar">Un ciclo completo, de la campaña al refuerzo.</h2>
    <p class="p-lead revelar">Ocho pasos, del anuncio al refuerzo. Avanza solo; pasa el cursor para detenerlo, arrástralo o usa las flechas.</p>
    ${carrusel()}
    ${sigue('arquitectura', '¿Por qué ese dato es confiable?')}
  </section>

  ${mundos()}

  <section class="p-seccion" id="para-quien">
    <p class="ceja revelar">05 / 07 · Para quién</p>
    <h2 class="revelar">Cada actor gana algo distinto.</h2>
    <div class="bn">
      ${[['empleados', 'Empleado', 'Recibe la simulación sin saber que es una prueba.', 'Retroalimentación formativa, sin exposición pública de su resultado.'],
         ['escudo', 'Administrador de seguridad', 'Programa y gestiona las campañas.', 'Un panel para cargar la población, configurar escenarios y programar envíos sin aviso.'],
         ['panel', 'Responsable organizacional', 'Reporta el cumplimiento a la gerencia.', 'Indicadores agregados por área y tipo de amenaza, en lugar de la nota de un cuestionario.'],
         ['perfil', 'La organización', 'Autoriza y financia el programa.', 'Evidencia objetiva del nivel de exposición real de su personal.']]
        .map(([i, n, rol, gana], k) => `<article class="bn-card revelar" tabindex="0" aria-label="${n}. ${rol} Gana: ${gana}">
        <div class="bn-giro">
          <div class="bn-cara bn-frente" aria-hidden="true">
            <span class="bn-pestana">Actor 0${k + 1}</span>
            <span class="bn-ico">${ico(i)}</span>
            <h3>${n}</h3>
            <span class="bn-pista">Pasa el cursor</span>
          </div>
          <div class="bn-cara bn-dorso" aria-hidden="true">
            <span class="bn-pestana">Actor 0${k + 1}</span>
            <h3>${n}</h3>
            <p class="bn-rol"><b>Su papel</b>${rol}</p>
            <p class="bn-gana"><b>Gana</b>${gana}</p>
          </div>
        </div>
      </article>`).join('')}
    </div>
    ${sigue('por-que', '¿Por qué no basta con lo que ya existe?')}
  </section>

  <section class="p-seccion" id="por-que">
    <p class="ceja revelar">06 / 07 · Por qué ShadowDrill</p>
    <h2 class="revelar">Lo que ninguna alternativa junta en un solo lugar.</h2>
    <p class="p-lead revelar">Cada alternativa resuelve una parte. ShadowDrill es la única que cubre las cuatro capacidades que pide la propuesta.</p>
    ${comparacion()}
    <p class="cmp-nota revelar">Fuente: antecedentes revisados en la propuesta (secciones 3.2 y 4.2).</p>
    ${sigue('confianza', 'Y todo, sin poner a nadie en riesgo.')}
  </section>

  <section class="p-seccion" id="confianza">
    <p class="ceja revelar">07 / 07 · Ética y confianza</p>
    <h2 class="revelar">Se simula el ataque. Nunca el daño.</h2>
    ${garantias()}
    ${sigue('entrar', 'Míralo funcionando.')}
  </section>

  <section class="p-seccion p-entrar" id="entrar">
    <p class="ceja revelar">Ver la demo</p>
    <h2 class="revelar">Mide cómo decide tu equipo, no lo que memoriza.</h2>
    <p class="p-lead revelar">Entra al prototipo con datos ficticios · ${ORG.nombre} · ${ORG.periodo}</p>
    <div class="p-roles">
      <a class="p-rol revelar" href="#/panel" data-accion="entrar" data-rol="admin"><strong>Administrador ${ico('flecha')}</strong><span>Configura campañas, sigue eventos en vivo y ve perfiles individuales.</span></a>
      <a class="p-rol revelar" href="#/panel" data-accion="entrar" data-rol="responsable"><strong>Responsable ${ico('flecha')}</strong><span>Ve solo indicadores agregados de la organización.</span></a>
    </div>
  </section>

  <footer class="p-pie">Prototipo académico · Universidad El Bosque · Efecto parallax basado en un recurso de <a href="https://www.osmo.supply/" target="_blank" rel="noopener">Osmo</a></footer>`;
}

// ---------- Capítulo 06: matriz comparativa ----------
const COMPARA = {
  alternativas: [['campanas', 'Capacitación tradicional', 'Video + cuestionario'], ['correo', 'Phishing simulado', 'Herramientas del mercado'], ['empleados', 'Juegos serios', 'Riskio, PERSUADED']],
  filas: [['Mide la decisión real del empleado', 'En el momento en que ocurre, no en un cuestionario', ['no', 'Solo en correo', 'no']],
          ['Cubre los 4 vectores de ataque', 'Phishing, ingeniería social, archivo y página falsa', ['no', 'Suele cubrir solo phishing', 'Solo ingeniería social']],
          ['Llega por correo y Teams reales', 'Sin bandeja simulada dentro de la plataforma', ['no', 'Solo correo', 'no']],
          ['Perfil que elige la siguiente simulación', 'Regla explícita sobre el escenario más débil', ['no', 'no', 'no']]]
};
function comparacion() {
  const celda = v => v === 'si' ? `<span class="cmp-si">${ico('check')}<b>Sí</b></span>`
    : v === 'no' ? `<span class="cmp-no">${ico('cruz')}<span class="sr">No</span></span>`
    : `<span class="cmp-parcial">${ico('medio')}<span>${v}</span></span>`;
  // Cobertura: 1 por "sí", 0,5 por parcial
  const puntos = i => COMPARA.filas.reduce((t, f) => t + (i === 3 ? 1 : f[2][i] === 'no' ? 0 : .5), 0);
  const medidor = n => `<span class="cmp-medidor" style="--n:${n}">${[0, 1, 2, 3].map(k => `<i style="--k:${k}"></i>`).join('')}</span><b class="cmp-cuenta">${String(n).replace('.', ',')} / 4</b>`;
  return `<div class="cmp-marco revelar"><div class="cmp-lienzo">
    <div class="cmp-foco" aria-hidden="true"></div>
    <table class="cmp">
      <colgroup><col class="cmp-c1"><col><col><col><col class="cmp-c5"></colgroup>
      <thead><tr><th scope="col"><span class="cmp-eje">Capacidad</span></th>
        ${COMPARA.alternativas.map(([i, n, d]) => `<th scope="col"><span class="cmp-alt">${ico(i)}</span>${n}<small>${d}</small></th>`).join('')}
        <th scope="col" class="cmp-sd"><span class="cmp-marca">${marcaSVG()}</span>ShadowDrill<small>La propuesta</small></th></tr></thead>
      <tbody>${COMPARA.filas.map(([f, d, v]) => `<tr><th scope="row">${f}<small>${d}</small></th>${v.map((x, i) => `<td data-alt="${COMPARA.alternativas[i][1]}">${celda(x)}</td>`).join('')}<td class="cmp-sd" data-alt="ShadowDrill">${celda('si')}</td></tr>`).join('')}</tbody>
      <tfoot><tr><th scope="row">Cobertura</th>${[0, 1, 2].map(i => `<td data-alt="${COMPARA.alternativas[i][1]}">${medidor(puntos(i))}</td>`).join('')}<td class="cmp-sd" data-alt="ShadowDrill">${medidor(4)}</td></tr></tfoot>
    </table>
  </div></div>`;
}

// ---------- Capítulo 07: garantías éticas ----------
function garantias() {
  const items = [['codigo', 'Escenarios', 'Sin código malicioso', 'Ningún escenario ejecuta código malicioso real.'],
    ['archivo', 'Archivo sospechoso', 'PDF generado, nada más', 'Sin macros ni ejecutables. Solo un PDF con una baliza de 1×1 px.'],
    ['ojo', 'Privacidad', 'Nadie queda expuesto', 'Los resultados individuales no se publican. El responsable solo ve agregados.'],
    ['campanas', 'Transparencia', 'Periodo anunciado', 'Toda la población sabe que habrá simulaciones, aunque no el día exacto.'],
    ['firma', 'Acuerdo', 'Confidencialidad firmada', 'Antes de cualquier campaña real se firma el acuerdo de tratamiento de datos.'],
    ['regla', 'Sin IA', 'Cada puntaje se explica', 'Reglas explícitas y auditables: se puede decir por qué alguien sacó lo que sacó.']];
  return `<div class="cf">
    <div class="cf-cero revelar">
      <span class="cf-tag">${ico('candado')}Página falsa</span>
      <strong>0</strong>
      <p>contraseñas reales capturadas.</p>
      <div class="cf-campo" aria-hidden="true">
        <span class="cf-etq">Contraseña</span>
        <div class="cf-input"><span>••••••••••</span><i>${ico('ojo')}no se guarda</i></div>
      </div>
      <div class="cf-log" aria-label="Lo que queda registrado">
        <p><span>09:41:07</span>INGRESO_DATOS · token 7f3a…c2</p>
        <p><span>09:41:07</span>contenido: <b>[descartado]</b></p>
      </div>
      <p class="cf-pie">Se registra <em>que</em> intentó escribir, nunca <em>qué</em> escribió.</p>
    </div>
    <ul class="cf-lista">
      ${items.map(([i, tag, t, d], k) => `<li class="cf-item revelar"><span class="cf-ico">${ico(i)}</span><div><small>0${k + 1} · ${tag}</small><h3>${t}</h3><p>${d}</p></div></li>`).join('')}
    </ul>
  </div>`;
}

function marcaSVG() {
  return '<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="16" cy="16" r="6" fill="currentColor"/><path d="M16 1v6M16 25v6M1 16h6M25 16h6" stroke="currentColor" stroke-width="2.5"/></svg>';
}

// ---------- Animación ----------

const portada = { lenis: null, tick: null, scroll: null, puntero: null, historia: null, rotar: null, zonas: null, carrusel: null };

// ---------- Capítulo 04: los dos mundos como esferas, en un parallax propio ----------
// Mundo B deja ver el entorno real del empleado; Mundo A es un domo cerrado con el panel de seguridad.
function mundos() {
  const luna = (icono, texto, angulo) => `<span class="mw-luna" style="--a:${angulo}deg"><span class="mw-gira"><span class="mw-chip">${ico(icono)}${texto}</span></span></span>`;
  return `<section class="mw" id="arquitectura" aria-label="Por qué el dato es real: los dos mundos">
    <div class="mw-escena">
      <div class="mw-estrellas mw-e1"></div><div class="mw-estrellas mw-e2"></div>
      <div class="mw-cab">
        <p class="ceja">04 / 07 · Por qué el dato es real</p>
        <h2>Dos mundos.<span>El empleado nunca ve la plataforma.</span></h2>
        <p class="mw-baja">Baja para recorrerlos</p>
      </div>

      <svg class="mw-puente" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path class="mw-via" pathLength="100" d="M66 40 C 58 16, 42 16, 34 40"/>
        <path class="mw-via mw-via-v" pathLength="100" d="M34 64 C 42 88, 58 88, 66 64"/>
        <path class="mw-flujo" pathLength="100" d="M66 40 C 58 16, 42 16, 34 40"/>
        <path class="mw-flujo mw-flujo-v" pathLength="100" d="M34 64 C 42 88, 58 88, 66 64"/>
      </svg>
      <span class="mw-etq mw-etq-ida" aria-hidden="true">← SMTP · conector de Teams</span>
      <span class="mw-etq mw-etq-vuelta" aria-hidden="true">/api/descarga/{token} · evento en &lt; 1 s →</span>

      <div class="mw-planeta mw-b" aria-hidden="true">
        <div class="mw-orbita">${luna('correo', 'Correo · Microsoft 365', 0)}${luna('chat', 'Microsoft Teams', 120)}${luna('web', 'Navegador y teléfono', 240)}</div>
        <div class="mw-esfera">
          <div class="mw-bandeja">
            <p class="mwb-cab">${ico('correo')}Bandeja de entrada</p>
            <p class="mwb-fila"><i></i><span><b></b><em></em></span></p>
            <p class="mwb-fila mwb-sim"><i></i><span><strong>Área de Nómina</strong><small>Confirme su cuenta…</small></span><u></u></p>
            <p class="mwb-fila"><i></i><span><b></b><em></em></span></p>
            <p class="mwb-fila"><i></i><span><b></b><em></em></span></p>
          </div>
          <div class="mw-chat"><b>Soporte TI</b>Hola, ¿me confirmas el código?</div>
          <div class="mw-cel"><span></span></div>
        </div>
        <span class="mw-nombre">Mundo B · el empleado</span>
      </div>
      <div class="mw-planeta mw-a" aria-hidden="true">
        <div class="mw-perimetro"></div><div class="mw-perimetro mw-perimetro-2"></div>
        <div class="mw-orbita">${luna('escudo', 'Administrador', 60)}${luna('panel', 'Responsable · agregados', 180)}${luna('perfil', 'Reglas auditables', 300)}</div>
        <div class="mw-esfera">
          <div class="mw-hex"></div>
          <div class="mw-panel">
            <p class="mwp-cab">${ico('escudo')}Perfil agregado</p>
            ${[['Phishing', 42], ['Ing. social', 71], ['Archivo', 38], ['Pág. falsa', 55]].map(([n, v]) => `<p class="mwp-fila"><span>${n}</span><i><b style="width:${v}%"></b></i></p>`).join('')}
            <p class="mwp-pie">${ico('perfil')}2 roles · acceso interno</p>
          </div>
        </div>
        <span class="mw-nombre">Mundo A · seguridad</span>
      </div>

      <article class="mw-txt mw-txt-b">
        <span class="mw-tag">Mundo B · el empleado</span>
        <h3>Su correo, su Teams, su teléfono.</h3>
        <p>La simulación llega a Exchange / Microsoft 365, a Teams o al navegador, donde trabaja todos los días. No inicia sesión ni sabe cuándo llega la prueba.</p>
        <p class="mw-clave">Por eso la decisión que toma es la real.</p>
      </article>
      <article class="mw-txt mw-txt-a">
        <span class="mw-tag">Mundo A · seguridad</span>
        <h3>Un panel interno con dos roles.</h3>
        <p>El administrador de seguridad crea campañas y consulta perfiles. El responsable organizacional solo ve resultados agregados. Todo se evalúa con reglas explícitas y auditables.</p>
        <p class="mw-clave">Nadie más entra. El empleado nunca lo ve.</p>
      </article>
      <article class="mw-txt mw-txt-p">
        <span class="mw-tag">El puente</span>
        <h3>La prueba sale por el canal real. La decisión vuelve como evento.</h3>
        <p>Cada enlace lleva un token único por empleado y campaña. El clic se registra con marca de tiempo antes de entregar cualquier contenido.</p>
        <ul class="mw-stack"><li>Monolito modular · Django</li><li>PostgreSQL sin salida a Internet</li><li>Docker Compose</li></ul>
      </article>

      <div class="mw-pie">${sigue('para-quien', '¿Y quién gana con todo esto?')}</div>
    </div>
  </section>`;
}

// Recorrido con scroll: presentación → Mundo B → Mundo A → el puente entre los dos.
function animarMundos() {
  const raiz = document.querySelector('.mw');
  if (!raiz) return null;
  const movil = innerWidth < 760;
  // [left %, top %, escala] de cada planeta en cada acto: presentación, Mundo B, Mundo A, puente.
  const B = movil ? [[16, 74, .42], [50, 30, .95], [6, 10, .3], [24, 34, .55]] : [[12, 78, .4], [30, 54, 1], [5, 86, .3], [26, 52, .6]];
  const A = movil ? [[84, 20, .42], [96, 6, .25], [50, 30, .95], [76, 34, .55]] : [[88, 22, .4], [97, 10, .25], [70, 50, 1], [74, 52, .6]];
  const pos = p => ({ left: p[0] + '%', top: p[1] + '%', scale: p[2] });
  gsap.set('.mw-b', pos(B[0]));
  gsap.set('.mw-a', pos(A[0]));
  gsap.set('.mw-txt', { autoAlpha: 0, y: 40 });
  gsap.set('.mw-pie', { autoAlpha: 0, y: 20 });
  gsap.set('.mw-puente', { clipPath: 'inset(0% 50% 0% 50%)' });   // el puente se dibuja desde el centro
  gsap.set('.mw-flujo, .mw-etq, .mw-orbita', { autoAlpha: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: raiz, start: 'top top', end: 'bottom bottom', scrub: 1 } });
  tl.to('.mw-e1', { yPercent: -15, ease: 'none', duration: 10.7 }, 0)
    .to('.mw-e2', { yPercent: -35, ease: 'none', duration: 10.7 }, 0)
    .to('.mw-perimetro', { rotation: 90, ease: 'none', duration: 10.7 }, 0)
    .fromTo('.mw-hex', { backgroundPositionY: '0px' }, { backgroundPositionY: '-120px', ease: 'none', duration: 10.7 }, 0)
    // Acto 1: Mundo B
    .to('.mw-cab', { autoAlpha: 0, y: -60, duration: 1 }, 1.1)
    .to('.mw-b', { ...pos(B[1]), duration: 1.5 }, 1)
    .to('.mw-a', { ...pos(A[1]), duration: 1.5 }, 1)
    .to('.mw-b .mw-orbita', { autoAlpha: 1, duration: .6 }, 2)
    .to('.mw-txt-b', { autoAlpha: 1, y: 0, duration: .8 }, 2.1)
    // Acto 2: Mundo A
    .to('.mw-txt-b', { autoAlpha: 0, y: -40, duration: .6 }, 4)
    .to('.mw-b .mw-orbita', { autoAlpha: 0, duration: .5 }, 4)
    .to('.mw-b', { ...pos(B[2]), duration: 1.5 }, 4.1)
    .to('.mw-a', { ...pos(A[2]), duration: 1.5 }, 4.1)
    .to('.mw-a .mw-orbita', { autoAlpha: 1, duration: .6 }, 5.1)
    .to('.mw-txt-a', { autoAlpha: 1, y: 0, duration: .8 }, 5.2)
    // Acto 3: el puente entre los dos
    .to('.mw-txt-a', { autoAlpha: 0, y: -40, duration: .6 }, 7)
    .to('.mw-a .mw-orbita', { autoAlpha: 0, duration: .5 }, 7)
    .to('.mw-b', { ...pos(B[3]), duration: 1.4 }, 7.1)
    .to('.mw-a', { ...pos(A[3]), duration: 1.4 }, 7.1)
    .to('.mw-puente', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power2.out' }, 8)
    .to('.mw-flujo, .mw-etq', { autoAlpha: 1, duration: .5, stagger: .1 }, 8.8)
    .to('.mw-txt-p', { autoAlpha: 1, y: 0, duration: .8 }, 8.9)
    .to('.mw-pie', { autoAlpha: 1, y: 0, duration: .5 }, 9.6)
    .to({}, { duration: .6 }, 10.1);
  return tl;
}

// Barra de ventana estilo GNOME Terminal (Ubuntu). La usan la portada y el registro de eventos.
function barraTerminal(titulo) {
  return `<div class="tm-barra" aria-hidden="true">
      <span class="tm-grupo"><i class="tm-btn"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="3.5" width="11" height="9" rx="1.5"/><path d="M8 6v4M6 8h4"/></svg></i><i class="tm-btn"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 6.5 3 3 3-3"/></svg></i></span>
      <b class="tm-titulo">${titulo}</b>
      <span class="tm-grupo"><i class="tm-btn"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4"/><path d="m10 10 3.5 3.5"/></svg></i><i class="tm-btn"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5h10M3 8h10M3 11.5h10"/></svg></i>
        <i class="tm-ctl"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 8.5h6"/></svg></i><i class="tm-ctl"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="6" height="6" rx="1"/></svg></i><i class="tm-ctl"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5.5 5.5 5 5M10.5 5.5l-5 5"/></svg></i></span>
    </div>`;
}

// Terminal del problema: el estudio y la auditoría del modelo actual, como salida de bash.
function terminalProblema() {
  const ps = `<span class="tm-ps"><b>auditoria@empresa</b>:<i>~/capacitacion</i>$</span>`;
  const cmd = c => `<p class="tm-l tm-cmd">${ps} <span class="tm-c">${c}</span></p>`;
  const kv = (k, v) => `<p class="tm-l tm-kv"><span>${k}</span><span>${v}</span></p>`;
  const falla = (t, d) => `<p class="tm-l tm-falla"><span>[FALLA]</span><span><b>${t}</b><br>${d}</span></p>`;
  return `<div class="tm revelar" role="group" aria-label="Terminal: hallazgo del estudio y auditoría del modelo actual">
    ${barraTerminal('auditoria@empresa: ~/capacitacion')}
    <div class="tm-cuerpo">
      ${cmd('cat estudio/ho-2025.txt')}
      ${kv('muestra', '<b>19.500+</b> empleados')}
      ${kv('duración', '<b>8</b> meses')}
      ${kv('campañas', '<b>10</b> de phishing')}
      ${kv('hallazgo', '<em>sin relación significativa entre recibir la capacitación obligatoria y caer menos ante un ataque.</em>')}
      ${kv('fuente', 'Ho et al., IEEE S&amp;P 2025 [1]')}
      ${cmd('./auditar --modelo actual')}
      ${falla('mide memoria, no decisiones', 'Aprueba la prueba y sigue haciendo clic cuando el mensaje llega en medio de su trabajo.')}
      ${falla('sin datos de reacción', 'Nadie sabe cuánto tarda cada persona en reaccionar ni en qué canal falla.')}
      ${falla('refuerzo genérico', 'El siguiente ciclo repite el mismo contenido para todos, sin distinguir área ni tipo de error.')}
      <p class="tm-l tm-res">3 fallas · cumplimiento certificado · <b>riesgo sin reducir</b></p>
      <p class="tm-l tm-cmd">${ps} <span class="tm-cursor" aria-hidden="true"></span></p>
    </div>
  </div>`;
}

// Escribe los comandos letra a letra y muestra la salida línea por línea al entrar en pantalla.
function escribirTerminal() {
  const tm = document.querySelector('.tm');
  if (!tm) return;
  const lineas = [...tm.querySelectorAll('.tm-l')];
  tm.classList.add('animada');
  const tl = gsap.timeline({ paused: true });
  lineas.forEach(l => {
    tl.call(() => l.classList.add('vista'));
    const c = l.querySelector('.tm-c');
    if (c) {
      const texto = c.textContent, o = { n: 0 };
      c.textContent = '';
      tl.to(o, { n: texto.length, duration: texto.length * .016, ease: 'none', onUpdate: () => { c.textContent = texto.slice(0, Math.round(o.n)); } }).to({}, { duration: .12 });
    } else tl.to({}, { duration: .045 });
  });
  ScrollTrigger.create({ trigger: tm, start: 'top 85%', once: true, onEnter: () => tl.play() });
}

function iniciarPortada() {
  const nav = document.getElementById('p-nav');
  portada.scroll = () => nav && nav.classList.toggle('solida', window.scrollY > 40);
  window.addEventListener('scroll', portada.scroll, { passive: true });
  portada.scroll();
  ubicarZonas();
  portada.zonas = ubicarZonas;
  window.addEventListener('resize', portada.zonas);

  // Menú de secciones (botones: los enlaces con # chocarían con el enrutador por hash).
  document.querySelectorAll('[data-ir]').forEach(b => b.addEventListener('click', () => {
    const destino = document.getElementById(b.dataset.ir);
    if (!destino) return;
    if (portada.lenis) portada.lenis.scrollTo(destino, { offset: -72 });
    else window.scrollTo({ top: destino.getBoundingClientRect().top + scrollY - 72, behavior: 'smooth' });
  }));

  // Antes / después: en pantallas táctiles el toque abre la tarjeta (no hay hover).
  document.querySelectorAll('.ad-t').forEach(t => t.addEventListener('click', () => t.classList.toggle('abierta')));
  document.querySelectorAll('.bn-card').forEach(t => t.addEventListener('click', () => t.classList.toggle('girada')));

  if (!window.gsap || !window.ScrollTrigger || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelector('.h-historia')?.classList.add('estatica');
    document.querySelector('.cr')?.classList.add('estatico');      // carrusel como rejilla
    document.querySelector('.mw')?.classList.add('estatica');      // mundos sin parallax
    document.querySelector('.cmp-marco')?.classList.add('activa');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  portada.historia = animarHistoria();
  portada.carrusel = iniciarCarrusel();
  escribirTerminal();
  ScrollTrigger.create({ trigger: '.cmp-marco', start: 'top 75%', once: true, onEnter: () => document.querySelector('.cmp-marco').classList.add('activa') });
  animarMundos();
  // Las fuentes cambian la altura de las secciones: recalcula dónde empieza cada animación.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

  // Riel de capítulos: aparece después del parallax y marca el capítulo actual.
  const riel = document.querySelector('.p-capitulos');
  ScrollTrigger.create({ trigger: '#problema', start: 'top 70%', endTrigger: '#entrar', end: 'top 60%', onToggle: st => riel.classList.toggle('visible', st.isActive) });
  CAPITULOS.forEach(([id]) => ScrollTrigger.create({
    trigger: '#' + id, start: 'top 50%', end: 'bottom 50%',
    onToggle: st => st.isActive && riel.querySelectorAll('[data-cap]').forEach(b => b.classList.toggle('act', b.dataset.cap === id))
  }));

  // Entrada al cargar (sobre elementos internos, para no chocar con el scroll)
  gsap.from('.parallax__title', { yPercent: 30, opacity: 0, duration: 1.2, ease: 'expo.out' });
  gsap.from('.parallax__def, .parallax__lema', { y: 12, opacity: 0, duration: 1, delay: .25, ease: 'expo.out' });
  gsap.from('.hp-in', { scale: .6, opacity: 0, duration: .8, stagger: .12, delay: .6, ease: 'back.out(2)', clearProps: 'all' });
  portada.rotar = rotarPersonas();
  gsap.from('.h-equipos', { y: 120, opacity: 0, duration: 1.4, delay: .2, ease: 'expo.out' });

  // Los equipos se inclinan levemente con el puntero
  const eq = document.querySelector('.h-equipos');
  gsap.set(eq, { transformPerspective: 1400 });
  if (matchMedia('(pointer: fine)').matches) {
    const rx = gsap.quickTo(eq, 'rotationX', { duration: .8, ease: 'power3' }), ry = gsap.quickTo(eq, 'rotationY', { duration: .8, ease: 'power3' });
    portada.puntero = ev => { rx((ev.clientY / innerHeight - .5) * -5); ry((ev.clientX / innerWidth - .5) * 7); };
    window.addEventListener('pointermove', portada.puntero, { passive: true });
  }

  // Secciones que aparecen al hacer scroll
  ScrollTrigger.batch('.revelar', {
    start: 'top 88%',
    onEnter: els => gsap.from(els, { y: 40, opacity: 0, duration: .9, stagger: .08, ease: 'expo.out', clearProps: 'transform,opacity' }),
    once: true
  });

  // Red de seguridad: si una animación de entrada se interrumpe (por el loader o un salto de
  // scroll), la sección no debe quedar pegada en opacity:0. Aquí se fuerza a mostrarla.
  const asegurarVisible = () => document.querySelectorAll('.revelar').forEach(el => {
    if (parseFloat(getComputedStyle(el).opacity) === 0 && !gsap.isTweening(el)) gsap.set(el, { clearProps: 'opacity,transform' });
  });
  ScrollTrigger.addEventListener('refresh', asegurarVisible);
  window.addEventListener('load', () => setTimeout(asegurarVisible, 500), { once: true });
  setTimeout(asegurarVisible, 2500);

  if (window.Lenis) {
    portada.lenis = new Lenis();
    portada.lenis.on('scroll', ScrollTrigger.update);
    portada.tick = time => portada.lenis.raf(time * 1000);
    gsap.ticker.add(portada.tick);
    gsap.ticker.lagSmoothing(0);
  }
}

function detenerPortada() {
  if (portada.scroll) window.removeEventListener('scroll', portada.scroll);
  if (portada.puntero) window.removeEventListener('pointermove', portada.puntero);
  clearInterval(portada.rotar);
  if (portada.carrusel) portada.carrusel.destruir();
  if (portada.zonas) window.removeEventListener('resize', portada.zonas);
  if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(st => st.kill());
  if (window.gsap) { if (portada.tick) gsap.ticker.remove(portada.tick); gsap.ticker.lagSmoothing(500, 33); }
  if (portada.lenis) portada.lenis.destroy();
  portada.lenis = portada.tick = portada.scroll = portada.puntero = portada.historia = portada.rotar = portada.carrusel = null;
}

// Línea de tiempo de la historia, atada al scroll. Unidades: 0–1 portada, luego ~2 por amenaza, 9–10.5 perfil.
function animarHistoria() {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const escena = $('.h-escena'), pant = $('.hl-pantalla'), cur = $('.h-cursor');
  const frase = n => `.h-frase[data-acto="${n}"]`, sello = n => `.h-sello[data-sello="${n}"]`;
  const ancho = innerWidth >= 960;

  // Posición (en % de la pantalla) del centro de cada botón objetivo; no depende de la escala.
  const pr = pant.getBoundingClientRect();
  const obj = k => {
    const r = $(`[data-objetivo="${k}"]`).getBoundingClientRect();
    return { left: ((r.left + r.width * .6 - pr.left) / pr.width * 100) + '%', top: ((r.top + r.height * .55 - pr.top) / pr.height * 100) + '%' };
  };
  const o = { correo: obj('correo'), archivo: obj('archivo'), descarga: obj('descarga'), login: obj('login') };

  // Estado inicial: equipos centrados bajo el título.
  const eq = $('.h-equipos'), er = eq.getBoundingClientRect(), sr = escena.getBoundingClientRect();
  const hx = (sr.left + sr.width / 2) - (er.left + er.width / 2);
  gsap.set('.h-frase', { opacity: 0, y: 40 });
  gsap.set('.h-sello, .h-perfil', { opacity: 0, scale: .85 });
  gsap.set('.h-cierre', { opacity: 0, y: 40 });
  gsap.set('.hc-noti, .hc-burbuja, .tm-mia, .tm-n2, .tm-f2 .tm-av, .tm-escribiendo', { opacity: 0, y: 14 });
  gsap.set('.tm-escribe', { clipPath: 'inset(0 100% 0 0)' });
  gsap.set('.hc-web', { opacity: 0, yPercent: 8 });
  gsap.set('.ol-vinculo', { opacity: 0 });
  gsap.set('.hc-teams', { opacity: 0, scale: .92 });
  gsap.set('.hw-codigo', { clipPath: 'inset(0 100% 0 0)' });
  gsap.set('.hl-app:not([data-pant="correo"]), .hl-descarga, .h-cursor', { opacity: 0 });
  gsap.set('.hl-pdf', { opacity: 0, scale: .94 });
  gsap.set('.h-clave', { clipPath: 'inset(0 100% 0 0)' });

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: { trigger: '.h-historia', start: 'top top', end: 'bottom bottom', scrub: .8 },
    // En la propia línea de tiempo: corre en cada cambio de tiempo, también tras un salto de scroll.
    onUpdate: () => {
      const t = tl.time(), acto = t < 1.1 ? 0 : t < 3.1 ? 1 : t < 6.9 ? 2 : t < 10.7 ? 3 : t < 12.7 ? 4 : t < 14 ? 5 : 6;
      if (escena.dataset.acto === String(acto)) return;
      escena.dataset.acto = acto;
      $$('.h-progreso li').forEach((li, k) => { li.classList.toggle('hecho', k + 1 < acto); li.classList.toggle('actual', k + 1 === acto); });
    }
  });
  const entra = (sel, at) => tl.to(sel, { opacity: 1, y: 0, duration: .45, ease: 'power3.out' }, at);
  const sale = (sel, at) => tl.to(sel, { opacity: 0, y: -30, duration: .4, ease: 'power2.in' }, at);
  const pop = (sel, at) => tl.to(sel, { opacity: 1, scale: 1, duration: .3, ease: 'back.out(2.2)' }, at);
  const clic = (boton, color, at) => tl
    .to(cur, { scale: .78, duration: .08, yoyo: true, repeat: 1, ease: 'none' }, at)
    .to(boton, { boxShadow: `0 0 0 4px ${color}`, duration: .15, ease: 'none' }, at + .05);
  const mover = (k, at) => tl.to(cur, { left: o[k].left, top: o[k].top, duration: .8 }, at);

  // 0 · Portada: el título sube, las personas se dispersan y los equipos llegan a su sitio. Fondo con profundidad.
  tl.to('.h-hero', { yPercent: -45, opacity: 0, duration: 1, ease: 'power1.in' }, 0)
    .to('.parallax__pista', { opacity: 0, duration: .3 }, 0)
    .to('.h-persona', { x: (i, el) => el.dataset.dx * innerWidth * .25, y: (i) => (i % 2 ? -1 : 1) * innerHeight * .12, opacity: 0, scale: .8, duration: 1 }, 0)
    .fromTo('.h-equipos-in', { x: ancho ? hx : 0, y: innerHeight * (ancho ? .36 : .22), scale: ancho ? .82 : .9 }, { x: 0, y: 0, scale: 1, duration: 1.1 }, 0)
    .to('.h-fondo', { yPercent: -10, scale: 1.1, ease: 'none', duration: 15.8 }, 0)
    .to('.h-red', { yPercent: -12, ease: 'none', duration: 15.8 }, 0);

  // 1 · Phishing
  entra(frase(1), 1.1);
  tl.set(cur, { left: '78%', top: '88%' }, 1.3).to(cur, { opacity: 1, duration: .2 }, 1.35);
  mover('correo', 1.4);
  tl.to('[data-vinculo="correo"]', { opacity: 1, duration: .15 }, 2.05).to('[data-vinculo="correo"]', { opacity: 0, duration: .15 }, 2.85);
  clic('[data-objetivo="correo"]', 'rgba(242,85,90,.7)', 2.25);
  pop(sello(1), 2.35);
  sale([frase(1), sello(1)], 2.9);
  tl.to(cur, { opacity: 0, duration: .2 }, 2.9);

  // 2 · Ingeniería social: el celular pasa al frente
  tl.to('.h-laptop', { opacity: .3, scale: .95, filter: 'blur(3px)', duration: .5 }, 3.0)
    .to('.h-cel', { scale: ancho ? 1.5 : 1.3, xPercent: ancho ? -150 : -100, yPercent: -22, duration: .6 }, 3.0);
  entra(frase(2), 3.2);
  entra('.hc-noti', 3.35);
  tl.to('.hc-noti', { scale: .95, duration: .08, yoyo: true, repeat: 1, ease: 'none' }, 3.6)        // toca la notificación
    .to('.hc-bloqueo', { opacity: 0, duration: .25 }, 3.68)
    .to('.hc-teams', { opacity: 1, scale: 1, duration: .3, ease: 'power3.out' }, 3.68);             // se abre Teams
  entra('.hc-burbuja[data-b="1"]', 3.9);                                                              // escribe el atacante
  entra('.hc-burbuja[data-b="2"]', 4.15);
  tl.to('.tm-campo em', { opacity: 0, duration: .05 }, 4.45)                                          // contesta la persona
    .to('.tm-escribe', { clipPath: 'inset(0 0% 0 0)', duration: .3, ease: 'steps(10)' }, 4.45)
    .to('.tm-escribe', { opacity: 0, duration: .05 }, 4.8)
    .to('.tm-campo em', { opacity: 1, duration: .05 }, 4.82);
  entra('.tm-mia', 4.8);
  entra('.tm-escribiendo', 5.0);                                                                      // «escribiendo…»
  tl.to('.tm-escribiendo', { opacity: 0, duration: .1 }, 5.3);
  const chat = $('.hc-chat'), hilo = $('.tm-hilo');
  // El chat sube lo justo para que el enlace quede entero sobre la barra de escribir (se mide al llegar a este punto).
  const subir = () => { const u = $('.hc-burbuja[data-b="4"]'); return -Math.max(0, u.offsetTop + u.offsetHeight - chat.clientHeight + chat.clientHeight * .05); };
  tl.fromTo(hilo, { y: 0 }, { y: subir, duration: .35, immediateRender: false }, 5.28);
  entra('.tm-n2, .tm-f2 .tm-av', 5.3);
  entra('.hc-burbuja[data-b="3"]', 5.32);                                                             // manda el enlace
  entra('.hc-burbuja[data-b="4"]', 5.5);
  tl.to('.tm-enlace', { scale: .96, duration: .08, yoyo: true, repeat: 1, ease: 'none' }, 5.85)     // toca el enlace
    .to('.hc-web', { opacity: 1, yPercent: 0, duration: .25, ease: 'power3.out' }, 5.92)              // se abre la página
    .to('.hw-codigo', { clipPath: 'inset(0 0% 0 0)', duration: .25, ease: 'steps(6)' }, 6.05)         // escribe el código
    .to('.hw-boton', { scale: .94, duration: .06, yoyo: true, repeat: 1, ease: 'none' }, 6.35);       // envía
  pop(sello(2), 6.4);
  sale([frase(2), sello(2)], 6.75);
  tl.to('.h-laptop', { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .5 }, 6.8)
    .to('.h-cel', { scale: 1, xPercent: 0, yPercent: 0, duration: .5 }, 6.8);

  // 3 · Archivo sospechoso: «Descargar» es un enlace intermediario (ADR 3.8). Luego se abre el PDF y su baliza marca la apertura.
  tl.to('[data-pant="correo"]', { opacity: 0, duration: .3 }, 6.9).to('[data-pant="archivo"]', { opacity: 1, duration: .3 }, 6.9);
  entra(frase(3), 7.05);
  tl.set(cur, { left: '30%', top: '85%' }, 7.2).to(cur, { opacity: 1, duration: .2 }, 7.25);
  mover('archivo', 7.3);
  tl.to('[data-vinculo="archivo"]', { opacity: 1, duration: .15 }, 7.9).to('[data-vinculo="archivo"]', { opacity: 0, duration: .15 }, 8.3);
  clic('[data-objetivo="archivo"]', 'rgba(242,85,90,.7)', 8.1);
  entra('.hl-descarga', 8.15);
  pop(sello(3), 8.25);
  tl.to(sello(3), { opacity: 0, duration: .25 }, 8.75);
  mover('descarga', 8.7);                                                        // abre el PDF descargado
  clic('[data-objetivo="descarga"]', 'rgba(34,211,238,.6)', 9.5);
  tl.to('.hl-pdf', { opacity: 1, scale: 1, duration: .35, ease: 'power3.out' }, 9.55)
    .to(cur, { opacity: 0, duration: .15 }, 9.55)
    .fromTo('.hp-baliza', { scale: .4, opacity: 0 }, { scale: 1, opacity: 1, duration: .3, ease: 'back.out(2.5)' }, 9.8);
  pop(sello(5), 9.85);
  sale([frase(3), sello(5)], 10.55);

  // 4 · Página falsa: el navegador muestra la intranet falsa
  tl.to('[data-pant="archivo"], .hl-pdf', { opacity: 0, duration: .3 }, 10.7).to('[data-pant="login"]', { opacity: 1, duration: .3 }, 10.7);
  entra(frase(4), 10.85);
  tl.to('.h-clave', { clipPath: 'inset(0 0% 0 0)', duration: .5, ease: 'steps(10)' }, 11.1);
  tl.set(cur, { left: '75%', top: '30%' }, 11.2).to(cur, { opacity: 1, duration: .2 }, 11.25);
  mover('login', 11.3);
  clic('[data-objetivo="login"]', 'rgba(242,85,90,.7)', 12.1);
  pop(sello(4), 12.15);
  sale([frase(4), sello(4)], 12.6);
  tl.to(cur, { opacity: 0, duration: .2 }, 12.6);

  // 5 · Perfil: los equipos se retiran y queda el resultado
  tl.to('.h-laptop, .h-cel', { opacity: .18, scale: .92, filter: 'blur(4px)', duration: .6 }, 12.7);
  entra(frase(5), 12.85);
  pop('.h-perfil', 12.9);
  tl.from('.hpf-barra i', { scaleX: 0, transformOrigin: 'left', stagger: .12, duration: .5, ease: 'power3.out' }, 13.05)
    .to({}, { duration: .5 }, 13.6);

  // 6 · Cierre: todo se retira y queda la frase que abre el recorrido
  tl.to([frase(5), '.h-perfil', '.h-progreso'], { opacity: 0, y: -30, duration: .45, ease: 'power2.in' }, 14.0)
    .to('.h-laptop, .h-cel', { opacity: 0, scale: .85, duration: .5 }, 14.0)
    .to('.h-cierre', { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, 14.3)
    .from('.h-cierre span', { opacity: 0, y: 24, duration: .5, ease: 'power3.out' }, 14.65)
    .to({}, { duration: .6 }, 15.2); // pausa final antes de soltar la escena
  return tl;
}

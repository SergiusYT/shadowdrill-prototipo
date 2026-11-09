// ShadowDrill, prototipo v1. Enrutador por hash y vistas en JS vanilla.

const estado = {
  rol: 'admin',            // 'admin' o 'responsable'
  campanas: CAMPANAS_HISTORICAS.slice(),
  borrador: null,
  timers: {}
};

const $ = s => document.querySelector(s);

// ---------- API falsa y persistencia local ----------
// Misma forma que tendrá la API real: cuando exista el backend solo cambia esta capa
// (por ejemplo, guardar: c => fetch('/api/campanas', { method: 'POST', body: ... })).
const CLAVE = 'shadowdrill-prototipo-v1';
const api = {
  espera: ms => new Promise(ok => setTimeout(ok, ms)),   // latencia simulada
  guardar() {
    try {
      const propias = estado.campanas.filter(c => !CAMPANAS_HISTORICAS.some(h => h.id === c.id));
      // Los Set (pendientes, manual) solo sirven mientras corre la simulación: no se guardan.
      localStorage.setItem(CLAVE, JSON.stringify({ rol: estado.rol, campanas: propias }, (k, v) => v instanceof Set ? undefined : v));
    } catch (e) { /* almacenamiento bloqueado: el prototipo sigue en memoria */ }
  },
  cargar() {
    try { return JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch (e) { return null; }
  },
  reiniciar() { try { localStorage.removeItem(CLAVE); } catch (e) { /* nada */ } }
};
const emp = id => EMPLEADOS.find(e => e.id === id);
const camp = id => estado.campanas.find(c => c.id === id);
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function fecha(t) { const d = new Date(t); return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`; }
function hora(t, ms = true) {
  const d = new Date(t), p = (n, l = 2) => String(n).padStart(l, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${ms ? '.' + p(d.getMilliseconds(), 3) : ''}`;
}
function fechaISO(d) { return d.toISOString().slice(0, 10); }

// ---------- Reglas de evaluación y selección (explícitas, sin IA) ----------

function competencias(empId) {
  const out = {};
  Object.keys(ESCENARIOS).forEach(esc => {
    const res = estado.campanas
      .filter(c => c.escenario === esc && c.resultados[empId])
      .map(c => ({ r: c.resultados[empId], t: c.creada }));
    out[esc] = {
      puntaje: res.length ? Math.round(res.reduce((s, x) => s + PUNTOS[x.r], 0) / res.length) : null,
      n: res.length,
      cuenta: { fallo: res.filter(x => x.r === 'fallo').length, reporto: res.filter(x => x.r === 'reporto').length, ignoro: res.filter(x => x.r === 'ignoro').length },
      ultima: res.length ? Math.max(...res.map(x => x.t)) : 0
    };
  });
  return out;
}

function nivel(p) {
  if (p === null) return { txt: 'Sin datos', cls: 'n-sin' };
  if (p < 50) return { txt: 'Bajo', cls: 'n-bajo' };
  if (p < 80) return { txt: 'Medio', cls: 'n-medio' };
  return { txt: 'Alto', cls: 'n-alto' };
}

function sugerencia(empId) {
  const c = competencias(empId);
  return Object.keys(c).sort((a, b) => {
    const pa = c[a].puntaje ?? -1, pb = c[b].puntaje ?? -1;
    return pa - pb || c[a].ultima - c[b].ultima;
  })[0];
}

// Tasa de fallo agregada para un filtro de empleados y escenario.
function tasaFallo(filtroEmp, esc) {
  let f = 0, n = 0;
  estado.campanas.forEach(c => {
    if (esc && c.escenario !== esc) return;
    Object.entries(c.resultados).forEach(([id, r]) => {
      if (!filtroEmp(emp(id))) return;
      n++; if (r === 'fallo') f++;
    });
  });
  return { f, n, p: pct(f, n) };
}

// ---------- Piezas visuales comunes (tablas, chips, avatares) ----------

const ESC_ICO = { phishing: 'correo', ingenieria: 'chat', archivo: 'archivo', pagina: 'web' };
const chipEsc = k => `<span class="t-esc t-esc-${k}">${ico(ESC_ICO[k])}${ESCENARIOS[k].nombre}</span>`;
const chipCanal = c => `<span class="t-canal">${ico(c === 'correo' ? 'correo' : 'chat')}${c === 'correo' ? 'Correo' : 'Teams'}</span>`;
const iniciales = n => n.split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('');
// Color de avatar estable por persona (como en Teams): el mismo nombre siempre da el mismo tono.
const TONOS_AVA = [230, 200, 265, 300, 340, 25, 70, 165, 135, 185];
const tonoAva = n => {
  const i = EMPLEADOS.findIndex(e => e.nombre === n); // por orden: dos vecinos nunca comparten color
  return TONOS_AVA[(i >= 0 ? i * 3 : [...n].reduce((h, ch) => h + ch.charCodeAt(0), 0)) % TONOS_AVA.length];
};
const avatar = (n, cls = '') => `<span class="t-ava ${cls}" style="--h:${tonoAva(n)}" aria-hidden="true">${iniciales(n)}</span>`;
// Texto del tooltip de un puntaje: de dónde sale el número.
const detallePuntaje = (esc, c) => c.n
  ? `<b>${ESCENARIOS[esc].nombre}: ${c.puntaje} de 100</b><br>${c.n} ${c.n === 1 ? 'prueba' : 'pruebas'}: ${[['reporto', 'reportó'], ['ignoro', 'ignoró'], ['fallo', 'cayó']].filter(([k]) => c.cuenta[k]).map(([k, t]) => `${c.cuenta[k]} ${t}`).join(', ')}`
  : `<b>${ESCENARIOS[esc].nombre}</b><br>Aún no ha recibido esta prueba`;
// Bloque que explica qué es el puntaje.
const explicaPuntaje = () => `<div class="explica-puntaje">
  <p><b>¿Qué es el puntaje?</b> Mide, de 0 a 100, qué tan bien reacciona la persona ante cada tipo de amenaza. Es el promedio de todas las simulaciones de ese tipo que ha recibido.</p>
  <ul class="ep-valores">
    <li class="ep-fallo"><b>0</b> si cayó</li>
    <li class="ep-ignoro"><b>60</b> si lo ignoró</li>
    <li class="ep-reporto"><b>100</b> si lo reportó</li>
  </ul>
  <p class="ep-ej">Ejemplo: en phishing reportó una vez (100) y cayó otra (0). Su puntaje de phishing es <b>50</b>. La siguiente simulación será la amenaza con el puntaje más bajo.</p>
</div>`;
// Medidor de fallo: más rojo cuanto más alto
const medidorFallo = p => `<span class="t-medidor ${p >= 50 ? 'alto' : p >= 30 ? 'medio' : 'bajo'}" style="--p:${p}%"><i><u></u></i><b>${p} %</b></span>`;

// ---------- Plantilla general ----------

function marco(contenido, activo) {
  const admin = estado.rol === 'admin';
  const enlaces = [
    ['panel', 'Panel de indicadores', true, 'panel'],
    ['campanas', 'Campañas', true, 'campanas'],
    ['empleados', 'Empleados', admin, 'empleados']
  ].filter(x => x[2]);
  return `
  <aside class="lateral">
    <a class="marca" href="#/panel" aria-label="ShadowDrill, ir al panel">
      ${marcaSVG()}
      <span>ShadowDrill</span>
    </a>
    <div>
      <p class="etiqueta-nav">Consola</p>
      <nav aria-label="Principal">
        ${enlaces.map(([r, t, , i]) => `<a href="#/${r}" class="${activo === r ? 'activo' : ''}" ${activo === r ? 'aria-current="page"' : ''}>${ico(i)}${t}</a>`).join('')}
      </nav>
    </div>
    ${admin ? `<a class="btn btn-primario btn-bloque" href="#/nueva">${ico('mas')}Nueva campaña</a>` : ''}
    <div class="rol">
      <label for="rol">Entrar como</label>
      <select id="rol">
        <option value="admin" ${admin ? 'selected' : ''}>Administrador</option>
        <option value="responsable" ${!admin ? 'selected' : ''}>Responsable</option>
      </select>
      <p class="pista">${admin ? 'Administrador de seguridad: configura campañas y ve perfiles.' : 'Responsable organizacional: solo ve datos agregados.'}<br>${ORG.nombre}</p>
      <a class="salir" href="#/inicio">${ico('salir')}Volver a la portada</a>
      <button type="button" class="salir" data-accion="reiniciar">${ico('reloj')}Reiniciar datos de demo</button>
    </div>
  </aside>
  <main id="principal" tabindex="-1">${contenido}</main>
  <div id="modal" class="modal" hidden></div>`;
}

function avisar(txt) {
  const a = $('#aviso'); if (!a) return;
  a.innerHTML = txt; a.classList.add('visible');
  clearTimeout(estado.timers.aviso);
  estado.timers.aviso = setTimeout(() => a.classList.remove('visible'), 4200);
}

// ---------- Vista: panel de indicadores ----------

function celdaCalor(p, n, tipTxt = '') {
  // más fallo, más intenso
  // matriz de 10 puntos: cada punto encendido = 10 % de fallo
  const on = n ? Math.round(p / 10) : 0;
  const nivel = !n ? 'nulo' : p >= 50 ? 'alto' : p >= 30 ? 'medio' : 'bajo';
  return `<td class="calor calor-${nivel}" data-tip="<b>${tipTxt}</b><br>${p}% de fallo · ${n} decisiones"><strong>${n ? p + '<small>%</small>' : '—'}</strong><span class="pm">${Array.from({ length: 10 }, (_, k) => `<i class="${k < on ? 'on' : ''}"></i>`).join('')}</span></td>`;
}

// Ruta tipo terminal sobre cada tarjeta del panel.
const hud = nombre => `<p class="hud-ruta" aria-hidden="true"><span>~/indicadores/</span>${nombre}</p>`;

function vistaPanel() {
  const escs = Object.keys(ESCENARIOS);
  const canal = estado.filtroCanal || 'todos';
  const delCanal = c => canal === 'todos' || c.canal === canal;
  const total = tasaFallo(() => true);
  let rep = 0, nrep = 0, eventos = 0, msSum = 0, msN = 0;
  const reparto = { fallo: 0, reporto: 0, ignoro: 0 };
  estado.campanas.forEach(c => {
    Object.values(c.resultados).forEach(r => { nrep++; if (r === 'reporto') rep++; reparto[r] = (reparto[r] || 0) + 1; });
    eventos += c.eventos.length;
    c.eventos.forEach(e => { if (e.ms) { msSum += e.ms; msN++; } });
  });
  const enCurso = estado.campanas.filter(c => c.estado === 'en-curso');
  const porEsc = escs.map(e => ({ e, ...tasaFallo(() => true, e) })).sort((a, b) => b.p - a.p);
  const peor = porEsc[0];

  // serie temporal: una campaña cerrada = un punto
  const cerradas = estado.campanas.filter(c => c.estado === 'cerrada' && Object.keys(c.resultados).length).sort((a, b) => a.creada - b.creada);
  const serie = cerradas.filter(delCanal);
  const tasa = (c, r) => { const v = Object.values(c.resultados); return pct(v.filter(x => x === r).length, v.length); };
  const fallos = cerradas.map(c => tasa(c, 'fallo'));
  const mitad = Math.floor(fallos.length / 2);
  const prom = a => a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length) : 0;
  const delta = prom(fallos.slice(mitad)) - prom(fallos.slice(0, mitad));

  const filtro = ['todos', 'correo', 'teams'].map(k => `<button type="button" class="seg-btn ${canal === k ? 'activo' : ''}" data-accion="canal" data-canal="${k}" aria-pressed="${canal === k}">${{ todos: 'Todos', correo: 'Correo', teams: 'Teams' }[k]}</button>`).join('');
  const recientes = estado.campanas.slice().sort((a, b) => b.creada - a.creada).slice(0, 4);

  return `
  <header class="cabeza">
    <div>
      <p class="ceja">En vivo · ${estado.rol === 'admin' ? 'Administrador' : 'Responsable'}</p>
      <h1>Panel de indicadores</h1>
      <p class="sub">${ORG.periodo}. Datos agregados: aquí no se muestran resultados individuales.</p>
    </div>
    <p class="fecha-chip">${ico('reloj')}${ORG.nombre}</p>
  </header>

  <div class="dash dash-hud">
    <section class="tarjeta kpi-hero d-5">
      ${hud('tasa_fallo')}
      <div class="fila-entre"><h2 class="t-chica">Tasa de fallo del periodo</h2><span class="kpi-vivo"><i></i>En vivo</span></div>
      <div class="kpi-cifra"><p class="dato-num" data-contar="${total.p}" data-suf="%">${total.p}%</p>${sparkline(fallos, SERIE.fallo)}</div>
      ${medidorVU(total.p)}
      <p class="kpi-delta"><span class="chip ${delta <= 0 ? 'chip-acierto' : 'chip-fallo'}">${delta > 0 ? '+' : ''}${delta} pts</span> segunda mitad del periodo frente a la primera</p>
      <div class="kpi-pie">
        <span class="kpi-icono">${ico('perfil')}</span>
        <span><b>${total.f} de ${total.n}</b><small>decisiones registradas fueron fallo</small></span>
        <a class="btn-redondo" href="#/campanas" aria-label="Ver campañas">${ico('flecha')}</a>
      </div>
    </section>

    <section class="tarjeta d-7">
      ${hud('evolucion')}
      <div class="fila-entre"><h2>Evolución por campaña</h2><div class="segmentado" role="group" aria-label="Filtrar por canal">${filtro}</div></div>
      <div class="kpi-mini-fila">
        <div><span class="punto-l" style="background:${SERIE.fallo}"></span><small>Fallo promedio</small><b>${prom(serie.map(c => tasa(c, 'fallo')))} %</b></div>
        <div><span class="punto-l" style="background:${SERIE.reporto}"></span><small>Reporte promedio</small><b>${prom(serie.map(c => tasa(c, 'reporto')))} %</b></div>
      </div>
      ${serie.length ? graficaLinea({
        series: [
          { id: 'f', nombre: 'Fallo', color: SERIE.fallo, valores: serie.map(c => tasa(c, 'fallo')) },
          { id: 'r', nombre: 'Reporte', color: SERIE.reporto, valores: serie.map(c => tasa(c, 'reporto')) }
        ],
        etiquetas: serie.map(c => fecha(c.creada).replace(/ \d{4}$/, '')),
        detalle: serie.map(c => `${c.nombre} · ${ESCENARIOS[c.escenario].nombre}`)
      }) : '<p class="vacio">No hay campañas cerradas en este canal.</p>'}
    </section>

    <section class="tarjeta d-7">
      ${hud('escenarios')}
      <div class="fila-entre"><h2>Resultados por escenario</h2>${leyendaG([[SERIE.fallo, 'Cayó'], [SERIE.reporto, 'Reportó'], [SERIE.ignoro, 'Ignoró']])}</div>
      <p class="sub-t">Qué hizo la gente con cada tipo de amenaza. ${estado.campanas.length} campañas.</p>
      ${graficaApilada(escs.map(e => {
        const partes = { fallo: 0, reporto: 0, ignoro: 0 };
        estado.campanas.filter(c => c.escenario === e).forEach(c => Object.values(c.resultados).forEach(r => partes[r]++));
        return { nombre: ESCENARIOS[e].nombre, partes };
      }))}
    </section>

    <section class="tarjeta d-5">
      ${hud('decisiones')}
      <h2>Distribución de decisiones</h2>
      ${graficaDona(reparto, nrep, 'decisiones')}
    </section>

    <div class="mini-kpis d-12">
      <section class="tarjeta mini"><span class="mini-ico">${ico('escudo')}</span><small>Reportado a seguridad</small><b data-contar="${pct(rep, nrep)}" data-suf=" %">${pct(rep, nrep)} %</b><span>de los mensajes simulados</span></section>
      <section class="tarjeta mini"><span class="mini-ico">${ico('enviar')}</span><small>Eventos registrados</small><b data-contar="${eventos}">${eventos.toLocaleString('es-CO')}</b><span>envíos, aperturas y decisiones</span></section>
      <section class="tarjeta mini"><span class="mini-ico">${ico('reloj')}</span><small>Registro de la decisión</small><b data-contar="${msN ? Math.round(msSum / msN) : 0}" data-suf=" ms">${msN ? Math.round(msSum / msN) : 0} ms</b><span>en promedio · meta &lt; 1 s</span></section>
      <section class="tarjeta mini mini-alerta"><span class="mini-ico">${ico(ESC_ICO[peor.e])}</span><small>Amenaza más débil</small><b>${ESCENARIOS[peor.e].nombre}</b><span>${peor.p} % de fallo. Conviene reforzarla.</span></section>
    </div>

    <section class="tarjeta mapa d-12">
      <div class="fila-entre">
        <div class="mapa-cabeza">${hud('mapa_areas')}<h2>Dónde cae la organización</h2><p>Porcentaje de decisiones que fueron fallo, por área y tipo de amenaza.</p></div>
        <p class="leyenda leyenda-pm"><span class="pm"><i class="on"></i></span> = 10 % de fallo <span class="sep"></span><span class="chip-n bajo">&lt; 30</span><span class="chip-n medio">30–49</span><span class="chip-n alto">≥ 50</span></p>
      </div>
      <div class="tabla-scroll">
      <table class="tabla-calor">
        <thead><tr><th scope="col">Área</th>${escs.map(e => `<th scope="col">${ESCENARIOS[e].nombre}</th>`).join('')}<th scope="col">Total</th></tr></thead>
        <tbody>
          ${AREAS.map(a => `<tr><th scope="row">${a}</th>${escs.map(e => { const t = tasaFallo(x => x.area === a, e); return celdaCalor(t.p, t.n, `${a} · ${ESCENARIOS[e].nombre}`); }).join('')}${(() => { const t = tasaFallo(x => x.area === a); return celdaCalor(t.p, t.n, `${a} · total`); })()}</tr>`).join('')}
        </tbody>
      </table>
      </div>
    </section>

    ${tarjetaGrafo(estado.rol === 'admin')}

    <section class="tarjeta d-7">
      ${hud('actividad')}
      <div class="fila-entre"><h2>Actividad reciente</h2><a class="ver-todo" href="#/campanas">Ver todas ${ico('flecha')}</a></div>
      <ul class="actividad">
        ${recientes.map(c => { const v = Object.values(c.resultados), f = pct(v.filter(r => r === 'fallo').length, v.length); return `<li>
          <span class="act-icono t-esc-${c.escenario}">${ico(ESC_ICO[c.escenario])}</span>
          <span class="act-txt"><a href="#/campana/${c.id}">${c.nombre}</a><small>${ESCENARIOS[c.escenario].nombre} · ${c.canal === 'correo' ? 'Correo' : 'Teams'} · ${fecha(c.creada)}</small></span>
          <span class="chip ${c.estado === 'en-curso' ? 'chip-vivo' : ''}">${c.estado === 'en-curso' ? 'En curso' : 'Cerrada'}</span>
          ${v.length ? medidorFallo(f) : '<b class="act-valor">—</b>'}</li>`; }).join('')}
      </ul>
    </section>

    <section class="tarjeta d-5">
      ${hud('en_curso')}
      <div class="fila-entre"><h2>Campañas en curso</h2>${estado.rol === 'admin' ? `<a class="btn btn-chico" href="#/nueva">${ico('mas')}Nueva</a>` : ''}</div>
      ${enCurso.length ? `<ul class="actividad">${enCurso.map(c => `<li><span class="act-icono vivo"><span class="punto"></span></span><span class="act-txt"><a href="#/campana/${c.id}">${c.nombre}</a><small>${Object.keys(c.resultados).length} de ${c.destinatarios.length} decisiones</small></span></li>`).join('')}</ul>`
        : `<p class="vacio">No hay campañas en curso. ${estado.rol === 'admin' ? 'Crea una con <a href="#/nueva">Nueva campaña</a>.' : ''}</p>`}
      <p class="nota-chica">${ico('escudo')}Cifras simuladas del prototipo.</p>
    </section>
  </div>`;
}

function listaCampanas(lista) {
  return `<div class="tabla-scroll"><table class="tabla">
    <thead><tr><th>Campaña</th><th>Escenario</th><th>Canal</th><th>Fecha</th><th>Estado</th><th>Tasa de fallo</th></tr></thead>
    <tbody>${lista.map(c => {
      const res = Object.values(c.resultados), f = res.filter(r => r === 'fallo').length;
      return `<tr>
        <td><a class="t-titulo" href="#/campana/${c.id}">${c.nombre}</a><small class="t-sub">${c.destinatarios.length} destinatarios · ${res.length} decisiones</small></td>
        <td>${chipEsc(c.escenario)}</td>
        <td>${chipCanal(c.canal)}</td>
        <td class="t-fecha">${fecha(c.creada)}</td>
        <td><span class="chip ${c.estado === 'en-curso' ? 'chip-vivo' : ''}">${c.estado === 'en-curso' ? 'En curso' : 'Cerrada'}</span></td>
        <td>${res.length ? medidorFallo(pct(f, res.length)) : '<span class="t-sub">sin datos</span>'}</td>
      </tr>`;
    }).join('')}</tbody></table></div>`;
}

function vistaCampanas() {
  const lista = estado.campanas.slice().sort((a, b) => b.creada - a.creada);
  return `<header class="cabeza"><div><h1>Campañas</h1><p class="sub">${lista.length} campañas en el periodo.</p></div>
    ${estado.rol === 'admin' ? '<a class="btn btn-primario" href="#/nueva">Nueva campaña</a>' : ''}</header>
    <section class="seccion-carpetas">
      <div class="fila-entre"><h2>Por tipo de amenaza</h2><p class="pista">Abre una carpeta para ver sus campañas. ${estado.rol === 'admin' ? 'El botón + crea una nueva de ese tipo.' : ''}</p></div>
      ${vistaCarpetas()}
    </section>
    <section class="tarjeta"><h2>Todas las campañas</h2>${listaCampanas(lista)}</section>`;
}

// ---------- Vista: nueva campaña (4 pasos) ----------

const PASOS = ['Escenario', 'Destinatarios', 'Canal y ventana', 'Revisar y lanzar'];

function nuevoBorrador() {
  const hoy = new Date();
  return {
    paso: 1, escenario: null, destinatarios: new Set(), canal: null,
    inicio: fechaISO(hoy), fin: fechaISO(new Date(hoy.getTime() + 4 * 864e5)),
    buzon: ORG.buzon, demo: true, confirmado: false, nombre: '', error: ''
  };
}

function vistaNueva() {
  if (estado.rol !== 'admin') return sinPermiso();
  const b = estado.borrador ||= nuevoBorrador();
  return `
  <header class="cabeza"><div><h1>Nueva campaña</h1><p class="sub">Los empleados no sabrán cuándo llega ni qué tipo de prueba es.</p></div>
    <a class="btn btn-texto" href="#/panel" data-accion="cancelar">Cancelar</a></header>
  <ol class="pasos" aria-label="Pasos">
    ${PASOS.map((p, i) => `<li class="${i + 1 === b.paso ? 'actual' : i + 1 < b.paso ? 'hecho' : ''}" ${i + 1 === b.paso ? 'aria-current="step"' : ''}><span>${i + 1}</span>${p}</li>`).join('')}
  </ol>
  <section class="tarjeta asistente">
    <p class="asis-ruta" aria-hidden="true"><span>campaña/nueva/</span>paso_0${b.paso} <i>// ${PASOS[b.paso - 1].toUpperCase()}</i></p>
    ${[paso1, paso2, paso3, paso4][b.paso - 1](b)}
    ${b.error ? `<p class="error" role="alert">${b.error}</p>` : ''}
    <div class="acciones">
      ${b.paso > 1 ? '<button class="btn" data-accion="atras">Atrás</button>' : '<span></span>'}
      ${b.paso < 4 ? '<button class="btn btn-primario btn-glitch" data-accion="siguiente" data-text="Continuar"><span>Continuar</span></button>'
                   : '<button class="btn btn-primario btn-lanzar btn-glitch" data-accion="lanzar" data-text="Lanzar campaña"><span>Lanzar campaña</span></button>'}
    </div>
  </section>`;
}

function paso1(b) {
  return `<h2>¿Qué amenaza quieres simular?</h2>
  <div class="opciones" role="radiogroup" aria-label="Escenario">
    ${Object.entries(ESCENARIOS).map(([k, e]) => `
      <label class="opcion ${b.escenario === k ? 'marcada' : ''}">
        <input type="radio" name="escenario" value="${k}" ${b.escenario === k ? 'checked' : ''}>
        <strong>${e.nombre}</strong><span>${e.resumen}</span>
        <small>Canal: ${e.canales.map(c => c === 'correo' ? 'correo' : 'Teams').join(' o ')}</small>
      </label>`).join('')}
  </div>
  ${b.escenario ? `<div class="vista-previa"><h3>Mensaje que se enviará</h3>${mensajeHTML(b.escenario, null, false)}</div>` : ''}`;
}

function paso2(b) {
  const sel = b.destinatarios;
  return `<h2>¿A quién se le envía?</h2>
  <p class="sub">Marca un área completa o elige personas. La etiqueta indica el escenario más débil de cada empleado según la regla R-SEL-1.</p>
  <div class="areas">
    ${AREAS.map(a => {
      const ids = EMPLEADOS.filter(e => e.area === a).map(e => e.id);
      const todos = ids.every(id => sel.has(id));
      return `<fieldset class="area">
        <legend><label><input type="checkbox" data-area="${a}" ${todos ? 'checked' : ''}> ${a}</label></legend>
        ${ids.map(id => { const e = emp(id), s = sugerencia(id); return `
          <label class="persona"><input type="checkbox" data-emp="${id}" ${sel.has(id) ? 'checked' : ''}>
            <span>${e.nombre}<small>${e.cargo}</small></span>
            <em class="etq ${s === b.escenario ? 'etq-coincide' : ''}" title="Escenario más débil">${ESCENARIOS[s].nombre}</em></label>`; }).join('')}
      </fieldset>`;
    }).join('')}
  </div>
  <p class="conteo"><strong>${sel.size}</strong> ${sel.size === 1 ? 'persona seleccionada' : 'personas seleccionadas'}</p>`;
}

function paso3(b) {
  const canales = ESCENARIOS[b.escenario].canales;
  if (canales.length === 1) b.canal = canales[0];
  return `<h2>¿Por dónde y cuándo?</h2>
  <fieldset class="grupo"><legend>Canal de entrega</legend>
    <div class="fila">
    ${['correo', 'teams'].map(c => `<label class="opcion-chica ${!canales.includes(c) ? 'apagada' : ''}">
      <input type="radio" name="canal" value="${c}" ${b.canal === c ? 'checked' : ''} ${!canales.includes(c) ? 'disabled' : ''}>
      ${c === 'correo' ? 'Correo corporativo (Exchange)' : 'Microsoft Teams'}</label>`).join('')}
    </div>
    ${canales.length === 1 ? `<p class="pista">${ESCENARIOS[b.escenario].nombre} solo se envía por ${canales[0] === 'correo' ? 'correo' : 'Teams'}.</p>` : ''}
  </fieldset>
  <fieldset class="grupo"><legend>Ventana de envío</legend>
    <div class="fila">
      <label class="campo">Desde<input type="date" name="inicio" value="${b.inicio}"></label>
      <label class="campo">Hasta<input type="date" name="fin" value="${b.fin}"></label>
    </div>
    <p class="pista">Cada persona recibe el mensaje en un momento al azar dentro de esta ventana, en horario laboral.</p>
  </fieldset>
  <fieldset class="grupo"><legend>Buzón de reporte</legend>
    <label class="campo">Correo de seguridad de la organización<input type="email" name="buzon" value="${b.buzon}" autocomplete="off"></label>
    <p class="pista">Es el buzón al que los empleados ya reenvían los mensajes sospechosos. Si alguien reenvía la simulación aquí, cuenta como «reportó».</p>
  </fieldset>
  <label class="check"><input type="checkbox" name="demo" ${b.demo ? 'checked' : ''}> Enviar ahora para la demostración (los eventos llegan en segundos)</label>`;
}

function paso4(b) {
  const e = ESCENARIOS[b.escenario];
  if (!b.nombre) b.nombre = `${e.nombre} ${fecha(Date.now())}`;
  const areas = AREAS.filter(a => EMPLEADOS.some(x => x.area === a && b.destinatarios.has(x.id)));
  return `<h2>Revisa antes de lanzar</h2>
  <label class="campo">Nombre de la campaña<input type="text" name="nombre" value="${b.nombre}" maxlength="60"></label>
  <dl class="resumen">
    <dt>Escenario</dt><dd>${e.nombre}</dd>
    <dt>Destinatarios</dt><dd>${b.destinatarios.size} personas de ${areas.join(', ')}</dd>
    <dt>Canal</dt><dd>${b.canal === 'correo' ? 'Correo corporativo' : 'Microsoft Teams'}</dd>
    <dt>Ventana</dt><dd>${b.demo ? 'Ahora (demostración)' : `${b.inicio} a ${b.fin}`}</dd>
    <dt>Buzón de reporte</dt><dd>${b.buzon}</dd>
    <dt>Regla de evaluación</dt><dd>${e.reglaFallo}<br>${REGLAS_GENERALES.reporto}<br>${REGLAS_GENERALES.ignoro}</dd>
  </dl>
  ${comoSeRegistra(e, b.canal, b.buzon)}
  <label class="check check-fuerte"><input type="checkbox" name="confirmado" ${b.confirmado ? 'checked' : ''}>
    Confirmo que la organización anunció el periodo de simulaciones y que este mensaje no pide contraseñas reales ni contiene archivos ejecutables.</label>`;
}

// Explicación corta de cada evento, alineada con la propuesta (ADR 2: el evento se registra
// en el servidor antes de entregar el contenido; la apertura es solo complementaria).
function comoSeRegistra(e, canal, buzon) {
  const fila = (tipo, cls, titulo, txt) => `<li class="${cls}"><span class="cr-tipo">${tipo}</span><div><b>${titulo}</b><p>${txt}</p></div></li>`;
  return `<details class="como-registra" open>
    <summary>¿Cómo se registra lo que hace cada persona?</summary>
    <p class="pista">Cada mensaje lleva un enlace único para esa persona y esta campaña. Cuando la persona actúa, su navegador llega primero a ShadowDrill. El servidor anota qué pasó y la hora exacta, y solo después muestra el contenido. La persona no inicia sesión ni sabe que es una prueba.</p>
    <ol>
      ${fila('ENVIADO', '', 'Entregado', `El servicio de envío confirma que el mensaje llegó al ${canal === 'teams' ? 'Teams' : 'correo'} de la persona.`)}
      ${fila(e.eventoFallo, 'cr-fallo', 'Cayó (decisión)', `${e.reglaFallo.replace(/^R-[A-Z0-9-]+: (.)/, (_, l) => l.toUpperCase())} Se registra en el instante en que ocurre, en menos de 1 s.`)}
      ${e === ESCENARIOS.archivo ? fila('APERTURA', 'cr-extra', 'Abrió el PDF (complementario)', 'Después de la descarga se entrega un PDF con una imagen de 1×1 px. Si la persona lo abre, se anota. No cambia la decisión, que ya quedó registrada al descargar.') : ''}
      ${fila('REPORTADO', 'cr-acierto', 'Reportó (decisión)', `La persona reenvía el mensaje a ${buzon}. El servicio de envío lo reconoce por el código único que lleva el mensaje.`)}
      ${fila('CERRADO', 'cr-extra', 'Ignoró (neutro)', 'Se cierra la ventana y la persona no cayó ni reportó. Eso también es una decisión: dejó pasar el mensaje. Cuenta 60 puntos.')}
    </ol>
  </details>`;
}

function validarPaso(b) {
  if (b.paso === 1 && !b.escenario) return 'Elige un escenario para continuar.';
  if (b.paso === 2 && !b.destinatarios.size) return 'Elige al menos una persona.';
  if (b.paso === 3) {
    if (!b.canal) return 'Elige el canal de entrega.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.buzon || '')) return 'Escribe un correo válido para el buzón de reporte.';
    if (!b.demo && b.fin < b.inicio) return 'La fecha final debe ser igual o posterior a la inicial.';
  }
  if (b.paso === 4) {
    if (!b.nombre.trim()) return 'Escribe un nombre para la campaña.';
    if (!b.confirmado) return 'Marca la confirmación para poder lanzar la campaña.';
  }
  return '';
}

function lanzar(b) {
  const id = 'c' + String(estado.campanas.length + 1).padStart(2, '0');
  const c = {
    id, nombre: b.nombre.trim(), escenario: b.escenario, canal: b.canal,
    inicio: b.inicio, fin: b.fin, destinatarios: [...b.destinatarios],
    buzon: b.buzon, estado: 'en-curso', resultados: {}, eventos: [], creada: Date.now(), demo: b.demo
  };
  estado.campanas.push(c);
  estado.borrador = null;
  api.guardar();
  if (b.demo) simular(c);
  location.hash = `#/campana/${id}`;
  setTimeout(() => avisar(`Campaña lanzada. ${c.destinatarios.length} mensajes en camino.`), 50);
}

// ---------- Simulación de eventos (sustituye al puente de envío y a la API de tracking) ----------

function registrar(c, empId, tipo) {
  const ev = { t: Date.now(), emp: empId, tipo, ms: 18 + Math.floor(Math.random() * 60) };
  c.eventos.push(ev);
  if (tipo === ESCENARIOS[c.escenario].eventoFallo) c.resultados[empId] = 'fallo';
  if (tipo === 'REPORTADO') c.resultados[empId] = 'reporto';
  api.guardar();
  refrescarSiVisible(c.id, ev);
  return ev;
}

function simular(c) {
  const fallo = ESCENARIOS[c.escenario].eventoFallo;
  c.pendientes = new Set(c.destinatarios);
  c.destinatarios.forEach((id, i) => {
    const t = emp(id).t[c.escenario], r = Math.random();
    const envio = 600 + i * 350 + Math.random() * 500;
    const plan = [[envio, 'ENVIADO']];
    const decide = r < t ? fallo : r < t + (1 - t) * 0.55 ? 'REPORTADO' : null;
    if (decide) plan.push([envio + 5000 + Math.random() * 9000, decide]);
    if (decide === 'DESCARGA') plan.push([envio + 15500 + Math.random() * 2000, 'APERTURA']);
    plan.forEach(([ms, tipo]) => {
      const h = setTimeout(() => {
        if (c.estado !== 'en-curso') return;
        if (c.manual?.has(id)) return; // alguien actuó como esta persona en la vista del empleado
        if (c.resultados[id] && tipo !== 'APERTURA') return;
        if (tipo === 'APERTURA' && c.resultados[id] !== 'fallo') return;
        if (tipo === 'ENVIADO' && c.eventos.some(e => e.emp === id && e.tipo === tipo)) return;
        registrar(c, id, tipo);
      }, ms);
      (estado.timers[c.id] ||= []).push(h);
    });
  });
}

function cerrarCampana(c) {
  (estado.timers[c.id] || []).forEach(clearTimeout);
  c.destinatarios.forEach(id => {
    if (!c.eventos.some(e => e.emp === id && e.tipo === 'ENVIADO')) c.eventos.push({ t: Date.now(), emp: id, tipo: 'ENVIADO' });
    if (!c.resultados[id]) { c.resultados[id] = 'ignoro'; c.eventos.push({ t: Date.now(), emp: id, tipo: 'CERRADO' }); }
  });
  c.estado = 'cerrada';
  api.guardar();
  render();
  avisar('Campaña cerrada. Las reglas se aplicaron y los perfiles se actualizaron.');
}

// ---------- Vista: detalle de campaña ----------

// ---- Destinatarios: lista con estado, evento de decisión y filtros ----
const EST_DEST = { fallo: 'Cayó', reporto: 'Reportó', ignoro: 'Ignoró', entregado: 'Entregado', cola: 'En cola' };
function estadoDest(c, id) {
  const r = c.resultados[id];
  if (r) return r;
  return c.eventos.some(e => e.emp === id && e.tipo === 'ENVIADO') ? 'entregado' : 'cola';
}
function filaDest(c, id) {
  const p = emp(id), k = estadoDest(c, id);
  const evs = c.eventos.filter(e => e.emp === id);
  const dec = evs.find(e => e.ms), env = evs.find(e => e.tipo === 'ENVIADO'), fin = evs.find(e => e.tipo === 'CERRADO');
  const det = dec ? `<b>${dec.tipo}</b> ${hora(dec.t, false)} · ${dec.ms} ms`
    : fin ? `<b>CERRADO</b> ${hora(fin.t, false)}`
    : env ? `<b>ENVIADO</b> ${hora(env.t, false)}`
    : 'aún no se envía';
  return `<li class="dest-fila est-${k}">
    <a class="dest-persona" href="#/empleado/${id}">${avatar(p.nombre)}<span><b>${p.nombre}</b><small>${p.cargo} · ${p.area}</small></span></a>
    <span class="dest-der"><span class="dest-estado">${EST_DEST[k]}</span><span class="dest-det" ${dec ? `title="Decisión registrada en ${dec.ms} ms"` : ''}>${det}</span></span>
  </li>`;
}
function filtrosDest(c) {
  const f = estado.filtroDest || 'todos';
  const n = k => c.destinatarios.filter(id => k === 'todos' || (k === 'pendiente' ? !c.resultados[id] : c.resultados[id] === k)).length;
  return [['todos', 'Todos'], ['fallo', 'Cayó'], ['reporto', 'Reportó'], ['ignoro', 'Ignoró'], ['pendiente', 'Pendientes']]
    .filter(([k]) => k === 'todos' || n(k))
    .map(([k, t]) => `<button type="button" class="seg-btn ${f === k ? 'activo' : ''}" data-accion="filtro-dest" data-filtro="${k}" aria-pressed="${f === k}">${t}<i>${n(k)}</i></button>`).join('');
}
function ledDest(c) {
  return c.destinatarios.map(id => { const k = estadoDest(c, id); return `<i class="dl-${k}" data-tip="<b>${emp(id).nombre}</b><br>${EST_DEST[k]}"></i>`; }).join('');
}
function tarjetaDestinatarios(c) {
  if (estado.filtroDestId !== c.id) { estado.filtroDest = 'todos'; estado.filtroDestId = c.id; }
  const decid = c.destinatarios.filter(id => c.resultados[id]).length;
  return `<section class="tarjeta dest" data-filtro="${estado.filtroDest || 'todos'}">
    <p class="hud-ruta" aria-hidden="true"><span>~/campanas/${c.id}/</span>destinatarios</p>
    <div class="fila-entre"><h2>Destinatarios</h2><span class="dest-avance" id="dest-avance"><b>${decid}</b>/${c.destinatarios.length} decidieron</span></div>
    <div class="dest-led" id="dest-led" aria-hidden="true">${ledDest(c)}</div>
    <div class="segmentado dest-filtros" id="dest-filtros" role="group" aria-label="Filtrar destinatarios">${filtrosDest(c)}</div>
    <ul class="dest-lista" id="lista-dest">${c.destinatarios.map(id => filaDest(c, id)).join('')}</ul>
  </section>`;
}

function contadores(c) {
  const ids = c.destinatarios;
  const tiene = (id, tipo) => c.eventos.some(e => e.emp === id && e.tipo === tipo);
  return {
    enviados: ids.filter(id => tiene(id, 'ENVIADO')).length,
    ignoraron: ids.filter(id => c.resultados[id] === 'ignoro').length,
    pendientes: ids.filter(id => !c.resultados[id]).length,
    fallos: ids.filter(id => c.resultados[id] === 'fallo').length,
    reportes: ids.filter(id => c.resultados[id] === 'reporto').length,
    total: ids.length
  };
}

function vistaCampana(id) {
  const c = camp(id);
  if (!c) return noEncontrado('Esa campaña no existe.');
  const e = ESCENARIOS[c.escenario], k = contadores(c), admin = estado.rol === 'admin';
  const vivo = c.estado === 'en-curso';
  return `
  <header class="cabeza">
    <div>
      <p class="migas"><a href="#/campanas">Campañas</a></p>
      <h1>${c.nombre}</h1>
      <p class="sub">${e.nombre} por ${c.canal === 'correo' ? 'correo' : 'Teams'}, ${k.total} destinatarios, creada el ${fecha(c.creada)}.</p>
    </div>
    <div class="cabeza-acciones">
      ${admin ? `<button class="btn" data-accion="ver-mensaje">Ver lo que recibe el empleado</button>` : ''}
      ${admin && vivo ? `<button class="btn btn-primario" data-accion="cerrar">Cerrar campaña y evaluar</button>` : ''}
    </div>
  </header>

  ${vivo ? `<p class="banda-viva"><span class="punto"></span> Campaña en curso. Los eventos se registran en el servidor en el instante en que ocurren. Cuando quieras evaluar, usa «Cerrar campaña y evaluar».</p>` : ''}

  <div class="contadores">
    <div><strong>${k.enviados}/${k.total}</strong><span>entregados</span></div>
    <div class="c-fallo"><strong>${k.fallos}</strong><span>cayeron</span></div>
    <div class="c-acierto"><strong>${k.reportes}</strong><span>reportaron al buzón</span></div>
    ${vivo ? `<div><strong>${k.pendientes}</strong><span>aún sin decidir</span></div>` : `<div><strong>${k.ignoraron}</strong><span>ignoraron</span></div>`}
  </div>

  ${admin ? `
  <div class="rejilla-2 rejilla-registro">
    ${tarjetaDestinatarios(c)}
    <section class="registro">
      <div class="fila-entre"><h2>Registro de eventos</h2><span class="reg-estado ${vivo ? 'vivo' : ''}"><i></i>${vivo ? 'Escuchando' : 'Campaña cerrada'}</span></div>
      ${terminalEventos(c, vivo)}
    </section>
  </div>` : `
  <section class="tarjeta"><h2>Resultado agregado</h2>
    <p>Como responsable organizacional ves solo datos agregados. ${pct(k.fallos, k.total)} % cayó y ${pct(k.reportes, k.total)} % reportó el mensaje.</p>
    <table class="tabla"><thead><tr><th>Área</th><th>Destinatarios</th><th>Fallo</th></tr></thead><tbody>
    ${AREAS.map(a => { const ids = c.destinatarios.filter(id => emp(id).area === a); if (!ids.length) return ''; const f = ids.filter(id => c.resultados[id] === 'fallo').length; return `<tr><td>${a}</td><td>${ids.length}</td><td>${pct(f, ids.length)} %</td></tr>`; }).join('')}
    </tbody></table></section>`}`;
}

// Registro de eventos como salida de `tail -f` sobre el log de tracking.
function terminalEventos(c, vivo) {
  const ps = `<span class="tm-ps"><b>admin@shadowdrill</b>:<i>~/tracking</i>$</span>`;
  const evs = c.eventos.slice(-60);
  return `<div class="tm tm-eventos" role="group" aria-label="Registro de eventos de la campaña">
    ${barraTerminal(`admin@shadowdrill: ~/tracking/${c.id}`)}
    <div class="tm-cuerpo">
      <p class="tm-l tm-cmd">${ps} <span class="tm-c">tail -f eventos.log --campana ${c.id}</span></p>
      <p class="tm-l tm-meta"># canal=${c.canal} · escenario=${c.escenario} · evento de decisión=${ESCENARIOS[c.escenario].eventoFallo}${c.eventos.length > 60 ? ` · mostrando 60 de ${c.eventos.length}` : ''}</p>
      <ol class="tm-log" id="linea" aria-live="polite">${evs.map(ev => itemEvento(c, ev)).join('') || '<li class="tm-l vacio">esperando el primer envío…</li>'}</ol>
      ${vivo ? `<p class="tm-l tm-cmd tm-espera"><span class="tm-cursor" aria-hidden="true"></span></p>`
        : `<p class="tm-l tm-res">^C · ${c.eventos.length} eventos · campaña cerrada</p><p class="tm-l tm-cmd">${ps} <span class="tm-cursor" aria-hidden="true"></span></p>`}
    </div>
  </div>`;
}

function itemEvento(c, ev) {
  const fallo = ev.tipo === ESCENARIOS[c.escenario].eventoFallo, reporte = ev.tipo === 'REPORTADO';
  const decision = fallo || reporte;
  const cls = reporte ? 'ev-acierto' : fallo ? 'ev-fallo' : ev.tipo === 'CERRADO' ? 'ev-neutro' : ev.tipo === 'APERTURA' ? 'ev-extra' : '';
  const nivel = reporte ? 'OK  ' : fallo ? 'WARN' : 'INFO';
  return `<li class="tm-ev ${cls} ${decision ? 'ev-decision' : ''}" data-t="${ev.t}">
    <time>${hora(ev.t)}</time><span class="ev-nivel">${nivel}</span><span class="ev-tipo">${ev.tipo}</span>
    <span class="ev-txt"><b>${emp(ev.emp).nombre}</b> ${EVENTOS[ev.tipo][0].toLowerCase() + EVENTOS[ev.tipo].slice(1)}${decision ? `<small>↳ decisión registrada en ${ev.ms} ms</small>` : ''}</span>
  </li>`;
}

function refrescarSiVisible(id, ev) {
  if (location.hash !== `#/campana/${id}`) return;
  const c = camp(id);
  // actualiza sin recargar toda la vista para no perder el scroll
  const tmp = document.createElement('div');
  tmp.innerHTML = vistaCampana(id);
  ['.contadores', '#lista-dest', '#dest-led', '#dest-filtros', '#dest-avance'].forEach(s => { const a = $(s), b = tmp.querySelector(s); if (a && b) a.innerHTML = b.innerHTML; });
  const linea = $('#linea');
  if (linea && ev) {
    linea.querySelector('.vacio')?.remove();
    linea.insertAdjacentHTML('beforeend', itemEvento(c, ev));
    linea.lastElementChild.classList.add('nuevo');
    while (linea.children.length > 60) linea.firstElementChild.remove();
    const cuerpo = linea.closest('.tm-cuerpo');
    cuerpo.scrollTop = cuerpo.scrollHeight;
  }
}

// ---------- Vista previa del Mundo B (lo que recibe el empleado) ----------

function abrirVistaEmpleado(c, empId) {
  const m = $('#modal');
  empId = empId || c.destinatarios.find(id => !c.resultados[id]) || c.destinatarios[0];
  const decidido = c.resultados[empId];
  m.hidden = false;
  m.innerHTML = `<div class="modal-caja modal-ancha" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
    <div class="fila-entre">
      <h2 id="modal-titulo">Lo que ve el empleado</h2>
      <button class="btn btn-texto" data-accion="cerrar-modal" aria-label="Cerrar">Cerrar</button>
    </div>
    <p class="sub">El empleado no entra a ShadowDrill: el mensaje le llega a su ${c.canal === 'correo' ? 'correo' : 'Teams'} real. Puedes actuar como él para probar el registro.</p>
    <label class="campo campo-linea">Ver como
      <select id="ver-como">${c.destinatarios.map(id => `<option value="${id}" ${id === empId ? 'selected' : ''}>${emp(id).nombre}${c.resultados[id] ? ' (ya decidió)' : ''}</option>`).join('')}</select>
    </label>
    <div id="mundo-b" data-emp="${empId}">
      ${decidido ? `<p class="nota">${emp(empId).nombre} ya tomó su decisión en esta campaña. Elige otra persona.</p>` : ''}
      <p class="prev-sello" hidden></p>
      ${mensajeHTML(c.escenario, empId, c.estado === 'en-curso' && !decidido, c.canal)}
    </div>
  </div>`;
  m.querySelector('#ver-como').focus();
}

// ---------- Vista: empleados y perfil ----------

function vistaEmpleados() {
  if (estado.rol !== 'admin') return sinPermiso();
  return `<header class="cabeza"><div><h1>Empleados</h1><p class="sub">${EMPLEADOS.length} personas en ${AREAS.length} áreas. Estos perfiles solo los ve el administrador de seguridad.</p></div></header>
  <section class="tarjeta"><div class="fila-entre"><h2>Perfiles de competencia</h2>${leyendaNiveles()}</div>
  ${explicaPuntaje()}
  <div class="tabla-scroll"><table class="tabla tabla-empleados">
    <thead><tr><th rowspan="2">Empleado</th><th rowspan="2">Área</th><th colspan="4" class="th-grupo">Puntaje por tipo de amenaza (0 a 100)</th><th rowspan="2">Siguiente simulación<small>la de menor puntaje</small></th></tr>
    <tr>${Object.entries(ESCENARIOS).map(([k, e]) => `<th><span class="t-th-esc">${ico(ESC_ICO[k])}${e.nombre}</span></th>`).join('')}</tr></thead>
    <tbody>${EMPLEADOS.map(e => { const c = competencias(e.id); return `<tr>
      <td><a class="t-persona" href="#/empleado/${e.id}">${avatar(e.nombre)}<span><b>${e.nombre}</b><small>${e.cargo}</small></span></a></td><td><span class="t-area">${e.area}</span></td>
      ${Object.keys(ESCENARIOS).map(k => { const n = nivel(c[k].puntaje); return `<td><span class="nivel ${n.cls}" style="--p:${c[k].puntaje ?? 0}%" data-tip="${detallePuntaje(k, c[k])}" tabindex="0" aria-label="${ESCENARIOS[k].nombre}: ${c[k].puntaje ?? 'sin datos'}, nivel ${n.txt.toLowerCase()}">${c[k].puntaje ?? '–'}</span></td>`; }).join('')}
      <td>${chipEsc(sugerencia(e.id))}</td></tr>`; }).join('')}</tbody>
  </table></div></section>`;
}

function vistaEmpleado(id) {
  if (estado.rol !== 'admin') return sinPermiso();
  const e = emp(id); if (!e) return noEncontrado('Ese empleado no existe.');
  const c = competencias(id), s = sugerencia(id);
  const historial = estado.campanas.filter(x => x.resultados[id]).sort((a, b) => b.creada - a.creada);
  const regla = (x) => x.resultados[id] === 'fallo' ? ESCENARIOS[x.escenario].reglaFallo : REGLAS_GENERALES[x.resultados[id]];
  const ultimo = historial[0];
  return `
  <header class="cabeza"><div>
    <p class="migas"><a href="#/empleados">Empleados</a></p>
    <div class="perfil-cab">${avatar(e.nombre, 't-ava-xl')}<div><h1>${e.nombre}</h1><p class="sub">${e.cargo} · ${e.area} · ${e.correo}</p></div></div></div>
    <p class="fecha-chip">${ico('escudo')}Solo lo ve el administrador</p></header>

  <div class="rejilla-perfil">
    <section class="tarjeta">
      <h2>Perfil de competencias</h2>
      ${explicaPuntaje()}
      <div class="perfil-graf">${graficaRadar(Object.fromEntries(Object.entries(ESCENARIOS).map(([k, x]) => [x.nombre, c[k].puntaje])))}
      <ul class="barras">${Object.entries(ESCENARIOS).map(([k, x]) => { const n = nivel(c[k].puntaje); return `
        <li><span class="barra-nombre">${x.nombre}</span>
          <span class="barra"><span class="${n.cls}" style="width:${c[k].puntaje ?? 0}%"></span></span>
          <span class="barra-valor" data-tip="${detallePuntaje(k, c[k])}"><b>${c[k].puntaje ?? '–'}</b> ${n.txt}, ${c[k].n} ${c[k].n === 1 ? 'prueba' : 'pruebas'}</span></li>`; }).join('')}
      </ul></div>
    </section>
    <section class="tarjeta sugerida">
      <h2>Siguiente simulación sugerida</h2>
      <span class="sug-ico">${ico(ESC_ICO[s])}</span>
      <p class="grande">${ESCENARIOS[s].nombre}</p>
      <p>${REGLAS_GENERALES.seleccion}</p>
      <a class="btn btn-primario" href="#/nueva" data-accion="sugerida" data-emp="${id}" data-esc="${s}">Crear campaña de ${ESCENARIOS[s].nombre.toLowerCase()} para esta persona</a>
    </section>
  </div>

  <section class="tarjeta">
    <h2>Historial de decisiones</h2>
    ${ultimo && ultimo.creada > CAMPANAS_HISTORICAS[CAMPANAS_HISTORICAS.length - 1].creada ? `<p class="nota">Incluye la campaña «${ultimo.nombre}» que acabas de lanzar.</p>` : ''}
    <div class="tabla-scroll"><table class="tabla">
      <thead><tr><th>Fecha</th><th>Campaña</th><th>Escenario</th><th>Resultado</th><th>Regla aplicada</th></tr></thead>
      <tbody>${historial.map(x => { const r = x.resultados[id]; return `<tr>
        <td class="t-fecha">${fecha(x.creada)}</td><td><a class="t-titulo" href="#/campana/${x.id}">${x.nombre}</a></td><td>${chipEsc(x.escenario)}</td>
        <td>${r === 'fallo' ? '<span class="chip chip-fallo">Cayó</span>' : r === 'reporto' ? '<span class="chip chip-acierto">Reportó</span>' : '<span class="chip">Ignoró</span>'}</td>
        <td class="regla">${regla(x)}</td></tr>`; }).join('')}</tbody>
    </table></div>
  </section>`;
}

function sinPermiso() {
  return `<section class="tarjeta vacio-grande"><h1>Esta sección es del administrador de seguridad</h1>
    <p>Como responsable organizacional ves resultados agregados, nunca individuales. Vuelve al <a href="#/panel">panel de indicadores</a>.</p></section>`;
}
function noEncontrado(t) { return `<section class="tarjeta vacio-grande"><h1>${t}</h1><p><a href="#/panel">Volver al panel</a></p></section>`; }

// ---------- Enrutador y eventos ----------

function render() {
  const [ruta = 'inicio', id] = location.hash.replace(/^#\/?/, '').split('/');
  const app = document.getElementById('app');
  if (!ruta || ruta === 'inicio') {
    detenerPortada();
    app.className = 'portada';
    app.innerHTML = vistaPortada();
    document.title = 'ShadowDrill';
    iniciarPortada();
    return;
  }
  if (app.className === 'portada') detenerPortada();
  app.className = 'app';
  const vistas = { panel: vistaPanel, campanas: vistaCampanas, nueva: vistaNueva, campana: vistaCampana, empleados: vistaEmpleados, empleado: vistaEmpleado };
  const activo = { campana: 'campanas', empleado: 'empleados', nueva: 'nueva' }[ruta] || ruta;
  app.innerHTML = marco((vistas[ruta] || vistaPanel)(id), activo);
  // el log arranca mostrando lo último, como tail -f
  document.querySelectorAll('.tm-eventos .tm-cuerpo').forEach(c => { c.scrollTop = c.scrollHeight; });
  iniciarGrafo();
  document.title = `ShadowDrill, ${({ panel: 'panel', campanas: 'campañas', nueva: 'nueva campaña', campana: 'campaña', empleados: 'empleados', empleado: 'perfil' })[ruta] || 'panel'}`;
}

// Esqueleto mientras la API falsa "consulta" los datos.
function esqueleto() {
  return `<div class="cargando" aria-busy="true">
    <p class="ceja">Consultando datos…</p>
    <span class="esq esq-titulo"></span><span class="esq esq-linea"></span>
    <div class="esq esq-tarjeta"></div>
    <div class="rejilla-3"><div class="esq esq-chica"></div><div class="esq esq-chica"></div><div class="esq esq-chica"></div></div>
  </div>`;
}

let rutaPrevia = '';
let primeraNav = true;      // el arranque ya mostró su propia pantalla de carga
const SECCIONES = ['panel', 'campanas', 'empleados'];   // opciones principales de la consola
async function navegar() {
  const r = location.hash.split('/')[1] || 'inicio';
  const cambio = r !== rutaPrevia;
  const prev = rutaPrevia;
  rutaPrevia = r;
  const primera = primeraNav; primeraNav = false;
  if (!cambio || r === 'inicio') { render(); if (cambio) window.scrollTo(0, 0); return; }
  // Pantalla de carga al entrar a la consola o cambiar de opción principal (no en los detalles).
  if (!primera && !Cargador.activo && (prev === 'inicio' || SECCIONES.includes(r))) {
    window.scrollTo(0, 0);
    Cargador.transicion(() => { render(); $('#principal')?.focus({ preventScroll: true }); animarEntrada(); },
      { sub: prev === 'inicio' ? 'Entrando a la consola…' : 'Cargando ' + ({ panel: 'el panel', campanas: 'las campañas', empleados: 'los empleados' }[r] || 'la sección') + '…' });
    return;
  }
  const app = document.getElementById('app');
  if (app.className === 'portada') detenerPortada();
  app.className = 'app';
  const activo = { campana: 'campanas', empleado: 'empleados', nueva: 'nueva' }[r] || r;
  app.innerHTML = marco(esqueleto(), activo);
  window.scrollTo(0, 0);
  const hash = location.hash;
  await api.espera(380 + Math.random() * 250);
  if (location.hash !== hash) return; // el usuario ya se fue a otra pantalla
  render();
  $('#principal')?.focus({ preventScroll: true });
  animarEntrada();
}
window.addEventListener('hashchange', navegar);

// Entrada de cada pantalla: tarjetas, gráficas que se dibujan, filas y cifras que cuentan.
function animarEntrada() {
  if (!window.gsap || !$('#principal') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hay = s => document.querySelector(s);
  gsap.from('#principal > *, .dash > *, .mini-kpis > .tarjeta, .rejilla-3 > .tarjeta, .contadores > div', { y: 24, opacity: 0, duration: .8, stagger: .05, ease: 'expo.out', clearProps: 'transform,opacity' });
  // Línea: el trazo se dibuja, el área sube y los puntos aparecen
  document.querySelectorAll('.g-trazo').forEach((l, k) => {
    const largo = l.getTotalLength?.() || 1000;
    gsap.fromTo(l, { strokeDasharray: largo, strokeDashoffset: largo }, { strokeDashoffset: 0, duration: 1.6, delay: .3 + k * .2, ease: 'power2.inOut', onComplete: () => gsap.set(l, { clearProps: 'strokeDasharray,strokeDashoffset' }) });
  });
  if (hay('.g-area')) gsap.from('.g-area', { opacity: 0, duration: 1.2, delay: .9, ease: 'power1.out' });
  if (hay('.g-punto')) gsap.from('.g-punto', { scale: 0, transformOrigin: '50% 50%', duration: .45, stagger: .04, delay: 1, ease: 'back.out(3)', clearProps: 'transform' });
  if (hay('.g-directa')) gsap.from('.g-directa', { opacity: 0, x: -8, duration: .6, delay: 1.8 });
  // Sparkline
  document.querySelectorAll('.spark polyline').forEach(l => {
    const largo = l.getTotalLength?.() || 300;
    gsap.fromTo(l, { strokeDasharray: largo, strokeDashoffset: largo }, { strokeDashoffset: 0, duration: 1.4, delay: .3, ease: 'power2.out', onComplete: () => gsap.set(l, { clearProps: 'strokeDasharray,strokeDashoffset' }) });
  });
  // LEDs: las barras, el dial, el medidor VU y la matriz del mapa se encienden en secuencia
  document.querySelectorAll('.led-fila').forEach((f, k) => {
    gsap.from(f.querySelectorAll('.led'), { opacity: 0, duration: .25, stagger: .012, delay: .35 + k * .12, ease: 'none', clearProps: 'opacity' });
  });
  if (hay('.dl-marca')) gsap.from('.dl-marca', { opacity: 0, duration: .2, stagger: .014, delay: .4, ease: 'none', clearProps: 'opacity' });
  if (hay('.vu-segs .on')) gsap.from('.vu-segs .on', { opacity: 0, duration: .15, stagger: .03, delay: .3, ease: 'none', clearProps: 'opacity' });
  if (hay('.pm .on')) gsap.from('.tabla-calor .pm .on', { opacity: 0, scale: 0, duration: .3, stagger: .006, delay: .5, ease: 'back.out(3)', clearProps: 'opacity,transform' });
  animarGrafo();
  // Radar del perfil
  if (hay('.rd-forma')) gsap.from('.rd-forma, .rd-punto', { scale: 0, svgOrigin: '120 120', duration: 1, delay: .3, ease: 'expo.out', stagger: .04 });
  // Mapa de calor y filas de tablas
  if (hay('.tabla-calor td.calor')) gsap.from('.tabla-calor td.calor', { scale: .7, opacity: 0, duration: .5, stagger: { each: .02, from: 'start' }, delay: .3, ease: 'back.out(2)', clearProps: 'transform,opacity' });
  if (hay('.tabla tbody tr')) gsap.from('.tabla tbody tr', { x: -16, opacity: 0, duration: .6, stagger: .035, delay: .25, ease: 'expo.out', clearProps: 'transform,opacity' });
  if (hay('.t-medidor u')) gsap.from('.t-medidor u', { scaleX: 0, transformOrigin: '0 50%', duration: 1, delay: .5, ease: 'power2.out', stagger: .03, clearProps: 'transform' });
  // Cifras que cuentan
  document.querySelectorAll('.dato-num, [data-contar]').forEach(el => {
    const fin = el.dataset.contar ? +el.dataset.contar : +(el.textContent.match(/^(\d+) %$/) || [])[1];
    if (Number.isNaN(fin)) return;
    const suf = el.dataset.contar ? (el.dataset.suf || '') : ' %', o = { v: 0 };
    gsap.to(o, { v: fin, duration: 1.4, delay: .2, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('es-CO') + suf; } });
  });
}

document.addEventListener('change', ev => {
  const t = ev.target, b = estado.borrador;
  if (t.id === 'rol') {
    estado.rol = t.value; api.guardar();
    const msg = t.value === 'admin' ? 'Entraste como administrador de seguridad.' : 'Entraste como responsable organizacional: solo verás datos agregados.';
    const hacer = () => { render(); animarEntrada(); avisar(msg); };
    if (Cargador.activo) hacer();
    else Cargador.transicion(hacer, { sub: t.value === 'admin' ? 'Entrando como administrador…' : 'Entrando como responsable…' });
    return;
  }
  if (t.id === 'ver-como') { abrirVistaEmpleado(camp(location.hash.split('/')[2]), t.value); return; }
  if (!b || !location.hash.startsWith('#/nueva')) return;
  if (t.name === 'escenario') { b.escenario = t.value; b.canal = null; }
  if (t.dataset.area) EMPLEADOS.filter(e => e.area === t.dataset.area).forEach(e => t.checked ? b.destinatarios.add(e.id) : b.destinatarios.delete(e.id));
  if (t.dataset.emp) t.checked ? b.destinatarios.add(t.dataset.emp) : b.destinatarios.delete(t.dataset.emp);
  if (t.name === 'canal') b.canal = t.value;
  if (t.name === 'inicio' || t.name === 'fin') b[t.name] = t.value;
  if (t.name === 'demo') b.demo = t.checked;
  if (t.name === 'confirmado') b.confirmado = t.checked;
  b.error = '';
  if (t.type !== 'date') { const y = window.scrollY; render(); window.scrollTo(0, y); }
});

document.addEventListener('input', ev => {
  if (ev.target.name === 'nombre' && estado.borrador) estado.borrador.nombre = ev.target.value;
  if (ev.target.name === 'buzon' && estado.borrador) estado.borrador.buzon = ev.target.value.trim();
});

document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-accion]'); if (!el) return;
  const a = el.dataset.accion, b = estado.borrador;
  if (a === 'nueva-esc') { estado.borrador = nuevoBorrador(); estado.borrador.escenario = el.dataset.esc; }
  if (a === 'filtro-dest') {
    estado.filtroDest = el.dataset.filtro;
    const d = el.closest('.dest'); d.dataset.filtro = el.dataset.filtro;
    d.querySelectorAll('[data-accion="filtro-dest"]').forEach(b => { b.classList.toggle('activo', b === el); b.setAttribute('aria-pressed', b === el); });
  }
  if (a === 'canal') { estado.filtroCanal = el.dataset.canal; const y = window.scrollY; render(); window.scrollTo(0, y); }
  if (a === 'entrar') { estado.rol = el.dataset.rol; api.guardar(); }
  if (a === 'siguiente') { b.error = validarPaso(b); if (!b.error) b.paso++; render(); }
  if (a === 'atras') { b.paso--; b.error = ''; render(); }
  if (a === 'lanzar') {
    b.error = validarPaso(b);
    if (b.error) { render(); return; }
    el.disabled = true;
    el.innerHTML = '<span class="giro" aria-hidden="true"></span>Enviando por el puente de entrega…';
    api.espera(1100).then(() => lanzar(b));
  }
  if (a === 'reiniciar') {
    if (!confirm('¿Borrar las campañas creadas en este navegador y volver a los datos de demo?')) return;
    api.reiniciar();
    Object.values(estado.timers).flat().forEach(clearTimeout);
    estado.campanas = CAMPANAS_HISTORICAS.slice();
    estado.borrador = null;
    location.hash = '#/panel';
    render();
    avisar('Datos de demo reiniciados.');
  }
  if (a === 'cancelar') estado.borrador = null;
  if (a === 'cerrar') cerrarCampana(camp(location.hash.split('/')[2]));
  if (a === 'ver-mensaje') abrirVistaEmpleado(camp(location.hash.split('/')[2]));
  if (a === 'cerrar-modal') { $('#modal').hidden = true; render(); }
  if (a === 'caer') actuarComoEmpleado('caer');
  if (a === 'reportar') actuarComoEmpleado('reportar');
  if (a === 'abrir-pdf') abrirPDF();
  if (a === 'abrir-enlace') abrirEnlaceCodigo();
  if (a === 'sugerida') {
    estado.borrador = nuevoBorrador();
    estado.borrador.escenario = el.dataset.esc;
    estado.borrador.destinatarios.add(el.dataset.emp);
  }
});

document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape' && !$('#modal')?.hidden) { $('#modal').hidden = true; render(); }
});

// Restaura lo guardado en este navegador y reanuda las campañas que quedaron en curso.
(function restaurar() {
  const g = api.cargar();
  if (!g) return;
  if (g.rol) estado.rol = g.rol;
  (g.campanas || []).forEach(c => {
    c.eventos = (c.eventos || []).filter(e => e.tipo !== 'ABIERTO'); // la apertura del correo ya no se mide
    estado.campanas.push(c);
    if (c.estado === 'en-curso' && c.demo) simular(c);
  });
  if (g.campanas?.length) setTimeout(() => avisar(`Se restauraron ${g.campanas.length} campaña(s) guardadas en este navegador.`), 900);
})();

// Arranque: muestra la pantalla de carga y renderiza al levantarse, para que las
// animaciones de entrada de cada componente corran al revelarse el contenido.
const cargador = new Cargador();
cargador.cuandoSalga(() => navegar());

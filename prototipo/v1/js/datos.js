// Datos simulados del dominio. Organización ficticia, sin personas reales.
// Todo vive en memoria: no hay backend.

const ORG = {
  nombre: 'Empresa de demostración',
  dominio: 'miempresa.co',
  buzon: 'seguridad@miempresa.co',   // buzón donde los empleados reportan mensajes sospechosos
  periodo: 'Periodo de simulaciones 2026-II (anunciado el 1 de junio)'
};

const AREAS = ['Contabilidad', 'Talento Humano', 'Operaciones', 'Atención al cliente'];

// tendencia = probabilidad de fallar en cada escenario (dato oculto, solo para simular)
const EMPLEADOS = [
  { id: 'e01', nombre: 'Laura Gómez Rincón', cargo: 'Analista contable', area: 'Contabilidad', t: { phishing: .2, ingenieria: .3, archivo: .8, pagina: .4 } },
  { id: 'e02', nombre: 'Jorge Iván Patiño', cargo: 'Contador senior', area: 'Contabilidad', t: { phishing: .5, ingenieria: .2, archivo: .4, pagina: .3 } },
  { id: 'e03', nombre: 'Diana Marcela Ruiz', cargo: 'Auxiliar de tesorería', area: 'Contabilidad', t: { phishing: .7, ingenieria: .6, archivo: .5, pagina: .6 } },
  { id: 'e04', nombre: 'Camilo Andrés Vega', cargo: 'Analista de cuentas por pagar', area: 'Contabilidad', t: { phishing: .3, ingenieria: .4, archivo: .6, pagina: .2 } },
  { id: 'e05', nombre: 'Paola Andrea Castro', cargo: 'Coordinadora de nómina', area: 'Talento Humano', t: { phishing: .6, ingenieria: .3, archivo: .3, pagina: .5 } },
  { id: 'e06', nombre: 'Natalia Herrera Ospina', cargo: 'Analista de selección', area: 'Talento Humano', t: { phishing: .4, ingenieria: .7, archivo: .5, pagina: .4 } },
  { id: 'e07', nombre: 'Felipe Moreno Lara', cargo: 'Auxiliar de bienestar', area: 'Talento Humano', t: { phishing: .3, ingenieria: .5, archivo: .2, pagina: .3 } },
  { id: 'e08', nombre: 'Sandra Milena Duarte', cargo: 'Jefe de talento humano', area: 'Talento Humano', t: { phishing: .2, ingenieria: .2, archivo: .3, pagina: .1 } },
  { id: 'e09', nombre: 'Óscar Julián Ríos', cargo: 'Supervisor de operaciones', area: 'Operaciones', t: { phishing: .3, ingenieria: .3, archivo: .4, pagina: .6 } },
  { id: 'e10', nombre: 'Luisa Fernanda Mejía', cargo: 'Analista de procesos', area: 'Operaciones', t: { phishing: .2, ingenieria: .4, archivo: .3, pagina: .3 } },
  { id: 'e11', nombre: 'Andrés Felipe Cárdenas', cargo: 'Auxiliar de archivo', area: 'Operaciones', t: { phishing: .6, ingenieria: .5, archivo: .7, pagina: .7 } },
  { id: 'e12', nombre: 'Mónica Patricia Salazar', cargo: 'Coordinadora logística', area: 'Operaciones', t: { phishing: .4, ingenieria: .2, archivo: .4, pagina: .5 } },
  { id: 'e13', nombre: 'Juan Sebastián Torres', cargo: 'Asesor comercial', area: 'Atención al cliente', t: { phishing: .7, ingenieria: .8, archivo: .5, pagina: .6 } },
  { id: 'e14', nombre: 'Valentina Ortiz Rojas', cargo: 'Asesora de servicio', area: 'Atención al cliente', t: { phishing: .5, ingenieria: .6, archivo: .4, pagina: .5 } },
  { id: 'e15', nombre: 'Ricardo Alonso Peña', cargo: 'Asesor de crédito', area: 'Atención al cliente', t: { phishing: .4, ingenieria: .7, archivo: .3, pagina: .4 } },
  { id: 'e16', nombre: 'Carolina Bermúdez Gil', cargo: 'Líder de servicio', area: 'Atención al cliente', t: { phishing: .3, ingenieria: .4, archivo: .2, pagina: .3 } }
];
EMPLEADOS.forEach(e => {
  const [n, a] = e.nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(' ');
  e.correo = `${n[0]}${a}@${ORG.dominio}`;
});

// Cada escenario: canales permitidos, plantilla del mensaje y la regla explícita de evaluación.
const ESCENARIOS = {
  phishing: {
    nombre: 'Phishing',
    resumen: 'Correo que suplanta a un remitente conocido y pide hacer clic en un enlace.',
    canales: ['correo'],
    plantilla: {
      remitente: 'Área de Nómina <nomina@miempresa-pagos.co>',
      asunto: 'Confirme su cuenta para el pago de la prima de diciembre',
      cuerpo: 'Buen día. Para recibir la prima de servicios debe confirmar su cuenta bancaria antes del viernes a las 5:00 p. m. Si no la confirma, el pago pasa al siguiente ciclo.',
      accion: 'Confirmar mi cuenta'
    },
    eventoFallo: 'CLIC',
    reglaFallo: 'R-EV-PHI-1: hacer clic en el enlace del correo es fallo (0 puntos).'
  },
  ingenieria: {
    nombre: 'Ingeniería social',
    resumen: 'Mensaje en Teams de alguien que se hace pasar por soporte y pide un dato.',
    canales: ['teams'],
    plantilla: {
      remitente: 'Andrés Mesa de Ayuda (externo)',
      asunto: 'Chat de Teams',
      cuerpo: 'Hola, te escribo de mesa de ayuda. Estamos migrando los equipos de tu área. Valida tu cuenta en este enlace con el código que te llegó por SMS para no borrar tu perfil.',
      accion: 'Abrir el enlace y enviar el código'
    },
    eventoFallo: 'RESPUESTA',
    reglaFallo: 'R-EV-ING-1: enviar el dato pedido en el enlace único es fallo (0 puntos). El dato no se guarda.'
  },
  archivo: {
    nombre: 'Archivo sospechoso',
    resumen: 'Correo con un documento para descargar. Se registra el clic en «descargar», no la apertura.',
    canales: ['correo', 'teams'],
    plantilla: {
      remitente: 'Facturación Proveedor <facturas@proveedor-fe.com>',
      asunto: 'Factura electrónica FE-2291 vencida',
      cuerpo: 'Adjuntamos la factura FE-2291 por $4.380.000, vencida desde el 28 de octubre. Por favor descárguela y programe el pago hoy para evitar intereses de mora.',
      accion: 'Descargar Factura_FE-2291.pdf'
    },
    eventoFallo: 'DESCARGA',
    reglaFallo: 'R-EV-ARC-1: descargar el archivo es fallo (0 puntos). Abrir el PDF después es solo un dato complementario.'
  },
  pagina: {
    nombre: 'Página falsa',
    resumen: 'Enlace a una página que imita la intranet y pide iniciar sesión.',
    canales: ['correo', 'teams'],
    plantilla: {
      remitente: 'Cuenta de Microsoft <account-security-noreply@miempresa-intranet.net>',
      asunto: 'Acción requerida: verifique la contraseña de su cuenta',
      cuerpo: 'La contraseña de su cuenta de Microsoft 365 vence hoy. Verifique su cuenta para conservar el acceso a su correo y archivos.',
      accion: 'Verificar mi cuenta'
    },
    eventoFallo: 'FORMULARIO',
    reglaFallo: 'R-EV-PAG-1: enviar el formulario de la página falsa es fallo (0 puntos). Lo que se escribe no se guarda.'
  }
};

const REGLAS_GENERALES = {
  reporto: 'R-EV-GEN-1: reenviar el mensaje al buzón de seguridad es acierto (100 puntos).',
  ignoro: 'R-EV-GEN-2: ignorar el mensaje (no caer ni reportar antes de que se cierre la ventana) es neutro (60 puntos).',
  seleccion: 'R-SEL-1: la siguiente simulación es el escenario con menor puntaje del empleado. Si hay empate, gana el que lleva más tiempo sin aplicarse.'
};

const PUNTOS = { reporto: 100, ignoro: 60, fallo: 0 };

const EVENTOS = {
  ENVIADO: 'Mensaje entregado',
  CLIC: 'Hizo clic en el enlace',
  DESCARGA: 'Descargó el archivo',
  APERTURA: 'Abrió el PDF (dato complementario)',
  RESPUESTA: 'Envió el dato pedido en el enlace',
  FORMULARIO: 'Envió el formulario falso',
  REPORTADO: 'Reenvió el mensaje al buzón de seguridad',
  CERRADO: 'Ignoró el mensaje (ventana cerrada)'
};

// Generador pseudoaleatorio con semilla para que el historial sea siempre igual.
function crearAzar(semilla) {
  return () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
}

// Historial: 8 campañas cerradas entre junio y octubre de 2026.
const CAMPANAS_HISTORICAS = (() => {
  const azar = crearAzar(20261);
  const base = [
    ['c01', 'Prima de junio', 'phishing', 'correo', '2026-06-10'],
    ['c02', 'Soporte TI por Teams', 'ingenieria', 'teams', '2026-06-25'],
    ['c03', 'Factura de proveedor', 'archivo', 'correo', '2026-07-14'],
    ['c04', 'Intranet vencida', 'pagina', 'correo', '2026-07-30'],
    ['c05', 'Bono de alimentación', 'phishing', 'correo', '2026-08-20'],
    ['c06', 'Auditoría urgente', 'ingenieria', 'teams', '2026-09-04'],
    ['c07', 'Acta de comité adjunta', 'archivo', 'teams', '2026-09-23'],
    ['c08', 'Encuesta de clima laboral', 'pagina', 'teams', '2026-10-15']
  ];
  return base.map(([id, nombre, escenario, canal, fecha]) => {
    const resultados = {};
    const eventos = [];
    EMPLEADOS.forEach(e => {
      const p = e.t[escenario];
      const r = azar();
      const res = r < p ? 'fallo' : r < p + (1 - p) * 0.55 ? 'reporto' : 'ignoro';
      resultados[e.id] = res;
      const t0 = new Date(`${fecha}T08:00:00`).getTime() + Math.floor(azar() * 8 * 3600e3);
      eventos.push({ t: t0, emp: e.id, tipo: 'ENVIADO' });
      if (res === 'fallo') eventos.push({ t: t0 + 4e6, emp: e.id, tipo: ESCENARIOS[escenario].eventoFallo, ms: 20 + Math.floor(azar() * 70) });
      if (res === 'reporto') eventos.push({ t: t0 + 4e6, emp: e.id, tipo: 'REPORTADO', ms: 20 + Math.floor(azar() * 70) });
      if (res === 'ignoro') eventos.push({ t: new Date(`${fecha}T23:59:00`).getTime() + 2 * 864e5, emp: e.id, tipo: 'CERRADO' });
    });
    eventos.sort((a, b) => a.t - b.t);
    return {
      id, nombre, escenario, canal,
      inicio: fecha, fin: fecha,
      destinatarios: EMPLEADOS.map(e => e.id),
      estado: 'cerrada', resultados, eventos,
      creada: new Date(`${fecha}T07:00:00`).getTime()
    };
  });
})();

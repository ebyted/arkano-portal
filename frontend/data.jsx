// API client + data layer
const API_BASE = 'http://localhost:8000/api';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('arkano_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(res.statusText), { status: res.status, data: err });
  }
  return res.status === 204 ? null : res.json();
}

// -- Public API calls --
const API = {
  getWorkshops: (params = '') => apiFetch(`/workshops/?status=published${params}`),
  getWorkshop: (id) => apiFetch(`/workshops/${id}/`),
  getCases: () => apiFetch('/cases/?published=true'),
  register: (data) => apiFetch('/register/', { method: 'POST', body: JSON.stringify(data) }),
  bookAppointment: (data) => apiFetch('/cita/', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  login: (username, password) => apiFetch('/auth/login/', {
    method: 'POST', body: JSON.stringify({ username, password })
  }),
  adminWorkshops: () => apiFetch('/workshops/'),
  adminRegistrations: (workshopId) => apiFetch(`/registrations/${workshopId ? `?workshop=${workshopId}` : ''}`),
  adminAppointments: () => apiFetch('/appointments/'),
  adminContacts: () => apiFetch('/contacts/'),
  adminCases: () => apiFetch('/cases/'),
  checkInFolio: (folio) => apiFetch('/registrations/check_in_by_folio/', { method: 'POST', body: JSON.stringify({ folio }) }),
  updateStatus: (entity, id, data) => apiFetch(`/${entity}/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  dashboardStats: () => apiFetch('/workshops/stats/'),
};

// Static fallback data (shown while API loads or if offline)
const WORKSHOPS_FALLBACK = [
  {
    id: 'code-cyborg', code: 'AI-001', title: 'Programación con IA', subtitle: 'Code Like a Cyborg',
    category: { name: 'Desarrollo' }, level: 'intermediate', modality: 'online',
    date: '2025-07-19', time_start: '11:00', time_end: '13:00', duration: '8 sesiones · 16 hrs',
    price: '1200.00', max_capacity: 18, registered_count: 12, available_spots: 6,
    location: 'Tijuana / Zoom', instructor_label: 'Iván Saldaña', status: 'published',
    status_display: 'Inscripciones abiertas', accent: 'cyan',
    short_description: 'Programa 10× más rápido fusionando tu cerebro con Copilot, Cursor y modelos LLM.',
    description: 'Un programa intensivo donde aprendes a delegar el código repetitivo a la IA.',
    benefits: ['Stack actualizado: Cursor, Claude Code, Copilot', '4 proyectos terminados al cierre'],
    curriculum: ['Mindset cyborg', 'Cursor & Copilot setup', 'Prompts de arquitectura', 'Frontend asistido', 'Backend asistido', 'Integraciones', 'Debug con IA', 'Demo day'],
    requirements: ['Lógica básica de programación', 'Laptop con 8GB+ RAM'],
    target_audience: 'Devs junior, freelancers y founders técnicos',
    images: [{ image: 'uploads/taller 1.png', is_main: true, order: 0 }, { image: 'uploads/taller 2.png', is_main: false, order: 1 }],
    main_image_url: 'uploads/taller 1.png',
  },
  {
    id: 'ia-negocios', code: 'AI-002', title: 'IA para tu Negocio', subtitle: 'Automatiza lo aburrido.',
    category: { name: 'Negocios' }, level: 'basic', modality: 'presencial',
    date: '2025-08-06', time_start: '18:00', time_end: '21:00', duration: '4 sesiones · 12 hrs',
    price: '980.00', max_capacity: 24, registered_count: 19, available_spots: 5,
    location: 'Tijuana · Zona Río', instructor_label: 'Iván Saldaña', status: 'published',
    status_display: 'Quedan 5 lugares', accent: 'magenta',
    short_description: 'Para dueños de negocio que quieren responder más rápido y vender más.',
    description: 'Diseñamos juntos 3 automatizaciones para tu negocio.',
    benefits: ['3 automatizaciones funcionando', 'Auditoría personalizada', 'Sesión 1:1 de seguimiento'],
    curriculum: ['Diagnóstico', 'WhatsApp + IA', 'Cotizaciones automáticas', 'Panel de KPIs'],
    requirements: ['Negocio en operación', 'Laptop o iPad'],
    target_audience: 'Dueños de negocio, gerentes, equipos comerciales',
    images: [], main_image_url: null,
  },
  {
    id: 'prompt-engineering', code: 'AI-003', title: 'Prompt Engineering Pro', subtitle: 'Habla con la máquina.',
    category: { name: 'Fundamentos' }, level: 'intermediate', modality: 'online',
    date: '2025-08-12', time_start: '20:00', time_end: '22:00', duration: '6 sesiones · 12 hrs',
    price: '850.00', max_capacity: 40, registered_count: 22, available_spots: 18,
    location: 'Zoom', instructor_label: 'Iván Saldaña', status: 'published',
    status_display: 'Inscripciones abiertas', accent: 'cyan',
    short_description: 'Sistemas de prompts, contextos largos, y cómo no terminar peleando con ChatGPT.',
    description: 'Pasamos de platicar con ChatGPT a sistemas de prompts versionados.',
    benefits: ['Biblioteca de 80+ prompts probados', 'Plantillas de evaluación', 'Comunidad 3 meses'],
    curriculum: ['Anatomía de un prompt', 'Roles y restricciones', 'Cadenas y agentes', 'Evaluar prompts', 'Costos y modelos', 'Casos de uso'],
    requirements: ['Cuenta de ChatGPT o Claude', 'Curiosidad'],
    target_audience: 'Marketers, copys, devs, founders',
    images: [], main_image_url: null,
  },
  {
    id: 'fotografos-ia', code: 'AI-004', title: 'IA para Fotógrafos', subtitle: 'Edita en horas lo que antes en días.',
    category: { name: 'Creativo' }, level: 'basic', modality: 'hybrid',
    date: '2025-08-23', time_start: '10:00', time_end: '13:00', duration: '3 sesiones · 9 hrs',
    price: '1100.00', max_capacity: 14, registered_count: 8, available_spots: 6,
    location: 'Tijuana / Zoom', instructor_label: 'Estudio invitado', status: 'published',
    status_display: 'Inscripciones abiertas', accent: 'magenta',
    short_description: 'Lightroom + IA, retoque automático, y catálogos editados sin perder tu estilo.',
    description: 'Tu estilo es tuyo. La IA solo te quita el dolor de cuello.',
    benefits: ['Presets propios entrenados', 'Workflow 500 fotos en 2 hrs'],
    curriculum: ['Lightroom + IA', 'Retoque selectivo', 'Catálogos masivos'],
    requirements: ['Lightroom Classic', 'Catálogo propio'],
    target_audience: 'Fotógrafos profesionales y semi-pro',
    images: [], main_image_url: null,
  },
  {
    id: 'abogados-ia', code: 'AI-005', title: 'IA para Abogados', subtitle: 'Contratos en minutos.',
    category: { name: 'Profesional' }, level: 'basic', modality: 'online',
    date: '2025-09-01', time_start: '19:00', time_end: '21:00', duration: '5 sesiones · 10 hrs',
    price: '1450.00', max_capacity: 20, registered_count: 4, available_spots: 16,
    location: 'Zoom', instructor_label: 'Iván + invitada', status: 'published',
    status_display: 'Pre-venta', accent: 'cyan',
    short_description: 'De 4 horas redactando un contrato a 20 minutos revisando con IA.',
    description: 'Cómo usar IA respetando confidencialidad.',
    benefits: ['12 plantillas de contratos', 'Workflow seguro', 'Prompts revisados legalmente'],
    curriculum: ['Confidencialidad y modelos locales', 'Redacción de contratos', 'Jurisprudencia', 'Resumen de expedientes', 'Minutas'],
    requirements: ['Despacho o práctica en operación'],
    target_audience: 'Abogados, despachos pequeños y medianos',
    images: [], main_image_url: null,
  },
  {
    id: 'fundamentos-ia', code: 'AI-006', title: 'IA desde Cero', subtitle: 'Empieza hoy. Sin código.',
    category: { name: 'Fundamentos' }, level: 'basic', modality: 'presencial',
    date: '2025-09-13', time_start: '10:00', time_end: '14:00', duration: '1 sesión · 4 hrs',
    price: '450.00', max_capacity: 30, registered_count: 11, available_spots: 19,
    location: 'Tijuana · Zona Río', instructor_label: 'Iván Saldaña', status: 'published',
    status_display: 'Inscripciones abiertas', accent: 'magenta',
    short_description: 'El taller de bienvenida. Sales con 5 herramientas que vas a usar el lunes.',
    description: 'Hands-on intensivo. No es teoría.',
    benefits: ['5 herramientas configuradas', 'Descuento 20% en talleres futuros'],
    curriculum: ['Panorama 2026 de la IA', 'Herramientas indispensables', 'Primer prompt', 'Caso aplicado'],
    requirements: ['Ganas. Nada más.'],
    target_audience: 'Cualquier persona curiosa',
    images: [], main_image_url: null,
  },
];

const CASES_FALLBACK = [
  { id: 'c1', title: 'De 14 hrs a 40 min en cotizar', client_sector: 'Constructora · 18 personas', problem: 'El equipo comercial perdía 14 horas a la semana armando cotizaciones manualmente.', solution: 'Automatización con IA que toma el brief y genera cotización en Excel + PDF.', result: '+38% en cotizaciones enviadas el primer mes.', metric: '−95%', metric_label: 'tiempo de cotización' },
  { id: 'c2', title: 'WhatsApp que vende mientras duermes', client_sector: 'Restaurante · 2 sucursales', problem: 'Reservas y pedidos se perdían fuera de horario.', solution: 'Bot de WhatsApp con voz de marca, tomando reservas y mandando ticket al sistema.', result: '+22% en ticket promedio nocturno.', metric: '+22%', metric_label: 'ticket nocturno' },
  { id: 'c3', title: 'Catálogo de 4,000 fotos editado en una tarde', client_sector: 'Estudio fotográfico', problem: 'Edición masiva post-evento tomaba 3 semanas.', solution: 'Workflow Lightroom + IA con presets entrenados con su estilo.', result: 'Entrega al cliente en 48 hrs.', metric: '21×', metric_label: 'más rápido' },
  { id: 'c4', title: 'Despacho legal con minutas automáticas', client_sector: 'Despacho · 6 abogados', problem: '2 hrs por junta sólo en redactar minutas.', solution: 'Pipeline de transcripción + resumen + tareas con IA local.', result: 'Liberaron 1 día/semana por abogado.', metric: '−80%', metric_label: 'horas en minutas' },
];

// Normalize workshop from API response to match what React components expect
function normalizeWorkshop(w) {
  return {
    ...w,
    // Map API field names to legacy field names used in UI
    fecha: w.date ? new Date(w.date).toLocaleDateString('es-MX', { weekday: 'long' }) : '',
    fechaLarga: w.date ? new Date(w.date + 'T12:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    hora: w.time_start ? `${w.time_start.slice(0,5)} — ${(w.time_end || '').slice(0,5)}` : '',
    precio: parseFloat(w.price),
    cupo: w.max_capacity,
    cupoTomado: w.registered_count || 0,
    instructor: w.instructor_label || '',
    estado: w.status_display || 'Inscripciones abiertas',
    modalidad: w.modality === 'hybrid' ? 'Híbrido' : w.modality === 'presencial' ? 'Presencial' : 'Online',
    category: w.category?.name || w.category || '',
    level: w.level === 'basic' ? 'Básico' : w.level === 'intermediate' ? 'Intermedio' : 'Avanzado',
    lugar: w.location,
    descripcionCorta: w.short_description,
    descripcion: w.description || '',
    beneficios: w.benefits || [],
    temario: w.curriculum || [],
    requisitos: w.requirements || [],
    publico: w.target_audience || '',
    images: (w.images || []).map(img => img.image?.startsWith('http') ? img.image : `http://localhost:8000/media/${img.image}`),
    accent: w.accent || 'cyan',
  };
}

// Global state: workshops loaded from API or fallback
// Apply normalizeWorkshop to fallback so components always get legacy field names
let WORKSHOPS = WORKSHOPS_FALLBACK.map(normalizeWorkshop);
let CASES = [...CASES_FALLBACK];
let dataLoaded = false;

async function loadData() {
  if (dataLoaded) return;
  try {
    const [wsRes, casesRes] = await Promise.all([
      API.getWorkshops(),
      API.getCases(),
    ]);
    if (wsRes?.results?.length || wsRes?.length) {
      const arr = wsRes.results || wsRes;
      WORKSHOPS = arr.map(normalizeWorkshop);
      window.WORKSHOPS = WORKSHOPS;
    }
    if (casesRes?.results?.length || casesRes?.length) {
      const arr = casesRes.results || casesRes;
      CASES = arr;
      window.CASES = CASES;
    }
    dataLoaded = true;
  } catch (e) {
    console.warn('[Arkano-IA] API offline — usando datos de muestra.', e.message);
  }
}

const SERVICES = [
  { id: 'asesoria-ia', code: 'S-01', title: 'Asesoría IA', duracion: '60 min', precio: 1500, desc: 'Sesión 1:1 para entender qué herramientas usar y por dónde empezar.' },
  { id: 'diagnostico', code: 'S-02', title: 'Diagnóstico de negocio', duracion: '2 sesiones', precio: 4800, desc: 'Mapeamos tus procesos y te entregamos un plan de automatización con prioridades.' },
  { id: 'automatizacion', code: 'S-03', title: 'Automatización a medida', duracion: 'Proyecto', precio: null, desc: 'Diseñamos, construimos y ponemos a operar un flujo automatizado para tu negocio.' },
  { id: 'desarrollo', code: 'S-04', title: 'Desarrollo de software', duracion: 'Proyecto', precio: null, desc: 'Apps, APIs y plataformas web hechas con IA en el ciclo de desarrollo.' },
  { id: 'capacitacion', code: 'S-05', title: 'Capacitación empresarial', duracion: 'In-company', precio: null, desc: 'Talleres cerrados para tu equipo, adaptados a tu industria.' },
  { id: 'mentoria', code: 'S-06', title: 'Mentoría personalizada', duracion: 'Mensual', precio: 3200, desc: 'Acompañamiento mensual para founders y profesionales que están construyendo con IA.' },
];

window.API = API;
window.WORKSHOPS = WORKSHOPS;
window.CASES = CASES;
window.SERVICES = SERVICES;
window.loadData = loadData;
window.normalizeWorkshop = normalizeWorkshop;

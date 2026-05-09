"""
Run after migrations: python setup_initial_data.py
Creates superuser, default categories, instructors, sample workshops and cases.
"""
import os
import sys
import django
from datetime import date

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arkano_project.settings')
django.setup()

from django.contrib.auth.models import User
from workshops.models import Category, Instructor, Workshop
from cases.models import SuccessCase

# ---------- Admin user ----------
if not User.objects.filter(username='arkano').exists():
    User.objects.create_superuser('arkano', 'admin@arkano-ia.mx', 'ARKANO1-#=.A')
    print('✓ Superusuario creado: arkano / ARKANO1-#=.A')
else:
    print('· Superusuario ya existe.')

# ---------- Categories ----------
cats = [
    ('Desarrollo', 'desarrollo'),
    ('Negocios', 'negocios'),
    ('Fundamentos', 'fundamentos'),
    ('Creativo', 'creativo'),
    ('Profesional', 'profesional'),
]
for name, slug in cats:
    Category.objects.get_or_create(slug=slug, defaults={'name': name})
print('✓ Categorías creadas.')

# ---------- Instructor ----------
ivan, _ = Instructor.objects.get_or_create(
    name='Iván Saldaña',
    defaults={'bio': 'Fundador de Arkano-IA. Desarrollador y consultor en IA aplicada.'}
)
print('✓ Instructor creado.')

# ---------- Sample workshops ----------
ws_data = [
    {
        'code': 'AI-001', 'title': 'Programación con IA', 'subtitle': 'Code Like a Cyborg',
        'level': 'intermediate', 'modality': 'online', 'accent': 'cyan',
        'date': date(2025, 7, 19), 'time_start': '11:00', 'time_end': '13:00',
        'duration': '8 sesiones · 16 hrs', 'price': 1200, 'max_capacity': 18,
        'location': 'Tijuana / Zoom', 'status': 'published',
        'short_description': 'Programa 10× más rápido fusionando tu cerebro con Copilot, Cursor y modelos LLM.',
        'description': 'Un programa intensivo donde aprendes a delegar el código repetitivo a la IA.',
        'benefits': ['Stack actualizado: Cursor, Claude Code, Copilot', '4 proyectos terminados al cierre'],
        'curriculum': ['Mindset cyborg', 'Cursor & Copilot setup pro', 'Prompts de arquitectura'],
        'requirements': ['Lógica básica de programación', 'Laptop 8GB+'],
        'target_audience': 'Devs junior, freelancers y founders técnicos',
    },
    {
        'code': 'AI-002', 'title': 'IA para tu Negocio', 'subtitle': 'Automatiza lo aburrido.',
        'level': 'basic', 'modality': 'presencial', 'accent': 'magenta',
        'date': date(2025, 8, 6), 'time_start': '18:00', 'time_end': '21:00',
        'duration': '4 sesiones · 12 hrs', 'price': 980, 'max_capacity': 24,
        'location': 'Tijuana · Zona Río', 'status': 'published',
        'short_description': 'Para dueños de negocio que quieren responder más rápido y vender más.',
        'description': 'Diseñamos juntos 3 automatizaciones para tu negocio.',
        'benefits': ['3 automatizaciones funcionando', 'Auditoría personalizada'],
        'curriculum': ['Diagnóstico de automatización', 'WhatsApp + IA', 'Panel de KPIs'],
        'requirements': ['Negocio en operación', 'Laptop o iPad'],
        'target_audience': 'Dueños de negocio, gerentes, equipos comerciales',
    },
    {
        'code': 'AI-006', 'title': 'IA desde Cero', 'subtitle': 'Empieza hoy. Sin código.',
        'level': 'basic', 'modality': 'presencial', 'accent': 'magenta',
        'date': date(2025, 9, 13), 'time_start': '10:00', 'time_end': '14:00',
        'duration': '1 sesión · 4 hrs', 'price': 450, 'max_capacity': 30,
        'location': 'Tijuana · Zona Río', 'status': 'published',
        'short_description': 'El taller de bienvenida. Sales con 5 herramientas que vas a usar el lunes.',
        'description': 'Hands-on intensivo. No es teoría.',
        'benefits': ['5 herramientas configuradas', 'Descuento 20% en talleres futuros'],
        'curriculum': ['Panorama 2026 de la IA', 'Herramientas indispensables', 'Primer prompt útil'],
        'requirements': ['Ganas. Nada más.'],
        'target_audience': 'Cualquier persona curiosa',
    },
]

cat_map = {c.slug: c for c in Category.objects.all()}

for wd in ws_data:
    slug_map = {'Desarrollo': 'desarrollo', 'Negocios': 'negocios', 'Fundamentos': 'fundamentos', 'Creativo': 'creativo', 'Profesional': 'profesional'}
    cat = cat_map.get('fundamentos')
    if 'AI-001' in wd['code']:
        cat = cat_map.get('desarrollo')
    elif 'AI-002' in wd['code']:
        cat = cat_map.get('negocios')

    if not Workshop.objects.filter(code=wd['code']).exists():
        Workshop.objects.create(
            code=wd['code'], title=wd['title'], subtitle=wd['subtitle'],
            category=cat, level=wd['level'], modality=wd['modality'], accent=wd['accent'],
            date=wd['date'], time_start=wd['time_start'], time_end=wd['time_end'],
            duration=wd['duration'], price=wd['price'], max_capacity=wd['max_capacity'],
            location=wd['location'], status=wd['status'],
            instructor=ivan, instructor_name=ivan.name,
            short_description=wd['short_description'], description=wd['description'],
            benefits=wd['benefits'], curriculum=wd['curriculum'],
            requirements=wd['requirements'], target_audience=wd['target_audience'],
        )
print('✓ Talleres de muestra creados.')

# ---------- Sample success cases ----------
cases_data = [
    {
        'title': 'De 14 hrs a 40 min en cotizar',
        'client_sector': 'Constructora · 18 personas',
        'problem': 'El equipo comercial perdía 14 horas a la semana armando cotizaciones manualmente.',
        'solution': 'Automatización con IA que toma el brief y genera cotización en Excel + PDF.',
        'result': '+38% en cotizaciones enviadas el primer mes.',
        'category': 'automation', 'metric': '−95%', 'metric_label': 'tiempo de cotización',
        'published': True, 'order': 0,
    },
    {
        'title': 'WhatsApp que vende mientras duermes',
        'client_sector': 'Restaurante · 2 sucursales',
        'problem': 'Reservas y pedidos se perdían fuera de horario.',
        'solution': 'Bot de WhatsApp con voz de marca, tomando reservas y mandando ticket.',
        'result': '+22% en ticket promedio nocturno.',
        'category': 'automation', 'metric': '+22%', 'metric_label': 'ticket nocturno',
        'published': True, 'order': 1,
    },
    {
        'title': 'Catálogo de 4,000 fotos editado en una tarde',
        'client_sector': 'Estudio fotográfico',
        'problem': 'Edición masiva post-evento tomaba 3 semanas.',
        'solution': 'Workflow Lightroom + IA con presets entrenados con su estilo.',
        'result': 'Entrega al cliente en 48 hrs.',
        'category': 'photographers', 'metric': '21×', 'metric_label': 'más rápido',
        'published': True, 'order': 2,
    },
    {
        'title': 'Despacho legal con minutas automáticas',
        'client_sector': 'Despacho · 6 abogados',
        'problem': '2 hrs por junta sólo en redactar minutas.',
        'solution': 'Pipeline de transcripción + resumen + tareas con IA local.',
        'result': 'Liberaron 1 día/semana por abogado.',
        'category': 'lawyers', 'metric': '−80%', 'metric_label': 'horas en minutas',
        'published': True, 'order': 3,
    },
]

for cd in cases_data:
    if not SuccessCase.objects.filter(title=cd['title']).exists():
        SuccessCase.objects.create(**cd)
print('✓ Casos de éxito de muestra creados.')

print('\n✅ Setup completado.')
print('   URL API:   http://localhost:8000/api/')
print('   Admin:     http://localhost:8000/admin/')
print('   Usuario:   arkano')
print('   Password:  ARKANO1-#=.A')

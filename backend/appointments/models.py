from django.db import models


TYPE_CHOICES = [
    ('asesoria_ia', 'Asesoría IA'),
    ('diagnostico', 'Diagnóstico de negocio'),
    ('automatizacion', 'Automatización'),
    ('desarrollo', 'Desarrollo de software'),
    ('capacitacion', 'Capacitación empresarial'),
    ('mentoria', 'Mentoría personalizada'),
]

STATUS_CHOICES = [
    ('requested', 'Solicitada'),
    ('confirmed', 'Confirmada'),
    ('completed', 'Realizada'),
    ('cancelled', 'Cancelada'),
]

SOURCE_CHOICES = [
    ('web', 'Sitio web'),
    ('ig', 'Instagram'),
    ('fb', 'Facebook'),
    ('wa', 'WhatsApp'),
    ('ref', 'Referido'),
    ('evento', 'Evento'),
]


class Appointment(models.Model):
    nombre = models.CharField(max_length=200, verbose_name='Nombre')
    email = models.EmailField(verbose_name='Email')
    tel = models.CharField(max_length=30, verbose_name='Teléfono / WhatsApp')
    empresa = models.CharField(max_length=200, blank=True, verbose_name='Empresa / Proyecto')
    appointment_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='diagnostico', verbose_name='Tipo de cita')
    notas = models.TextField(blank=True, verbose_name='¿Qué quieres lograr?')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested', verbose_name='Estado')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='web', verbose_name='Origen')
    internal_notes = models.TextField(blank=True, verbose_name='Notas internas')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Cita'
        verbose_name_plural = 'Citas'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.nombre} · {self.get_appointment_type_display()} · {self.get_status_display()}'

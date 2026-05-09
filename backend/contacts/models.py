from django.db import models
from django.contrib.auth.models import User


STATUS_CHOICES = [
    ('new', 'Nuevo'),
    ('interested', 'Interesado'),
    ('contacted', 'Contactado'),
    ('registered', 'Registrado a taller'),
    ('client', 'Cliente'),
    ('recurring', 'Cliente recurrente'),
    ('potential_biz', 'Empresa potencial'),
    ('discarded', 'Descartado'),
]

SOURCE_CHOICES = [
    ('web', 'Sitio web'),
    ('ig', 'Instagram'),
    ('fb', 'Facebook'),
    ('wa', 'WhatsApp'),
    ('ref', 'Referido'),
    ('evento', 'Evento'),
]


class Contact(models.Model):
    nombre = models.CharField(max_length=200, verbose_name='Nombre')
    email = models.EmailField(blank=True, verbose_name='Email')
    tel = models.CharField(max_length=30, blank=True, verbose_name='Teléfono')
    empresa = models.CharField(max_length=200, blank=True, verbose_name='Empresa')
    interes = models.CharField(max_length=300, blank=True, verbose_name='Interés principal')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='web', verbose_name='Origen')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name='Estado')
    notas = models.TextField(blank=True, verbose_name='Notas comerciales')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Contacto'
        verbose_name_plural = 'Contactos'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.nombre} · {self.get_status_display()}'


class Interaction(models.Model):
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='interactions', verbose_name='Contacto')
    note = models.TextField(verbose_name='Nota')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Registrado por')

    class Meta:
        verbose_name = 'Interacción'
        verbose_name_plural = 'Interacciones'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.contact.nombre} · {self.created_at:%Y-%m-%d}'

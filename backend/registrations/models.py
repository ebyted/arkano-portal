import random
import string
import qrcode
import io
from django.db import models
from django.core.files.base import ContentFile


FUENTE_CHOICES = [
    ('web', 'Sitio web'),
    ('ig', 'Instagram'),
    ('fb', 'Facebook'),
    ('wa', 'WhatsApp'),
    ('ref', 'Referido'),
    ('evento', 'Evento'),
]


class Attendee(models.Model):
    nombre = models.CharField(max_length=200, verbose_name='Nombre completo')
    email = models.EmailField(unique=True, verbose_name='Email')
    tel = models.CharField(max_length=30, verbose_name='WhatsApp / Teléfono')
    ocupacion = models.CharField(max_length=200, blank=True, verbose_name='Ocupación')
    empresa = models.CharField(max_length=200, blank=True, verbose_name='Empresa')
    ciudad = models.CharField(max_length=100, blank=True, verbose_name='Ciudad')
    fuente = models.CharField(max_length=20, choices=FUENTE_CHOICES, default='web', verbose_name='¿Cómo nos conociste?')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Asistente'
        verbose_name_plural = 'Asistentes'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.nombre} <{self.email}>'


class Registration(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pendiente de pago'),
        (STATUS_CONFIRMED, 'Confirmado'),
        (STATUS_CANCELLED, 'Cancelado'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('paid', 'Pagado'),
        ('refunded', 'Reembolsado'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('transferencia', 'Transferencia SPEI'),
        ('tarjeta', 'Tarjeta crédito/débito'),
        ('oxxo', 'OXXO Pay'),
        ('paypal', 'PayPal'),
        ('efectivo', 'Efectivo'),
    ]

    attendee = models.ForeignKey(Attendee, on_delete=models.CASCADE, related_name='registrations', verbose_name='Asistente')
    workshop = models.ForeignKey('workshops.Workshop', on_delete=models.CASCADE, related_name='registrations', verbose_name='Taller')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, verbose_name='Estado de asistencia')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending', verbose_name='Estado de pago')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='transferencia', verbose_name='Método de pago')
    folio = models.CharField(max_length=30, unique=True, verbose_name='Folio')
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True, verbose_name='Código QR')
    notes = models.TextField(blank=True, verbose_name='Notas internas')
    attended = models.BooleanField(default=False, verbose_name='Asistió')
    check_in_at = models.DateTimeField(null=True, blank=True, verbose_name='Hora de check-in')
    registered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Inscripción'
        verbose_name_plural = 'Inscripciones'
        ordering = ['-registered_at']
        unique_together = [('attendee', 'workshop')]

    def __str__(self):
        return f'{self.folio} · {self.attendee.nombre} → {self.workshop.code}'

    @staticmethod
    def generate_folio(workshop_code):
        suffix = ''.join(random.choices(string.digits, k=4))
        return f'ARK-{workshop_code}-{suffix}'

    def generate_qr(self):
        data = f'ARKANO|{self.folio}|{self.attendee.email}|{self.workshop.code}'
        img = qrcode.make(data)
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        buf.seek(0)
        fname = f'qr_{self.folio}.png'
        self.qr_code.save(fname, ContentFile(buf.read()), save=False)

    def save(self, *args, **kwargs):
        if not self.folio:
            self.folio = self.generate_folio(self.workshop.code)
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.qr_code:
            self.generate_qr()
            Registration.objects.filter(pk=self.pk).update(qr_code=self.qr_code.name)

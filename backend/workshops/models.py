from django.db import models
from django.core.validators import MaxValueValidator


class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name='Nombre')
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        ordering = ['name']

    def __str__(self):
        return self.name


class Instructor(models.Model):
    name = models.CharField(max_length=200, verbose_name='Nombre')
    bio = models.TextField(blank=True, verbose_name='Biografía')
    photo = models.ImageField(upload_to='instructors/', blank=True, null=True, verbose_name='Foto')

    class Meta:
        verbose_name = 'Instructor'
        verbose_name_plural = 'Instructores'
        ordering = ['name']

    def __str__(self):
        return self.name


class Workshop(models.Model):
    STATUS_DRAFT = 'draft'
    STATUS_PUBLISHED = 'published'
    STATUS_CLOSED = 'closed'
    STATUS_FINISHED = 'finished'
    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Borrador'),
        (STATUS_PUBLISHED, 'Publicado'),
        (STATUS_CLOSED, 'Cerrado'),
        (STATUS_FINISHED, 'Finalizado'),
    ]

    LEVEL_CHOICES = [
        ('basic', 'Básico'),
        ('intermediate', 'Intermedio'),
        ('advanced', 'Avanzado'),
    ]

    MODALITY_CHOICES = [
        ('presencial', 'Presencial'),
        ('online', 'Online'),
        ('hybrid', 'Híbrido'),
    ]

    ACCENT_CHOICES = [
        ('cyan', 'Cyan'),
        ('magenta', 'Magenta'),
        ('violet', 'Violet'),
    ]

    code = models.CharField(max_length=20, unique=True, verbose_name='Código')
    title = models.CharField(max_length=200, verbose_name='Título')
    subtitle = models.CharField(max_length=300, blank=True, verbose_name='Subtítulo')
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name='Categoría', related_name='workshops'
    )
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='basic', verbose_name='Nivel')
    modality = models.CharField(max_length=20, choices=MODALITY_CHOICES, default='online', verbose_name='Modalidad')

    date = models.DateField(verbose_name='Fecha de inicio')
    time_start = models.TimeField(verbose_name='Hora de inicio')
    time_end = models.TimeField(verbose_name='Hora de fin')
    duration = models.CharField(max_length=100, verbose_name='Duración')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio (MXN)')
    max_capacity = models.PositiveIntegerField(verbose_name='Cupo máximo')
    location = models.CharField(max_length=300, verbose_name='Lugar')

    instructor = models.ForeignKey(
        Instructor, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name='Instructor', related_name='workshops'
    )
    instructor_name = models.CharField(max_length=200, blank=True, verbose_name='Nombre instructor (texto libre)')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT, verbose_name='Estado')
    accent = models.CharField(max_length=20, choices=ACCENT_CHOICES, default='cyan', verbose_name='Color acento')

    short_description = models.CharField(max_length=500, verbose_name='Descripción corta')
    description = models.TextField(verbose_name='Descripción completa')

    benefits = models.JSONField(default=list, verbose_name='Beneficios')
    curriculum = models.JSONField(default=list, verbose_name='Temario')
    requirements = models.JSONField(default=list, verbose_name='Requisitos')
    target_audience = models.CharField(max_length=300, blank=True, verbose_name='Público objetivo')
    promo_video_url = models.URLField(blank=True, verbose_name='Video promocional URL')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Taller'
        verbose_name_plural = 'Talleres'
        ordering = ['date']

    def __str__(self):
        return f'{self.code} — {self.title}'

    @property
    def registered_count(self):
        return self.registrations.filter(payment_status__in=['confirmed', 'pending']).count()

    @property
    def available_spots(self):
        return max(0, self.max_capacity - self.registered_count)

    @property
    def status_display(self):
        if self.available_spots == 0:
            return 'Cupo lleno'
        if self.available_spots <= 5:
            return f'Quedan {self.available_spots} lugares'
        return 'Inscripciones abiertas'

    @property
    def main_image_url(self):
        img = self.images.filter(is_main=True).first() or self.images.first()
        return img.image.url if img else None


class WorkshopImage(models.Model):
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='workshops/', verbose_name='Imagen')
    alt_text = models.CharField(max_length=200, blank=True, verbose_name='Texto alternativo')
    order = models.PositiveSmallIntegerField(
        default=0, validators=[MaxValueValidator(4)],
        verbose_name='Orden (0-4)'
    )
    is_main = models.BooleanField(default=False, verbose_name='Imagen principal')

    class Meta:
        verbose_name = 'Imagen de taller'
        verbose_name_plural = 'Imágenes de taller'
        ordering = ['order']

    def __str__(self):
        return f'{self.workshop.code} · Imagen {self.order + 1}'

    def save(self, *args, **kwargs):
        if self.is_main:
            WorkshopImage.objects.filter(workshop=self.workshop, is_main=True).exclude(pk=self.pk).update(is_main=False)
        total = WorkshopImage.objects.filter(workshop=self.workshop).exclude(pk=self.pk).count()
        if total >= 5:
            raise ValueError('Un taller puede tener máximo 5 imágenes.')
        super().save(*args, **kwargs)

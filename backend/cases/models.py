from django.db import models


CATEGORY_CHOICES = [
    ('small_biz', 'Negocios pequeños'),
    ('photographers', 'Fotógrafos'),
    ('lawyers', 'Abogados'),
    ('restaurants', 'Restaurantes'),
    ('software', 'Software'),
    ('automation', 'Automatización'),
    ('sales', 'Ventas'),
    ('productivity', 'Productividad'),
]

IMAGE_TYPE_CHOICES = [
    ('before', 'Antes'),
    ('after', 'Después'),
    ('general', 'General'),
]


class SuccessCase(models.Model):
    title = models.CharField(max_length=200, verbose_name='Título')
    client_sector = models.CharField(max_length=200, verbose_name='Cliente / Sector')
    problem = models.TextField(verbose_name='Problema inicial')
    solution = models.TextField(verbose_name='Solución aplicada')
    result = models.TextField(verbose_name='Resultado obtenido')
    testimonial = models.TextField(blank=True, verbose_name='Testimonio')
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, verbose_name='Categoría')
    metric = models.CharField(max_length=50, blank=True, verbose_name='Métrica principal (ej: −95%)')
    metric_label = models.CharField(max_length=100, blank=True, verbose_name='Etiqueta de métrica')
    video_url = models.URLField(blank=True, verbose_name='Video URL')
    published = models.BooleanField(default=False, verbose_name='Publicado')
    order = models.PositiveSmallIntegerField(default=0, verbose_name='Orden de visualización')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Caso de éxito'
        verbose_name_plural = 'Casos de éxito'
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title


class SuccessCaseImage(models.Model):
    case = models.ForeignKey(SuccessCase, on_delete=models.CASCADE, related_name='images', verbose_name='Caso')
    image = models.ImageField(upload_to='cases/', verbose_name='Imagen')
    image_type = models.CharField(max_length=10, choices=IMAGE_TYPE_CHOICES, default='general', verbose_name='Tipo')
    order = models.PositiveSmallIntegerField(default=0, verbose_name='Orden')

    class Meta:
        verbose_name = 'Imagen de caso'
        verbose_name_plural = 'Imágenes de caso'
        ordering = ['order']

    def __str__(self):
        return f'{self.case.title} · {self.get_image_type_display()}'

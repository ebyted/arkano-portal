from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Instructor, Workshop, WorkshopImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


class WorkshopImageInline(admin.TabularInline):
    model = WorkshopImage
    extra = 0
    max_num = 5
    fields = ['image', 'alt_text', 'order', 'is_main', 'preview']
    readonly_fields = ['preview']

    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" height="60" style="border-radius:6px"/>', obj.image.url)
        return '—'
    preview.short_description = 'Vista previa'


@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ['code', 'title', 'category', 'level', 'modality', 'date', 'price',
                    'registered_count', 'available_spots', 'status']
    list_filter = ['status', 'level', 'modality', 'category']
    search_fields = ['code', 'title', 'subtitle']
    list_editable = ['status']
    date_hierarchy = 'date'
    inlines = [WorkshopImageInline]
    readonly_fields = ['registered_count', 'available_spots', 'created_at', 'updated_at']

    fieldsets = (
        ('Identificación', {
            'fields': ('code', 'title', 'subtitle', 'category', 'accent', 'status')
        }),
        ('Detalles', {
            'fields': ('level', 'modality', 'date', 'time_start', 'time_end', 'duration',
                       'price', 'max_capacity', 'location', 'instructor', 'instructor_name')
        }),
        ('Contenido', {
            'fields': ('short_description', 'description', 'benefits', 'curriculum',
                       'requirements', 'target_audience', 'promo_video_url')
        }),
        ('Estadísticas', {
            'fields': ('registered_count', 'available_spots', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def registered_count(self, obj):
        return obj.registered_count
    registered_count.short_description = 'Inscritos'

    def available_spots(self, obj):
        spots = obj.available_spots
        color = 'red' if spots == 0 else 'orange' if spots <= 5 else 'green'
        return format_html('<span style="color:{}">{}</span>', color, spots)
    available_spots.short_description = 'Disponibles'

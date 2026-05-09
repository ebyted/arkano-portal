from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'email', 'tel', 'appointment_type', 'status', 'source', 'created_at']
    list_filter = ['status', 'appointment_type', 'source']
    search_fields = ['nombre', 'email', 'empresa']
    list_editable = ['status']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Contacto', {'fields': ('nombre', 'email', 'tel', 'empresa')}),
        ('Cita', {'fields': ('appointment_type', 'notas', 'status', 'source')}),
        ('Notas internas', {'fields': ('internal_notes',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

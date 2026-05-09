from django.contrib import admin
from django.utils.html import format_html
from .models import Attendee, Registration


@admin.register(Attendee)
class AttendeeAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'email', 'tel', 'empresa', 'fuente', 'created_at']
    list_filter = ['fuente', 'created_at']
    search_fields = ['nombre', 'email', 'tel', 'empresa']
    readonly_fields = ['created_at']


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ['folio', 'attendee_nombre', 'workshop', 'status',
                    'payment_status', 'payment_method', 'attended', 'registered_at']
    list_filter = ['workshop', 'status', 'payment_status', 'attended', 'payment_method']
    search_fields = ['folio', 'attendee__nombre', 'attendee__email']
    readonly_fields = ['folio', 'qr_preview', 'registered_at', 'updated_at']
    list_editable = ['payment_status', 'attended']
    date_hierarchy = 'registered_at'

    fieldsets = (
        ('Inscripción', {'fields': ('folio', 'attendee', 'workshop', 'status')}),
        ('Pago', {'fields': ('payment_status', 'payment_method')}),
        ('Asistencia', {'fields': ('attended', 'check_in_at')}),
        ('QR', {'fields': ('qr_code', 'qr_preview')}),
        ('Notas', {'fields': ('notes',)}),
        ('Timestamps', {'fields': ('registered_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    def attendee_nombre(self, obj):
        return obj.attendee.nombre
    attendee_nombre.short_description = 'Asistente'

    def qr_preview(self, obj):
        if obj.qr_code:
            return format_html('<img src="{}" height="120"/>', obj.qr_code.url)
        return '—'
    qr_preview.short_description = 'QR'

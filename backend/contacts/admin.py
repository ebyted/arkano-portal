from django.contrib import admin
from .models import Contact, Interaction


class InteractionInline(admin.TabularInline):
    model = Interaction
    extra = 1
    readonly_fields = ['created_at', 'created_by']
    fields = ['note', 'created_at', 'created_by']


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'email', 'tel', 'empresa', 'status', 'source', 'created_at']
    list_filter = ['status', 'source']
    search_fields = ['nombre', 'email', 'tel', 'empresa']
    list_editable = ['status']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [InteractionInline]
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Datos', {'fields': ('nombre', 'email', 'tel', 'empresa')}),
        ('CRM', {'fields': ('interes', 'source', 'status', 'notas')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for obj in instances:
            if isinstance(obj, Interaction) and not obj.pk:
                obj.created_by = request.user
            obj.save()
        formset.save_m2m()

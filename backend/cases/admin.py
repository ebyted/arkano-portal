from django.contrib import admin
from django.utils.html import format_html
from .models import SuccessCase, SuccessCaseImage


class SuccessCaseImageInline(admin.TabularInline):
    model = SuccessCaseImage
    extra = 0
    fields = ['image', 'image_type', 'order', 'preview']
    readonly_fields = ['preview']

    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" height="60" style="border-radius:6px"/>', obj.image.url)
        return '—'
    preview.short_description = 'Vista previa'


@admin.register(SuccessCase)
class SuccessCaseAdmin(admin.ModelAdmin):
    list_display = ['title', 'client_sector', 'category', 'metric', 'published', 'order']
    list_filter = ['category', 'published']
    search_fields = ['title', 'client_sector']
    list_editable = ['published', 'order']
    inlines = [SuccessCaseImageInline]
    readonly_fields = ['created_at']

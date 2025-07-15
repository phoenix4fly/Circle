from django.contrib import admin
from .models import Media


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'media_type',
        'uploaded_by',
        'is_active',
        'created_at'
    )
    list_filter = (
        'media_type',
        'is_active',
        'created_at'
    )
    search_fields = (
        'uploaded_by__username',
        'description'
    )
    autocomplete_fields = ['uploaded_by']
    readonly_fields = ('created_at',)

    fieldsets = (
        (None, {
            'fields': ('file', 'media_type', 'description', 'uploaded_by')
        }),
        ('Статус', {
            'fields': ('is_active', 'created_at')
        }),
    )
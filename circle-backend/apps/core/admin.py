# apps/core/admin.py

from django.contrib import admin
from .models import SystemConfig, SystemLogEntry


@admin.register(SystemConfig)
class SystemConfigAdmin(admin.ModelAdmin):
    list_display = ('key', 'value_preview', 'is_active', 'updated_at')
    list_filter = ('is_active', 'updated_at')
    search_fields = ('key', 'value', 'description')
    readonly_fields = ('updated_at',)
    ordering = ['key']
    
    fieldsets = (
        (None, {
            'fields': ('key', 'value', 'is_active')
        }),
        ('Documentation', {
            'fields': ('description',)
        }),
        ('Meta', {
            'fields': ('updated_at',)
        }),
    )
    
    def value_preview(self, obj):
        if len(obj.value) > 50:
            return obj.value[:50] + '...'
        return obj.value
    value_preview.short_description = 'Value'


@admin.register(SystemLogEntry)
class SystemLogEntryAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'level', 'source', 'message_short', 'user')
    list_filter = ('level', 'source', 'user')
    search_fields = ('message', 'source', 'user__username')
    ordering = ('-timestamp',)
    readonly_fields = ('timestamp',)

    def message_short(self, obj):
        return (obj.message[:75] + '...') if len(obj.message) > 75 else obj.message

    message_short.short_description = "Message"
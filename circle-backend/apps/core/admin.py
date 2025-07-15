# apps/core/admin.py

from django.contrib import admin
from .models import SystemConfig, SystemLogEntry


@admin.register(SystemConfig)
class SystemConfigAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'description', 'is_active', 'updated_at')
    search_fields = ('key', 'value', 'description')
    list_filter = ('is_active',)
    ordering = ('key',)
    readonly_fields = ('updated_at',)

    fieldsets = (
        (None, {
            'fields': ('key', 'value', 'description', 'is_active')
        }),
        ('Системные поля', {
            'fields': ('updated_at',)
        }),
    )


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
from django.contrib import admin
from .models import TravelAgency


@admin.register(TravelAgency)
class TravelAgencyAdmin(admin.ModelAdmin):
    list_display = (
        'name', 
        'is_active', 
        'commission_percent', 
        'contact_person', 
        'phone_number', 
        'email'
    )
    list_filter = ('is_active',)
    search_fields = ('name', 'contact_person', 'phone_number', 'email')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('name',)

    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'is_active')
        }),
        ("Контактная информация", {
            'fields': (
                'contact_person',
                'phone_number',
                'email',
                'address',
                'logo'
            )
        }),
        ("Финансовые настройки", {
            'fields': (
                'commission_percent',
                'payme_merchant_id'
            )
        }),
        ("Системные поля", {
            'fields': (
                'created_at',
                'updated_at'
            )
        }),
    )
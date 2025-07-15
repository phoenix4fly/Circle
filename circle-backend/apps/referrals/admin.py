from django.contrib import admin
from .models import ReferralPartner, ReferralBonus, WithdrawalRequest


@admin.register(ReferralPartner)
class ReferralPartnerAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'user', 
        'code', 
        'commission_percentage', 
        'total_earned', 
        'total_withdrawn', 
        'is_active'
    )
    search_fields = (
        'user__username', 
        'user__first_name', 
        'user__last_name', 
        'code'
    )
    list_filter = (
        'is_active',
    )
    readonly_fields = (
        'created_at',
        'updated_at',
        'total_earned',
        'total_withdrawn'
    )
    ordering = ['-created_at']
    autocomplete_fields = ['user']

    fieldsets = (
        (None, {
            'fields': (
                'user', 
                'code', 
                'commission_percentage', 
                'is_active'
            )
        }),
        ("Финансы", {
            'fields': (
                'total_earned',
                'total_withdrawn',
            )
        }),
        ("Системные", {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )


@admin.register(ReferralBonus)
class ReferralBonusAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'partner', 
        'amount', 
        'status', 
        'available_at', 
        'created_at'
    )
    list_filter = (
        'status',
        'available_at',
        'partner__user',
    )
    search_fields = (
        'partner__user__username', 
        'partner__user__first_name', 
        'partner__user__last_name'
    )
    autocomplete_fields = ['partner', 'booking']
    readonly_fields = (
        'created_at',
    )
    ordering = ['-created_at']

    fieldsets = (
        (None, {
            'fields': (
                'partner', 
                'booking', 
                'amount', 
                'status', 
                'available_at'
            )
        }),
        ("Системные", {
            'fields': (
                'created_at',
            )
        }),
    )


@admin.register(WithdrawalRequest)
class WithdrawalRequestAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'partner', 
        'amount', 
        'card_number', 
        'status', 
        'created_at', 
        'approved_at', 
        'paid_at'
    )
    list_filter = (
        'status',
        'created_at',
        'approved_at',
        'paid_at',
    )
    search_fields = (
        'partner__user__username', 
        'partner__user__first_name', 
        'partner__user__last_name',
        'card_number'
    )
    autocomplete_fields = ['partner']
    readonly_fields = (
        'created_at',
        'approved_at',
        'paid_at'
    )
    ordering = ['-created_at']

    fieldsets = (
        (None, {
            'fields': (
                'partner', 
                'amount', 
                'card_number', 
                'status'
            )
        }),
        ("Админ", {
            'fields': (
                'admin_comment',
            )
        }),
        ("Системные", {
            'fields': (
                'created_at', 
                'approved_at', 
                'paid_at'
            )
        }),
    )
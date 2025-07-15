from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Админка для пользователей
    """
    list_display = (
        'username',
        'first_name', 
        'last_name',
        'telegram_id',
        'phone_number',
        'gender',
        'is_staff',
        'is_active',
        'date_joined'
    )
    
    list_filter = (
        'is_staff',
        'is_active',
        'gender',
        'date_joined'
    )
    
    search_fields = (
        'username',
        'first_name',
        'last_name',
        'telegram_id',
        'phone_number'
    )
    
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Telegram & Personal Info', {
            'fields': ('telegram_id', 'phone_number', 'gender', 'bio', 'interests', 'avatar')
        }),
        ('Referral System', {
            'fields': ('referral_code', 'referred_by')
        }),
        ('Connections', {
            'fields': ('connections',)
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Sphere, Specialization


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
        'sphere',
        'specialization',
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
    
    actions = ['activate_users', 'deactivate_users']
    
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} users activated.')
    activate_users.short_description = "Activate selected users"
    
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} users deactivated.')
    deactivate_users.short_description = "Deactivate selected users"


class SpecializationInline(admin.TabularInline):
    model = Specialization
    extra = 1
    fields = ['name', 'description', 'is_active']
    verbose_name = "Specialization"
    verbose_name_plural = "Specializations"


@admin.register(Sphere)
class SphereAdmin(admin.ModelAdmin):
    list_display = ('name', 'specializations_count', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    ordering = ['name']
    inlines = [SpecializationInline]
    
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'is_active')
        }),
    )
    
    def specializations_count(self, obj):
        return obj.specializations.count()
    specializations_count.short_description = 'Specializations'


@admin.register(Specialization)
class SpecializationAdmin(admin.ModelAdmin):
    list_display = ('name', 'sphere', 'is_active')
    list_filter = ('is_active', 'sphere')
    search_fields = ('name', 'description', 'sphere__name')
    autocomplete_fields = ['sphere']
    ordering = ['sphere', 'name']
    
    fieldsets = (
        (None, {
            'fields': ('sphere', 'name', 'description', 'is_active')
        }),
    )

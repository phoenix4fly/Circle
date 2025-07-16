from django.contrib import admin
from .models import Community, CommunityMembership, CommunityChat, CommunityPopularTour


class CommunityMembershipInline(admin.TabularInline):
    model = CommunityMembership
    extra = 1
    autocomplete_fields = ['user']
    fields = ['user', 'role', 'joined_at']
    readonly_fields = ['joined_at']
    verbose_name = "Member"
    verbose_name_plural = "Members"


class CommunityPopularTourInline(admin.TabularInline):
    model = CommunityPopularTour
    extra = 1
    autocomplete_fields = ['tour']
    fields = ['tour', 'rank']
    verbose_name = "Popular Tour"
    verbose_name_plural = "Popular Tours"
    ordering = ['rank']


@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ('name', 'sphere', 'specialization', 'members_count', 'is_active', 'created_at')
    list_filter = ('is_active', 'sphere', 'specialization', 'created_at')
    search_fields = ('name', 'description')
    autocomplete_fields = ['sphere', 'specialization']
    readonly_fields = ('created_at', 'updated_at')
    inlines = [CommunityMembershipInline, CommunityPopularTourInline]
    
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'is_active')
        }),
        ('Targeting', {
            'fields': ('sphere', 'specialization')
        }),
        ('Media', {
            'fields': ('avatar',)
        }),
        ('Meta', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def members_count(self, obj):
        return obj.members.count()
    members_count.short_description = 'Members'


@admin.register(CommunityMembership)
class CommunityMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'community', 'role', 'joined_at')
    list_filter = ('role', 'community', 'joined_at')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'community__name')
    autocomplete_fields = ['user', 'community']
    readonly_fields = ('joined_at',)
    ordering = ['-joined_at']


@admin.register(CommunityChat)
class CommunityChatAdmin(admin.ModelAdmin):
    list_display = ('name', 'community')
    search_fields = ('name', 'description', 'community__name')
    autocomplete_fields = ['community']


@admin.register(CommunityPopularTour)
class CommunityPopularTourAdmin(admin.ModelAdmin):
    list_display = ('community', 'tour', 'rank')
    list_filter = ('community', 'rank')
    search_fields = ('community__name', 'tour__title')
    autocomplete_fields = ['community', 'tour']
    ordering = ['community', 'rank']

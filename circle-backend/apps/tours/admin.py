from django.contrib import admin
from .models import (
    TourCategory,
    Tour,
    TourSchedule,
    TourParameterDefinition,
    TourParameterValue,
    TourChat,
    TourSession
)
from .models import Promotion, PromoCode



@admin.register(TourCategory)
class TourCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active")
    search_fields = ("name",)
    list_filter = ("is_active",)
    ordering = ("name",)


class TourParameterValueInline(admin.TabularInline):
    model = TourParameterValue
    extra = 1
    autocomplete_fields = ['parameter_definition']
    fields = ['parameter_definition', 'value']
    verbose_name = "Parameter Value"
    verbose_name_plural = "Parameter Values"


class TourScheduleInline(admin.StackedInline):
    model = TourSchedule
    extra = 1
    fields = ['day_number', 'title', 'description', 'image']
    verbose_name = "Program Day"
    verbose_name_plural = "Program Schedule"


class TourSessionInline(admin.TabularInline):
    model = TourSession
    extra = 1
    fields = [
        'date_start', 'date_end', 'capacity',
        'available_seats', 'price_override', 'is_active'
    ]
    readonly_fields = ['available_seats']
    verbose_name = "Tour Date"
    verbose_name_plural = "Available Dates"
    ordering = ['date_start']


@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ("title", "agency", "type", "price_from", "sessions_count", "is_active")
    list_filter = ("is_active", "type", "agency", "created_at", "season_start")
    search_fields = ("title", "description", "agency__name")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ['agency', 'type', 'participants']
    inlines = [TourSessionInline, TourParameterValueInline, TourScheduleInline]
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'agency', 'type', 'description')
        }),
        ('Pricing & Details', {
            'fields': (
                'price_from', 'base_price',
                'transport_options', 'season_start', 'season_end'
            )
        }),
        ('Images', {
            'fields': ('main_image', 'gallery')
        }),
        ('Meta', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )
    
    actions = ['activate_tours', 'deactivate_tours']
    
    def sessions_count(self, obj):
        return obj.sessions.count()
    sessions_count.short_description = 'Sessions'
    
    def activate_tours(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} tours activated.')
    activate_tours.short_description = "Activate selected tours"
    
    def deactivate_tours(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} tours deactivated.')
    deactivate_tours.short_description = "Deactivate selected tours"


@admin.register(TourSession)
class TourSessionAdmin(admin.ModelAdmin):
    list_display = (
        "tour", "date_start", "date_end",
        "capacity", "available_seats", "price_override", "is_active"
    )
    list_filter = ("is_active", "tour")
    search_fields = ("tour__title",)
    autocomplete_fields = ['tour']
    ordering = ['date_start']


@admin.register(TourSchedule)
class TourScheduleAdmin(admin.ModelAdmin):
    list_display = ("tour", "day_number", "title")
    list_filter = ("tour",)
    search_fields = ("tour__title", "title")
    ordering = ("tour", "day_number")
    autocomplete_fields = ['tour']


@admin.register(TourParameterDefinition)
class TourParameterDefinitionAdmin(admin.ModelAdmin):
    list_display = ("name", "tour_type", "data_type", "required")
    list_filter = ("tour_type", "data_type", "required")
    search_fields = ("name",)
    ordering = ("tour_type", "name")
    autocomplete_fields = ['tour_type']


@admin.register(TourParameterValue)
class TourParameterValueAdmin(admin.ModelAdmin):
    list_display = ("tour", "parameter_definition", "value")
    list_filter = ("parameter_definition__tour_type",)
    search_fields = ("tour__title", "parameter_definition__name", "value")
    autocomplete_fields = ['tour', 'parameter_definition']


@admin.register(TourChat)
class TourChatAdmin(admin.ModelAdmin):
    list_display = ("tour", "name", "is_restricted")
    search_fields = ("tour__title", "name")
    autocomplete_fields = ['tour']







@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ('name', 'session', 'discount_percent', 'discount_amount', 'valid_from', 'valid_until', 'is_active')
    list_filter = ('is_active', 'valid_from', 'valid_until', 'session__tour__agency')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'session', 'is_active')
        }),
        ('Discount', {
            'fields': ('discount_percent', 'discount_amount')
        }),
        ('Validity', {
            'fields': ('valid_from', 'valid_until')
        }),
        ('Meta', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'session', 'discount_percent', 'discount_amount', 'usage_limit', 'used_count', 'valid_from', 'valid_until', 'is_active')
    list_filter = ('is_active', 'valid_from', 'valid_until', 'session__tour__agency')
    search_fields = ('code', 'description')
    readonly_fields = ('created_at', 'updated_at', 'used_count')

    fieldsets = (
        (None, {
            'fields': ('code', 'description', 'session', 'is_active')
        }),
        ('Discount', {
            'fields': ('discount_percent', 'discount_amount')
        }),
        ('Usage', {
            'fields': ('usage_limit', 'used_count')
        }),
        ('Validity', {
            'fields': ('valid_from', 'valid_until')
        }),
        ('Meta', {
            'fields': ('created_at', 'updated_at')
        }),
    )
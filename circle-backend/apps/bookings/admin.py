from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """
    Админка для бронирований:
    - Удобный просмотр всех деталей заявки
    - Фильтры по турагентствам, датам, статусу
    - Только чтение для большинства полей
    """

    list_display = (
        "id",
        "user",
        "session",
        "status",
        "seats_reserved",
        "final_price_paid",
        "promo_code",
        "approved_by",
        "approved_at",
        "expires_at",
        "created_at"
    )

    list_filter = (
        "status",
        "approved_by",
        "session__tour__agency",
        "session__tour",
        "session__date_start"
    )

    search_fields = (
        "user__username",
        "user__first_name",
        "user__last_name",
        "session__tour__title",
        "session__date_start",
        "promo_code"
    )

    autocomplete_fields = [
        'user',
        'session',
        'approved_by'
    ]

    readonly_fields = (
        'created_at',
        'approved_at',
        'expires_at',
        'base_price',
        'discount_amount',
        'final_price_paid'
    )

    ordering = ['-created_at']
    
    actions = ['approve_bookings', 'cancel_bookings', 'mark_as_paid']

    fieldsets = (
        ("📌 Пользователь", {
            'fields': ('user',)
        }),
        ("📌 Тур и Дата", {
            'fields': ('session',)
        }),
        ("📌 Детали бронирования", {
            'fields': (
                'seats_reserved',
                'selected_transport',
                'selected_accommodation',
                'promo_code',
                'base_price',
                'discount_amount',
                'bonus_used_amount',
                'final_price_paid',
                'comment',
            )
        }),
        ("📌 Статус заявки", {
            'fields': (
                'status',
                'approved_by',
                'approved_at',
                'expires_at',
                'cancel_reason'
            )
        }),
        ("📌 Системные поля", {
            'fields': ('created_at',)
        }),
    )

    def get_queryset(self, request):
        """
        Ограничиваем видимость для менеджеров агентств
        """
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if request.user.is_staff and request.user.agency:
            return qs.filter(session__tour__agency=request.user.agency)
        return qs.none()
    
    def approve_bookings(self, request, queryset):
        from django.utils import timezone
        updated = queryset.filter(status='requested').update(
            status='approved', 
            approved_by=request.user,
            approved_at=timezone.now()
        )
        self.message_user(request, f'{updated} bookings approved.')
    approve_bookings.short_description = "Approve selected bookings"
    
    def cancel_bookings(self, request, queryset):
        updated = queryset.exclude(status__in=['paid', 'cancelled']).update(
            status='cancelled',
            cancel_reason='Cancelled by admin'
        )
        self.message_user(request, f'{updated} bookings cancelled.')
    cancel_bookings.short_description = "Cancel selected bookings"
    
    def mark_as_paid(self, request, queryset):
        updated = queryset.filter(status='approved').update(status='paid')
        self.message_user(request, f'{updated} bookings marked as paid.')
    mark_as_paid.short_description = "Mark selected bookings as paid"
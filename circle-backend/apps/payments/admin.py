from django.contrib import admin
from .models import PaymentTransaction, AccountingTransaction


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    """
    Админка для платежных транзакций:
    - Circle admin видит все платежи со всеми полями
    - Менеджер турагентства видит только свои платежи
    """

    ordering = ('-created_at',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if request.user.is_staff and request.user.agency:
            return qs.filter(agency=request.user.agency)
        return qs.none()

    def get_list_display(self, request):
        if request.user.is_superuser:
            return (
                'id',
                'status',
                'amount',
                'commission_amount',
                'agency',
                'user',
                'booking',
                'payme_transaction_id',
                'created_at'
            )
        return (
            'id',
            'status',
            'amount',
            'user',
            'booking',
            'created_at'
        )

    def get_readonly_fields(self, request, obj=None):
        fields = [
            'user',
            'agency',
            'booking',
            'amount',
            'currency',
            'status',
            'commission_amount',
            'payme_transaction_id',
            'payme_receipt_id',
            'payme_merchant_id',
            'notes',
            'created_at',
            'updated_at'
        ]
        if request.user.is_superuser:
            return fields
        # Менеджерам агентств скрываем комиссию и Payme-детали
        return [f for f in fields if f not in (
            'commission_amount',
            'payme_transaction_id',
            'payme_receipt_id',
            'payme_merchant_id'
        )]

    def get_list_filter(self, request):
        if request.user.is_superuser:
            return ('status', 'agency', 'created_at')
        return ('status', 'created_at')

    def get_search_fields(self, request):
        if request.user.is_superuser:
            return ('payme_transaction_id', 'payme_receipt_id', 'user__username', 'agency__name')
        return ('user__username',)

    fieldsets = (
        (None, {
            'fields': (
                'status',
                'amount',
                'commission_amount',
                'currency'
            )
        }),
        ('Relations', {
            'fields': (
                'user',
                'agency',
                'booking'
            )
        }),
        ('Payme Info', {
            'fields': (
                'payme_transaction_id',
                'payme_receipt_id',
                'payme_merchant_id'
            )
        }),
        ('Other', {
            'fields': (
                'notes',
                'created_at',
                'updated_at'
            )
        }),
    )


@admin.register(AccountingTransaction)
class AccountingTransactionAdmin(admin.ModelAdmin):
    """
    Админка для бухгалтерских проводок:
    - Circle admin видит все записи
    - Менеджер агентства видит только свои
    """

    ordering = ('-created_at',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if request.user.is_staff and request.user.agency:
            return qs.filter(agency=request.user.agency)
        return qs.none()

    def get_list_display(self, request):
        if request.user.is_superuser:
            return (
                'id',
                'type',
                'amount',
                'agency',
                'payment_transaction',
                'created_at'
            )
        return (
            'id',
            'type',
            'amount',
            'payment_transaction',
            'created_at'
        )

    def get_readonly_fields(self, request, obj=None):
        fields = [
            'payment_transaction',
            'agency',
            'type',
            'amount',
            'currency',
            'description',
            'created_at'
        ]
        if request.user.is_superuser:
            return fields
        # Менеджерам агентств скрываем agency и currency
        return [f for f in fields if f not in ('agency', 'currency')]

    def get_list_filter(self, request):
        if request.user.is_superuser:
            return ('type', 'agency', 'created_at')
        return ('type', 'created_at')

    def get_search_fields(self, request):
        if request.user.is_superuser:
            return ('description', 'agency__name')
        return ('description',)
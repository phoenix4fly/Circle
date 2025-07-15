from django.db import models
from django.conf import settings
from apps.agencies.models import TravelAgency
from apps.bookings.models import Booking


class PaymentTransaction(models.Model):
    """
    Сохраняем все фактические платежи клиентов через Payme
    """
    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
        ('failed', 'Failed')
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='payments')
    agency = models.ForeignKey(TravelAgency, on_delete=models.SET_NULL, null=True, related_name='payments')
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, related_name='payments')
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='UZS')

    payme_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    payme_receipt_id = models.CharField(max_length=100, blank=True, null=True)
    payme_merchant_id = models.CharField(max_length=100, blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    notes = models.TextField(blank=True, help_text="Любые дополнительные детали")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Payment Transaction"
        verbose_name_plural = "Payment Transactions"

    def __str__(self):
        return f"Payment {self.id} - {self.status} - {self.amount}"


class AccountingTransaction(models.Model):
    """
    Бухгалтерская проводка: записывает движение денег внутри системы
    Например:
    - сумма агентства
    - комиссия платформы
    """
    TRANSACTION_TYPE_CHOICES = [
        ('AGENCY_SHARE', 'Agency Share'),
        ('PLATFORM_COMMISSION', 'Platform Commission'),
        ('PAYOUT', 'Payout to Agency'),
        ('REFUND', 'Refund to Customer'),
        ('ADJUSTMENT', 'Manual Adjustment')
    ]

    payment_transaction = models.ForeignKey(
        PaymentTransaction, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='accounting_entries'
    )

    agency = models.ForeignKey(
        TravelAgency, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='accounting_entries'
    )

    type = models.CharField(max_length=30, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='UZS')
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Accounting Transaction"
        verbose_name_plural = "Accounting Transactions"

    def __str__(self):
        return f"{self.type} - {self.amount} - {self.agency}"
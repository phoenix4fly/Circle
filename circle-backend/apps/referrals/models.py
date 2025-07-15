from django.db import models
from django.conf import settings


class ReferralPartner(models.Model):
    """
    Участник реферальной программы — например блогер.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='referral_profile',
        help_text="Связанный аккаунт пользователя"
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        help_text="Уникальный реферальный код"
    )
    commission_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5.00,
        help_text="Процент комиссии с продаж"
    )
    total_earned = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Общая сумма начисленных бонусов"
    )
    total_withdrawn = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Общая сумма уже выплаченных бонусов"
    )
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Referral Partner"
        verbose_name_plural = "Referral Partners"
        ordering = ['user']

    def __str__(self):
        return f"{self.user.username} ({self.code})"


class ReferralBonus(models.Model):
    """
    Начисление бонуса за конкретную покупку.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('available', 'Available'),
        ('withdrawn', 'Withdrawn'),
    ]

    partner = models.ForeignKey(
        ReferralPartner,
        on_delete=models.CASCADE,
        related_name='bonuses',
        help_text="Кому начислен бонус"
    )
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Бронирование, по которому начислен бонус"
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Сумма бонуса"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    available_at = models.DateTimeField(
        help_text="Когда бонус станет доступным для вывода"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Referral Bonus"
        verbose_name_plural = "Referral Bonuses"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.partner.user.username} - {self.amount} ({self.status})"


class WithdrawalRequest(models.Model):
    """
    Заявка на вывод средств партнером.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('declined', 'Declined'),
    ]

    partner = models.ForeignKey(
        ReferralPartner,
        on_delete=models.CASCADE,
        related_name='withdrawal_requests'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    card_number = models.CharField(
        max_length=30,
        help_text="Номер карты для перевода"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    admin_comment = models.TextField(
        blank=True,
        null=True,
        help_text="Комментарий администратора при отклонении"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Withdrawal Request"
        verbose_name_plural = "Withdrawal Requests"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.partner.user.username} - {self.amount} ({self.status})"
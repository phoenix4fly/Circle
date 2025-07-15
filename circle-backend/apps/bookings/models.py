from django.db import models
from django.utils import timezone

from apps.users.models import User
from apps.tours.models import Tour, TourSession, PromoCode


class Booking(models.Model):
    STATUS_CHOICES = [
        ("requested", "Заявка отправлена"),
        ("approved", "Подтверждена менеджером"),
        ("paid", "Оплачено"),
        ("cancelled", "Отменена"),
        ("expired", "Просрочена"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bookings",
        help_text="Кто сделал бронирование"
    )
    tour = models.ForeignKey(
        Tour,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bookings"
    )
    session = models.ForeignKey(
        TourSession,
        on_delete=models.CASCADE,
        related_name="bookings"
    )
    seats_reserved = models.PositiveIntegerField(default=1)
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Базовая цена до всех скидок"
    )
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Общая скидка (акция+промокод)"
    )
    bonus_used_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Сумма использованных бонусов"
    )
    final_price_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Финальная сумма, оплаченная картой"
    )

    promo_code = models.ForeignKey(
        PromoCode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings',
        help_text="Промокод, использованный при брони"
    )

    referral_partner = models.ForeignKey(
        'referrals.ReferralPartner',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='referred_bookings',
        help_text="Партнёр, который привёл этого пользователя"
    )

    selected_transport = models.CharField(max_length=100, blank=True)
    selected_accommodation = models.CharField(max_length=100, blank=True)
    comment = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="requested"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_bookings"
    )
    expires_at = models.DateTimeField(null=True, blank=True)
    cancel_reason = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"

    def __str__(self):
        return f"{self.user.username} → {self.session.tour.title} on {self.session.date_start} ({self.status})"

    def is_expired(self):
        return self.expires_at and timezone.now() > self.expires_at

    def calculate_final_price(self):
        """
        Основной метод расчёта цены:
        1. Базовая цена (price * seats)
        2. - скидки акций и промокодов
        3. - бонусы
        = сумма к оплате
        """
        total_price = self.session.price * self.seats_reserved

        discount = 0
        if self.promo_code:
            discount += self.promo_code.calculate_discount(total_price)

        if hasattr(self.session, 'discount_amount') and self.session.discount_amount:
            discount += self.session.discount_amount

        total_price -= discount
        total_price -= self.bonus_used_amount

        if total_price < 0:
            total_price = 0

        self.base_price = self.session.price * self.seats_reserved
        self.discount_amount = discount
        self.final_price_paid = total_price
        self.save()
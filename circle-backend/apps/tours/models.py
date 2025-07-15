from django.db import models
from apps.users.models import User
from apps.media.models import Media
from apps.agencies.models import TravelAgency
from decimal import Decimal
from django.utils import timezone


class TourCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Tour Category"
        verbose_name_plural = "Tour Categories"

    def __str__(self):
        return self.name


class Tour(models.Model):
    title = models.CharField(max_length=200, help_text="Название тура")
    slug = models.SlugField(unique=True)
    agency = models.ForeignKey(
        TravelAgency,
        on_delete=models.CASCADE,
        related_name="tours",
        help_text="Турагентство, которое создало тур"
    )
    description = models.TextField(help_text="Подробное описание маршрута")
    type = models.ForeignKey(
        TourCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tours",
        help_text="Тип/категория тура"
    )
    price_from = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Минимальная цена на карточке"
    )
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Базовая цена без опций"
    )
    distance_from_tashkent_km = models.FloatField(
        null=True,
        blank=True,
        help_text="Расстояние от Ташкента (в км)"
    )
    duration_days = models.PositiveIntegerField(help_text="Количество дней")
    duration_nights = models.PositiveIntegerField(help_text="Количество ночей")
    transport_options = models.JSONField(
        default=dict,
        blank=True,
        help_text='Варианты транспорта и цены. Пример: {"bus": 100000, "car": 150000}'
    )
    main_image = models.ImageField(
        upload_to="tour_main_images/",
        null=True,
        blank=True
    )
    gallery = models.ManyToManyField(
        Media,
        blank=True,
        related_name="tours",
        help_text="Дополнительные фото тура"
    )
    is_active = models.BooleanField(default=True)
    season_start = models.DateField(
        null=True,
        blank=True,
        help_text="Начало сезона (необязательно)"
    )
    season_end = models.DateField(
        null=True,
        blank=True,
        help_text="Конец сезона (необязательно)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    participants = models.ManyToManyField(
        User,
        blank=True,
        related_name="joined_tours",
        help_text="Пользователи, записавшиеся на тур (на любой дате)"
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Tour"
        verbose_name_plural = "Tours"

    def __str__(self):
        return self.title


class TourSession(models.Model):
    tour = models.ForeignKey(
        Tour,
        on_delete=models.CASCADE,
        related_name="sessions",
        help_text="Маршрут, к которому относится эта дата"
    )
    date_start = models.DateField(help_text="Дата начала поездки")
    date_end = models.DateField(
        null=True,
        blank=True,
        help_text="Дата окончания (если многодневный тур)"
    )
    capacity = models.PositiveIntegerField(help_text="Максимальное количество мест")
    available_seats = models.PositiveIntegerField(help_text="Оставшиеся доступные места")
    is_active = models.BooleanField(
        default=True,
        help_text="Отображать эту дату на витрине"
    )
    price_override = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Специальная цена для этой даты (если отличается)"
    )

    class Meta:
        ordering = ["date_start"]
        verbose_name = "Tour Session"
        verbose_name_plural = "Tour Sessions"

    def __str__(self):
        return f"{self.tour.title} on {self.date_start}"

    def get_active_promotions(self):
        now = timezone.now()
        return self.promotions.filter(
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        )

    def get_active_promo_codes(self):
        now = timezone.now()
        return self.promo_codes.filter(
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        )

    def calculate_discounted_price(self, base_price, promo_code=None):
        """
        Рассчитывает итоговую цену с учетом акций и промокодов
        """
        now = timezone.now()
        price = Decimal(base_price)

        # Акции
        for promo in self.get_active_promotions():
            if promo.discount_percent:
                price -= (price * promo.discount_percent / Decimal('100'))
            if promo.discount_amount:
                price -= promo.discount_amount

        # Промокод (если указан)
        if promo_code:
            code_qs = self.promo_codes.filter(
                code=promo_code,
                is_active=True,
                valid_from__lte=now,
                valid_until__gte=now,
                usage_limit__gt=models.F('used_count')
            )
            if code_qs.exists():
                code = code_qs.first()
                if code.discount_percent:
                    price -= (price * code.discount_percent / Decimal('100'))
                if code.discount_amount:
                    price -= code.discount_amount

        # Никогда не меньше нуля
        return max(price, Decimal('0'))

class TourSchedule(models.Model):
    tour = models.ForeignKey(
        Tour,
        on_delete=models.CASCADE,
        related_name="schedule"
    )
    day_number = models.PositiveIntegerField(help_text="Номер дня в программе")
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(
        upload_to="tour_schedule_images/",
        null=True,
        blank=True
    )

    class Meta:
        ordering = ["tour", "day_number"]
        verbose_name = "Tour Schedule"
        verbose_name_plural = "Tour Schedules"

    def __str__(self):
        return f"{self.tour.title} - Day {self.day_number}"


class TourParameterDefinition(models.Model):
    tour_type = models.ForeignKey(
        TourCategory,
        on_delete=models.CASCADE,
        related_name="parameters",
        help_text="К какой категории относится параметр"
    )
    name = models.CharField(max_length=100, help_text="Название параметра")
    unit = models.CharField(max_length=50, blank=True, help_text="Единица измерения (например: км, м)")
    data_type = models.CharField(
        max_length=20,
        choices=[
            ("string", "String"),
            ("integer", "Integer"),
            ("float", "Float"),
            ("enum", "Enum")
        ]
    )
    required = models.BooleanField(default=False, help_text="Обязателен ли параметр для заполнения")
    options = models.JSONField(
        blank=True,
        null=True,
        help_text='Список опций для Enum. Пример: ["Easy", "Medium", "Hard"]'
    )

    class Meta:
        verbose_name = "Tour Parameter Definition"
        verbose_name_plural = "Tour Parameter Definitions"

    def __str__(self):
        return f"{self.name} ({self.tour_type.name})"


class TourParameterValue(models.Model):
    tour = models.ForeignKey(
        Tour,
        on_delete=models.CASCADE,
        related_name="parameter_values"
    )
    parameter_definition = models.ForeignKey(
        TourParameterDefinition,
        on_delete=models.CASCADE
    )
    value = models.TextField(help_text="Значение параметра (хранится как текст)")

    class Meta:
        verbose_name = "Tour Parameter Value"
        verbose_name_plural = "Tour Parameter Values"

    def __str__(self):
        return f"{self.tour.title} - {self.parameter_definition.name}: {self.value}"


class TourChat(models.Model):
    tour = models.OneToOneField(
        Tour,
        on_delete=models.CASCADE,
        related_name="chat"
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_restricted = models.BooleanField(
        default=True,
        help_text="Если True, писать могут только участники тура"
    )

    class Meta:
        verbose_name = "Tour Chat"
        verbose_name_plural = "Tour Chats"

    def __str__(self):
        return f"Chat for {self.tour.title}"
    



class Promotion(models.Model):
    """
    Акция/скидка для определённой сессии тура
    """
    session = models.ForeignKey(TourSession, on_delete=models.CASCADE, related_name='promotions')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Promotion"
        verbose_name_plural = "Promotions"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.session})"

    def is_currently_valid(self):
        now = timezone.now()
        return self.is_active and self.valid_from <= now <= self.valid_until

    def calculate_discount(self, base_price):
        if not self.is_currently_valid():
            return 0

        discount = 0
        if self.discount_percent:
            discount += (base_price * self.discount_percent / 100)
        if self.discount_amount:
            discount += self.discount_amount
        return min(discount, base_price)

class PromoCode(models.Model):
    """
    Промокод на скидку для определённой сессии тура
    """
    code = models.CharField(max_length=50, unique=True)
    session = models.ForeignKey(TourSession, on_delete=models.CASCADE, related_name='promo_codes')
    description = models.TextField(blank=True)

    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    usage_limit = models.PositiveIntegerField(default=1)
    used_count = models.PositiveIntegerField(default=0)

    min_purchase_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Минимальная сумма покупки для применения промокода"
    )

    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Promo Code"
        verbose_name_plural = "Promo Codes"
        ordering = ['-created_at']

    def __str__(self):
        return self.code

    def is_currently_valid(self):
        now = timezone.now()
        return (
            self.is_active and
            self.used_count < self.usage_limit and
            self.valid_from <= now <= self.valid_until
        )

    def calculate_discount(self, base_price):
        if not self.is_currently_valid():
            return 0

        if self.min_purchase_amount and base_price < self.min_purchase_amount:
            return 0

        discount = 0
        if self.discount_percent:
            discount += (base_price * self.discount_percent / 100)
        if self.discount_amount:
            discount += self.discount_amount
        return min(discount, base_price)
from django.db import models
from django.conf import settings
from apps.agencies.models import TravelAgency


class CustomTripRequest(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новый'),
        ('assigned', 'В работе'),
        ('declined', 'Отклонён'),
        ('completed', 'Завершён'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='custom_trip_requests')
    agency = models.ForeignKey(TravelAgency, null=True, blank=True, on_delete=models.SET_NULL, related_name='custom_requests')

    request_type = models.CharField(max_length=100, help_text="Тип поездки (семейный отдых, корпоратив и т.д.)")
    directions = models.TextField(help_text="Куда хочет поехать")
    people_count = models.PositiveIntegerField()
    date_start = models.DateField()
    duration_days = models.PositiveIntegerField()

    transport_options = models.TextField(blank=True, help_text="Предпочтительный транспорт")
    wishes = models.TextField(blank=True, help_text="Особые пожелания")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Custom Trip Request"
        verbose_name_plural = "Custom Trip Requests"
        ordering = ['-created_at']

    def __str__(self):
        return f"Запрос от {self.user} на {self.directions}"


class CustomTripOffer(models.Model):
    request = models.ForeignKey(CustomTripRequest, on_delete=models.CASCADE, related_name='offers')
    agency = models.ForeignKey(TravelAgency, on_delete=models.CASCADE, related_name='offers')
    proposal_text = models.TextField(help_text="Описание предложения агентства")
    price_estimate = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Custom Trip Offer"
        verbose_name_plural = "Custom Trip Offers"
        ordering = ['-created_at']

    def __str__(self):
        return f"Offer by {self.agency} for Request {self.request.id}"
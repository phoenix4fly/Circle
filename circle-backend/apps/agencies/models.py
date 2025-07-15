from django.db import models


class TravelAgency(models.Model):
    """
    Туристическое агентство-партнёр
    """
    name = models.CharField(max_length=255, unique=True, help_text="Название агентства")
    description = models.TextField(blank=True, help_text="Описание, информация об агентстве")
    is_active = models.BooleanField(default=True, help_text="Может ли публиковать туры")
    
    contact_person = models.CharField(max_length=255, blank=True, help_text="Имя контактного лица")
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)

    logo = models.ImageField(upload_to='agency_logos/', blank=True, null=True)

    # платежные реквизиты
    commission_percent = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=5.00, 
        help_text="Процент комиссии, которую удерживает платформа"
    )

    payme_merchant_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Payme Merchant ID для split-интеграции (на будущее)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Travel Agency"
        verbose_name_plural = "Travel Agencies"
        ordering = ['name']

    def __str__(self):
        return self.name
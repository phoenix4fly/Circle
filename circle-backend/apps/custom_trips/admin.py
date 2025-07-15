from django.contrib import admin
from .models import CustomTripRequest, CustomTripOffer


@admin.register(CustomTripRequest)
class CustomTripRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'agency', 'request_type', 'directions', 'people_count', 'date_start', 'status')
    list_filter = ('status', 'agency')
    search_fields = ('user__username', 'directions', 'request_type')
    autocomplete_fields = ['user', 'agency']
    readonly_fields = ('created_at',)


@admin.register(CustomTripOffer)
class CustomTripOfferAdmin(admin.ModelAdmin):
    list_display = ('id', 'request', 'agency', 'price_estimate', 'created_at')
    list_filter = ('agency',)
    search_fields = ('agency__name', 'proposal_text')
    autocomplete_fields = ['request', 'agency']
    readonly_fields = ('created_at',)
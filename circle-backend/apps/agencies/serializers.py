from rest_framework import serializers
from .models import TravelAgency


class TravelAgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelAgency
        fields = [
            'id',
            'name',
            'description',
            'is_active',
            'contact_person',
            'phone_number',
            'email',
            'address',
            'logo',
            'commission_percent',
            'payme_merchant_id',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
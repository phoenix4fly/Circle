from rest_framework import serializers
from .models import CustomTripRequest, CustomTripOffer


class CustomTripOfferSerializer(serializers.ModelSerializer):
    agency_name = serializers.CharField(source='agency.name', read_only=True)

    class Meta:
        model = CustomTripOffer
        fields = ['id', 'agency', 'agency_name', 'proposal_text', 'price_estimate', 'created_at']


class CustomTripRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    offers = CustomTripOfferSerializer(many=True, read_only=True)

    class Meta:
        model = CustomTripRequest
        fields = [
            'id',
            'user', 'user_name',
            'agency',
            'request_type',
            'directions',
            'people_count',
            'date_start',
            'duration_days',
            'transport_options',
            'wishes',
            'status',
            'offers',
            'created_at'
        ]
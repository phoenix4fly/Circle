from rest_framework import serializers
from .models import Promotion, PromoCode
from .models import (
    TourCategory,
    Tour,
    TourSchedule,
    TourSession,
    TourParameterValue,
)
from apps.media.models import Media
from apps.users.models import User


########################################
# Media (фото, галереи)
########################################
class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ['id', 'file', 'description']


########################################
# Категории туров
########################################
class TourCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TourCategory
        fields = ['id', 'name', 'description']


########################################
# Расписание по дням
########################################
class TourScheduleSerializer(serializers.ModelSerializer):
    image = MediaSerializer(read_only=True)

    class Meta:
        model = TourSchedule
        fields = ['id', 'day_number', 'title', 'description', 'image']





class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = ['id', 'name', 'discount_percent', 'discount_amount', 'valid_from', 'valid_until']

class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = ['id', 'code', 'discount_percent', 'discount_amount', 'valid_from', 'valid_until']

########################################
# Сессии (конкретные даты выездов)
########################################
class TourSessionSerializer(serializers.ModelSerializer):
    available_seats = serializers.IntegerField(read_only=True)
    promotions = PromotionSerializer(many=True, read_only=True)
    promo_codes = PromoCodeSerializer(many=True, read_only=True)

    class Meta:
        model = TourSession
        fields = [
            'id',
            'date_start',
            'date_end',
            'price_override',
            'is_active',
            'available_seats',
            'promotions',
            'promo_codes',
        ]
    
    


########################################
# Параметры тура (расстояние, сложность)
########################################
class TourParameterValueSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='parameter_definition.name', read_only=True)
    unit = serializers.CharField(source='parameter_definition.unit', read_only=True)
    data_type = serializers.CharField(source='parameter_definition.data_type', read_only=True)

    class Meta:
        model = TourParameterValue
        fields = ['id', 'name', 'value', 'unit', 'data_type']


########################################
# Участники тура (аватарки)
########################################
class TourParticipantSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar']


########################################
# Список туров (для витрины)
########################################
class TourListSerializer(serializers.ModelSerializer):
    category = TourCategorySerializer(source='type', read_only=True)
    main_image = MediaSerializer(read_only=True)

    class Meta:
        model = Tour
        fields = [
            'id',
            'title',
            'slug',
            'category',
            'price_from',
            'duration_days',
            'main_image',
            'is_active'
        ]


########################################
# Детальная страница тура
########################################
class TourDetailSerializer(serializers.ModelSerializer):
    category = TourCategorySerializer(source='type', read_only=True)
    main_image = MediaSerializer(read_only=True)
    gallery = MediaSerializer(many=True, read_only=True)
    schedule = TourScheduleSerializer(many=True, read_only=True)
    sessions = TourSessionSerializer(many=True, read_only=True, source='sessions')
    parameter_values = TourParameterValueSerializer(many=True, read_only=True)
    participants = TourParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = Tour
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'category',
            'price_from',
            'base_price',
            'duration_days',
            'duration_nights',
            'distance_from_tashkent_km',
            'transport_options',
            'main_image',
            'gallery',
            'schedule',
            'sessions',
            'parameter_values',
            'participants',
            'is_active'
        ]




class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = [
            'id',
            'session',
            'name',
            'description',
            'discount_percent',
            'discount_amount',
            'valid_from',
            'valid_until',
            'is_active',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = [
            'id',
            'code',
            'session',
            'description',
            'discount_percent',
            'discount_amount',
            'usage_limit',
            'used_count',
            'valid_from',
            'valid_until',
            'is_active',
            'created_at'
        ]
        read_only_fields = ['id', 'used_count', 'created_at']


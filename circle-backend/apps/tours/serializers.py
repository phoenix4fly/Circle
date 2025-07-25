from rest_framework import serializers
from .models import Promotion, PromoCode
from .models import (
    TourCategory,
    Tour,
    TourSchedule,
    TourSession,
    TourParameterValue,
    TourWishlist,
)
from apps.media.models import Media
from apps.media.serializers import MediaSerializer
from apps.users.models import User


########################################
# Участники туров
########################################
class TourParticipantNewSerializer(serializers.ModelSerializer):
    sphere_name = serializers.SerializerMethodField()
    specialization_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'sphere_name', 'specialization_name', 'avatar']
    
    def get_sphere_name(self, obj):
        return obj.sphere.name if obj.sphere else None
    
    def get_specialization_name(self, obj):
        return obj.specialization.name if obj.specialization else None

# Алиас для обратной совместимости
TourParticipantSerializer = TourParticipantNewSerializer


########################################
# Категории туров
########################################
class TourCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TourCategory
        fields = ['id', 'name', 'description']





########################################
# Акции и промокоды
########################################
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


########################################
# Расписание по дням
########################################
class TourScheduleSerializer(serializers.ModelSerializer):
    image = MediaSerializer(read_only=True)

    class Meta:
        model = TourSchedule
        fields = ['id', 'day_number', 'title', 'description', 'image']





########################################
# Сессии (конкретные даты выездов)
########################################
class TourSessionSerializer(serializers.ModelSerializer):
    available_seats = serializers.IntegerField(read_only=True)
    max_participants = serializers.IntegerField(source='capacity', read_only=True)
    current_participants = serializers.SerializerMethodField()
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
            'max_participants',
            'current_participants',
            'promotions',
            'promo_codes',
        ]
    
    def get_current_participants(self, obj):
        return obj.capacity - obj.available_seats
    
    


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
    participants = serializers.SerializerMethodField()
    is_wishlisted = serializers.SerializerMethodField()
    
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
            'participants',
            'is_wishlisted',
            'is_active'
        ]
    
    def get_participants(self, obj):
        # Получаем подтвержденные бронирования для тура
        from apps.bookings.models import Booking
        bookings = Booking.objects.filter(
            tour=obj, 
            status='paid'
        ).select_related('user', 'user__sphere', 'user__specialization')
        
        users = [booking.user for booking in bookings]
        return TourParticipantNewSerializer(users, many=True, context=self.context).data
    
    def get_is_wishlisted(self, obj):
        """Проверяет находится ли тур в wishlist текущего пользователя"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return TourWishlist.is_in_wishlist(request.user, obj)


########################################
# Детальная страница тура
########################################
class TourDetailSerializer(serializers.ModelSerializer):
    category = TourCategorySerializer(source='type', read_only=True)
    main_image = MediaSerializer(read_only=True)
    gallery = MediaSerializer(many=True, read_only=True)
    schedule = TourScheduleSerializer(many=True, read_only=True)
    sessions = TourSessionSerializer(many=True, read_only=True)
    parameter_values = TourParameterValueSerializer(many=True, read_only=True)
    participants = serializers.SerializerMethodField()
    is_wishlisted = serializers.SerializerMethodField()

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
            'is_wishlisted',
            'is_active'
        ]
    
    def get_participants(self, obj):
        # Получаем подтвержденные бронирования для тура
        from apps.bookings.models import Booking
        bookings = Booking.objects.filter(
            tour=obj, 
            status='paid'
        ).select_related('user', 'user__sphere', 'user__specialization')
        
        users = [booking.user for booking in bookings]
        return TourParticipantNewSerializer(users, many=True, context=self.context).data
    
    def get_is_wishlisted(self, obj):
        """Проверяет находится ли тур в wishlist текущего пользователя"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return TourWishlist.is_in_wishlist(request.user, obj)


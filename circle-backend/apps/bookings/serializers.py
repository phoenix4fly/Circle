from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal

from apps.bookings.models import Booking
from apps.tours.models import TourSession, PromoCode
from apps.users.models import User
from apps.referrals.models import ReferralPartner
from apps.tours.serializers import PromotionSerializer, PromoCodeSerializer


############################################
# Simple User Serializer
############################################
class BookingUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


############################################
# Session Serializer with Discounts
############################################
class BookingSessionSerializer(serializers.ModelSerializer):
    tour_title = serializers.CharField(source='tour.title', read_only=True)
    promotions = PromotionSerializer(many=True, read_only=True)
    promo_codes = PromoCodeSerializer(many=True, read_only=True)

    class Meta:
        model = TourSession
        fields = [
            'id',
            'tour_title',
            'date_start',
            'date_end',
            'price',
            'promotions',
            'promo_codes'
        ]


############################################
# Booking Detail Serializer
############################################
class BookingDetailSerializer(serializers.ModelSerializer):
    user = BookingUserSerializer(read_only=True)
    session = BookingSessionSerializer(read_only=True)
    approved_by = BookingUserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'session',
            'promo_code',
            'seats_reserved',
            'selected_transport',
            'selected_accommodation',
            'base_price',
            'discount_amount',
            'bonus_used_amount',
            'final_price_paid',
            'referral_partner',
            'status',
            'approved_by',
            'approved_at',
            'expires_at',
            'cancel_reason',
            'comment',
            'created_at'
        ]


############################################
# Create Booking Serializer
############################################
class CreateBookingSerializer(serializers.ModelSerializer):
    promo_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bonus_used_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00')
    )

    class Meta:
        model = Booking
        fields = [
            'session',
            'seats_reserved',
            'selected_transport',
            'selected_accommodation',
            'comment',
            'promo_code',
            'bonus_used_amount'
        ]

    def validate(self, data):
        session = data.get('session')
        seats = data.get('seats_reserved', 1)

        if not session.is_active:
            raise serializers.ValidationError("Выбранная дата тура недоступна для бронирования.")

        if session.available_seats < seats:
            raise serializers.ValidationError(
                f"На выбранную дату осталось только {session.available_seats} мест."
            )

        return data

    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        session = validated_data['session']
        seats = validated_data.get('seats_reserved', 1)
        promo_code_str = validated_data.get('promo_code')
        bonus_used = validated_data.get('bonus_used_amount', Decimal('0.00'))

        # 1️⃣ Базовая цена
        base_price = session.price * seats
        total_discount = Decimal('0.00')
        applied_promo = None

        # 2️⃣ Применяем промокод
        if promo_code_str:
            try:
                promo = PromoCode.objects.get(code=promo_code_str, session=session)
                if promo.is_currently_valid() and promo.can_use():
                    discount = promo.calculate_discount(base_price)
                    total_discount += discount
                    applied_promo = promo
                else:
                    raise serializers.ValidationError("Промокод недействителен или превышен лимит использования.")
            except PromoCode.DoesNotExist:
                raise serializers.ValidationError("Промокод не найден.")

        # 3️⃣ Применяем активные акции
        for promo in session.promotions.filter(is_active=True):
            if promo.is_currently_valid():
                total_discount += promo.calculate_discount(base_price)

        # 4️⃣ Проверка и применение бонусов пользователя
        if bonus_used > user.bonus_balance:
            raise serializers.ValidationError("Недостаточно бонусов на счёте.")
        if bonus_used > (base_price - total_discount):
            bonus_used = base_price - total_discount

        # 5️⃣ Финальная сумма
        final_price = base_price - total_discount - bonus_used
        if final_price < 0:
            final_price = Decimal('0.00')

        # 6️⃣ Учитываем рефералку (только если это первый платный заказ)
        referral_partner = None
        if user.is_first_booking():
            referral_partner = user.invited_by

        # 7️⃣ Создаём бронь
        booking = Booking.objects.create(
            user=user,
            session=session,
            tour=session.tour,
            seats_reserved=seats,
            base_price=base_price,
            discount_amount=total_discount,
            bonus_used_amount=bonus_used,
            final_price_paid=final_price,
            promo_code=applied_promo,
            referral_partner=referral_partner,
            selected_transport=validated_data.get('selected_transport', ''),
            selected_accommodation=validated_data.get('selected_accommodation', ''),
            comment=validated_data.get('comment', ''),
            status='requested'
        )

        # 8️⃣ Списание бонусов у пользователя
        if bonus_used > 0:
            user.bonus_balance -= bonus_used
            user.save()

        # 9️⃣ Промокод — увеличение счетчика использования
        if applied_promo:
            applied_promo.used_count += 1
            applied_promo.save()

        return booking


############################################
# Approve Booking Serializer
############################################
class ApproveBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id']

    def validate(self, data):
        booking = self.instance
        if booking.status != 'requested':
            raise serializers.ValidationError("Эта заявка уже обработана.")
        if booking.session.available_seats < booking.seats_reserved:
            raise serializers.ValidationError(
                f"Недостаточно мест. Осталось {booking.session.available_seats}."
            )
        return data

    def save(self, approved_by):
        booking = self.instance
        booking.status = 'approved'
        booking.approved_by = approved_by
        booking.approved_at = timezone.now()
        booking.expires_at = timezone.now() + timezone.timedelta(minutes=60)
        booking.save()
        return booking


############################################
# Reject Booking Serializer
############################################
class RejectBookingSerializer(serializers.ModelSerializer):
    cancel_reason = serializers.CharField()

    class Meta:
        model = Booking
        fields = ['id', 'cancel_reason']

    def validate(self, data):
        booking = self.instance
        if booking.status != 'requested':
            raise serializers.ValidationError("Эта заявка уже обработана.")
        return data

    def save(self, approved_by):
        booking = self.instance
        booking.status = 'cancelled'
        booking.approved_by = approved_by
        booking.approved_at = timezone.now()
        booking.cancel_reason = self.validated_data.get('cancel_reason')
        booking.save()
        return booking
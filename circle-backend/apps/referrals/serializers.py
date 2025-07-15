from rest_framework import serializers
from .models import ReferralPartner, ReferralBonus, WithdrawalRequest
from apps.users.serializers import UserShortSerializer


class ReferralPartnerSerializer(serializers.ModelSerializer):
    user = UserShortSerializer(read_only=True)

    class Meta:
        model = ReferralPartner
        fields = [
            'id',
            'user',
            'code',
            'commission_percentage',
            'total_earned',
            'total_withdrawn',
            'is_active',
            'created_at',
            'updated_at'
        ]


class ReferralBonusSerializer(serializers.ModelSerializer):
    partner = ReferralPartnerSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ReferralBonus
        fields = [
            'id',
            'partner',
            'amount',
            'status',
            'status_display',
            'available_at',
            'created_at'
        ]


class WithdrawalRequestSerializer(serializers.ModelSerializer):
    partner = ReferralPartnerSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = WithdrawalRequest
        fields = [
            'id',
            'partner',
            'amount',
            'card_number',
            'status',
            'status_display',
            'admin_comment',
            'created_at',
            'approved_at',
            'paid_at'
        ]


class CreateWithdrawalRequestSerializer(serializers.ModelSerializer):
    """
    Для подачи пользователем заявки на вывод
    """

    class Meta:
        model = WithdrawalRequest
        fields = ['amount', 'card_number']

    def validate(self, data):
        partner = self.context['request'].user.referral_profile
        amount = data['amount']

        # Проверка доступного баланса
        available_amount = partner.bonuses.filter(status='available').aggregate(
            total=models.Sum('amount')
        )['total'] or 0

        if amount > available_amount:
            raise serializers.ValidationError(f"Доступный баланс для вывода: {available_amount} сум.")

        # Минимальная сумма вывода
        if amount < 10000:
            raise serializers.ValidationError("Минимальная сумма для вывода - 10 000 сум.")

        return data

    def create(self, validated_data):
        partner = self.context['request'].user.referral_profile
        return WithdrawalRequest.objects.create(
            partner=partner,
            amount=validated_data['amount'],
            card_number=validated_data['card_number']
        )


class CreateReferralPartnerSerializer(serializers.ModelSerializer):
    """
    Для регистрации нового реферального партнёра
    """
    class Meta:
        model = ReferralPartner
        fields = ['code', 'commission_percentage']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)
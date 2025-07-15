from rest_framework import serializers
from .models import PaymentTransaction, AccountingTransaction
from apps.agencies.models import TravelAgency
from apps.users.models import User
from apps.bookings.models import Booking


############################################
# Simple Agency Serializer
############################################
class SimpleAgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelAgency
        fields = ['id', 'name']


############################################
# Simple User Serializer
############################################
class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


############################################
# PaymentTransaction Serializer
############################################
class PaymentTransactionSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    agency = SimpleAgencySerializer(read_only=True)
    booking = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            'id',
            'status',
            'amount',
            'commission_amount',
            'currency',
            'user',
            'agency',
            'booking',
            'payme_transaction_id',
            'payme_receipt_id',
            'payme_merchant_id',
            'notes',
            'created_at'
        ]
        read_only_fields = fields


############################################
# AccountingTransaction Serializer
############################################
class AccountingTransactionSerializer(serializers.ModelSerializer):
    agency = SimpleAgencySerializer(read_only=True)
    payment_transaction = PaymentTransactionSerializer(read_only=True)

    class Meta:
        model = AccountingTransaction
        fields = [
            'id',
            'type',
            'amount',
            'currency',
            'agency',
            'payment_transaction',
            'description',
            'created_at'
        ]
        read_only_fields = fields
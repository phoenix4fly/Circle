from rest_framework import viewsets, permissions
from rest_framework.response import Response

from .models import PaymentTransaction, AccountingTransaction
from .serializers import PaymentTransactionSerializer, AccountingTransactionSerializer


######################################
# Custom Permission
######################################
class IsAuthenticatedStaffOrAdmin(permissions.BasePermission):
    """
    Доступ только аутентифицированным пользователям.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


######################################
# PaymentTransaction ViewSet
######################################
class PaymentTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/payments/transactions/

    - Admin видит все
    - Менеджер агентства видит только свои платежи
    - Пользователи не видят чужое
    """
    serializer_class = PaymentTransactionSerializer
    permission_classes = [IsAuthenticatedStaffOrAdmin]
    queryset = PaymentTransaction.objects.select_related(
        'user', 'agency', 'booking'
    ).order_by('-created_at')

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return self.queryset

        if user.is_staff and user.agency:
            return self.queryset.filter(agency=user.agency)

        # Обычный пользователь → свои платежи
        return self.queryset.filter(user=user)


######################################
# AccountingTransaction ViewSet
######################################
class AccountingTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/payments/accounting/

    - Admin видит все
    - Менеджер агентства видит только свои проводки
    """
    serializer_class = AccountingTransactionSerializer
    permission_classes = [IsAuthenticatedStaffOrAdmin]
    queryset = AccountingTransaction.objects.select_related(
        'agency', 'payment_transaction'
    ).order_by('-created_at')

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return self.queryset

        if user.is_staff and user.agency:
            return self.queryset.filter(agency=user.agency)

        # Обычные пользователи не видят бухгалтерию
        return AccountingTransaction.objects.none()
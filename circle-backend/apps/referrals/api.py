from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .permissions import IsAdminPermission
from .models import ReferralPartner, ReferralBonus, WithdrawalRequest
from .serializers import (
    ReferralPartnerSerializer,
    ReferralBonusSerializer,
    WithdrawalRequestSerializer,
    CreateWithdrawalRequestSerializer
)


######################################
# ViewSet для партнёра
######################################
class ReferralPartnerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/referrals/partners/
    - GET list (для админов)
    - GET my/ (для партнёра)
    """
    queryset = ReferralPartner.objects.select_related('user').all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReferralPartnerSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [IsAdminPermission()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def my(self, request):
        """
        /api/referrals/partners/my/
        - Получить свой реферальный профиль
        """
        partner = request.user.referral_profile
        serializer = self.get_serializer(partner)
        return Response(serializer.data)


######################################
# ViewSet для начислений
######################################
class ReferralBonusViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/referrals/bonuses/
    - GET list (админ)
    - GET my/ (партнёр)
    """
    queryset = ReferralBonus.objects.select_related('partner', 'partner__user')
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReferralBonusSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [IsAdminPermission()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def my(self, request):
        """
        /api/referrals/bonuses/my/
        - Список бонусов текущего партнёра
        """
        partner = request.user.referral_profile
        qs = self.queryset.filter(partner=partner).order_by('-created_at')
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)


######################################
# ViewSet для заявок на вывод
######################################
class WithdrawalRequestViewSet(viewsets.ModelViewSet):
    """
    /api/referrals/withdrawals/
    - POST → подать заявку
    - GET my/ → список своих заявок
    - GET list (для админов)
    """
    queryset = WithdrawalRequest.objects.select_related('partner', 'partner__user')
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateWithdrawalRequestSerializer
        return WithdrawalRequestSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [IsAdminPermission()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(partner=user.referral_profile)

    def perform_create(self, serializer):
        partner = self.request.user.referral_profile
        serializer.save(partner=partner)

    @action(detail=False, methods=['get'])
    def my(self, request):
        """
        /api/referrals/withdrawals/my/
        - Список собственных заявок на вывод
        """
        qs = self.get_queryset().order_by('-created_at')
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[IsAdminPermission]
    )
    def approve(self, request, pk=None):
        """
        /api/referrals/withdrawals/{id}/approve/
        - Подтвердить заявку на вывод (админ)
        """
        withdrawal = self.get_object()
        if withdrawal.status != 'pending':
            return Response({"error": "Заявка уже обработана."}, status=status.HTTP_400_BAD_REQUEST)

        withdrawal.status = 'approved'
        withdrawal.approved_at = timezone.now()
        withdrawal.save()

        return Response({"status": "approved", "message": "Заявка подтверждена."})

    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[IsAdminPermission]
    )
    def pay(self, request, pk=None):
        """
        /api/referrals/withdrawals/{id}/pay/
        - Отметить как Выплачено (админ)
        """
        withdrawal = self.get_object()
        if withdrawal.status != 'approved':
            return Response({"error": "Сначала нужно подтвердить заявку."}, status=status.HTTP_400_BAD_REQUEST)

        withdrawal.status = 'paid'
        withdrawal.paid_at = timezone.now()
        withdrawal.save()

        # Здесь можно интегрировать вызов Payme API

        return Response({"status": "paid", "message": "Заявка отмечена как выплаченная."})

    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[IsAdminPermission]
    )
    def decline(self, request, pk=None):
        """
        /api/referrals/withdrawals/{id}/decline/
        - Отклонить заявку на вывод (админ)
        - Требует поле admin_comment
        """
        withdrawal = self.get_object()
        if withdrawal.status != 'pending':
            return Response({"error": "Заявка уже обработана."}, status=status.HTTP_400_BAD_REQUEST)

        comment = request.data.get('admin_comment')
        if not comment:
            return Response({"error": "Нужен комментарий к отказу."}, status=status.HTTP_400_BAD_REQUEST)

        withdrawal.status = 'declined'
        withdrawal.admin_comment = comment
        withdrawal.save()

        return Response({"status": "declined", "message": "Заявка отклонена."})
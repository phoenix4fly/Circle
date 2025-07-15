from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Booking
from .serializers import (
    BookingDetailSerializer,
    CreateBookingSerializer,
    ApproveBookingSerializer,
    RejectBookingSerializer
)


########################################
# Permission для менеджеров
########################################
class IsManagerPermission(permissions.BasePermission):
    """
    Доступ только для сотрудников/менеджеров (связанных с агентством)
    """
    message = "У вас нет прав для выполнения этого действия."

    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.is_superuser
        )


########################################
# Основной ViewSet
########################################
class BookingViewSet(viewsets.ModelViewSet):
    """
    /api/bookings/

    - POST /  → пользователь оставляет заявку
    - GET /my/ → пользователь видит свои заявки
    - GET /pending/ → менеджер видит заявки на подтверждение
    - PATCH /{id}/approve/ → менеджер подтверждает
    - PATCH /{id}/reject/ → менеджер отклоняет
    """
    queryset = Booking.objects.select_related(
        'user', 'session', 'session__tour', 'approved_by'
    ).order_by('-created_at')
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateBookingSerializer
        elif self.action == 'approve':
            return ApproveBookingSerializer
        elif self.action == 'reject':
            return RejectBookingSerializer
        return BookingDetailSerializer

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset

        if user.is_superuser:
            return qs

        if user.is_staff and hasattr(user, 'agency') and user.agency:
            # Менеджеры турагентства видят только свои туры
            return qs.filter(session__tour__agency=user.agency)

        # Обычный пользователь видит только свои бронирования
        return qs.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    #################################
    # Пользовательское: мои заявки
    #################################
    @action(detail=False, methods=['get'])
    def my(self, request):
        """
        /api/bookings/my/
        - Список только своих заявок
        """
        qs = self.get_queryset().filter(user=request.user)
        page = self.paginate_queryset(qs)
        serializer = BookingDetailSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    #################################
    # Для менеджеров: pending заявки
    #################################
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[IsManagerPermission]
    )
    def pending(self, request):
        """
        /api/bookings/pending/
        - Все заявки со статусом 'requested'
        - Только для менеджеров
        """
        qs = self.get_queryset().filter(status='requested')
        page = self.paginate_queryset(qs)
        serializer = BookingDetailSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    #################################
    # Менеджер подтверждает заявку
    #################################
    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[IsManagerPermission]
    )
    def approve(self, request, pk=None):
        """
        /api/bookings/{id}/approve/
        - Менеджер подтверждает заявку
        """
        booking = self.get_object()

        serializer = ApproveBookingSerializer(booking, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(approved_by=request.user)

        return Response(
            {"status": "approved", "message": "Бронирование успешно подтверждено."},
            status=status.HTTP_200_OK
        )

    #################################
    # Менеджер отклоняет заявку
    #################################
    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[IsManagerPermission]
    )
    def reject(self, request, pk=None):
        """
        /api/bookings/{id}/reject/
        - Менеджер отклоняет заявку
        - Требует поле cancel_reason
        """
        booking = self.get_object()

        serializer = RejectBookingSerializer(booking, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(approved_by=request.user)

        return Response(
            {"status": "cancelled", "message": "Заявка была отклонена."},
            status=status.HTTP_200_OK
        )
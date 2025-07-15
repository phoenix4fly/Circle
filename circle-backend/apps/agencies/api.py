from rest_framework import viewsets, permissions
from .models import TravelAgency
from .serializers import TravelAgencySerializer


class IsAdminOrStaff(permissions.BasePermission):
    """
    Разрешение только для сотрудников и админов
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or request.user.is_superuser
        )


class TravelAgencyViewSet(viewsets.ModelViewSet):
    """
    /api/agencies/
    - Admin и staff могут просматривать и управлять агентствами
    """
    queryset = TravelAgency.objects.all().order_by('name')
    serializer_class = TravelAgencySerializer
    permission_classes = [IsAdminOrStaff]

    def get_queryset(self):
        qs = self.queryset
        user = self.request.user

        if user.is_superuser:
            return qs

        if user.is_staff and hasattr(user, 'agency'):
            # Менеджер агентства видит только своё агентство
            return qs.filter(id=user.agency.id)

        return qs.none()
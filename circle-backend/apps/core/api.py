# apps/core/api.py

from rest_framework import viewsets, permissions, mixins
from .models import SystemConfig, SystemLogEntry
from .serializers import SystemConfigSerializer, SystemLogEntrySerializer


########################################
# Permission: Только для админов
########################################
class IsAdminPermission(permissions.BasePermission):
    """
    Доступ разрешён только суперпользователям
    """
    message = "Доступ разрешён только администраторам."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


########################################
# ViewSet для SystemConfig
########################################
class SystemConfigViewSet(viewsets.ModelViewSet):
    """
    /api/core/configs/
    - Полный CRUD для системных настроек
    - Только для админов
    """
    queryset = SystemConfig.objects.all().order_by('key')
    serializer_class = SystemConfigSerializer
    permission_classes = [IsAdminPermission]


########################################
# ViewSet для SystemLogEntry
########################################
class SystemLogEntryViewSet(mixins.ListModelMixin,
                            mixins.RetrieveModelMixin,
                            viewsets.GenericViewSet):
    """
    /api/core/logs/
    - Только чтение системных логов
    - Только для админов
    """
    queryset = SystemLogEntry.objects.select_related('user').order_by('-timestamp')
    serializer_class = SystemLogEntrySerializer
    permission_classes = [IsAdminPermission]
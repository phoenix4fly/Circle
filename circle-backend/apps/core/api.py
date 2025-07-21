# apps/core/api.py

from rest_framework import viewsets, permissions, mixins, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
from .models import SystemConfig, SystemLogEntry
from .serializers import SystemConfigSerializer, SystemLogEntrySerializer


########################################
# Health Check Endpoint
########################################
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Простой health check endpoint для проверки статуса API
    """
    return Response({
        'status': 'ok',
        'message': 'Circle API работает корректно',
        'version': '1.0.0',
        'debug': settings.DEBUG,
        'endpoints': {
            'auth': '/api/v1/auth/',
            'users': '/api/v1/users/',
            'tours': '/api/v1/tours/',
            'communities': '/api/v1/communities/',
            'documentation': '/swagger/',
        }
    }, status=status.HTTP_200_OK)


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
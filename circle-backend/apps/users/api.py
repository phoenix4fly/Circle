from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Sphere, Specialization
from .serializers import (
    UserDetailSerializer,
    UserUpdateSerializer,
    UserShortSerializer,
    SphereSerializer,
    SpecializationSerializer,
    TelegramRegisterSerializer
)

User = get_user_model()


class SphereViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/users/spheres/
    - GET → список сфер деятельности
    """
    queryset = Sphere.objects.filter(is_active=True).order_by('name')
    serializer_class = SphereSerializer
    permission_classes = [permissions.AllowAny]


class SpecializationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/users/specializations/
    - GET → список специализаций
    - GET ?sphere={id} → фильтр по сфере
    """
    queryset = Specialization.objects.select_related('sphere').filter(is_active=True).order_by('name')
    serializer_class = SpecializationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        sphere_id = self.request.query_params.get('sphere')
        if sphere_id:
            queryset = queryset.filter(sphere_id=sphere_id)
        return queryset


class UserViewSet(viewsets.ModelViewSet):
    """
    /api/users/
    - GET → список пользователей (только для админов)
    - GET /me/ → свой профиль
    - PATCH /me/ → обновить свой профиль
    - GET /{id}/ → профиль пользователя (публичная информация)
    """
    queryset = User.objects.select_related('sphere', 'specialization').filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['me', 'retrieve']:
            return UserDetailSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserShortSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.IsAdminUser()]
        elif self.action in ['me', 'update_me']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['retrieve']:
            return [permissions.AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return self.queryset
        elif self.action == 'retrieve':
            # Публичные профили - только основная информация
            return self.queryset
        else:
            # Обычные пользователи видят только себя
            return self.queryset.filter(id=user.id)

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """
        /api/users/me/
        GET → получить свой профиль
        PATCH → обновить свой профиль
        """
        user = request.user
        
        if request.method == 'GET':
            serializer = UserDetailSerializer(user)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(UserDetailSerializer(user).data)

    @action(detail=False, methods=['get'])
    def connections(self, request):
        """
        /api/users/connections/
        - Список друзей/связей пользователя
        """
        user = request.user
        connections = user.connections.all()
        serializer = UserShortSerializer(connections, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def connect(self, request, pk=None):
        """
        /api/users/{id}/connect/
        - Добавить пользователя в друзья
        """
        target_user = self.get_object()
        current_user = request.user
        
        if target_user == current_user:
            return Response(
                {"error": "Нельзя добавить себя в друзья"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        current_user.connections.add(target_user)
        return Response({"message": "Пользователь добавлен в друзья"})

    @action(detail=True, methods=['delete'])
    def disconnect(self, request, pk=None):
        """
        /api/users/{id}/disconnect/
        - Удалить пользователя из друзей
        """
        target_user = self.get_object()
        current_user = request.user
        
        current_user.connections.remove(target_user)
        return Response({"message": "Пользователь удален из друзей"})

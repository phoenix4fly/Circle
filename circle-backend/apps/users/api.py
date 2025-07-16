from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    User, Sphere, Specialization,
    TravelStyle, TravelLocation, TripDuration
)
from .serializers import (
    UserDetailSerializer, UserShortSerializer, UserUpdateSerializer,
    SphereSerializer, SpecializationSerializer,
    TravelStyleSerializer, TravelLocationSerializer, TripDurationSerializer,
    SphereSelectionSerializer, PreferencesSelectionSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    """API для работы с пользователями"""
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        elif self.action in ['list']:
            return UserShortSerializer
        return UserDetailSerializer

    def get_queryset(self):
        if self.action == 'list':
            # Для списка показываем только активных пользователей
            return User.objects.filter(is_active=True)
        return super().get_queryset()

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """Получить или обновить свой профиль"""
        if request.method == 'GET':
            serializer = UserDetailSerializer(request.user)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = UserUpdateSerializer(
                request.user, 
                data=request.data, 
                partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(UserDetailSerializer(request.user).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['patch'])
    def select_sphere(self, request):
        """Выбор сферы деятельности (onboarding шаг 1)"""
        serializer = SphereSelectionSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Сфера деятельности сохранена',
                'user': UserDetailSerializer(request.user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['patch'])
    def select_preferences(self, request):
        """Выбор предпочтений путешествий (onboarding шаг 2)"""
        serializer = PreferencesSelectionSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Предпочтения сохранены',
                'user': UserDetailSerializer(request.user).data,
                'onboarding_completed': request.user.onboarding_completed
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SphereViewSet(viewsets.ReadOnlyModelViewSet):
    """API для сфер деятельности"""
    queryset = Sphere.objects.filter(is_active=True)
    serializer_class = SphereSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['get'])
    def specializations(self, request, pk=None):
        """Получить специализации для конкретной сферы"""
        sphere = self.get_object()
        specializations = sphere.specializations.filter(is_active=True)
        serializer = SpecializationSerializer(specializations, many=True)
        return Response(serializer.data)


class SpecializationViewSet(viewsets.ReadOnlyModelViewSet):
    """API для специализаций"""
    queryset = Specialization.objects.filter(is_active=True)
    serializer_class = SpecializationSerializer
    permission_classes = [permissions.AllowAny]


class TravelStyleViewSet(viewsets.ReadOnlyModelViewSet):
    """API для стилей отдыха"""
    queryset = TravelStyle.objects.filter(is_active=True)
    serializer_class = TravelStyleSerializer
    permission_classes = [permissions.AllowAny]


class TravelLocationViewSet(viewsets.ReadOnlyModelViewSet):
    """API для локаций"""
    queryset = TravelLocation.objects.filter(is_active=True)
    serializer_class = TravelLocationSerializer
    permission_classes = [permissions.AllowAny]


class TripDurationViewSet(viewsets.ReadOnlyModelViewSet):
    """API для форматов поездок"""
    queryset = TripDuration.objects.filter(is_active=True)
    serializer_class = TripDurationSerializer
    permission_classes = [permissions.AllowAny]

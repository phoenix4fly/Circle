from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Tour, TourCategory, TourWishlist
from .serializers import (
    TourListSerializer,
    TourDetailSerializer,
    TourCategorySerializer,
)


class TourCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/tours/categories/
    - список категорий туров для фильтра
    """
    queryset = TourCategory.objects.filter(is_active=True)
    serializer_class = TourCategorySerializer
    permission_classes = [permissions.AllowAny]





class TourViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/tours/
    - GET → список туров (витрина) с фильтрацией
    - GET /{id}/ → детальная страница тура
    
    Фильтры:
    - ?category={id} - по типу тура
    - ?destination={id} - по направлению  
    - ?price_min={amount} - минимальная цена
    - ?price_max={amount} - максимальная цена
    - ?search={text} - поиск по названию/описанию
    """
    permission_classes = [permissions.AllowAny]
    filter_backends = []  # Временно отключаем фильтры для исправления ошибки
    filterset_fields = ['type']
    search_fields = ['title', 'description']
    ordering_fields = ['price_from', 'duration_days', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = (
            Tour.objects.filter(is_active=True)
            .select_related('type', 'agency')
            .prefetch_related(
                'gallery',
                'schedule',
                'sessions',
                'parameter_values__parameter_definition',
                'participants'
            )
        )
        
        # Фильтр по цене (с поддержкой обычных Django request)
        query_params = getattr(self.request, 'query_params', self.request.GET)
        price_min = query_params.get('price_min')
        price_max = query_params.get('price_max')
        
        if price_min:
            try:
                queryset = queryset.filter(price_from__gte=float(price_min))
            except ValueError:
                pass
                
        if price_max:
            try:
                queryset = queryset.filter(price_from__lte=float(price_max))
            except ValueError:
                pass
        
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return TourListSerializer
        return TourDetailSerializer

    @action(detail=True, methods=['post', 'delete'], permission_classes=[permissions.IsAuthenticated])
    def wishlist(self, request, pk=None):
        """
        POST /api/tours/{id}/wishlist/ - добавить в планы
        DELETE /api/tours/{id}/wishlist/ - убрать из планов
        """
        tour = self.get_object()
        user = request.user

        if request.method == 'POST':
            wishlist_item, created = TourWishlist.toggle_wishlist(user, tour)
            if created:
                return Response({
                    'message': 'Тур добавлен в планы',
                    'is_wishlisted': True
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'message': 'Тур уже был в планах',
                    'is_wishlisted': False
                }, status=status.HTTP_200_OK)

        elif request.method == 'DELETE':
            deleted_count, _ = TourWishlist.objects.filter(user=user, tour=tour).delete()
            if deleted_count > 0:
                return Response({
                    'message': 'Тур удален из планов',
                    'is_wishlisted': False
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Тур не был в планах',
                    'is_wishlisted': False
                }, status=status.HTTP_404_NOT_FOUND)
    




from .models import Promotion, PromoCode
from .serializers import PromotionSerializer, PromoCodeSerializer


########################################
# Permissions
########################################
class IsAuthenticatedStaffOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


########################################
# Promotion ViewSet
########################################
class PromotionViewSet(viewsets.ModelViewSet):
    """
    /api/tours/promotions/
    - Admin видит все
    - Менеджер агентства видит только свои акции
    """
    serializer_class = PromotionSerializer
    permission_classes = [IsAuthenticatedStaffOrAdmin]
    queryset = Promotion.objects.select_related('session', 'session__tour').order_by('-created_at')

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset
        if user.is_superuser:
            return qs
        if user.is_staff and user.agency:
            return qs.filter(session__tour__agency=user.agency)
        return Promotion.objects.none()


########################################
# PromoCode ViewSet
########################################
class PromoCodeViewSet(viewsets.ModelViewSet):
    """
    /api/tours/promocodes/
    - Admin видит все
    - Менеджер агентства видит только свои промокоды
    """
    serializer_class = PromoCodeSerializer
    permission_classes = [IsAuthenticatedStaffOrAdmin]
    queryset = PromoCode.objects.select_related('session', 'session__tour').order_by('-created_at')

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset
        if user.is_superuser:
            return qs
        if user.is_staff and user.agency:
            return qs.filter(session__tour__agency=user.agency)
        return PromoCode.objects.none()


########################################
# TourWishlist ViewSet  
########################################
class TourWishlistViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/tours/wishlist/
    - GET → список запланированных туров пользователя
    - GET /{id}/ → детали запланированного тура
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return (
            TourWishlist.objects
            .filter(user=self.request.user)
            .select_related('tour', 'tour__agency', 'tour__type')
            .prefetch_related('tour__gallery', 'tour__sessions')
            .order_by('-added_at')
        )
    
    def get_serializer_class(self):
        # Пока используем существующие сериализаторы, создадим специальные позже
        if self.action == 'list':
            from .serializers import TourListSerializer
            return TourListSerializer
        from .serializers import TourDetailSerializer
        return TourDetailSerializer
    
    def list(self, request, *args, **kwargs):
        """Возвращает список запланированных туров"""
        queryset = self.get_queryset()
        
        # Извлекаем туры из wishlist объектов
        tours = [wishlist_item.tour for wishlist_item in queryset]
        
        # Добавляем метаданные wishlist
        tours_data = []
        serializer_class = self.get_serializer_class()
        
        for wishlist_item in queryset:
            tour_data = serializer_class(wishlist_item.tour, context={'request': request}).data
            tour_data['wishlist_meta'] = {
                'added_at': wishlist_item.added_at,
                'priority': wishlist_item.priority,
                'notes': wishlist_item.notes
            }
            tours_data.append(tour_data)
        
        return Response({
            'count': len(tours_data),
            'results': tours_data
        })
    
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Очистить все запланированные туры"""
        deleted_count, _ = self.get_queryset().delete()
        return Response({
            'message': f'Удалено {deleted_count} запланированных туров',
            'deleted_count': deleted_count
        })
    
    @action(detail=True, methods=['patch'])
    def update_priority(self, request, pk=None):
        """Обновить приоритет запланированного тура"""
        try:
            wishlist_item = self.get_queryset().get(pk=pk)
        except TourWishlist.DoesNotExist:
            return Response({
                'error': 'Запланированный тур не найден'
            }, status=status.HTTP_404_NOT_FOUND)
        
        priority = request.data.get('priority')
        notes = request.data.get('notes')
        
        if priority is not None:
            if priority in [1, 2, 3]:
                wishlist_item.priority = priority
            else:
                return Response({
                    'error': 'Приоритет должен быть 1, 2 или 3'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        if notes is not None:
            wishlist_item.notes = notes
        
        wishlist_item.save()
        
        return Response({
            'message': 'Запланированный тур обновлен',
            'priority': wishlist_item.priority,
            'notes': wishlist_item.notes
        })
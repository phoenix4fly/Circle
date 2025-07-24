from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Tour, TourCategory
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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
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
        
        # Фильтр по цене
        price_min = self.request.query_params.get('price_min')
        price_max = self.request.query_params.get('price_max')
        
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
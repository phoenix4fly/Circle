from rest_framework.routers import DefaultRouter
from .api import TourViewSet, TourCategoryViewSet, TourWishlistViewSet
from .api import PromotionViewSet, PromoCodeViewSet

router = DefaultRouter()
router.register(r'tours', TourViewSet, basename='tour')
router.register(r'categories', TourCategoryViewSet, basename='tour-category')
router.register(r'wishlist', TourWishlistViewSet, basename='tour-wishlist')

router.register(r'promotions', PromotionViewSet, basename='promotion')
router.register(r'promocodes', PromoCodeViewSet, basename='promocode')

urlpatterns = router.urls


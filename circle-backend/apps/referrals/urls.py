from rest_framework.routers import DefaultRouter
from . import api

router = DefaultRouter()
# Когда создадим ViewSets, добавим их здесь
# router.register(r'partners', api.ReferralPartnerViewSet, basename='referral-partner')

urlpatterns = router.urls
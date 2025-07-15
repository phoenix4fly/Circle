from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .api import (
    ReferralPartnerViewSet,
    ReferralBonusViewSet,
    WithdrawalRequestViewSet
)

router = DefaultRouter()
router.register(r'partners', ReferralPartnerViewSet, basename='referral-partner')
router.register(r'bonuses', ReferralBonusViewSet, basename='referral-bonus')
router.register(r'withdrawals', WithdrawalRequestViewSet, basename='withdrawal-request')

urlpatterns = [
    path('', include(router.urls)),
]
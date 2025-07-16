from rest_framework.routers import DefaultRouter
from . import api

router = DefaultRouter()
router.register(r'partners', api.ReferralPartnerViewSet, basename='referral-partner')
router.register(r'bonuses', api.ReferralBonusViewSet, basename='referral-bonus')
router.register(r'withdrawals', api.WithdrawalRequestViewSet, basename='withdrawal-request')

urlpatterns = router.urls
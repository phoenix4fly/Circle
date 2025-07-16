from rest_framework.routers import DefaultRouter
from . import api

router = DefaultRouter()
router.register(r'transactions', api.PaymentTransactionViewSet, basename='payment-transaction')
router.register(r'accounting', api.AccountingTransactionViewSet, basename='accounting-transaction')

urlpatterns = router.urls
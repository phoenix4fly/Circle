from rest_framework.routers import DefaultRouter
from .api import PaymentTransactionViewSet, AccountingTransactionViewSet

router = DefaultRouter()
router.register(r'transactions', PaymentTransactionViewSet, basename='paymenttransaction')
router.register(r'accounting', AccountingTransactionViewSet, basename='accountingtransaction')

urlpatterns = router.urls
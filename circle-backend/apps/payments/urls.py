from rest_framework.routers import DefaultRouter
from . import api

router = DefaultRouter()
# Когда создадим ViewSets, добавим их здесь
# router.register(r'transactions', api.PaymentTransactionViewSet, basename='payment-transaction')

urlpatterns = router.urls
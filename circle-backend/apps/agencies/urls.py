from rest_framework.routers import DefaultRouter
from . import api

router = DefaultRouter()
router.register(r'agencies', api.TravelAgencyViewSet, basename='agency')
# router.register(r'reviews', api.AgencyReviewViewSet, basename='agency-review')

urlpatterns = router.urls
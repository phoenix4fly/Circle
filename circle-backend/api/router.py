from django.urls import path, include

urlpatterns = [
    # Основные API endpoints
    path('users/', include('apps.users.urls')),           # /api/users/
    path('tours/', include('apps.tours.urls')),           # /api/tours/
    path('bookings/', include('apps.bookings.urls')),     # /api/bookings/
    path('agencies/', include('apps.agencies.urls')),     # /api/agencies/
    path('payments/', include('apps.payments.urls')),     # /api/payments/
    path('referrals/', include('apps.referrals.urls')),   # /api/referrals/
    path('media/', include('apps.media.urls')),           # /api/media/
    path('custom-trips/', include('apps.custom_trips.urls')),  # /api/custom-trips/
    path('core/', include('apps.core.urls')),             # /api/core/
    path('communities/', include('apps.communities.urls')), # /api/communities/
]

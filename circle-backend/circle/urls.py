from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

# API Documentation
schema_view = get_schema_view(
    openapi.Info(
        title="Circle API",
        default_version='v1',
        description="API для платформы Circle - путешествия с единомышленниками",
        contact=openapi.Contact(email="dev@circle.uz"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

# API Router
api_router = DefaultRouter()

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/schema/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    
    # API Endpoints
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/tours/', include('apps.tours.urls')),
    path('api/v1/bookings/', include('apps.bookings.urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/agencies/', include('apps.agencies.urls')),
    path('api/v1/referrals/', include('apps.referrals.urls')),
    path('api/v1/communities/', include('apps.communities.urls')),
    path('api/v1/custom-trips/', include('apps.custom_trips.urls')),
    path('api/v1/media/', include('apps.media.urls')),
    path('api/v1/core/', include('apps.core.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Debug Toolbar
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns

# Custom Admin Site Header
admin.site.site_header = "Circle Admin"
admin.site.site_title = "Circle Admin Portal"
admin.site.index_title = "Добро пожаловать в Circle Admin"

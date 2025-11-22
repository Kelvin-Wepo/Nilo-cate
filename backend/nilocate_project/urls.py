"""
URL configuration for nilocate_project project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

from users.views import UserViewSet
from trees.views import TreeSpeciesViewSet, TreeViewSet, TreeAdoptionViewSet, AdoptionRequestViewSet, PaymentViewSet
from monitoring.views import TreeReportViewSet, AlertViewSet, IncidentReportViewSet, mpesa_callback
from monitoring.sms_handlers import sms_webhook, ussd_webhook

# API Router
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'species', TreeSpeciesViewSet)
router.register(r'trees', TreeViewSet)
router.register(r'adoptions', TreeAdoptionViewSet)
router.register(r'adoption-requests', AdoptionRequestViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'reports', TreeReportViewSet)
router.register(r'incidents', IncidentReportViewSet)
router.register(r'alerts', AlertViewSet)

# Swagger/OpenAPI documentation
schema_view = get_schema_view(
    openapi.Info(
        title="Nilocate API",
        default_version='v1',
        description="API for Nilocate - Endangered Tree Conservation Platform",
        contact=openapi.Contact(email="info@nilocate.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include(router.urls)),
    path('api/', include('campaigns.urls')),
    
    # Authentication
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # SMS/USSD webhooks (public endpoints for Africa's Talking)
    path('api/sms/webhook/', sms_webhook, name='sms_webhook'),
    path('api/ussd/webhook/', ussd_webhook, name='ussd_webhook'),
    
    # M-Pesa callback (public endpoint for Safaricom)
    path('api/mpesa/callback/', mpesa_callback, name='mpesa_callback'),
    
    # API documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import (
    api_root,
    CustomObtainAuthToken,
    me,
    logout,
    password_reset_request,
    password_reset_confirm,
    UserViewSet
)
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Initialize DefaultRouter and register UserViewSet
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

# Swagger/OpenAPI schema setup
schema_view = get_schema_view(
    openapi.Info(
        title="Shining Smiles API",
        default_version='v1',
        description="API documentation for Shining Smiles College backend",
        terms_of_service="https://www.shiningsmiles.edu",
        contact=openapi.Contact(email="support@shiningsmiles.edu"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', api_root, name='api-root'),  # Root API info
    
    # Authentication endpoints
    path('api/v1/auth/login/', CustomObtainAuthToken.as_view(), name='api-token-login'),
    path('api/v1/auth/logout/', logout, name='api-logout'),
    path('api/v1/auth/me/', me, name='api-me'),
    path('api/v1/auth/password-reset/', password_reset_request, name='api-password-reset'),
    path('api/v1/auth/password-reset/confirm/', password_reset_confirm, name='api-password-reset-confirm'),

    # App endpoints
    path('api/v1/students/', include('students.urls')),
    path('api/v1/payments/', include('payments.urls')),
    path('api/v1/agents/', include('agents.urls')),
    path('api/v1/reports/', include('reports.urls')),
    path('api/v1/notifications/', include('notifications.urls')),

    # Swagger/OpenAPI
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/openapi/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
]

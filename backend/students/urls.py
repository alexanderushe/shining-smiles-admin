from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, CampusViewSet

router = DefaultRouter()
router.register(r'', StudentViewSet, basename='student')
router.register(r'campuses', CampusViewSet, basename='campus')

urlpatterns = [
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, CampusViewSet

router = DefaultRouter()
router.register(r'campuses', CampusViewSet)
router.register(r'', StudentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

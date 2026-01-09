from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AgentActionViewSet

router = DefaultRouter()
router.register(r'actions', AgentActionViewSet, basename='action')

urlpatterns = [
    path('', include(router.urls)),
]

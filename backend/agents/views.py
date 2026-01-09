from rest_framework import viewsets, permissions
from .models import AgentAction
from .serializers import AgentActionSerializer

class AgentActionViewSet(viewsets.ModelViewSet):
    serializer_class = AgentActionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return actions for the user's school
        if hasattr(self.request.user, 'profile'):
            return AgentAction.objects.filter(school=self.request.user.profile.school).order_by('-priority', '-created_at')
        return AgentAction.objects.none()

    def perform_create(self, serializer):
        # Allow manual creation for testing, assign school
        if hasattr(self.request.user, 'profile'):
            serializer.save(school=self.request.user.profile.school)

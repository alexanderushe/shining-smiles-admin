from rest_framework import generics
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(generics.ListAPIView):
    queryset = Notification.objects.all().order_by('-sent_at')
    serializer_class = NotificationSerializer

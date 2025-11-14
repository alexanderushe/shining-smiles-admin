from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='recipient.first_name', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'recipient_name', 'type', 'template', 'sent_at', 'status']

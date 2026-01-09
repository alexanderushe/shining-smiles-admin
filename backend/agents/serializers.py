from rest_framework import serializers
from .models import AgentAction

class AgentActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentAction
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'agent_name', 'action_payload', 'school_id']  # Agents create these, humans just read/act

    def create(self, validated_data):
        # Override to ensure school is set from context if needed, but agents usually run as tasks.
        # This serializer is mostly for the frontend to consume.
        # But if we POST from an external agent (webhook), we might need logic.
        return super().create(validated_data)

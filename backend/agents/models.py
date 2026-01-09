from django.db import models
from core.models import School

class AgentAction(models.Model):
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='agent_actions')
    agent_name = models.CharField(max_length=50)  # e.g. "BursarBot"
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    action_payload = models.JSONField(default=dict, blank=True)  # Context data
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.agent_name}] {self.title}"

from django.db import models
from students.models import Student

class Notification(models.Model):
    TYPE_CHOICES = [
        ('sms', 'SMS'),
        ('email', 'Email'),
        ('whatsapp', 'WhatsApp')
    ]

    recipient = models.ForeignKey(Student, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    template = models.TextField()
    sent_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')

    def __str__(self):
        return f"{self.type} to {self.recipient.student_number}"

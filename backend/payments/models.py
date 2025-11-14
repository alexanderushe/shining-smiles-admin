from django.db import models
from students.models import Student

class Payment(models.Model):
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('posted', 'Posted'),
        ('voided', 'Voided')
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    receipt_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=10, choices=PAYMENT_STATUS, default='pending')
    date = models.DateField(auto_now_add=True)
    cashier_name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.student.student_number} - {self.receipt_number}"

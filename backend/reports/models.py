from django.db import models
from students.models import Student
from payments.models import Payment
from django.contrib.auth.models import User

class Statement(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('finalized', 'Finalized'),
        ('sent', 'Sent'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    term = models.CharField(max_length=50)
    generation_date = models.DateField(auto_now_add=True)
    total_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')

    def __str__(self):
        return f"Statement {self.student.student_number} - {self.term}"

class StatementTransaction(models.Model):
    statement = models.ForeignKey(Statement, related_name='transactions', on_delete=models.CASCADE)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, null=True, blank=True)
    description = models.CharField(max_length=255)
    fees_levies = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payments = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    due_date = models.DateField()

    def __str__(self):
        return f"{self.statement.student.student_number} - {self.description}"

class Reconciliation(models.Model):
    cashier = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    expected_total = models.DecimalField(max_digits=10, decimal_places=2)
    actual_amount = models.DecimalField(max_digits=10, decimal_places=2)
    variance = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=[('balanced','Balanced'),('short','Short'),('over','Over')])
    notes = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.cashier.username} {self.date} {self.status}"

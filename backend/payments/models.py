from django.db import models
from students.models import Student
from django.contrib.auth.models import User
from django.db.models import UniqueConstraint

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
    term = models.CharField(max_length=10, choices=[('1','Term 1'),('2','Term 2'),('3','Term 3')])
    academic_year = models.IntegerField()
    
    # New fields for enhanced payment details
    fee_type = models.CharField(max_length=50, choices=[
        ('Tuition', 'Tuition'),
        ('Transport', 'Transport'),
        ('Boarding', 'Boarding'),
        ('Registration', 'Registration'),
        ('Other', 'Other')
    ], default='Tuition')
    reference_id = models.CharField(max_length=100, blank=True, null=True)
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    merchant_provider = models.CharField(max_length=100, blank=True, null=True)
    
    # Void tracking fields
    void_reason = models.TextField(blank=True, null=True, help_text='Reason for voiding this payment')
    voided_at = models.DateTimeField(blank=True, null=True, help_text='When this payment was voided')
    voided_by = models.CharField(max_length=100, blank=True, null=True, help_text='User who voided this payment')

    def __str__(self):
        return f"{self.student.student_number} - {self.receipt_number}"

    class Meta:
        constraints = [
            UniqueConstraint(fields=['term','academic_year','receipt_number'], name='unique_receipt_per_term_year')
        ]

class Profile(models.Model):
    class Role(models.TextChoices):
        CASHIER = 'cashier', 'Cashier'
        ACCOUNTANT = 'accountant', 'Accountant'
        ADMIN = 'admin', 'Admin'
        AUDITOR = 'auditor', 'Auditor'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=Role.choices)

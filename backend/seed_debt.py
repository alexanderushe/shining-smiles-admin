import os
import django
from datetime import date

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from core.models import School
from students.models import Student, Campus
from payments.models import Payment

def seed_debt():
    school = School.objects.get(code='SSA')
    
    # Ensure Campus exists
    campus, _ = Campus.objects.get_or_create(
        school=school,
        code='MAIN',
        defaults={'name': 'Main Campus', 'location': 'Harare'}
    )
    
    # Create delinquent student
    student, created = Student.objects.get_or_create(
        student_number='S24001',
        school=school,
        defaults={
            'first_name': 'Michael',
            'last_name': 'Jordan',
            'current_grade': '5',
            'dob': '2014-01-01',
            'campus': campus
        }
    )
    
    # Simulate a "Tuition" charge (In a real system, we'd have an Invoice model, 
    # but here we might just infer debt from expected fees vs payments.
    # For this simplified agent, let's assume we check against a fixed term fee of $500).
    
    # Record a partial payment
    Payment.objects.create(
        school=school,
        student=student,
        amount=100.00,
        payment_method='cash',
        receipt_number='REC-SEED-01',
        status='posted',
        term='1',
        academic_year=2024,
        fee_type='Tuition'
    )
    
    print(f"Seeded Student {student.first_name} {student.last_name} with $100 payment (Target: $500)")

if __name__ == "__main__":
    seed_debt()

from core.wsgi import application
from students.models import Student, Campus

def run():
    # Ensure a campus exists
    campus, _ = Campus.objects.get_or_create(
        name="Main Campus", 
        defaults={"location": "123 Main St", "code": "MAIN"}
    )
    
    # Create test student for the user
    s1, created = Student.objects.get_or_create(
        student_number="ssc123456",
        defaults={
            "first_name": "Test",
            "last_name": "Student",
            "dob": "2010-01-01",
            "campus": campus,
            "current_grade": "Grade 1"
        }
    )
    if created:
        print(f"Created student: {s1.student_number}")
    else:
        print(f"Student already exists: {s1.student_number}")

    # Create another one
    s2, created = Student.objects.get_or_create(
        student_number="ssc999999",
        defaults={
            "first_name": "Jane",
            "last_name": "Doe",
            "dob": "2011-05-05",
            "campus": campus,
            "current_grade": "Grade 2"
        }
    )
    if created:
        print(f"Created student: {s2.student_number}")

if __name__ == "__main__":
    run()

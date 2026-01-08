from django.db import models
from django.db.models import UniqueConstraint

class Campus(models.Model):
    school = models.ForeignKey(
        'core.School',
        on_delete=models.CASCADE,
        related_name='campuses',
        null=True,  # Temporary for migration
        help_text="School this campus belongs to"
    )
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    code = models.CharField(max_length=50)  # No longer globally unique

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=['school', 'code'],
                name='unique_campus_code_per_school'
            )
        ]
        verbose_name = 'Campus'
        verbose_name_plural = 'Campuses'

    def __str__(self):
        return f"{self.name} ({self.school.code})"

class Student(models.Model):
    school = models.ForeignKey(
        'core.School',
        on_delete=models.CASCADE,
        related_name='students',
        null=True,  # Temporary for migration
        help_text="School this student belongs to"
    )
    student_number = models.CharField(max_length=50)  # No longer globally unique
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    dob = models.DateField()
    current_grade = models.CharField(max_length=50)
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=['school', 'student_number'],
                name='unique_student_number_per_school'
            )
        ]
        ordering = ['student_number']

    def __str__(self):
        return f"{self.student_number} - {self.first_name} {self.last_name}"

from django.db import models

class Campus(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Student(models.Model):
    student_number = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    dob = models.DateField()
    current_grade = models.CharField(max_length=50)
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.student_number} - {self.first_name} {self.last_name}"

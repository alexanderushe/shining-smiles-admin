from rest_framework import serializers
from .models import Student, Campus

class CampusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campus
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    campus = CampusSerializer(read_only=True)
    campus_id = serializers.PrimaryKeyRelatedField(queryset=Campus.objects.all(), source='campus', write_only=True)

    class Meta:
        model = Student
        fields = ['id', 'student_number', 'first_name', 'last_name', 'dob', 'current_grade', 'campus', 'campus_id']

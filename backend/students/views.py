from rest_framework import viewsets, filters 
from django.db.models import Q
from .models import Student, Campus
from .serializers import StudentSerializer, CampusSerializer
from core.permissions import IsCashier

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [IsCashier]
    filter_backends = [filters.SearchFilter]
    search_fields = ['student_number', 'first_name', 'last_name']

    def get_queryset(self):
        # Filter by current user's school for multi-tenant isolation
        if self.request.user.is_authenticated and hasattr(self.request.user, 'profile'):
            school = self.request.user.profile.school
            qs = Student.objects.filter(school=school)
        else:
            # No school context - return empty queryset
            qs = Student.objects.none()
        
        # Custom search for typeahead - combines multiple fields
        search = self.request.query_params.get('search', None)
        if search:
            qs = qs.filter(
                Q(student_number__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        return qs
    
    def perform_create(self, serializer):
        # Automatically assign school when creating new student
        if self.request.user.is_authenticated and hasattr(self.request.user, 'profile'):
            serializer.save(school=self.request.user.profile.school)

class CampusViewSet(viewsets.ModelViewSet):
    serializer_class = CampusSerializer
    
    def get_queryset(self):
        # Filter by current user's school for multi-tenant isolation
        if self.request.user.is_authenticated and hasattr(self.request.user, 'profile'):
            return Campus.objects.filter(school=self.request.user.profile.school)
        return Campus.objects.none()
    
    def perform_create(self, serializer):
        # Automatically assign school when creating new campus
        if self.request.user.is_authenticated and hasattr(self.request.user, 'profile'):
            serializer.save(school=self.request.user.profile.school)

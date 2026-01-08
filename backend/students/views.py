from rest_framework import viewsets, filters
from django.db.models import Q
from .models import Student, Campus
from .serializers import StudentSerializer, CampusSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['student_number', 'first_name', 'last_name']

    def get_queryset(self):
        qs = super().get_queryset()
        # Custom search for typeahead - combines multiple fields
        search = self.request.query_params.get('search', None)
        if search:
            qs = qs.filter(
                Q(student_number__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        return qs

class CampusViewSet(viewsets.ModelViewSet):
    queryset = Campus.objects.all()
    serializer_class = CampusSerializer

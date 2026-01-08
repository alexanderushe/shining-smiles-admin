# reports/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from students.models import Student
from payments.models import Payment
from django.contrib.auth.models import User
from django.db.models import Sum, Count
from .models import Reconciliation, Statement
from .serializers_recon import ReconciliationSerializer
from .serializers import StatementSerializer
from core.permissions import IsAuditor

class ReportSummaryView(APIView):
    permission_classes = [IsAuditor]
    def get(self, request, id=None):
        try:
            student = Student.objects.get(id=id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        payments = Payment.objects.filter(student=student).exclude(status='voided')
        total_paid = sum(p.amount for p in payments)

        data = {
            "student": {
                "id": student.id,
                "student_number": student.student_number,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "campus": student.campus.name,
                "current_grade": student.current_grade,
            },
            "payments": [
                {
                    "id": p.id,
                    "amount": float(p.amount),
                    "payment_method": p.payment_method,
                    "receipt_number": p.receipt_number,
                    "status": p.status,
                    "date": p.date,
                    "cashier_name": p.cashier_name,
                }
                for p in payments
            ],
            "total_paid": float(total_paid),
        }

        return Response(data)

class CashierDailyView(APIView):
    permission_classes = [IsAuditor]
    def get(self, request):
        date_str = request.GET.get('date')
        cashier_id = request.GET.get('cashier_id')
        if not date_str or not cashier_id:
            return Response({'error': 'date and cashier_id are required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=int(cashier_id))
            cashier_name = user.get_full_name() or user.username
        except User.DoesNotExist:
            return Response({'error': 'Cashier not found'}, status=status.HTTP_404_NOT_FOUND)

        qs = Payment.objects.filter(date=date_str, cashier_name=cashier_name).exclude(status='voided')
        total = qs.aggregate(total=Sum('amount'))['total'] or 0
        count = qs.aggregate(count=Count('id'))['count'] or 0
        methods = list(qs.values('payment_method').annotate(total=Sum('amount'), count=Count('id')))
        return Response({'date': date_str, 'cashier_id': int(cashier_id), 'cashier_name': cashier_name, 'total': float(total), 'count': count, 'by_method': methods})

class TermSummaryView(APIView):
    permission_classes = [IsAuditor]
    def get(self, request):
        term = request.GET.get('term')
        year = request.GET.get('year')
        if not term or not year:
            return Response({'error': 'term and year are required'}, status=status.HTTP_400_BAD_REQUEST)
        qs = Payment.objects.filter(term=str(term), academic_year=int(year), status='posted')
        total = qs.aggregate(total=Sum('amount'))['total'] or 0
        count = qs.aggregate(count=Count('id'))['count'] or 0
        methods = list(qs.values('payment_method').annotate(total=Sum('amount'), count=Count('id')))
        return Response({'term': str(term), 'year': int(year), 'total': float(total), 'count': count, 'by_method': methods})

class StudentBalanceView(APIView):
    permission_classes = [IsAuditor]
    def get(self, request):
        student_id = request.GET.get('student_id')
        if not student_id:
            return Response({'error': 'student_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            student = Student.objects.get(id=int(student_id))
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        payments = Payment.objects.filter(student=student).exclude(status='voided')
        total_paid = payments.aggregate(total=Sum('amount'))['total'] or 0
        # Placeholder for fees/levies aggregation (not modeled here)
        total_fees = 0
        balance = float(total_fees) - float(total_paid)
        return Response({'student_id': student.id, 'student_number': student.student_number, 'total_paid': float(total_paid), 'total_fees': float(total_fees), 'balance': float(balance)})

class ReconciliationView(APIView):
    permission_classes = [IsAuditor]
    def get(self, request):
        date_str = request.GET.get('date')
        cashier_id = request.GET.get('cashier_id')
        qs = Reconciliation.objects.all()
        if date_str:
            qs = qs.filter(date=date_str)
        if cashier_id:
            qs = qs.filter(cashier_id=int(cashier_id))
        # Add school filtering
        if request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.school:
            qs = qs.filter(school=request.user.profile.school)

        serializer = ReconciliationSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ReconciliationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        # Add school to reconciliation if user is authenticated and has a profile/school
        if request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.school:
            rec = serializer.save(school=request.user.profile.school)
        else:
            rec = serializer.save()
        return Response(ReconciliationSerializer(rec).data, status=status.HTTP_201_CREATED)

class StatementViewSet(viewsets.ModelViewSet):
    serializer_class = StatementSerializer
    permission_classes = [IsAuditor]
    
    def get_queryset(self):
        # Filter by current user's school
        if self.request.user.is_authenticated and hasattr(self.request.user, 'profile') and self.request.user.profile.school:
            return Statement.objects.filter(school=self.request.user.profile.school)
        return Statement.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated and hasattr(self.request.user, 'profile') and self.request.user.profile.school:
            serializer.save(school=self.request.user.profile.school)
        else:
            serializer.save()


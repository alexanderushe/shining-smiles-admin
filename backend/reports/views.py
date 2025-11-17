# reports/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from students.models import Student
from payments.models import Payment
from django.contrib.auth.models import User
from django.db.models import Sum, Count
from .models import Reconciliation
from .serializers_recon import ReconciliationSerializer
from core.permissions import ReconciliationWritePermission

class ReportSummaryView(APIView):
    def get(self, request, id=None):
        try:
            student = Student.objects.get(id=id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        payments = Payment.objects.filter(student=student)
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

        qs = Payment.objects.filter(date=date_str, cashier_name=cashier_name)
        total = qs.aggregate(total=Sum('amount'))['total'] or 0
        count = qs.aggregate(count=Count('id'))['count'] or 0
        methods = list(qs.values('payment_method').annotate(total=Sum('amount'), count=Count('id')))
        return Response({'date': date_str, 'cashier_id': int(cashier_id), 'cashier_name': cashier_name, 'total': float(total), 'count': count, 'by_method': methods})

class TermSummaryView(APIView):
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
    def get(self, request):
        student_id = request.GET.get('student_id')
        if not student_id:
            return Response({'error': 'student_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            student = Student.objects.get(id=int(student_id))
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        payments = Payment.objects.filter(student=student)
        total_paid = payments.aggregate(total=Sum('amount'))['total'] or 0
        # Placeholder for fees/levies aggregation (not modeled here)
        total_fees = 0
        balance = float(total_fees) - float(total_paid)
        return Response({'student_id': student.id, 'student_number': student.student_number, 'total_paid': float(total_paid), 'total_fees': float(total_fees), 'balance': float(balance)})

class ReconciliationView(APIView):
    permission_classes = [ReconciliationWritePermission]
    def get(self, request):
        date_str = request.GET.get('date')
        cashier_id = request.GET.get('cashier_id')
        qs = Reconciliation.objects.all()
        if date_str:
            qs = qs.filter(date=date_str)
        if cashier_id:
            qs = qs.filter(cashier_id=int(cashier_id))
        serializer = ReconciliationSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ReconciliationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        rec = serializer.save()
        return Response(ReconciliationSerializer(rec).data, status=status.HTTP_201_CREATED)

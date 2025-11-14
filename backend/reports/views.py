# reports/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from students.models import Student
from payments.models import Payment

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

import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from students.models import Student, Campus
from payments.models import Payment
from datetime import date

@pytest.mark.django_db
def test_cashier_daily_report():
    client = APIClient()
    campus = Campus.objects.create(name="C", location="L", code="C1")
    student = Student.objects.create(student_number="S1", first_name="A", last_name="B", dob=date(2008,1,1), current_grade="G9", campus=campus)
    cashier = User.objects.create_user(username="cashierx", password="pass")
    cashier_name = cashier.get_full_name() or cashier.username
    Payment.objects.create(student=student, amount=50, payment_method="Cash", receipt_number="RX1", status="posted", cashier_name=cashier_name, term="1", academic_year=date.today().year)
    Payment.objects.create(student=student, amount=25, payment_method="Card", receipt_number="RX2", status="posted", cashier_name=cashier_name, term="1", academic_year=date.today().year)
    res = client.get(f"/api/v1/reports/cashier-daily/?date={date.today()}&cashier_id={cashier.id}")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data and float(data["total"]) >= 75.0

@pytest.mark.django_db
def test_cashier_daily_invalid_id():
    client = APIClient()
    res = client.get(f"/api/v1/reports/cashier-daily/?date={date.today()}&cashier_id=999999")
    assert res.status_code == 404

@pytest.mark.django_db
def test_reconciliation_expected_total_auto():
    client = APIClient()
    campus = Campus.objects.create(name="C2", location="L2", code="C2")
    student = Student.objects.create(student_number="S2", first_name="Tom", last_name="Lee", dob=date(2008,2,2), current_grade="G9", campus=campus)
    cashier = User.objects.create_user(username="cashier2", password="pass")
    client.force_authenticate(user=cashier)
    cashier_name = cashier.get_full_name() or cashier.username
    today = date.today()
    Payment.objects.create(student=student, amount=10, payment_method="Cash", receipt_number="RX3", status="posted", cashier_name=cashier_name, term="1", academic_year=today.year)
    Payment.objects.create(student=student, amount=5, payment_method="Cash", receipt_number="RX4", status="posted", cashier_name=cashier_name, term="1", academic_year=today.year)
    res = client.post("/api/v1/reports/reconciliation/", {"date": str(today), "actual_amount": "14.00"}, format="json")
    assert res.status_code == 201
    data = res.json()
    assert float(data["expected_total"]) == 15.0
    assert data["status"] in ["balanced","short","over"]

@pytest.mark.django_db
def test_reconciliation_uses_request_user_when_missing_cashier_id():
    client = APIClient()
    campus = Campus.objects.create(name="C3", location="L3", code="C3")
    student = Student.objects.create(student_number="S3", first_name="Ann", last_name="Ray", dob=date(2008,3,3), current_grade="G9", campus=campus)
    user = User.objects.create_user(username="cashier3", password="pass")
    client.force_authenticate(user=user)
    cashier_name = user.get_full_name() or user.username
    today = date.today()
    Payment.objects.create(student=student, amount=20, payment_method="Cash", receipt_number="RX5", status="posted", cashier_name=cashier_name, term="1", academic_year=today.year)
    res = client.post("/api/v1/reports/reconciliation/", {"date": str(today), "actual_amount": 19.00}, format="json")
    assert res.status_code == 201
    data = res.json()
    assert float(data["expected_total"]) == 20.0

@pytest.mark.django_db
def test_term_summary_missing_params():
    client = APIClient()
    res = client.get("/api/v1/reports/term-summary/")
    assert res.status_code == 400

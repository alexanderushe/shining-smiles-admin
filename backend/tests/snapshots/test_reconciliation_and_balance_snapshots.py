import pytest
from datetime import date
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from students.models import Student, Campus
from payments.models import Payment


@pytest.mark.django_db
def test_reconciliation_list_snapshot(snapshot):
    client = APIClient()
    campus = Campus.objects.create(name="C4", location="L4", code="C4")
    student = Student.objects.create(student_number="SN4", first_name="X", last_name="Y", dob=date(2008, 4, 4), current_grade="G9", campus=campus)
    user = User.objects.create_user(username="snap_rec", password="x")
    client.force_authenticate(user=user)
    name = user.get_full_name() or user.username
    today = date.today()
    Payment.objects.create(student=student, amount=9, payment_method="Cash", receipt_number="RC1", status="posted", cashier_name=name, term="1", academic_year=today.year)
    Payment.objects.create(student=student, amount=6, payment_method="Cash", receipt_number="RC2", status="posted", cashier_name=name, term="1", academic_year=today.year)
    res = client.post("/api/v1/reports/reconciliation/", {"date": str(today), "actual_amount": "15.00"}, format="json")
    assert res.status_code == 201
    res = client.get("/api/v1/reports/reconciliation/")
    assert res.status_code == 200
    data = res.json()
    for item in data:
        item["expected_total"] = float(item.get("expected_total", 0))
        item["variance"] = float(item.get("variance", 0))
    snapshot.assert_match(sorted(data, key=lambda x: x.get("id", 0)))


@pytest.mark.django_db
def test_student_balance_snapshot(snapshot):
    client = APIClient()
    campus = Campus.objects.create(name="C5", location="L5", code="C5")
    student = Student.objects.create(student_number="SN5", first_name="P", last_name="Q", dob=date(2008, 5, 5), current_grade="G9", campus=campus)
    user = User.objects.create_user(username="snap_bal", password="x")
    name = user.get_full_name() or user.username
    year = date.today().year
    Payment.objects.create(student=student, amount=30, payment_method="Cash", receipt_number="SB1", status="posted", cashier_name=name, term="1", academic_year=year)
    Payment.objects.create(student=student, amount=20, payment_method="Card", receipt_number="SB2", status="posted", cashier_name=name, term="1", academic_year=year)
    res = client.get(f"/api/v1/reports/student-balance/?student_id={student.id}")
    assert res.status_code == 200
    data = res.json()
    snapshot.assert_match({
        "student_id": data.get("student_id"),
        "student_number": data.get("student_number"),
        "total_paid": float(data.get("total_paid", 0)),
        "total_fees": float(data.get("total_fees", 0)),
        "balance": float(data.get("balance", 0)),
    })
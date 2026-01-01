import pytest
from datetime import date
import json
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from payments.models import Payment
from students.models import Student, Campus


def normalize_daily(data):
    m = sorted(data.get("by_method", []), key=lambda x: x.get("payment_method", ""))
    return {"date": data.get("date"), "cashier_name": data.get("cashier_name"), "total": float(data.get("total", 0)), "count": data.get("count", 0), "by_method": m}


@pytest.mark.django_db
def test_cashier_daily_snapshot(snapshot):
    client = APIClient()
    campus = Campus.objects.create(name="S1", location="L1", code="S1")
    student = Student.objects.create(student_number="SN1", first_name="F", last_name="L", dob=date(2008, 1, 1), current_grade="G9", campus=campus)
    user = User.objects.create_user(username="snap_cashier", password="x")
    name = user.get_full_name() or user.username
    today = date.today()
    Payment.objects.create(student=student, amount=12, payment_method="Cash", receipt_number="SP1", status="posted", cashier_name=name, term="1", academic_year=today.year)
    Payment.objects.create(student=student, amount=8, payment_method="Card", receipt_number="SP2", status="posted", cashier_name=name, term="1", academic_year=today.year)
    res = client.get(f"/api/v1/reports/cashier-daily/?date={today}&cashier_id={user.id}")
    assert res.status_code == 200
    snapshot.assert_match(json.dumps(normalize_daily(res.json()), indent=2, sort_keys=True), "cashier_daily.json")


@pytest.mark.django_db
def test_term_summary_snapshot(snapshot):
    client = APIClient()
    campus = Campus.objects.create(name="S2", location="L2", code="S2")
    student = Student.objects.create(student_number="SN2", first_name="A", last_name="B", dob=date(2008, 2, 2), current_grade="G9", campus=campus)
    user = User.objects.create_user(username="snap2", password="x")
    name = user.get_full_name() or user.username
    year = date.today().year
    Payment.objects.create(student=student, amount=20, payment_method="Cash", receipt_number="SP3", status="posted", cashier_name=name, term="1", academic_year=year)
    res = client.get(f"/api/v1/reports/term-summary/?term=1&year={year}")
    assert res.status_code == 200
    data = res.json()
    data["by_method"] = sorted(data.get("by_method", []), key=lambda x: x.get("payment_method", ""))
    snapshot.assert_match(json.dumps(data, indent=2, sort_keys=True), "term_summary.json")
import pytest
from datetime import date
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory
from payments.models import Payment
from reports.serializers import ReportSerializer
from reports.serializers_recon import ReconciliationSerializer
from tests.factories import StudentFactory, UserFactory


@pytest.mark.django_db
def test_report_serializer_outputs_transactions():
    student = StudentFactory()
    Payment.objects.create(student=student, amount=10, payment_method="Cash", receipt_number="A1", status="posted", cashier_name="C1", term="1", academic_year=date.today().year)
    Payment.objects.create(student=student, amount=5, payment_method="Card", receipt_number="A2", status="pending", cashier_name="C1", term="1", academic_year=date.today().year)
    s = ReportSerializer(student)
    data = s.data
    assert data["id"] == student.id
    assert "name" in data
    assert isinstance(data["transactions"], list)
    assert len(data["transactions"]) >= 2


@pytest.mark.django_db
def test_reconciliation_expected_total_multi_cashier():
    user_a = UserFactory(username="cashier_a")
    user_b = UserFactory(username="cashier_b")
    name_a = user_a.get_full_name() or user_a.username
    name_b = user_b.get_full_name() or user_b.username
    student = StudentFactory()
    today = date.today()
    Payment.objects.create(student=student, amount=10, payment_method="Cash", receipt_number="B1", status="posted", cashier_name=name_a, term="1", academic_year=today.year)
    Payment.objects.create(student=student, amount=7, payment_method="Cash", receipt_number="B2", status="posted", cashier_name=name_b, term="1", academic_year=today.year)
    factory = APIRequestFactory()
    req = factory.post("/api/v1/reports/reconciliation/")
    req.user = user_a
    s = ReconciliationSerializer(data={"date": str(today), "actual_amount": "10.00"}, context={"request": req})
    assert s.is_valid(), s.errors
    inst = s.save()
    assert float(inst.expected_total) == 10.0


@pytest.mark.django_db
def test_reconciliation_zero_payments_balanced():
    user = UserFactory(username="cashier_zero")
    factory = APIRequestFactory()
    req = factory.post("/api/v1/reports/reconciliation/")
    req.user = user
    today = date.today()
    s = ReconciliationSerializer(data={"date": str(today), "actual_amount": "0.00"}, context={"request": req})
    assert s.is_valid(), s.errors
    inst = s.save()
    assert float(inst.expected_total) == 0.0
    assert inst.status == "balanced"
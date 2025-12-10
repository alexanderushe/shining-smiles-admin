import pytest
from rest_framework.test import APIRequestFactory
from django.contrib.auth.models import User
from datetime import date
from uuid import uuid4
from payments.serializers import PaymentSerializer
from payments.models import Payment
from tests.factories import StudentFactory, UserFactory, PaymentFactory


@pytest.mark.django_db
def test_create_sets_cashier_name_from_request():
    user = UserFactory(username="cashier_req")
    factory = APIRequestFactory()
    req = factory.post("/api/v1/payments/")
    req.user = user
    student = StudentFactory()
    data = {
        "student": student.id,
        "amount": "100.00",
        "payment_method": "Cash",
        "receipt_number": f"RX-{uuid4().hex[:8]}",
        "status": "pending",
        "term": "1",
        "academic_year": date.today().year,
    }
    s = PaymentSerializer(data=data, context={"request": req})
    assert s.is_valid(), s.errors
    inst = s.save()
    assert inst.cashier_name == (user.get_full_name() or user.username)


@pytest.mark.django_db
def test_create_sets_cashier_name_from_cashier_id_without_request():
    user = UserFactory(username="cashier_id")
    student = StudentFactory()
    data = {
        "student": student.id,
        "amount": "55.00",
        "payment_method": "Card",
        "receipt_number": f"RX-{uuid4().hex[:8]}",
        "status": "pending",
        "term": "2",
        "academic_year": date.today().year,
        "cashier_id": user.id,
    }
    s = PaymentSerializer(data=data)
    assert s.is_valid(), s.errors
    inst = s.save()
    assert inst.cashier_name == (user.get_full_name() or user.username)


@pytest.mark.django_db
def test_auto_term_year_when_missing():
    student = StudentFactory()
    factory = APIRequestFactory()
    req = factory.post("/api/v1/payments/")
    req.user = UserFactory()
    data = {
        "student": student.id,
        "amount": "25.00",
        "payment_method": "Cash",
        "receipt_number": f"RX-{uuid4().hex[:8]}",
        "status": "pending",
    }
    s = PaymentSerializer(data=data, context={"request": req})
    assert s.is_valid(), s.errors
    inst = s.save()
    assert inst.term in {"1", "2", "3"}
    assert inst.academic_year == date.today().year


@pytest.mark.django_db
def test_duplicate_receipt_errors():
    student = StudentFactory()
    receipt = f"RX-{uuid4().hex[:8]}"
    Payment.objects.create(
        student=student,
        amount=10,
        payment_method="Cash",
        receipt_number=receipt,
        status="pending",
        term="1",
        academic_year=date.today().year,
        cashier_name="C1",
    )
    data = {
        "student": student.id,
        "amount": "12.00",
        "payment_method": "Cash",
        "receipt_number": receipt,
        "status": "pending",
        "term": "1",
        "academic_year": date.today().year,
    }
    s = PaymentSerializer(data=data)
    assert not s.is_valid()
    assert "receipt_number" in s.errors


@pytest.mark.django_db
def test_update_posted_raises_validation_error():
    inst = PaymentFactory(status="posted")
    factory = APIRequestFactory()
    req = factory.patch(f"/api/v1/payments/{inst.id}/")
    req.user = UserFactory()
    s = PaymentSerializer(instance=inst, data={"amount": "200.00"}, partial=True, context={"request": req})
    assert s.is_valid(), s.errors
    with pytest.raises(Exception):
        s.save()


@pytest.mark.django_db
def test_void_requires_admin_permission():
    inst = PaymentFactory(status="pending")
    factory = APIRequestFactory()
    req = factory.patch(f"/api/v1/payments/{inst.id}/")
    req.user = UserFactory(is_staff=False, is_superuser=False)
    s = PaymentSerializer(instance=inst, data={"status": "voided"}, partial=True, context={"request": req})
    assert s.is_valid(), s.errors
    with pytest.raises(Exception):
        s.save()


@pytest.mark.django_db
def test_core_fields_not_changed_when_not_pending():
    inst = PaymentFactory(status="voided")
    orig_amount = inst.amount
    s = PaymentSerializer(instance=inst, data={"amount": "999.99"}, partial=True)
    assert s.is_valid(), s.errors
    saved = s.save()
    assert saved.amount == orig_amount
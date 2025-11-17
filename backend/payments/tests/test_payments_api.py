import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from tests.factories import UserFactory, PaymentFactory, StudentFactory
from django.contrib.auth.models import User
from uuid import uuid4

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def cashier():
    user = UserFactory(username="cashier1", password="password")
    return user

@pytest.mark.django_db
def test_create_payment(api_client, cashier):
    api_client.force_authenticate(user=cashier)
    student = StudentFactory()
    expected_receipt = f"RT-{uuid4().hex[:8]}"
    payload = {
        "student": student.id,
        "amount": "150.00",
        "payment_method": "Cash",
        "receipt_number": expected_receipt,
        "status": "pending",
        "term": "1",
        "academic_year": 2025,
        "cashier_id": cashier.id
    }
    res = api_client.post("/api/v1/payments/", payload, format="json")
    assert res.status_code == 201
    data = res.json()
    assert data["receipt_number"] == expected_receipt
    assert data["status"] == "pending"
    assert "id" in data

@pytest.mark.django_db
def test_posted_lock(api_client, cashier):
    api_client.force_authenticate(user=cashier)
    payment = PaymentFactory(status="posted")
    # Attempt update should be blocked
    res = api_client.patch(f"/api/v1/payments/{payment.id}/", {"amount": "200.00"}, format="json")
    assert res.status_code in (400, 403)

@pytest.mark.django_db
def test_delete_pending_allowed(api_client, cashier):
    api_client.force_authenticate(user=cashier)
    payment = PaymentFactory(status="pending")
    payment.cashier_name = cashier.get_full_name() or cashier.username
    payment.save()
    res = api_client.delete(f"/api/v1/payments/{payment.id}/")
    assert res.status_code in (204, 200)

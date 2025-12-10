import pytest
from rest_framework.test import APIClient
from datetime import date
from tests.factories import UserFactory, StudentFactory


@pytest.mark.django_db
def test_receipt_number_race_condition_duplicate_requests():
    client = APIClient()
    cashier = UserFactory(username="race_cashier")
    client.force_authenticate(user=cashier)
    student = StudentFactory()
    year = date.today().year
    receipt = "RACE-001"

    payload = {
        "student": student.id,
        "amount": "50.00",
        "payment_method": "Cash",
        "receipt_number": receipt,
        "status": "pending",
        "term": "1",
        "academic_year": year,
    }

    res1 = client.post("/api/v1/payments/", payload, format="json")
    assert res1.status_code == 201

    res2 = client.post("/api/v1/payments/", payload, format="json")
    assert res2.status_code in (400, 409)
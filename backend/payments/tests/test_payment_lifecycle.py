import pytest
from rest_framework.test import APIClient
from datetime import date
from uuid import uuid4
from tests.factories import UserFactory, StudentFactory


@pytest.fixture
def client():
    return APIClient()


@pytest.mark.django_db
def test_payment_full_lifecycle_and_reporting(client):
    cashier = UserFactory(username="lifecycle_cashier")
    client.force_authenticate(user=cashier)
    student = StudentFactory()
    year = date.today().year

    # 1. Create payment (pending)
    receipt = f"LC-{uuid4().hex[:8]}"
    payload = {
        "student": student.id,
        "amount": "120.00",
        "payment_method": "Cash",
        "receipt_number": receipt,
        "status": "pending",
        "term": "1",
        "academic_year": year,
    }
    res = client.post("/api/v1/payments/", payload, format="json")
    assert res.status_code == 201
    payment_id = res.json()["id"]

    # 2. Update allowed fields while pending
    res = client.patch(f"/api/v1/payments/{payment_id}/", {"amount": "130.00"}, format="json")
    assert res.status_code in (200, 202)

    # 3. Post payment
    res = client.patch(f"/api/v1/payments/{payment_id}/", {"status": "posted"}, format="json")
    assert res.status_code in (200, 202)

    # 3a. Fetch and verify the payment transitioned correctly
    res = client.get(f"/api/v1/payments/{payment_id}/")
    assert res.status_code == 200
    pdata = res.json()
    assert pdata["status"] == "posted"
    assert pdata["term"] == "1"
    assert pdata["academic_year"] == year

    # 4. Attempt update again → expect rejection
    res = client.patch(f"/api/v1/payments/{payment_id}/", {"amount": "140.00"}, format="json")
    assert res.status_code in (400, 403)

    # 5. Run reconciliation → verify totals
    today = date.today()
    res = client.post("/api/v1/reports/reconciliation/", {"date": str(today), "actual_amount": "130.00"}, format="json")
    assert res.status_code == 201
    data = res.json()
    assert float(data["expected_total"]) >= 130.0

    # 6. Term summary includes payment
    res = client.get(f"/api/v1/reports/term-summary/?term=1&year={year}")
    assert res.status_code == 200
    summary = res.json()
    assert float(summary["total"]) >= 130.0
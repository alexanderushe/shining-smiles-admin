import pytest
from rest_framework.test import APIClient
from datetime import date
from uuid import uuid4
from tests.factories import UserFactory, StudentFactory


@pytest.mark.django_db
def test_posted_payments_are_immutable_via_api():
    client = APIClient()
    cashier = UserFactory(username="spec_cashier")
    client.force_authenticate(user=cashier)
    student = StudentFactory()
    year = date.today().year
    receipt = f"SPEC-{uuid4().hex[:8]}"

    res = client.post("/api/v1/payments/", {
        "student": student.id,
        "amount": "80.00",
        "payment_method": "Cash",
        "receipt_number": receipt,
        "status": "pending",
        "term": "1",
        "academic_year": year,
    }, format="json")
    assert res.status_code == 201
    pid = res.json()["id"]

    res = client.patch(f"/api/v1/payments/{pid}/", {"status": "posted"}, format="json")
    assert res.status_code in (200, 202)

    res = client.patch(f"/api/v1/payments/{pid}/", {"amount": "81.00"}, format="json")
    assert res.status_code in (400, 403)

    res_unpost = client.patch(f"/api/v1/payments/{pid}/", {"status": "pending"}, format="json")
    assert res_unpost.status_code in (400, 403)


@pytest.mark.django_db
def test_reconciliation_sums_posted_only():
    client = APIClient()
    cashier = UserFactory(username="spec_cashier2")
    client.force_authenticate(user=cashier)
    name = cashier.get_full_name() or cashier.username
    student = StudentFactory()
    today = date.today()
    year = today.year

    client.post("/api/v1/payments/", {
        "student": student.id,
        "amount": "10.00",
        "payment_method": "Cash",
        "receipt_number": f"S-{uuid4().hex[:8]}",
        "status": "posted",
        "term": "1",
        "academic_year": year,
    }, format="json")
    client.post("/api/v1/payments/", {
        "student": student.id,
        "amount": "8.00",
        "payment_method": "Cash",
        "receipt_number": f"S-{uuid4().hex[:8]}",
        "status": "pending",
        "term": "1",
        "academic_year": year,
    }, format="json")

    res = client.post("/api/v1/reports/reconciliation/", {"date": str(today), "actual_amount": "10.00"}, format="json")
    assert res.status_code == 201
    data = res.json()
    assert float(data["expected_total"]) == 10.0


@pytest.mark.django_db
def test_term_summary_excludes_non_posted():
    client = APIClient()
    cashier = UserFactory(username="spec_cashier3")
    client.force_authenticate(user=cashier)
    student = StudentFactory()
    year = date.today().year

    client.post("/api/v1/payments/", {
        "student": student.id,
        "amount": "15.00",
        "payment_method": "Cash",
        "receipt_number": f"TS-{uuid4().hex[:8]}",
        "status": "pending",
        "term": "1",
        "academic_year": year,
    }, format="json")

    client.post("/api/v1/payments/", {
        "student": student.id,
        "amount": "20.00",
        "payment_method": "Card",
        "receipt_number": f"TS-{uuid4().hex[:8]}",
        "status": "posted",
        "term": "1",
        "academic_year": year,
    }, format="json")

    res = client.get(f"/api/v1/reports/term-summary/?term=1&year={year}")
    assert res.status_code == 200
    data = res.json()
    assert float(data["total"]) >= 20.0


@pytest.mark.django_db
def test_term_summary_only_includes_posted():
    client = APIClient()
    from payments.models import Profile
    cashier = UserFactory(profile__role=Profile.Role.CASHIER)
    client.force_authenticate(user=cashier)
    student = StudentFactory()
    year = date.today().year
    pending_receipt = f"PEND-{uuid4().hex[:8]}"
    client.post(
        "/api/v1/payments/",
        {
            "student": student.id,
            "amount": "50.00",
            "payment_method": "Cash",
            "receipt_number": pending_receipt,
            "status": "pending",
            "term": "1",
            "academic_year": year,
        },
        format="json",
    )
    posted_receipt = f"POST-{uuid4().hex[:8]}"
    client.post(
        "/api/v1/payments/",
        {
            "student": student.id,
            "amount": "100.00",
            "payment_method": "Cash",
            "receipt_number": posted_receipt,
            "status": "posted",
            "term": "1",
            "academic_year": year,
        },
        format="json",
    )
    res = client.get(f"/api/v1/reports/term-summary/?term=1&year={year}")
    assert res.status_code == 200
    summary = res.json()
    assert float(summary["total"]) == 100.00
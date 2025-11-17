import os
import pytest
import requests
from uuid import uuid4


BASE = os.environ.get("CONTRACT_BASE", "http://localhost:8000/api/v1")


@pytest.mark.skipif(os.environ.get("CONTRACT_TESTS") != "1", reason="contract tests run in CI against docker compose")
def test_end_to_end_flow():
    # Create/Get cashier
    # Use API root to ensure service is up
    root = requests.get(f"{BASE}/").json()
    assert "payments" in root

    # Create campus
    requests.post(f"{BASE}/students/campuses/", json={"name": "CT", "location": "City", "code": "CT1"})
    campuses = requests.get(f"{BASE}/students/campuses/").json()
    camp_id = campuses[0]["id"]

    # Create student
    requests.post(f"{BASE}/students/", json={"student_number": "SCON1", "first_name": "A", "last_name": "B", "dob": "2008-01-01", "current_grade": "G9", "campus_id": camp_id})
    students = requests.get(f"{BASE}/students/").json()
    sid = students[0]["id"]

    # Create payment pending
    receipt = f"CT-{uuid4().hex[:8]}"
    pay = requests.post(f"{BASE}/payments/", json={"student": sid, "amount": 100.0, "payment_method": "Cash", "receipt_number": receipt, "status": "pending", "term": "1", "academic_year": 2025})
    assert pay.status_code == 201
    pid = pay.json()["id"]

    # Update amount
    up = requests.patch(f"{BASE}/payments/{pid}/", json={"amount": 110.0})
    assert up.status_code in (200, 202)

    # Post payment
    posted = requests.patch(f"{BASE}/payments/{pid}/", json={"status": "posted"})
    assert posted.status_code in (200, 202)

    # Block further edits
    blocked = requests.patch(f"{BASE}/payments/{pid}/", json={"amount": 120.0})
    assert blocked.status_code in (400, 403)

    # Reconciliation
    rec = requests.post(f"{BASE}/reports/reconciliation/", json={"date": "2025-01-01", "actual_amount": 110.0})
    assert rec.status_code == 201
    # Term summary
    ts = requests.get(f"{BASE}/reports/term-summary/?term=1&year=2025")
    assert ts.status_code == 200
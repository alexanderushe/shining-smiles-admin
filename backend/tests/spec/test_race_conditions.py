import pytest
from concurrent.futures import ThreadPoolExecutor
from rest_framework.test import APIClient
from datetime import date
from tests.factories import UserFactory, StudentFactory


def _submit(payload, user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client.post("/api/v1/payments/", payload, format="json").status_code


from django.db import connection

@pytest.mark.django_db(transaction=True)
def test_parallel_duplicate_receipts():
    if connection.vendor == 'sqlite':
        pytest.skip("Skipping race condition test on SQLite due to locking")
    user = UserFactory(username="parallel_cashier")
    student = StudentFactory()
    year = date.today().year
    receipt = "PAR-001"
    payload = {
        "student": student.id,
        "amount": "10.00",
        "payment_method": "Cash",
        "receipt_number": receipt,
        "status": "pending",
        "term": "1",
        "academic_year": year,
    }
    with ThreadPoolExecutor(max_workers=20) as ex:
        results = list(ex.map(lambda _: _submit(payload, user), range(40)))
    assert results.count(201) == 1
    assert all(code in (201, 400, 409) for code in results)
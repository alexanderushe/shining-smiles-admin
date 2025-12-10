import pytest
from rest_framework.test import APIClient
from datetime import date
from tests.factories import UserFactory, PaymentFactory
from payments.models import Profile


@pytest.mark.django_db
def test_auditor_can_read_but_cannot_write():
    client = APIClient()
    auditor = UserFactory(profile__role=Profile.Role.AUDITOR)
    client.force_authenticate(user=auditor)
    inst = PaymentFactory(status="pending")
    res_get = client.get(f"/api/v1/payments/{inst.id}/")
    assert res_get.status_code == 200
    res_post = client.post("/api/v1/payments/", {
        "student": inst.student.id,
        "amount": "10.00",
        "payment_method": "Cash",
        "receipt_number": "AUD-1",
        "status": "pending",
        "term": "1",
        "academic_year": date.today().year,
    }, format="json")
    assert res_post.status_code in (401, 403)
    res_patch = client.patch(f"/api/v1/payments/{inst.id}/", {"amount": "20.00"}, format="json")
    assert res_patch.status_code in (401, 403)
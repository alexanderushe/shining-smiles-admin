import pytest
from rest_framework.test import APIClient
from datetime import date
from payments.models import Profile
from tests.factories import UserFactory, StudentFactory
from payments.models import Payment


@pytest.mark.django_db
def test_auditor_can_read_reports_but_cannot_post_reconciliation():
    client = APIClient()
    auditor = UserFactory(profile__role=Profile.Role.AUDITOR)
    client.force_authenticate(user=auditor)
    student = StudentFactory()
    today = date.today()
    name = auditor.get_full_name() or auditor.username
    Payment.objects.create(student=student, amount=10, payment_method="Cash", receipt_number="AR1", status="posted", cashier_name=name, term="1", academic_year=today.year)

    res = client.get(f"/api/v1/reports/cashier-daily/?date={today}&cashier_id={auditor.id}")
    assert res.status_code == 200
    res = client.get(f"/api/v1/reports/term-summary/?term=1&year={today.year}")
    assert res.status_code == 200
    res = client.get(f"/api/v1/reports/reconciliation/")
    assert res.status_code == 200

    res_post = client.post("/api/v1/reports/reconciliation/", {"date": str(today), "actual_amount": "10.00"}, format="json")
    assert res_post.status_code in (401, 403)
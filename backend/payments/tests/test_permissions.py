import pytest
from rest_framework.test import APIClient
from datetime import date
from tests.factories import UserFactory, PaymentFactory
from payments.models import Profile


@pytest.mark.django_db
def test_cashier_cannot_edit_another_cashiers_payment():
    client = APIClient()
    owner = UserFactory(username="owner_cashier", profile__role=Profile.Role.CASHIER)
    other = UserFactory(username="other_cashier", profile__role=Profile.Role.CASHIER)
    client.force_authenticate(user=other)
    # Owned by 'owner' via cashier_name
    inst = PaymentFactory(status="pending")
    inst.cashier_name = owner.get_full_name() or owner.username
    inst.save()
    res = client.patch(f"/api/v1/payments/{inst.id}/", {"amount": "200.00"}, format="json")
    assert res.status_code in (403, 401)


@pytest.mark.django_db
def test_admin_can_reassign_cashier():
    client = APIClient()
    admin = UserFactory(username="admin", profile__role=Profile.Role.ADMIN)
    client.force_authenticate(user=admin)
    inst = PaymentFactory(status="pending")
    new_cashier = UserFactory(username="new_cashier")
    res = client.patch(f"/api/v1/payments/{inst.id}/", {"cashier_id": new_cashier.id}, format="json")
    assert res.status_code in (200, 202)
    # Fetch updated instance
    res = client.get(f"/api/v1/payments/{inst.id}/")
    assert res.status_code == 200
    data = res.json()
    assert data["cashier_name"] == (new_cashier.get_full_name() or new_cashier.username)


@pytest.mark.django_db
def test_delete_posted_payment_fails_cleanly():
    client = APIClient()
    user = UserFactory(profile__role=Profile.Role.CASHIER)
    client.force_authenticate(user=user)
    inst = PaymentFactory(status="posted")
    res = client.delete(f"/api/v1/payments/{inst.id}/")
    assert res.status_code in (400, 403)
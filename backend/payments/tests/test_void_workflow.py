import pytest
from rest_framework.test import APIClient
from tests.factories import UserFactory, PaymentFactory, StudentFactory
from payments.models import Profile, Payment
from django.utils import timezone


@pytest.mark.django_db
def test_void_requires_void_reason():
    """Test that voiding requires a void reason"""
    client = APIClient()
    admin = UserFactory(username="admin", profile__role=Profile.Role.ADMIN)
    client.force_authenticate(user=admin)
    
    payment = PaymentFactory(status="pending")
    
    # Try to void without reason
    res = client.post(f"/api/v1/payments/{payment.id}/void/", {}, format="json")
    assert res.status_code == 400
    assert 'void_reason' in res.json()


@pytest.mark.django_db
def test_void_populates_tracking_fields():
    """Test that voiding auto-populates voided_at and voided_by"""
    client = APIClient()
    admin = UserFactory(username="admin", first_name="Admin", last_name="User", profile__role=Profile.Role.ADMIN)
    client.force_authenticate(user=admin)
    
    payment = PaymentFactory(status="posted")
    
    res = client.post(
        f"/api/v1/payments/{payment.id}/void/",
        {"void_reason": "Duplicate payment"},
        format="json"
    )
    assert res.status_code == 200
    
    payment.refresh_from_db()
    assert payment.status == "voided"
    assert payment.void_reason == "Duplicate payment"
    assert payment.voided_at is not None
    assert payment.voided_by == "Admin User"


@pytest.mark.django_db
def test_non_admin_cannot_void():
    """Test that non-admin users cannot void payments"""
    client = APIClient()
    cashier = UserFactory(username="cashier", profile__role=Profile.Role.CASHIER)
    client.force_authenticate(user=cashier)
    
    payment = PaymentFactory(status="pending")
    
    res = client.post(
        f"/api/v1/payments/{payment.id}/void/",
        {"void_reason": "Test"},
        format="json"
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_cannot_void_already_voided():
    """Test that already voided payments cannot be voided again"""
    client = APIClient()
    admin = UserFactory(username="admin", profile__role=Profile.Role.ADMIN)
    client.force_authenticate(user=admin)
    
    payment = PaymentFactory(status="voided", void_reason="Original reason")
    
    res = client.post(
        f"/api/v1/payments/{payment.id}/void/",
        {"void_reason": "New reason"},
        format="json"
    )
    assert res.status_code == 400
    assert 'already voided' in res.json()['detail'].lower()


@pytest.mark.django_db
def test_voided_payment_cannot_be_edited():
    """Test that voided payments cannot have their details edited"""
    client = APIClient()
    admin = UserFactory(username="admin", profile__role=Profile.Role.ADMIN)
    client.force_authenticate(user=admin)
    
    payment = PaymentFactory(status="voided", void_reason="Test", amount=100)
    
    # Try to change amount
    res = client.patch(
        f"/api/v1/payments/{payment.id}/",
        {"amount": "200.00"},
        format="json"
    )
    
    payment.refresh_from_db()
    assert payment.amount == 100  # Amount should not change


@pytest.mark.django_db
def test_admin_can_void_posted_payment():
    """Test that admin can void a posted payment"""
    client = APIClient()
    admin = UserFactory(username="admin", profile__role=Profile.Role.ADMIN)
    client.force_authenticate(user=admin)
    
    payment = PaymentFactory(status="posted")
    
    res = client.post(
        f"/api/v1/payments/{payment.id}/void/",
        {"void_reason": "Error in amount"},
        format="json"
    )
    assert res.status_code == 200
    
    payment.refresh_from_db()
    assert payment.status == "voided"

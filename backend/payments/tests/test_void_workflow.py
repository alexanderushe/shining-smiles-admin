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


@pytest.mark.django_db
def test_accountant_cannot_void():
    """Test that accountants cannot void payments"""
    client = APIClient()
    accountant = UserFactory(username="accountant", profile__role=Profile.Role.ACCOUNTANT)
    client.force_authenticate(user=accountant)
    
    payment = PaymentFactory(status="pending")
    
    res = client.post(
        f"/api/v1/payments/{payment.id}/void/",
        {"void_reason": "Test"},
        format="json"
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_auditor_cannot_void():
    """Test that auditors cannot void payments (read-only role)"""
    client = APIClient()
    auditor = UserFactory(username="auditor", profile__role=Profile.Role.AUDITOR)
    client.force_authenticate(user=auditor)
    
    payment = PaymentFactory(status="pending")
    
    res = client.post(
        f"/api/v1/payments/{payment.id}/void/",
        {"void_reason": "Test"},
        format="json"
    )
    assert res.status_code == 403


@pytest.mark.django_db
def test_void_reason_cannot_be_empty_string():
    """Test that void reason must have actual content"""
    client = APIClient()
    admin = UserFactory(username="admin", profile__role=Profile.Role.ADMIN)
    client.force_authenticate(user=admin)
    
    payment = PaymentFactory(status="pending")
    
    # Try with empty string
    res = client.post(
        f"/api/v1/payments/{payment.id}/void/",
        {"void_reason": ""},
        format="json"
    )
    assert res.status_code == 400


@pytest.mark.django_db
def test_void_reason_with_special_characters():
    """Test that void reason can contain special characters"""
    client = APIClient()
    admin = UserFactory(username="admin", profile__role=Profile.Role.ADMIN)
    client.force_authenticate(user=admin)
    
    payment = PaymentFactory(status="pending")
    special_reason = "Payment voided due to: incorrect amount ($150 vs $100) - student #12345"
    
    res = client.post(
        f"/api/v1/payments/{payment.id}/void/",
        {"void_reason": special_reason},
        format="json"
    )
    assert res.status_code == 200
    
    payment.refresh_from_db()
    assert payment.void_reason == special_reason


@pytest.mark.django_db
def test_voided_at_timestamp_accuracy():
    """Test that voided_at timestamp is accurate to the void action time"""
    client = APIClient()
    admin = UserFactory(username="admin", profile__role=Profile.Role.ADMIN)
    client.force_authenticate(user=admin)
    
    payment = PaymentFactory(status="pending")
    
    before_void = timezone.now()
    res = client.post(
        f"/api/v1/payments/{payment.id}/void/",
        {"void_reason": "Test timestamp"},
        format="json"
    )
    after_void = timezone.now()
    
    assert res.status_code == 200
    payment.refresh_from_db()
    
    # Verify timestamp is within the void action window
    assert payment.voided_at >= before_void
    assert payment.voided_at <= after_void


@pytest.mark.django_db
def test_void_preserves_original_payment_data():
    """Test that voiding doesn't alter original payment data"""
    client = APIClient()
    admin = UserFactory(username="admin", profile__role=Profile.Role.ADMIN)
    client.force_authenticate(user=admin)
    
    student = StudentFactory()
    payment = PaymentFactory(
        status="posted",
        amount=250,
        payment_method="Card",
        student=student
    )
    original_amount = payment.amount
    original_method = payment.payment_method
    original_student_id = payment.student.id
    
    res = client.post(
        f"/api/v1/payments/{payment.id}/void/",
        {"void_reason": "Test data preservation"},
        format="json"
    )
    assert res.status_code == 200
    
    payment.refresh_from_db()
    # Original data should be preserved
    assert payment.amount == original_amount
    assert payment.payment_method == original_method
    assert payment.student.id == original_student_id
    # Only status and void fields should change
    assert payment.status == "voided"


@pytest.mark.django_db
def test_void_response_includes_audit_trail():
    """Test that void API response includes all audit trail fields"""
    client = APIClient()
    admin = UserFactory(username="admin", first_name="Test", last_name="Admin", profile__role=Profile.Role.ADMIN)
    client.force_authenticate(user=admin)
    
    payment = PaymentFactory(status="pending")
    
    res = client.post(
        f"/api/v1/payments/{payment.id}/void/",
        {"void_reason": "API response test"},
        format="json"
    )
    assert res.status_code == 200
    
    data = res.json()
    assert data['status'] == 'voided'
    assert data['void_reason'] == 'API response test'
    assert 'voided_at' in data
    assert data['voided_by'] == 'Test Admin'

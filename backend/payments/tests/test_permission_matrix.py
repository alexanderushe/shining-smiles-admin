import pytest
from rest_framework.test import APIClient
from datetime import date
from uuid import uuid4
from tests.factories import UserFactory, StudentFactory, PaymentFactory
from payments.models import Profile


@pytest.mark.django_db
@pytest.mark.parametrize("role,action,expected_status", [
    (Profile.Role.CASHIER, "create", 201),
    (Profile.Role.CASHIER, "update_own_pending", 200),
    (Profile.Role.CASHIER, "post", 200),
    (Profile.Role.CASHIER, "void", 403),
    (Profile.Role.CASHIER, "reassign_cashier", 403),
    (Profile.Role.CASHIER, "delete_posted", 403),
    (Profile.Role.ADMIN, "create", 201),
    (Profile.Role.ADMIN, "update_any_pending", 200),
    (Profile.Role.ADMIN, "void", 200),
    (Profile.Role.ADMIN, "reassign_cashier", 200),
    (Profile.Role.ACCOUNTANT, "create", 403),
    (Profile.Role.ACCOUNTANT, "update_own_pending", 403),
    (Profile.Role.AUDITOR, "create", 403),
    (Profile.Role.AUDITOR, "update_own_pending", 403),
])
def test_permission_matrix(role, action, expected_status):
    client = APIClient()
    user = UserFactory(profile__role=role)
    client.force_authenticate(user=user)
    student = StudentFactory()
    year = date.today().year

    if action == "create":
        res = client.post("/api/v1/payments/", {
            "student": student.id,
            "amount": "10.00",
            "payment_method": "Cash",
            "receipt_number": f"PM-{uuid4().hex[:8]}",
            "status": "pending",
            "term": "1",
            "academic_year": year,
        }, format="json")
        assert res.status_code == expected_status
        return

    # Create baseline via factory to avoid API permission constraints for non-creator roles
    inst = PaymentFactory(status="pending", student=student)
    # Ensure term/year consistency
    inst.term = "1"
    inst.academic_year = year
    # Attribute ownership to current user when relevant
    name = user.get_full_name() or user.username
    if action in ("update_own_pending", "post", "void", "delete_posted"):
        inst.cashier_name = name
    inst.save()
    pid = inst.id

    if action in ("update_own_pending", "update_any_pending"):
        res = client.patch(f"/api/v1/payments/{pid}/", {"amount": "16.00"}, format="json")
        assert res.status_code in (expected_status, 202)
        return

    if action == "post":
        res = client.patch(f"/api/v1/payments/{pid}/", {"status": "posted"}, format="json")
        assert res.status_code in (expected_status, 202)
        return

    if action == "void":
        res = client.patch(f"/api/v1/payments/{pid}/", {"status": "voided"}, format="json")
        assert res.status_code in (expected_status, 202)
        return

    if action == "reassign_cashier":
        other = UserFactory()
        res = client.patch(f"/api/v1/payments/{pid}/", {"cashier_id": other.id}, format="json")
        assert res.status_code in (expected_status, 202)
        return

    if action == "delete_posted":
        from payments.models import Payment as _Payment
        obj = _Payment.objects.get(id=pid)
        obj.status = "posted"
        obj.save()
        res = client.delete(f"/api/v1/payments/{pid}/")
        assert res.status_code == expected_status
        return
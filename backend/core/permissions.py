from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.contrib.auth.models import Group
from payments.models import Profile

def get_role(user):
    if not user or not user.is_authenticated:
        return None
    role = getattr(getattr(user, 'profile', None), 'role', None)
    if role:
        return {
            'cashier': 'Cashier',
            'accountant': 'Accountant',
            'admin': 'Admin',
            'auditor': 'Auditor',
        }.get(role.lower())
    if user.is_superuser or user.is_staff:
        return 'Admin'
    names = set(user.groups.values_list('name', flat=True))
    if 'Admin' in names:
        return 'Admin'
    if 'Accountant' in names:
        return 'Accountant'
    if 'Cashier' in names:
        return 'Cashier'
    if 'Auditor' in names:
        return 'Auditor'
    return None

class PaymentWritePermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        role = get_role(request.user)
        return role in {'Admin', 'Cashier'}

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        role = get_role(request.user)
        if role == 'Admin':
            return True
        if role == 'Accountant':
            return False
        if role == 'Cashier':
            name = request.user.get_full_name() or request.user.username
            return obj.status == 'pending' and obj.cashier_name == name
        return False

class ReconciliationWritePermission(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        role = get_role(user)
        if role == 'Auditor':
            return request.method in SAFE_METHODS
        return True
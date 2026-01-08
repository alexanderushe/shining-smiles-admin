from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Allocates permissions to Admin users.
    Admins have full access to everything in their school.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'profile') and request.user.profile.role == 'admin'

class IsAccountant(permissions.BasePermission):
    """
    Allocates permissions to Accountant users.
    Accountants can view all data and manage payments, but cannot manage users/schools.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if not hasattr(request.user, 'profile'):
            return False
        return request.user.profile.role in ['admin', 'accountant']

class IsCashier(permissions.BasePermission):
    """
    Allocates permissions to Cashier users.
    Cashiers can create payments and view students.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if not hasattr(request.user, 'profile'):
            return False
        return request.user.profile.role in ['admin', 'accountant', 'cashier']

class IsAuditor(permissions.BasePermission):
    """
    Allocates permissions to Auditor users.
    Auditors have read-only access to financial data.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if not hasattr(request.user, 'profile'):
            return False
        
        # Check for auditor role
        is_auditor = request.user.profile.role == 'auditor'
        
        # Auditors only allow SAFE_METHODS (GET, HEAD, OPTIONS)
        if is_auditor and request.method not in permissions.SAFE_METHODS:
            return False
            
        return request.user.profile.role in ['admin', 'accountant', 'cashier', 'auditor']

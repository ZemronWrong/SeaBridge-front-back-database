from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """Allow access only to users with the 'owner' role."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'owner'


class IsOwnerOrManager(permissions.BasePermission):
    """Allow access to owner or manager roles."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('owner', 'manager')


class IsOwnerOrFinance(permissions.BasePermission):
    """Allow access to owner or finance roles."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('owner', 'finance')


class CanManagePayroll(permissions.BasePermission):
    """Allow access to owner or finance roles for payroll management."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role in ('owner', 'finance')


class CanManageInventory(permissions.BasePermission):
    """
    owner/finance: full CRUD
    foreman: can update stock
    manager: read-only
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return request.user.role in ('owner', 'manager', 'finance', 'foreman')
        if request.method == 'POST':
            # Allow 'foreman' for adding/subtracting stock actions
            return request.user.role in ('owner', 'finance', 'foreman')
        if request.method in ('PUT', 'PATCH'):
            return request.user.role in ('owner', 'finance', 'foreman')
        return request.user.role in ('owner', 'finance')


class CanManageProduction(permissions.BasePermission):
    """
    owner/manager: assign tasks
    foreman: perform QC, update task status
    worker: view own tasks, update own task status
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ('owner', 'manager', 'foreman', 'worker')


class CanManageDTR(permissions.BasePermission):
    """Everyone authenticated can view DTR; only employees can clock in/out."""
    def has_permission(self, request, view):
        return request.user.is_authenticated


class MaterialRequestPermission(permissions.BasePermission):
    """
    Foreman: create only; list/retrieve own requests.
    Owner/Finance: list all, update status (approve/order/fulfill), delete.
    Manager: read all requests.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        role = getattr(request.user, 'role', None)
        if view.action == 'create':
            return role == 'foreman'
        if view.action in ('update', 'partial_update', 'destroy'):
            return role in ('owner', 'finance')
        if view.action in ('list', 'retrieve'):
            return role in ('owner', 'finance', 'manager', 'foreman')
        return False

    def has_object_permission(self, request, view, obj):
        role = getattr(request.user, 'role', None)
        if view.action in ('update', 'partial_update', 'destroy'):
            return role in ('owner', 'finance')
        if view.action == 'retrieve':
            if role == 'foreman':
                return obj.requester_id == request.user.id
            return role in ('owner', 'finance', 'manager')
        return True

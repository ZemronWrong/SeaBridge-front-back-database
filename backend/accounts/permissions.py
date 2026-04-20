from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'owner'


class IsOwnerOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('owner', 'manager')


class IsOwnerOrFinance(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('owner', 'finance')


class CanManagePayroll(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role in ('owner', 'finance')


class CanManageInventory(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return request.user.role in ('owner', 'manager', 'finance', 'foreman')
        if request.method in ('POST', 'PUT', 'PATCH'):
            return request.user.role in ('owner', 'finance', 'foreman')
        return request.user.role in ('owner', 'finance')


class CanManageProduction(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ('owner', 'manager', 'foreman', 'worker')


class CanManageDTR(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

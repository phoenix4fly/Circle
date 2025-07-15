from rest_framework import permissions

class IsAdminPermission(permissions.BasePermission):
    """
    Разрешение только для сотрудников / админов платформы.
    """
    message = "Доступ разрешён только администраторам."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff
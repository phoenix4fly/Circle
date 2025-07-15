from rest_framework import viewsets, permissions
from .models import Media
from .serializers import MediaSerializer


class MediaViewSet(viewsets.ModelViewSet):
    """
    /api/media/
    - GET / → список своих медиа
    - POST / → загрузить файл
    - GET /{id}/ → получить данные по файлу
    - DELETE /{id}/ → удалить файл
    """
    serializer_class = MediaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Ограничиваем только своими файлами
        """
        return Media.objects.filter(uploaded_by=self.request.user, is_active=True).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
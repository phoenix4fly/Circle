from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import (
    UserDetailSerializer,
    UserUpdateSerializer,
    TelegramRegisterSerializer,
    UserRegisterSerializer,
    UserLoginSerializer
)


class UserMeView(generics.RetrieveUpdateAPIView):
    """
    /api/users/me/
    GET → получить свой профиль
    PATCH → обновить свой профиль
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserDetailSerializer
        return UserUpdateSerializer

    def get_object(self):
        return self.request.user


class TelegramRegisterView(APIView):
    """
    /api/users/telegram-register/
    POST → регистрация через бот
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = TelegramRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.create_or_update()
        return Response({
            "message": "User registered or updated via Telegram.",
            "user_id": user.id
        }, status=status.HTTP_200_OK)


class UserRegisterView(APIView):
    """
    /api/users/register/
    POST → регистрация через веб-интерфейс
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Создаем JWT токены
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "message": "Регистрация успешна",
            "user": UserDetailSerializer(user).data,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }
        }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    """
    /api/users/login/
    POST → вход через веб-интерфейс
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Создаем JWT токены
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "message": "Вход выполнен успешно",
            "user": UserDetailSerializer(user).data,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }
        }, status=status.HTTP_200_OK)
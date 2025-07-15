from rest_framework import serializers
from .models import User, Sphere, Specialization


class SphereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sphere
        fields = ['id', 'name', 'description']


class SpecializationSerializer(serializers.ModelSerializer):
    sphere = SphereSerializer(read_only=True)

    class Meta:
        model = Specialization
        fields = ['id', 'name', 'description', 'sphere']


class UserShortSerializer(serializers.ModelSerializer):
    """Краткий сериализатор пользователя для списков и связей"""
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'avatar']


class UserDetailSerializer(serializers.ModelSerializer):
    sphere = SphereSerializer(read_only=True)
    specialization = SpecializationSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'avatar',
            'bio',
            'interests',
            'phone_number',
            'sphere',
            'specialization',
            'telegram_id',
            'last_online',
        ]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'username',
            'first_name',
            'last_name',
            'avatar',
            'bio',
            'interests',
            'phone_number',
            'sphere',
            'specialization',
        ]

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("Username не может быть пустым.")
        return value


class TelegramRegisterSerializer(serializers.Serializer):
    telegram_id = serializers.IntegerField()
    username = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    def validate_telegram_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Неверный telegram_id")
        return value

    def create_or_update(self):
        """
        Логика регистрации через /start бота.
        Создаёт нового пользователя или обновляет существующего по telegram_id.
        """
        telegram_id = self.validated_data['telegram_id']
        username = self.validated_data.get('username', '')
        first_name = self.validated_data.get('first_name', '')
        last_name = self.validated_data.get('last_name', '')

        user, created = User.objects.get_or_create(
            telegram_id=telegram_id,
            defaults={
                'username': username or f'tguser_{telegram_id}',
                'first_name': first_name,
                'last_name': last_name,
                'password': User.objects.make_random_password(),
            }
        )

        if not created:
            # обновляем существующего
            if username:
                user.username = username
            if first_name:
                user.first_name = first_name
            if last_name:
                user.last_name = last_name
            user.save()

        return user
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
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


class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Сериализатор для регистрации пользователей через веб-интерфейс
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 
            'email', 'phone_number', 'password', 'password_confirm'
        ]
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
            'phone_number': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Пароли не совпадают")
        return attrs
    
    def validate_phone_number(self, value):
        if not value:
            raise serializers.ValidationError("Номер телефона обязателен")
        
        # Удаляем все кроме цифр
        phone_digits = ''.join(filter(str.isdigit, value))
        
        # Проверяем узбекский формат
        if not phone_digits.startswith('998') or len(phone_digits) != 12:
            raise serializers.ValidationError("Введите корректный номер телефона в формате +998XXXXXXXXX")
        
        # Проверяем уникальность
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Пользователь с таким номером уже существует")
        
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Сериализатор для входа пользователей (телефон или email + пароль)
    """
    login = serializers.CharField(
        help_text="Телефон (+998XXXXXXXXX) или Email"
    )
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        login = attrs.get('login')
        password = attrs.get('password')
        
        if not login or not password:
            raise serializers.ValidationError("Введите логин и пароль")
        
        # Попробуем найти пользователя по телефону или email
        user = None
        
        # Если выглядит как телефон
        if login.startswith('+998') or login.startswith('998'):
            phone_digits = ''.join(filter(str.isdigit, login))
            if len(phone_digits) == 12 and phone_digits.startswith('998'):
                formatted_phone = f"+{phone_digits}"
                user = User.objects.filter(phone_number=formatted_phone).first()
        
        # Если не нашли по телефону, пробуем по email
        if not user and '@' in login:
            user = User.objects.filter(email=login).first()
        
        # Если не нашли по email, пробуем по username
        if not user:
            user = User.objects.filter(username=login).first()
        
        if not user:
            raise serializers.ValidationError("Пользователь не найден")
        
        # Проверяем пароль
        if not user.check_password(password):
            raise serializers.ValidationError("Неверный пароль")
        
        if not user.is_active:
            raise serializers.ValidationError("Аккаунт заблокирован")
        
        attrs['user'] = user
        return attrs
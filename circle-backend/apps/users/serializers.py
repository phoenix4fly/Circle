from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import (
    User, Sphere, Specialization, 
    TravelStyle, TravelLocation, TripDuration
)


class SphereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sphere
        fields = ['id', 'name', 'description']


class SpecializationSerializer(serializers.ModelSerializer):
    sphere = SphereSerializer(read_only=True)

    class Meta:
        model = Specialization
        fields = ['id', 'name', 'description', 'sphere']


# Новые сериализаторы для предпочтений
class TravelStyleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelStyle
        fields = ['id', 'name', 'description', 'icon']


class TravelLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelLocation
        fields = ['id', 'name', 'description', 'icon']


class TripDurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripDuration
        fields = ['id', 'name', 'description', 'icon']


class UserShortSerializer(serializers.ModelSerializer):
    """Краткий сериализатор пользователя для списков и связей"""
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'avatar']


class UserDetailSerializer(serializers.ModelSerializer):
    sphere = SphereSerializer(read_only=True)
    specialization = SpecializationSerializer(read_only=True)
    preferred_travel_styles = TravelStyleSerializer(many=True, read_only=True)
    preferred_travel_locations = TravelLocationSerializer(many=True, read_only=True)
    preferred_trip_durations = TripDurationSerializer(many=True, read_only=True)

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
            'preferred_travel_styles',
            'preferred_travel_locations', 
            'preferred_trip_durations',
            'onboarding_completed',
            'sphere_selected',
            'preferences_selected',
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


# Новые сериализаторы для onboarding процесса
class SphereSelectionSerializer(serializers.ModelSerializer):
    """Сериализатор для выбора сферы деятельности"""
    class Meta:
        model = User
        fields = ['sphere', 'specialization']
    
    def update(self, instance, validated_data):
        instance.sphere = validated_data.get('sphere', instance.sphere)
        instance.specialization = validated_data.get('specialization', instance.specialization)
        instance.sphere_selected = True
        instance.save()
        return instance


class PreferencesSelectionSerializer(serializers.ModelSerializer):
    """Сериализатор для выбора предпочтений путешествий"""
    preferred_travel_styles = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=TravelStyle.objects.filter(is_active=True),
        required=False
    )
    preferred_travel_locations = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=TravelLocation.objects.filter(is_active=True),
        required=False
    )
    preferred_trip_durations = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=TripDuration.objects.filter(is_active=True),
        required=False
    )
    
    class Meta:
        model = User
        fields = ['preferred_travel_styles', 'preferred_travel_locations', 'preferred_trip_durations']
    
    def update(self, instance, validated_data):
        # Обновляем предпочтения
        if 'preferred_travel_styles' in validated_data:
            instance.preferred_travel_styles.set(validated_data['preferred_travel_styles'])
        if 'preferred_travel_locations' in validated_data:
            instance.preferred_travel_locations.set(validated_data['preferred_travel_locations'])
        if 'preferred_trip_durations' in validated_data:
            instance.preferred_trip_durations.set(validated_data['preferred_trip_durations'])
        
        # Помечаем что предпочтения выбраны
        instance.preferences_selected = True
        
        # Если выбраны и сфера, и предпочтения - завершаем onboarding
        if instance.sphere_selected and instance.preferences_selected:
            instance.onboarding_completed = True
            
        instance.save()
        return instance


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
            # Пользователь уже существует, обновим данные
            user.username = username or user.username
            user.first_name = first_name or user.first_name
            user.last_name = last_name or user.last_name
            user.save()

        return user


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username',
            'first_name',
            'last_name',
            'phone_number',
            'email',
            'password',
            'password_confirm'
        ]

    def validate_phone_number(self, value):
        """Валидация номера телефона для Узбекистана"""
        import re
        
        # Убираем все пробелы и символы
        clean_phone = re.sub(r'[^\d+]', '', value)
        
        # Проверяем формат +998XXXXXXXXX
        if not re.match(r'^\+998\d{9}$', clean_phone):
            raise serializers.ValidationError(
                "Номер телефона должен быть в формате +998XXXXXXXXX"
            )
        
        # Проверяем уникальность
        if User.objects.filter(phone_number=clean_phone).exists():
            raise serializers.ValidationError(
                "Пользователь с таким номером уже существует"
            )
        
        return clean_phone

    def validate_username(self, value):
        """Валидация имени пользователя"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Пользователь с таким именем уже существует"
            )
        return value

    def validate(self, attrs):
        """Общая валидация данных"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Пароли не совпадают'
            })
        return attrs

    def create(self, validated_data):
        """Создание нового пользователя"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    login = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        login = attrs.get('login')
        password = attrs.get('password')

        if login and password:
            # Попробуем найти пользователя по номеру телефона, email или username
            user = None
            
            # Сначала по номеру телефона
            if login.startswith('+998'):
                try:
                    user = User.objects.get(phone_number=login)
                except User.DoesNotExist:
                    pass
            
            # Потом по email
            if not user and '@' in login:
                try:
                    user = User.objects.get(email=login)
                except User.DoesNotExist:
                    pass
            
            # И наконец по username
            if not user:
                try:
                    user = User.objects.get(username=login)
                except User.DoesNotExist:
                    pass

            if not user:
                raise serializers.ValidationError('Пользователь не найден')

            if not user.check_password(password):
                raise serializers.ValidationError('Неверный пароль')

            attrs['user'] = user
        else:
            raise serializers.ValidationError('Необходимо указать логин и пароль')

        return attrs
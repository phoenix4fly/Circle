# apps/core/serializers.py

from rest_framework import serializers
from .models import SystemConfig, SystemLogEntry
from apps.users.serializers import UserShortSerializer


class SystemConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemConfig
        fields = [
            'id',
            'key',
            'value',
            'description',
            'is_active',
            'updated_at',
        ]
        read_only_fields = ['id', 'updated_at']


class SystemLogEntrySerializer(serializers.ModelSerializer):
    user = UserShortSerializer(read_only=True)

    class Meta:
        model = SystemLogEntry
        fields = [
            'id',
            'timestamp',
            'level',
            'source',
            'message',
            'user',
        ]
        read_only_fields = ['id', 'timestamp', 'level', 'source', 'message', 'user']
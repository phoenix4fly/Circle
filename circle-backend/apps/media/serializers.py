from rest_framework import serializers
from .models import Media


class MediaSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Media
        fields = [
            'id',
            'file',
            'file_url',
            'media_type',
            'description',
            'uploaded_by',
            'is_active',
            'created_at'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'file_url']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None
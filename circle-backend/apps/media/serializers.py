from rest_framework import serializers
from .models import Media


class MediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    title = serializers.CharField(read_only=True)

    class Meta:
        model = Media
        fields = [
            'id',
            'url',
            'title',
            'media_type',
            'description',
            'uploaded_by',
            'is_public',
            'created_at'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'url']

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None
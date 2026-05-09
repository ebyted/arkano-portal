from rest_framework import serializers
from .models import SuccessCase, SuccessCaseImage


class SuccessCaseImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuccessCaseImage
        fields = ['id', 'image', 'image_type', 'order']


class SuccessCaseSerializer(serializers.ModelSerializer):
    images = SuccessCaseImageSerializer(many=True, read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = SuccessCase
        fields = [
            'id', 'title', 'client_sector', 'problem', 'solution', 'result',
            'testimonial', 'category', 'category_display', 'metric', 'metric_label',
            'video_url', 'published', 'order', 'images', 'created_at',
        ]
        read_only_fields = ['created_at']

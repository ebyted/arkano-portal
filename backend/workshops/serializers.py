from rest_framework import serializers
from .models import Category, Instructor, Workshop, WorkshopImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = ['id', 'name', 'bio', 'photo']


class WorkshopImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopImage
        fields = ['id', 'image', 'alt_text', 'order', 'is_main']


class WorkshopListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    registered_count = serializers.IntegerField(read_only=True)
    available_spots = serializers.IntegerField(read_only=True)
    status_display = serializers.CharField(read_only=True)
    main_image_url = serializers.CharField(read_only=True)
    images = WorkshopImageSerializer(many=True, read_only=True)
    instructor_label = serializers.SerializerMethodField()

    class Meta:
        model = Workshop
        fields = [
            'id', 'code', 'title', 'subtitle', 'category', 'category_name',
            'level', 'modality', 'date', 'time_start', 'time_end', 'duration',
            'price', 'max_capacity', 'registered_count', 'available_spots',
            'location', 'instructor', 'instructor_label', 'status',
            'status_display', 'accent', 'short_description',
            'main_image_url', 'images', 'promo_video_url',
        ]

    def get_instructor_label(self, obj):
        if obj.instructor:
            return obj.instructor.name
        return obj.instructor_name


class WorkshopDetailSerializer(WorkshopListSerializer):
    class Meta(WorkshopListSerializer.Meta):
        fields = WorkshopListSerializer.Meta.fields + [
            'description', 'benefits', 'curriculum',
            'requirements', 'target_audience',
        ]


class WorkshopWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        exclude = ['created_at', 'updated_at']

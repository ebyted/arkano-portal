from rest_framework import serializers
from .models import Contact, Interaction


class InteractionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Interaction
        fields = ['id', 'note', 'created_at', 'created_by', 'created_by_name']
        read_only_fields = ['created_at', 'created_by']


class ContactSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    interactions = InteractionSerializer(many=True, read_only=True)

    class Meta:
        model = Contact
        fields = [
            'id', 'nombre', 'email', 'tel', 'empresa', 'interes',
            'source', 'source_display', 'status', 'status_display',
            'notas', 'created_at', 'updated_at', 'interactions',
        ]
        read_only_fields = ['created_at', 'updated_at']

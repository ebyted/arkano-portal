from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    appointment_type_display = serializers.CharField(source='get_appointment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'nombre', 'email', 'tel', 'empresa',
            'appointment_type', 'appointment_type_display',
            'notas', 'status', 'status_display', 'source',
            'created_at',
        ]
        read_only_fields = ['created_at']


class AppointmentAdminSerializer(AppointmentSerializer):
    class Meta(AppointmentSerializer.Meta):
        fields = AppointmentSerializer.Meta.fields + ['internal_notes', 'updated_at']

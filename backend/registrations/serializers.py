from rest_framework import serializers
from .models import Attendee, Registration


class AttendeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendee
        fields = ['id', 'nombre', 'email', 'tel', 'ocupacion', 'empresa', 'ciudad', 'fuente', 'created_at']
        read_only_fields = ['created_at']


class RegistrationListSerializer(serializers.ModelSerializer):
    attendee_nombre = serializers.CharField(source='attendee.nombre', read_only=True)
    attendee_email = serializers.CharField(source='attendee.email', read_only=True)
    attendee_tel = serializers.CharField(source='attendee.tel', read_only=True)
    workshop_title = serializers.CharField(source='workshop.title', read_only=True)
    workshop_code = serializers.CharField(source='workshop.code', read_only=True)

    class Meta:
        model = Registration
        fields = [
            'id', 'folio', 'attendee', 'attendee_nombre', 'attendee_email', 'attendee_tel',
            'workshop', 'workshop_title', 'workshop_code',
            'status', 'payment_status', 'payment_method',
            'attended', 'check_in_at', 'registered_at',
        ]
        read_only_fields = ['folio', 'registered_at']


class RegistrationDetailSerializer(RegistrationListSerializer):
    attendee = AttendeeSerializer(read_only=True)
    qr_code = serializers.ImageField(read_only=True)

    class Meta(RegistrationListSerializer.Meta):
        fields = RegistrationListSerializer.Meta.fields + ['attendee', 'notes', 'qr_code', 'updated_at']


class RegisterWorkshopSerializer(serializers.Serializer):
    """Public endpoint: register for a workshop."""
    nombre = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    tel = serializers.CharField(max_length=30)
    ocupacion = serializers.CharField(max_length=200, required=False, allow_blank=True)
    empresa = serializers.CharField(max_length=200, required=False, allow_blank=True)
    ciudad = serializers.CharField(max_length=100, required=False, allow_blank=True)
    fuente = serializers.ChoiceField(
        choices=['web', 'ig', 'fb', 'wa', 'ref', 'evento'],
        default='web'
    )
    payment_method = serializers.ChoiceField(
        choices=['transferencia', 'tarjeta', 'oxxo', 'paypal', 'efectivo'],
        default='transferencia'
    )
    workshop_id = serializers.IntegerField()

    def validate_workshop_id(self, value):
        from workshops.models import Workshop
        try:
            ws = Workshop.objects.get(pk=value, status=Workshop.STATUS_PUBLISHED)
        except Workshop.DoesNotExist:
            raise serializers.ValidationError('Taller no encontrado o no disponible.')
        if ws.available_spots == 0:
            raise serializers.ValidationError('El taller no tiene lugares disponibles.')
        return value

    def create(self, validated_data):
        from workshops.models import Workshop
        workshop = Workshop.objects.get(pk=validated_data['workshop_id'])

        attendee, _ = Attendee.objects.get_or_create(
            email=validated_data['email'],
            defaults={
                'nombre': validated_data['nombre'],
                'tel': validated_data['tel'],
                'ocupacion': validated_data.get('ocupacion', ''),
                'empresa': validated_data.get('empresa', ''),
                'ciudad': validated_data.get('ciudad', ''),
                'fuente': validated_data.get('fuente', 'web'),
            }
        )

        if Registration.objects.filter(attendee=attendee, workshop=workshop).exists():
            raise serializers.ValidationError({'email': 'Ya estás inscrito en este taller.'})

        reg = Registration(
            attendee=attendee,
            workshop=workshop,
            payment_method=validated_data.get('payment_method', 'transferencia'),
        )
        reg.save()
        return reg

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.core.mail import send_mail
from django.conf import settings as django_settings
import threading
import logging

from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentAdminSerializer

logger = logging.getLogger(__name__)


def _send_notify(appt):
    """Envía notificación de nueva cita en hilo separado para no bloquear la respuesta."""
    try:
        subject = f'[Arkano-IA] Nueva cita: {appt.nombre}'
        body = f"""Nueva solicitud de cita recibida en arkano-ia.com

━━━━━━━━━━━━━━━━━━━━
👤  {appt.nombre}
📧  {appt.email}
📱  {appt.tel}
🏢  {appt.empresa or '—'}
📋  {appt.get_appointment_type_display()}
━━━━━━━━━━━━━━━━━━━━

¿Qué quiere lograr?
{appt.notas or '(sin notas)'}

Origen: {appt.get_source_display()}
ID:     #{appt.id}
"""
        logger.info(f'[email] Enviando notificación de cita #{appt.id} a {django_settings.NOTIFY_EMAIL}')
        send_mail(
            subject=subject,
            message=body,
            from_email=django_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[django_settings.NOTIFY_EMAIL],
            fail_silently=False,
        )
        logger.info(f'[email] ✓ Notificación enviada correctamente (cita #{appt.id})')
    except Exception as e:
        logger.error(f'[email] ✗ Error enviando notificación de cita #{appt.id}: {e}')


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status', 'appointment_type', 'source']
    search_fields = ['nombre', 'email', 'empresa']

    def get_serializer_class(self):
        return AppointmentAdminSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def public_appointment(request):
    serializer = AppointmentSerializer(data=request.data)
    if serializer.is_valid():
        appt = serializer.save()
        # Notificar a Edgar sin bloquear la respuesta
        threading.Thread(target=_send_notify, args=(appt,), daemon=True).start()
        return Response({
            'message': 'Cita solicitada. Te contactamos en menos de 24 hrs hábiles.',
            **serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

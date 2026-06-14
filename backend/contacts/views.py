from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.core.mail import send_mail
from django.conf import settings as django_settings
import threading
import logging

from .models import Contact, Interaction
from .serializers import ContactSerializer, InteractionSerializer

logger = logging.getLogger(__name__)


def _send_contact_notify(contact):
    try:
        subject = f'[Arkano-IA] Nuevo contacto: {contact.nombre}'
        body = f"""Nuevo contacto recibido en arkano-ia.com

━━━━━━━━━━━━━━━━━━━━
👤  {contact.nombre}
📧  {contact.email}
📱  {contact.tel}
🏢  {contact.empresa or '—'}
━━━━━━━━━━━━━━━━━━━━

Interés:
{contact.interes or '(sin especificar)'}

Origen: {contact.get_source_display()}
ID:     #{contact.id}
"""
        send_mail(
            subject=subject,
            message=body,
            from_email=django_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[django_settings.NOTIFY_EMAIL],
            fail_silently=False,
        )
        logger.info(f'[email] ✓ Notificación de contacto #{contact.id} enviada')
    except Exception as e:
        logger.error(f'[email] ✗ Error notificando contacto #{contact.id}: {e}')


@api_view(['POST'])
@permission_classes([AllowAny])
def public_contact(request):
    serializer = ContactSerializer(data=request.data)
    if serializer.is_valid():
        contact = serializer.save()
        threading.Thread(target=_send_contact_notify, args=(contact,), daemon=True).start()
        return Response({
            'message': 'Mensaje recibido. Te contactamos pronto.',
            **serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.prefetch_related('interactions').all()
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status', 'source']
    search_fields = ['nombre', 'email', 'tel', 'empresa', 'interes']

    @action(detail=True, methods=['post'])
    def add_interaction(self, request, pk=None):
        contact = self.get_object()
        serializer = InteractionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(contact=contact, created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        contact = self.get_object()
        new_status = request.data.get('status')
        valid = [s[0] for s in Contact._meta.get_field('status').choices]
        if new_status not in valid:
            return Response({'error': 'Estado inválido.'}, status=status.HTTP_400_BAD_REQUEST)
        contact.status = new_status
        contact.save(update_fields=['status', 'updated_at'])
        return Response({'status': contact.status, 'status_display': contact.get_status_display()})

    @action(detail=False, methods=['get'])
    def pipeline(self, request):
        from django.db.models import Count
        data = Contact.objects.values('status').annotate(count=Count('id'))
        return Response(list(data))

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from .models import Attendee, Registration
from .serializers import (
    AttendeeSerializer, RegistrationListSerializer,
    RegistrationDetailSerializer, RegisterWorkshopSerializer
)


class AttendeeViewSet(viewsets.ModelViewSet):
    queryset = Attendee.objects.all()
    serializer_class = AttendeeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['fuente']
    search_fields = ['nombre', 'email', 'tel', 'empresa']


class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.select_related('attendee', 'workshop').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['workshop', 'status', 'payment_status', 'attended']
    search_fields = ['folio', 'attendee__nombre', 'attendee__email']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RegistrationDetailSerializer
        return RegistrationListSerializer

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def check_in(self, request, pk=None):
        reg = self.get_object()
        if reg.attended:
            return Response({'detail': 'Ya registró asistencia.'}, status=status.HTTP_400_BAD_REQUEST)
        reg.attended = True
        reg.check_in_at = timezone.now()
        reg.save(update_fields=['attended', 'check_in_at'])
        return Response({'detail': 'Check-in registrado.', 'check_in_at': reg.check_in_at})

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def check_in_by_folio(self, request):
        folio = request.data.get('folio', '').strip().upper()
        try:
            reg = Registration.objects.get(folio=folio)
        except Registration.DoesNotExist:
            return Response({'detail': 'Folio no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        if reg.attended:
            return Response({'detail': 'Ya registró asistencia.', 'nombre': reg.attendee.nombre})
        reg.attended = True
        reg.check_in_at = timezone.now()
        reg.save(update_fields=['attended', 'check_in_at'])
        return Response({
            'detail': '✓ Check-in exitoso',
            'nombre': reg.attendee.nombre,
            'workshop': reg.workshop.title,
            'folio': reg.folio,
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def public_register(request):
    serializer = RegisterWorkshopSerializer(data=request.data)
    if serializer.is_valid():
        reg = serializer.save()
        return Response({
            'folio': reg.folio,
            'nombre': reg.attendee.nombre,
            'email': reg.attendee.email,
            'workshop': reg.workshop.title,
            'payment_method': reg.payment_method,
            'message': 'Inscripción registrada. Te enviamos confirmación a tu correo.',
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

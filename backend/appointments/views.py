from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentAdminSerializer


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
        serializer.save()
        return Response({
            'message': 'Cita solicitada. Te contactamos en menos de 24 hrs hábiles.',
            **serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

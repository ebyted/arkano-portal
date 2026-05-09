from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Contact, Interaction
from .serializers import ContactSerializer, InteractionSerializer


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

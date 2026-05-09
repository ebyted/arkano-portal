from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend

from .models import SuccessCase, SuccessCaseImage
from .serializers import SuccessCaseSerializer, SuccessCaseImageSerializer


class SuccessCaseViewSet(viewsets.ModelViewSet):
    queryset = SuccessCase.objects.prefetch_related('images').all()
    serializer_class = SuccessCaseSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'published']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action in ['list', 'retrieve'] and not self.request.user.is_authenticated:
            qs = qs.filter(published=True)
        return qs

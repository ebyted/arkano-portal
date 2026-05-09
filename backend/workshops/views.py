from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Category, Instructor, Workshop, WorkshopImage
from .serializers import (
    CategorySerializer, InstructorSerializer,
    WorkshopListSerializer, WorkshopDetailSerializer,
    WorkshopWriteSerializer, WorkshopImageSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class InstructorViewSet(viewsets.ModelViewSet):
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class WorkshopViewSet(viewsets.ModelViewSet):
    queryset = Workshop.objects.select_related('category', 'instructor').prefetch_related('images')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'level', 'modality', 'category']
    search_fields = ['title', 'subtitle', 'code', 'short_description']
    ordering_fields = ['date', 'price', 'created_at']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action in ['list', 'retrieve'] and not self.request.user.is_authenticated:
            qs = qs.filter(status=Workshop.STATUS_PUBLISHED)
        return qs

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return WorkshopDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return WorkshopWriteSerializer
        return WorkshopListSerializer

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated],
            parser_classes=[MultiPartParser, FormParser])
    def add_image(self, request, pk=None):
        workshop = self.get_object()
        if workshop.images.count() >= 5:
            return Response({'error': 'Máximo 5 imágenes por taller.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = WorkshopImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(workshop=workshop)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated],
            url_path='images/(?P<image_id>[^/.]+)')
    def remove_image(self, request, pk=None, image_id=None):
        workshop = self.get_object()
        try:
            img = workshop.images.get(pk=image_id)
            img.image.delete(save=False)
            img.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except WorkshopImage.DoesNotExist:
            return Response({'error': 'Imagen no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def stats(self, request):
        from registrations.models import Registration
        data = {
            'total': Workshop.objects.filter(status=Workshop.STATUS_PUBLISHED).count(),
            'categories': list(Category.objects.values('id', 'name', 'slug')),
        }
        return Response(data)

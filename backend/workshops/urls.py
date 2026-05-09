from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, InstructorViewSet, WorkshopViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('instructors', InstructorViewSet, basename='instructor')
router.register('workshops', WorkshopViewSet, basename='workshop')

urlpatterns = [
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendeeViewSet, RegistrationViewSet, public_register

router = DefaultRouter()
router.register('attendees', AttendeeViewSet, basename='attendee')
router.register('registrations', RegistrationViewSet, basename='registration')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', public_register, name='public_register'),
]

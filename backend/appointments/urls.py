from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, public_appointment

router = DefaultRouter()
router.register('appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
    path('cita/', public_appointment, name='public_appointment'),
]

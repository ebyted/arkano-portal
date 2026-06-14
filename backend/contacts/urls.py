from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactViewSet, public_contact

router = DefaultRouter()
router.register('contacts', ContactViewSet, basename='contact')

urlpatterns = [
    path('contacto/', public_contact, name='public-contact'),
    path('', include(router.urls)),
]

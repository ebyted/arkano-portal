from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SuccessCaseViewSet

router = DefaultRouter()
router.register('cases', SuccessCaseViewSet, basename='case')

urlpatterns = [
    path('', include(router.urls)),
]

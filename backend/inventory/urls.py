from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'materials', views.MaterialViewSet)
router.register(r'material-requests', views.MaterialRequestViewSet, basename='material-request')

urlpatterns = [
    path('', include(router.urls)),
]

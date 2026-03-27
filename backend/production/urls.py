from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet)
router.register(r'tasks', views.TaskViewSet)
router.register(r'quality-checks', views.QualityCheckViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

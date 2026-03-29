from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'materials', views.MaterialViewSet)
router.register(r'suppliers', views.SupplierViewSet, basename='supplier')
router.register(r'material-requests', views.MaterialRequestViewSet, basename='materialrequest')
router.register(r'purchase-orders', views.PurchaseOrderViewSet, basename='purchaseorder')

urlpatterns = [
    path('', include(router.urls)),
]

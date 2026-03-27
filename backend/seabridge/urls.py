"""
URL configuration for Seabridge Boats Manufacturing project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('inventory.urls')),
    path('api/', include('production.urls')),
    path('api/', include('payroll.urls')),
    path('api/', include('dtr.urls')),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'employees', views.EmployeeViewSet)
router.register(r'payroll', views.PayrollRecordViewSet)
router.register(r'payroll-profiles', views.EmployeePayrollProfileViewSet, basename='payrollprofile')
router.register(r'payroll-runs', views.PayrollRunViewSet, basename='payrollrun')
router.register(r'deductions', views.DeductionViewSet, basename='deduction')

urlpatterns = [
    path('', include(router.urls)),
]

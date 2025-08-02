from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (register_patient, verify_otp, 
        add_patient_medical_info, patient_login, 
        verify_login_otp,
    )

urlpatterns = [
    path('register/', register_patient, name='patient-register'),
    path('verify-otp/', verify_otp, name='patient-verify-otp'),
    path('add-medical-info/', add_patient_medical_info, name='add-patient-medical-info'),
    path('login/', patient_login, name='patient-login'),
    path('verify-login-otp/', verify_login_otp, name='verify-login-otp'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]
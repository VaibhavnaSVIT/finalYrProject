from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from .views import (
    send_doctor_otp,
    register_doctor,
    doctor_login,
    verify_doctor_login_otp,
    upload_doctor_files
)

urlpatterns = [
    path('send-otp/', send_doctor_otp, name='doctor-send-otp'),
    path('register/', register_doctor, name='doctor-register'),
    path('login/', doctor_login, name='doctor-login'),
    path('verify-login-otp/', verify_doctor_login_otp, name='doctor-verify-login-otp'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path("upload-doctor-files/", upload_doctor_files, name="upload-doctor-files"),
]

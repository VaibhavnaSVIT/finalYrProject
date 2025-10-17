from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from .views import (
    send_doctor_otp,
    register_doctor,
    doctor_login,
    upload_doctor_files,
    upload_medical_image,
    wrong_image_feedback,
    symptoms_assessment
)

urlpatterns = [
    path('send-otp/', send_doctor_otp, name='doctor-send-otp'),
    path('register/', register_doctor, name='doctor-register'),
    path('login/', doctor_login, name='doctor-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path("upload-doctor-files/", upload_doctor_files, name="upload-doctor-files"),
    path("upload-images/", upload_medical_image, name='upload-medical-img'),
    path("wrong-image-feedback/", wrong_image_feedback, name='wrong-image-feedback'),
    path("symptom-assessment/", symptoms_assessment, name='symptom-assessment')
]

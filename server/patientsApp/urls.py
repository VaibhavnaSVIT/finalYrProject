from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (register_patient, verify_otp, 
        add_patient_medical_info, patient_login, patient_dashboard, upload_medical_image, symptom_assessment, get_results, get_verified_doctors, get_image_classifications, get_symptoms_prediction
    )

urlpatterns = [
    path('register/', register_patient, name='patient-register'),
    path('verify-otp/', verify_otp, name='patient-verify-otp'),
    path('add-medical-info/', add_patient_medical_info, name='add-patient-medical-info'),
    path("dashboard/", patient_dashboard, name='patient-dashboard'),
    path("upload-images/", upload_medical_image, name='upload-medical-img'),
    path("symptom-assessment/", symptom_assessment, name='symptom-assessment'),
    path("results/", get_results, name='get-results'),
    path('login/', patient_login, name='patient-login'),
    path('list-doctors/', get_verified_doctors, name='verified-doctors'),
    path('image-classification-result/', get_image_classifications, name='image-classification-result'),
    path("symptom-prediction-result/", get_symptoms_prediction, name='symptom-prediction-result'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]
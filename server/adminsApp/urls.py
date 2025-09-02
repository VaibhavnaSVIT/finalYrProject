from django.urls import path
from . import views

urlpatterns = [
    path("api/signup/", views.register_admin, name="register_admin"),
    path("api/verify-otp/", views.verify_admin_otp, name="verify_admin_otp"),
    path("api/login/", views.admin_login, name="admin_login"),
    path("api/doctors/pending/", views.get_pending_doctors, name="get_pending_doctors"),
    path("api/doctors/approve/", views.approve_doctor, name="approve_doctors"),
    path("api/doctors/reject/", views.reject_doctor, name="reject_doctors"),
    path("api/patients/pending/", views.get_pending_patients, name="get_pending_patients"),
    path("api/patients/approve/", views.approve_patient, name="approve_patients"),
    path("api/patients/reject/", views.reject_patient, name="reject_patients"),
]
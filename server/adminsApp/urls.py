from django.urls import path
from . import views

urlpatterns = [
    path("api/signup/", views.register_admin, name="register_admin"),
    path("api/verify-otp/", views.verify_admin_otp, name="verify_admin_otp"),
    path("api/login/", views.admin_login, name="admin_login"),
    path("api/verify-login-otp/", views.verify_admin_login_otp, name="verify_admin_login_otp"),
]
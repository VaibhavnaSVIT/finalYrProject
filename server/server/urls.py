from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('myadmin/', admin.site.urls),
    path('patient/', include('patientsApp.urls')),
    path('doctor/', include('doctorsApp.urls')),
    path('admin/', include('adminsApp.urls')),
]
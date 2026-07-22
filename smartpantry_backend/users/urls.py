from django.urls import path
from . import views
from .views import UserSettingsView

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('resend-code/', views.resend_code, name='resend_code'),
    path("settings/", UserSettingsView.as_view(), name="user-settings"),
]
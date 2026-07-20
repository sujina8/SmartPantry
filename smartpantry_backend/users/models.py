# users/models.py
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
from datetime import timedelta
import random
import secrets


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=254, unique=True)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, blank=True)
    household_size = models.IntegerField(default=1)

    is_2fa_enabled = models.BooleanField(default=False)
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_expiry = models.DateTimeField(blank=True, null=True)
    verification_token = models.CharField(max_length=64, blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    is_donations_public = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = CustomUserManager()

    def generate_otp(self):
        self.otp_code = str(random.randint(100000, 999999))
        self.otp_expiry = timezone.now() + timedelta(minutes=10)
        self.verification_token = secrets.token_urlsafe(32)
        self.save()
        return self.otp_code, self.verification_token

    def is_otp_valid(self, entered_code):
        if not self.otp_code or not self.otp_expiry:
            return False
        if timezone.now() > self.otp_expiry:
            return False
        return self.otp_code == entered_code
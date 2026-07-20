# users/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser


def user_payload(user):
    return {"id": user.id, "full_name": user.full_name, "email": user.email}


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    full_name = request.data.get('full_name')
    email = request.data.get('email')
    password = request.data.get('password')
    household_size = request.data.get('household_size')

    if CustomUser.objects.filter(email=email).exists():
        return Response({"error": "This email is already registered. Please log in or use a different email."}, status=400)

    user = CustomUser.objects.create_user(
        email=email,
        password=password,
        full_name=full_name,
        household_size=household_size or 1,
        is_verified=True,  # account usable immediately; 2FA happens at login instead
    )
    return Response({"message": "Registration successful. Please log in.", "user_id": user.id}, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(request, email=email, password=password)

    if user is None:
        return Response({"error": "Invalid email or password"}, status=401)

    # Always require OTP at login (2FA)
    code, _token = user.generate_otp()

    send_mail(
        subject='Your SmartPantry Login Code',
        message=f"Your login verification code is: {code}\nThis code expires in 10 minutes.",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user.email],
    )

    return Response({"requires_2fa": True, "email": user.email}, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get('email')
    entered_code = request.data.get('otp')

    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    if not user.is_otp_valid(entered_code):
        return Response({"error": "Invalid or expired code. Please try logging in again."}, status=400)

    user.otp_code = None
    user.save()

    refresh = RefreshToken.for_user(user)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": user_payload(user),
    }, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_code(request):
    email = request.data.get('email')
    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    code, _token = user.generate_otp()
    send_mail(
        subject='SmartPantry – New Login Code',
        message=f"Your new login code is: {code}",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user.email],
    )
    return Response({"message": "New code sent"}, status=200)
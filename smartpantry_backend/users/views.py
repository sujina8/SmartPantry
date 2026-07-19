import secrets
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import RegisterSerializer, UserSerializer


def issue_tokens_response(user):
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'email': user.email,
            'full_name': user.full_name,
        }
    })


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Registration successful',
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, email=email, password=password)
        if user is None:
            return Response({
                'error': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)

        if user.is_2fa_enabled:
            otp = f"{secrets.randbelow(1000000):06d}"
            user.otp_code = otp
            user.otp_expiry = timezone.now() + timedelta(minutes=10)
            user.save(update_fields=['otp_code', 'otp_expiry'])

            send_mail(
                subject='Your SmartPantry login code',
                message=f'Your one-time login code is: {otp}\n\nThis code expires in 10 minutes.',
                from_email='noreply@smartpantry.local',
                recipient_list=[user.email],
                fail_silently=False,
            )

            return Response({
                'requires_2fa': True,
                'email': user.email,
            })

        return issue_tokens_response(user)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Invalid code. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.otp_code or user.otp_code != otp:
            return Response({'error': 'Invalid code. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.otp_expiry or timezone.now() > user.otp_expiry:
            return Response({'error': 'This code has expired. Please log in again.'}, status=status.HTTP_400_BAD_REQUEST)

        # OTP is valid and single-use — clear it so it can't be replayed
        user.otp_code = None
        user.otp_expiry = None
        user.save(update_fields=['otp_code', 'otp_expiry'])

        return issue_tokens_response(user)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
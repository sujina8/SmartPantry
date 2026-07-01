from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from food.models import FoodItem
from donation.models import Donation

class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Count total food items
        total_items = FoodItem.objects.filter(
            user=request.user
        ).count()

        # Count donated items
        total_donated = Donation.objects.filter(
            donor=request.user
        ).count()

        # Count expiring soon items
        from django.utils import timezone
        from datetime import timedelta
        soon = timezone.now().date() + timedelta(days=3)
        expiring_soon = FoodItem.objects.filter(
            user=request.user,
            expiry_date__lte=soon
        ).count()

        return Response({
            'total_items': total_items,
            'total_donated': total_donated,
            'expiring_soon': expiring_soon,
        })
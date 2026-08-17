from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from django.db.models.functions import TruncWeek
from food.models import FoodItem
from donation.models import Donation


class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        category = request.query_params.get('category')

        total_items = FoodItem.objects.filter(user=request.user).count()
        items_used = FoodItem.objects.filter(user=request.user, is_used=True).count()

        donation_qs = Donation.objects.filter(donor=request.user)
        if category:
            donation_qs = donation_qs.filter(food_item__category=category)

        total_donated = donation_qs.count()

        soon = timezone.now().date() + timedelta(days=3)
        expiring_soon = FoodItem.objects.filter(
            user=request.user,
            expiry_date__lte=soon
        ).count()

        weekly_qs = (
            donation_qs
            .annotate(week=TruncWeek('created_at'))
            .values('week')
            .annotate(count=Count('id'))
            .order_by('week')
        )
        weekly_trend = [
            {'week': entry['week'].strftime('%Y-%m-%d'), 'count': entry['count']}
            for entry in weekly_qs
        ]

        # Items logged per week (general inventory activity, not just donations)
        items_logged_qs = (
            FoodItem.objects.filter(user=request.user)
            .annotate(week=TruncWeek('date_added'))
            .values('week')
            .annotate(count=Count('id'))
            .order_by('week')
        )
        items_logged_trend = [
            {'week': entry['week'].strftime('%Y-%m-%d'), 'count': entry['count']}
            for entry in items_logged_qs
        ]

        category_qs = (
            donation_qs
            .values('food_item__category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        category_breakdown = [
            {'category': entry['food_item__category'], 'count': entry['count']}
            for entry in category_qs
        ]

        return Response({
            'total_items': total_items,
            'items_used': items_used,
            'total_donated': total_donated,
            'expiring_soon': expiring_soon,
            'weekly_trend': weekly_trend,
            'items_logged_trend': items_logged_trend,
            'category_breakdown': category_breakdown,
        })
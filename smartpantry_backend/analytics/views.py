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
        # --- Existing summary stats (unchanged) ---
        total_items = FoodItem.objects.filter(user=request.user).count()
        total_donated = Donation.objects.filter(donor=request.user).count()

        soon = timezone.now().date() + timedelta(days=3)
        expiring_soon = FoodItem.objects.filter(
            user=request.user,
            expiry_date__lte=soon
        ).count()

        # --- NEW: weekly donation trend, last 8 weeks (powers the bar chart) ---
        # ASSUMPTION: Donation model has a `created_at` DateTimeField.
        # Adjust the field name below if yours is called something else
        # (e.g. `donated_at`, `date_created`).
        eight_weeks_ago = timezone.now() - timedelta(weeks=8)
        weekly_qs = (
            Donation.objects.filter(donor=request.user, created_at__gte=eight_weeks_ago)
            .annotate(week=TruncWeek('created_at'))
            .values('week')
            .annotate(count=Count('id'))
            .order_by('week')
        )
        weekly_trend = [
            {'week': w['week'].strftime('%b %d'), 'count': w['count']}
            for w in weekly_qs
        ]

        # --- NEW: donation breakdown by category (powers the pie chart) ---
        # ASSUMPTION: Donation has a ForeignKey `food_item` to FoodItem,
        # and FoodItem has a `category` field. Adjust the lookup below
        # (e.g. `food_item__category` -> `category`) if Donation stores
        # category directly instead of through FoodItem.
        category_qs = (
            Donation.objects.filter(donor=request.user)
            .values('food_item__category')
            .annotate(count=Count('id'))
        )
        category_breakdown = [
            {'category': c['food_item__category'] or 'Other', 'count': c['count']}
            for c in category_qs
        ]

        return Response({
            'total_items': total_items,
            'total_donated': total_donated,
            'expiring_soon': expiring_soon,
            'weekly_trend': weekly_trend,
            'category_breakdown': category_breakdown,
        })
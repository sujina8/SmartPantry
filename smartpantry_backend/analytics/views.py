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
        period = request.query_params.get('period', 'all')

        now = timezone.now().date()
        cutoff = None
        if period == '7d':
            cutoff = now - timedelta(days=7)
        elif period == '30d':
            cutoff = now - timedelta(days=30)
        elif period == '90d':
            cutoff = now - timedelta(days=90)

        food_qs = FoodItem.objects.filter(user=request.user)
        donation_qs = Donation.objects.filter(donor=request.user)

        if category:
            food_qs = food_qs.filter(category=category)
            donation_qs = donation_qs.filter(food_item__category=category)

        if cutoff is not None:
            food_qs = food_qs.filter(date_added__date__gte=cutoff)
            donation_qs = donation_qs.filter(created_at__date__gte=cutoff)

        total_items = food_qs.count()
        items_used = food_qs.filter(is_used=True).count()
        total_donated = donation_qs.count()
        food_saved_from_waste = items_used + total_donated

        soon = now + timedelta(days=3)
        expiring_soon = food_qs.filter(expiry_date__lte=soon).count()

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

        items_logged_qs = (
            food_qs
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
            'food_saved_from_waste': food_saved_from_waste,
            'expiring_soon': expiring_soon,
            'weekly_trend': weekly_trend,
            'items_logged_trend': items_logged_trend,
            'category_breakdown': category_breakdown,
        })
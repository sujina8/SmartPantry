from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta
from .models import FoodItem
from .serializers import FoodItemSerializer

class FoodItemViewSet(viewsets.ModelViewSet):
    # Only authenticated users can access inventory
    permission_classes = [IsAuthenticated]
    serializer_class = FoodItemSerializer

    def get_queryset(self):
        # Users can only see their own food items
        queryset = FoodItem.objects.filter(user=self.request.user)
        
        # Filter by category if provided
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by storage location if provided
        storage = self.request.query_params.get('storage')
        if storage:
            queryset = queryset.filter(storage_location=storage)
        
        # Search by name if provided
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset

    def perform_create(self, serializer):
        # Automatically set the user when creating a food item
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        # Returns items expiring within 3 days
        soon = timezone.now().date() + timedelta(days=3)
        items = FoodItem.objects.filter(
            user=request.user,
            expiry_date__lte=soon,
            is_donated=False
        )
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expired(self, request):
        # Returns already expired items
        today = timezone.now().date()
        items = FoodItem.objects.filter(
            user=request.user,
            expiry_date__lt=today,
            is_donated=False
        )
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)
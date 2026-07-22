from rest_framework import serializers
from .models import FoodItem
from django.utils import timezone

class FoodItemSerializer(serializers.ModelSerializer):
    is_expiring_soon = serializers.ReadOnlyField()
    
    class Meta:
        model = FoodItem
        fields = [
            'id', 'name', 'quantity', 'unit', 
            'category', 'storage_location', 'expiry_date', 
            'notes', 'is_donated', 'date_added', 'is_expiring_soon', 'image'
        ]
        read_only_fields = ['id', 'date_added', 'is_donated']
    
    def validate_expiry_date(self, value):
        # Expiry date cannot be in the past
        if value < timezone.now().date():
            raise serializers.ValidationError(
                "Expiry date cannot be in the past."
            )
        return value
    
    def validate_quantity(self, value):
        # Quantity must be greater than 0
        if value <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than 0."
            )
        return value
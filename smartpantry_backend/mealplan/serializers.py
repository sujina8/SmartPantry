from rest_framework import serializers
from .models import MealPlan

class MealPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPlan
        fields = [
            'id', 'date', 'meal_type', 
            'meal_name', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
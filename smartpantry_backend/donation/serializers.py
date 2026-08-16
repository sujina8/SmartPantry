from rest_framework import serializers
from .models import Donation
from food.serializers import FoodItemSerializer

class DonationSerializer(serializers.ModelSerializer):
    donor_email = serializers.ReadOnlyField(source='donor.email')
    donor_full_name = serializers.ReadOnlyField(source='donor.full_name')
    donor_phone = serializers.ReadOnlyField(source='donor.phone_number')
    food_item_detail = FoodItemSerializer(source='food_item', read_only=True)

    class Meta:
        model = Donation
        fields = [
            'id', 'donor_email', 'donor_full_name', 'donor_phone',
            'food_item', 'food_item_detail', 'description',
            'pickup_info', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'donor_email', 'donor_full_name', 'donor_phone']
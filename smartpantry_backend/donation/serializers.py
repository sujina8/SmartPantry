from rest_framework import serializers
from .models import Donation

class DonationSerializer(serializers.ModelSerializer):
    donor_email = serializers.ReadOnlyField(source='donor.email')
    food_item_name = serializers.ReadOnlyField(source='food_item.name')

    class Meta:
        model = Donation
        fields = [
            'id', 'donor_email', 'food_item',
            'food_item_name', 'description',
            'pickup_info', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'donor_email']
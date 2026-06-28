from django.db import models
from django.conf import settings
from food.models import FoodItem

class Donation(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('claimed', 'Claimed'),
        ('completed', 'Completed'),
    ]
    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='donations')
    claimer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='claimed_donations')
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    description = models.TextField(blank=True)
    pickup_info = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.donor.email} - {self.food_item.name}'
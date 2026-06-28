from django.db import models
from django.conf import settings
from datetime import date, timedelta


class FoodItem(models.Model):
    # Food category choices
    CATEGORY_CHOICES = [
        ('vegetables', 'Vegetables'),
        ('fruits', 'Fruits'),
        ('dairy', 'Dairy'),
        ('meat', 'Meat'),
        ('grains', 'Grains'),
        ('beverages', 'Beverages'),
        ('snacks', 'Snacks'),
        ('others', 'Others'),
    ]

    STORAGE_CHOICES = [
        ('fridge', 'Fridge'),
        ('freezer', 'Freezer'),
        ('pantry', 'Pantry'),
        ('counter', 'Counter'),
    ]

    # User who owns the food item
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='food_items'
    )

    name = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50, default='pcs')
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='others'
    )
    storage_location = models.CharField(
        max_length=50,
        choices=STORAGE_CHOICES,
        default='pantry'
    )
    expiry_date = models.DateField()
    notes = models.TextField(blank=True)
    is_donated = models.BooleanField(default=False)

    date_added = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['expiry_date']

    def __str__(self):
        return f"{self.name} - {self.user.email}"

    @property
    def is_expiring_soon(self):
        """
        Returns True if the food item expires within the next 3 days.
        """
        today = date.today()
        return today <= self.expiry_date <= today + timedelta(days=3)
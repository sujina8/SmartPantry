from django.db import models
from django.conf import settings

class MealPlan(models.Model):
    MEAL_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='meal_plans')
    date = models.DateField()
    meal_type = models.CharField(max_length=20, choices=MEAL_CHOICES, default='lunch')
    meal_name = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'meal_type']

    def __str__(self):
        return f'{self.user.email} - {self.meal_name} on {self.date}'
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from food.models import FoodItem
from notification.models import Notification
from .models import MealPlan
from .serializers import MealPlanSerializer

# Small static recipe library. No DB table needed for this — each recipe is
# matched against the user's real FoodItem names at request time.
RECIPE_LIBRARY = [
    {
        'name': 'Florentine Spinach Eggs',
        'meal_type': 'breakfast',
        'ingredients': ['spinach', 'eggs'],
        'tag': 'Top Pick',
    },
    {
        'name': 'Lemon Herb Chicken Bowl',
        'meal_type': 'dinner',
        'ingredients': ['chicken', 'lemon', 'herbs'],
        'tag': 'Low Effort',
    },
    {
        'name': 'Creamy Tomato Lentil Soup',
        'meal_type': 'lunch',
        'ingredients': ['tomatoes', 'lentils', 'garlic'],
        'tag': 'Comfort Meal',
    },
    {
        'name': 'Banana Oat Smoothie',
        'meal_type': 'breakfast',
        'ingredients': ['banana', 'oats', 'milk'],
        'tag': 'Quick',
    },
    {
        'name': 'Veggie Fried Rice',
        'meal_type': 'dinner',
        'ingredients': ['rice', 'carrot', 'egg', 'soy sauce'],
        'tag': 'Uses Leftovers',
    },
    {
        'name': 'Fruit & Yogurt Bowl',
        'meal_type': 'snack',
        'ingredients': ['yogurt', 'berries', 'honey'],
        'tag': 'Light',
    },
]


def _ingredient_owned(ingredient, owned_names):
    """Loose substring match: 'spinach' matches a FoodItem named 'Fresh Spinach'."""
    return any(ingredient in name or name in ingredient for name in owned_names)


class MealPlanViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MealPlanSerializer

    def get_queryset(self):
        return MealPlan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        meal_plan = serializer.save(user=self.request.user)

        notification = Notification.objects.create(
            user=self.request.user,
            notification_type='meal',
            title=f'{meal_plan.meal_name} added to your plan',
            message=f'{meal_plan.get_meal_type_display()} on {meal_plan.date} — {meal_plan.meal_name} is on your meal plan.'
        )

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'notifications_{self.request.user.id}',
            {
                'type': 'send_notification',
                'id': notification.id,
                'title': notification.title,
                'message': notification.message,
                'notification_type': notification.notification_type,
                'created_at': notification.created_at.isoformat(),
                'is_read': notification.is_read,
            }
        )

    @action(detail=False, methods=['get'])
    def suggestions(self, request):
        """
        Suggests recipes from RECIPE_LIBRARY based on what the user actually
        has in their Inventory, prioritizing recipes that use items expiring
        soon (matches the app's food-waste-reduction goal).
        """
        food_items = FoodItem.objects.filter(user=request.user, is_donated=False)
        owned_names = {item.name.lower() for item in food_items}
        expiring_names = {item.name.lower() for item in food_items if item.is_expiring_soon}

        results = []
        for recipe in RECIPE_LIBRARY:
            matched = [ing for ing in recipe['ingredients'] if _ingredient_owned(ing, owned_names)]
            if not matched:
                continue

            uses_expiring = any(_ingredient_owned(ing, expiring_names) for ing in recipe['ingredients'])

            results.append({
                'name': recipe['name'],
                'meal_type': recipe['meal_type'],
                'tag': recipe['tag'],
                'ingredients': recipe['ingredients'],
                'matched_count': len(matched),
                'total_ingredients': len(recipe['ingredients']),
                'uses_expiring_item': uses_expiring,
            })

        results.sort(
            key=lambda r: (not r['uses_expiring_item'], -(r['matched_count'] / r['total_ingredients']))
        )

        return Response(results[:6])
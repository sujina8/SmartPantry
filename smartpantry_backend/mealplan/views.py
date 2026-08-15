from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from food.models import FoodItem
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
        # Users can only see their own meal plans
        return MealPlan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating a meal plan
        serializer.save(user=self.request.user)

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
                continue  # skip recipes the user can't currently make any part of

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

        # Prioritize: uses an expiring item first, then by how complete the match is
        results.sort(
            key=lambda r: (not r['uses_expiring_item'], -(r['matched_count'] / r['total_ingredients']))
        )

        return Response(results[:6])
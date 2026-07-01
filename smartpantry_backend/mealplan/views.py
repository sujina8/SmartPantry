from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import MealPlan
from .serializers import MealPlanSerializer

class MealPlanViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MealPlanSerializer

    def get_queryset(self):
        # Users can only see their own meal plans
        return MealPlan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating a meal plan
        serializer.save(user=self.request.user)
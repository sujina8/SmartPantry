from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from .models import Donation
from .serializers import DonationSerializer


class DonationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DonationSerializer

    def get_queryset(self):
        return Donation.objects.all()

    def perform_create(self, serializer):
        food_item = serializer.validated_data['food_item']

        if food_item.is_donated:
            raise ValidationError({"error": "This item has already been donated."})

        donation = serializer.save(donor=self.request.user)

        food_item.is_donated = True
        food_item.save()

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        donation = self.get_object()

        if donation.donor == request.user:
            return Response(
                {"You cannot claim your own donation."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if donation.status != "available":
            return Response(
                {"error": "This donation is already claimed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        donation.claimer = request.user
        donation.status = "claimed"
        donation.save()

        return Response({"message": "Donation claimed successfully"})
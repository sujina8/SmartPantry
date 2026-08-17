from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Donation
from .serializers import DonationSerializer
from notification.models import Notification


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
                {"error": "You cannot claim your own donation."},
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

        notification = Notification.objects.create(
            user=donation.donor,
            notification_type='donation',
            title=f'{donation.food_item.name} was claimed!',
            message=f'{request.user.full_name} claimed your donation of {donation.food_item.name}.'
        )

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'notifications_{donation.donor.id}',
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

        return Response({"message": "Donation claimed successfully"})
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Donation
from .serializers import DonationSerializer

class DonationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DonationSerializer

    def get_queryset(self):
        return Donation.objects.filter(status='available')

    def perform_create(self, serializer):
        serializer.save(donor=self.request.user)

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        donation = self.get_object()
        if donation.status != 'available':
            return Response({
                'error': 'This donation is already claimed'
            }, status=status.HTTP_400_BAD_REQUEST)
        donation.claimer = request.user
        donation.status = 'claimed'
        donation.save()
        return Response({'message': 'Donation claimed successfully'})
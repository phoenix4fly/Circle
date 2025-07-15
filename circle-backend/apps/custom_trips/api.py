from rest_framework import viewsets, permissions
from .models import CustomTripRequest, CustomTripOffer
from .serializers import CustomTripRequestSerializer, CustomTripOfferSerializer


class CustomTripRequestViewSet(viewsets.ModelViewSet):
    queryset = CustomTripRequest.objects.select_related('user', 'agency').prefetch_related('offers').order_by('-created_at')
    serializer_class = CustomTripRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CustomTripOfferViewSet(viewsets.ModelViewSet):
    queryset = CustomTripOffer.objects.select_related('request', 'agency').order_by('-created_at')
    serializer_class = CustomTripOfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(agency=self.request.user.agency)
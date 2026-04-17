"""
Receipt ViewSet — full CRUD, scoped to the authenticated user.
"""
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Receipt
from .serializers import ReceiptSerializer


class ReceiptViewSet(viewsets.ModelViewSet):
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'store', 'category', 'notes']
    ordering_fields = ['created_at', 'warranty_end', 'price', 'purchase_date']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return only receipts belonging to the current user."""
        return Receipt.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

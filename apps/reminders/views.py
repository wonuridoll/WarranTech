"""
Reminders view — returns receipts expiring within 30 days.
"""
from datetime import date, timedelta
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.receipts.models import Receipt
from apps.receipts.serializers import ReceiptSerializer


class ReminderListView(generics.ListAPIView):
    """
    GET /api/reminders/
    Returns receipts belonging to the user whose warranty expires
    between today and today + 30 days (inclusive), ordered by soonest first.
    """
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        today = date.today()
        deadline = today + timedelta(days=30)
        return (
            Receipt.objects
            .filter(user=self.request.user, warranty_end__gte=today, warranty_end__lte=deadline)
            .order_by('warranty_end')
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data,
        })

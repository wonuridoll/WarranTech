from django.urls import path
from .views import (
    IndexView, LoginView, RegisterView, DashboardView,
    ReceiptsListView, ReceiptFormView, RemindersView,
)

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('receipts/', ReceiptsListView.as_view(), name='receipts-list'),
    path('receipts/new/', ReceiptFormView.as_view(), name='receipt-new'),
    path('receipts/<int:pk>/edit/', ReceiptFormView.as_view(), name='receipt-edit'),
    path('reminders/', RemindersView.as_view(), name='reminders'),
]

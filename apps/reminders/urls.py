from django.urls import path
from .views import ReminderListView

urlpatterns = [
    path('reminders/', ReminderListView.as_view(), name='reminders-list'),
]

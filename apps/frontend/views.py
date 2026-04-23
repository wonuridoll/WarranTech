from django.views.generic import TemplateView
from django.shortcuts import redirect


class IndexView(TemplateView):
    def get(self, request, *args, **kwargs):
        return redirect('login')


class LoginView(TemplateView):
    template_name = 'login.html'


class RegisterView(TemplateView):
    template_name = 'register.html'


class DashboardView(TemplateView):
    template_name = 'dashboard.html'


class ReceiptsListView(TemplateView):
    template_name = 'receipts_list.html'


class ReceiptFormView(TemplateView):
    template_name = 'receipt_form.html'


class RemindersView(TemplateView):
    template_name = 'reminders.html'

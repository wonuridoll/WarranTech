"""
WarranTech URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # API routes
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.receipts.urls')),
    path('api/', include('apps.reminders.urls')),

    # Frontend routes (catch-all served by Django templates)
    path('', include('apps.frontend.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

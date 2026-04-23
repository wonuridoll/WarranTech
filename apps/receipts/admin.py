from django.contrib import admin
from .models import Receipt


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ('title', 'store', 'user', 'category', 'price', 'purchase_date', 'warranty_end', 'created_at')
    list_filter = ('category', 'purchase_date', 'warranty_end')
    search_fields = ('title', 'store', 'user__username', 'notes')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

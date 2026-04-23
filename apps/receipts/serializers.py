"""
Receipt serializer with warranty_end future-date validation.
"""
from datetime import date
from rest_framework import serializers
from .models import Receipt


class ReceiptSerializer(serializers.ModelSerializer):
    days_remaining = serializers.SerializerMethodField(read_only=True)
    is_expiring_soon = serializers.SerializerMethodField(read_only=True)
    image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Receipt
        fields = (
            'id',
            'title',
            'store',
            'category',
            'purchase_date',
            'price',
            'warranty_end',
            'notes',
            'image',
            'image_url',
            'days_remaining',
            'is_expiring_soon',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
        extra_kwargs = {
            'image': {'required': False, 'write_only': True},
        }

    def get_days_remaining(self, obj):
        delta = obj.warranty_end - date.today()
        return delta.days

    def get_is_expiring_soon(self, obj):
        delta = obj.warranty_end - date.today()
        return 0 <= delta.days <= 30

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def validate_warranty_end(self, value):
        if value < date.today():
            raise serializers.ValidationError(
                'Warranty end date must be today or a future date.'
            )
        return value

    def validate_purchase_date(self, value):
        if value > date.today():
            raise serializers.ValidationError(
                'Purchase date cannot be in the future.'
            )
        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError('Price must be a positive value.')
        return value

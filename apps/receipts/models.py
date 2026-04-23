"""
Receipt model — core data entity for WarranTech.
"""
from django.db import models
from django.contrib.auth.models import User


class Receipt(models.Model):
    CATEGORY_CHOICES = [
        ('electronics', 'Electronics'),
        ('appliances', 'Appliances'),
        ('furniture', 'Furniture'),
        ('clothing', 'Clothing'),
        ('vehicles', 'Vehicles'),
        ('tools', 'Tools & Hardware'),
        ('jewelry', 'Jewelry & Watches'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='receipts',
    )
    title = models.CharField(max_length=200)
    store = models.CharField(max_length=200)
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='other',
    )
    purchase_date = models.DateField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    warranty_end = models.DateField()
    notes = models.TextField(blank=True, default='')
    image = models.ImageField(
        upload_to='receipts/%Y/%m/',
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Receipt'
        verbose_name_plural = 'Receipts'

    def __str__(self):
        return f'{self.title} — {self.user.username}'

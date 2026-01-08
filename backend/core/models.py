from django.db import models


class School(models.Model):
    """
    Represents a school/tenant in the multi-tenant SaaS system.
    Each school has its own isolated data (students, payments, users, etc.)
    """
    # Basic Information
    name = models.CharField(max_length=255, help_text="School name")
    code = models.CharField(
        max_length=50, 
        unique=True,
        help_text="Unique school code (e.g., SHINING001)"
    )
    
    # Contact & Location
    email = models.EmailField(help_text="School contact email")
    phone = models.CharField(max_length=20, help_text="School contact phone")
    address = models.TextField(help_text="Physical address")
    city = models.CharField(max_length=100, default="Harare")
    country = models.CharField(max_length=100, default="Zimbabwe")
    
    # Subscription & Status
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the school's subscription is active"
    )
    subscription_tier = models.CharField(
        max_length=50,
        choices=[
            ('starter', 'Starter (< 150 students)'),
            ('growth', 'Growth (150-400 students)'),
            ('professional', 'Professional (400-800 students)'),
            ('enterprise', 'Enterprise (800+ students)'),
        ],
        default='starter',
        help_text="Pricing tier based on school size"
    )
    subscription_start_date = models.DateField(
        auto_now_add=True,
        help_text="Date school started subscription"
    )
    subscription_end_date = models.DateField(
        null=True,
        blank=True,
        help_text="Subscription expiry date (null = active)"
    )
    monthly_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=60.00,
        help_text="Monthly subscription fee in USD"
    )
    
    # WhatsApp Configuration
    whatsapp_phone_number = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        help_text="WhatsApp bot number for this school"
    )
    whatsapp_enabled = models.BooleanField(
        default=True,
        help_text="Whether WhatsApp bot is enabled for this school"
    )
    
    # Branding (for future customization)
    logo_url = models.URLField(
        null=True,
        blank=True,
        help_text="URL to school logo"
    )
    primary_color = models.CharField(
        max_length=7,
        default='#1976d2',
        help_text="Primary brand color (hex format)"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'School'
        verbose_name_plural = 'Schools'
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    @property
    def is_subscription_active(self):
        """Check if subscription is currently active"""
        if not self.is_active:
            return False
        if self.subscription_end_date is None:
            return True
        from django.utils import timezone
        return self.subscription_end_date >= timezone.now().date()

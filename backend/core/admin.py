from django.contrib import admin
from .models import School


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'city', 'subscription_tier', 'is_active', 'created_at')
    list_filter = ('is_active', 'subscription_tier', 'city', 'country')
    search_fields = ('name', 'code', 'email', 'phone')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'email', 'phone')
        }),
        ('Location', {
            'fields': ('address', 'city', 'country')
        }),
        ('Subscription', {
            'fields': (
                'is_active',
                'subscription_tier',
                'monthly_fee',
                'subscription_start_date',
                'subscription_end_date'
            )
        }),
        ('WhatsApp Configuration', {
            'fields': ('whatsapp_phone_number', 'whatsapp_enabled')
        }),
        ('Branding', {
            'fields': ('logo_url', 'primary_color'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

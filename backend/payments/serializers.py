from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Payment
from datetime import date

def generate_receipt_number():
    """Generate a sequential receipt number in format REC-YYYY-NNNNN"""
    today = date.today()
    year = today.year
    # Get the latest payment for this year to determine the next sequence number
    last_payment = Payment.objects.filter(academic_year=year).order_by('-id').first()
    
    if last_payment and last_payment.receipt_number.startswith(f"REC-{year}-"):
        try:
            # Extract sequence number from REC-YYYY-NNNNN
            last_sequence = int(last_payment.receipt_number.split('-')[-1])
            count = last_sequence + 1
        except ValueError:
            # Fallback if receipt number format is unexpected
            count = Payment.objects.filter(academic_year=year).count() + 1
    else:
        count = 1
        
    return f"REC-{year}-{count:05d}"

class PaymentSerializer(serializers.ModelSerializer):
    cashier_id = serializers.IntegerField(write_only=True, required=False)
    term = serializers.CharField(required=False)
    academic_year = serializers.IntegerField(required=False)
    receipt_number = serializers.CharField(required=False)  # Now optional - auto-generated

    class Meta:
        model = Payment
        fields = '__all__'
        extra_kwargs = {
            'cashier_name': {'read_only': True},
            'date': {'read_only': True},
            'term': {'required': False},
            'academic_year': {'required': False},
            'voided_at': {'read_only': True},
            'voided_by': {'read_only': True},
        }

    def to_internal_value(self, data):
        # Set defaults BEFORE field validation runs
        d = data.copy() if hasattr(data, 'copy') else dict(data)
        
        # Auto-pick term/academic_year
        if not d.get('term') or not d.get('academic_year'):
            from datetime import date
            today = date.today()
            month = today.month
            if 1 <= month <= 4:
                term_val = '1'
            elif 5 <= month <= 8:
                term_val = '2'
            else:
                term_val = '3'
            d.setdefault('term', term_val)
            d.setdefault('academic_year', today.year)
            
        # Auto-generate receipt number if missing
        if not d.get('receipt_number'):
            d['receipt_number'] = generate_receipt_number()
            
        return super().to_internal_value(d)

    def validate(self, attrs):
        # Ensure term/year are present (should be handled by to_internal_value but safe to keep)
        term = attrs.get('term')
        year = attrs.get('academic_year')
        if not term or not year:
            from datetime import date
            today = date.today()
            month = today.month
            if 1 <= month <= 4:
                term_val = '1'
            elif 5 <= month <= 8:
                term_val = '2'
            else:
                term_val = '3'
            attrs.setdefault('term', term_val)
            attrs.setdefault('academic_year', today.year)
        return attrs

    def create(self, validated_data):
        cashier_id = validated_data.pop('cashier_id', None)
        request = self.context.get('request')
        # Auto-pick term/year if missing
        if not validated_data.get('term') or not validated_data.get('academic_year'):
            from datetime import date
            today = date.today()
            month = today.month
            if 1 <= month <= 4:
                term_val = '1'
            elif 5 <= month <= 8:
                term_val = '2'
            else:
                term_val = '3'
            validated_data.setdefault('term', term_val)
            validated_data.setdefault('academic_year', today.year)

        if cashier_id:
            try:
                user = User.objects.get(id=cashier_id)
                validated_data['cashier_name'] = user.get_full_name() or user.username
            except User.DoesNotExist:
                validated_data['cashier_name'] = validated_data.get('cashier_name') or 'Unknown'
        elif request and getattr(request, 'user', None) and request.user.is_authenticated:
            user = request.user
            validated_data['cashier_name'] = user.get_full_name() or user.username
        else:
            validated_data['cashier_name'] = validated_data.get('cashier_name') or 'Unknown'

        # Auto-generate receipt number if not provided
        if not validated_data.get('receipt_number'):
            validated_data['receipt_number'] = generate_receipt_number()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        from core.permissions import get_role
        cashier_id = validated_data.pop('cashier_id', None)
        request = self.context.get('request')
        role = get_role(request.user) if request and getattr(request, 'user', None) else None
        
        # Only admin can reassign cashier
        if cashier_id is not None and role != 'Admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only admin can reassign cashier')
        
        # Block edits for posted payments
        if instance.status == 'posted':
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'detail': 'Posted payments cannot be edited'})
        
        # Only allow the original cashier or admin to edit a payment
        if request and getattr(request, 'user', None) and request.user.is_authenticated:
            req_name = request.user.get_full_name() or request.user.username
            if role != 'Admin' and (instance.cashier_name != req_name):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Cannot edit another cashier's payment")
        
        # Only admin can void (only check when actually changing to voided)
        new_status = validated_data.get('status')
        if new_status == 'voided' and instance.status != 'voided' and role != 'Admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only admin can void payments')
        
        # Require void_reason when voiding
        if new_status == 'voided' and instance.status != 'voided':
            if not validated_data.get('void_reason'):
                from rest_framework.exceptions import ValidationError
                raise ValidationError({'void_reason': 'Void reason is required when voiding a payment'})
            
            # Auto-populate void tracking fields
            from django.utils import timezone
            validated_data['voided_at'] = timezone.now()
            if request and getattr(request, 'user', None) and request.user.is_authenticated:
                validated_data['voided_by'] = request.user.get_full_name() or request.user.username
            else:
                validated_data['voided_by'] = 'Unknown'
        
        # Prevent re-voiding
        if instance.status == 'voided' and new_status == 'voided':
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'detail': 'Payment is already voided'})
        
        # Only pending payments can be edited (other statuses only allow status transitions as permitted above)
        if instance.status != 'pending':
            for key in ['student', 'amount', 'payment_method', 'receipt_number', 'term', 'academic_year',
                        'fee_type', 'reference_id', 'bank_name', 'merchant_provider', 'void_reason']:
                if key in validated_data and key != 'void_reason':  # void_reason is allowed when voiding
                    validated_data.pop(key)

        if cashier_id:
            try:
                user = User.objects.get(id=cashier_id)
                validated_data['cashier_name'] = user.get_full_name() or user.username
            except User.DoesNotExist:
                pass
        elif request and getattr(request, 'user', None) and request.user.is_authenticated:
            user = request.user
            validated_data['cashier_name'] = user.get_full_name() or user.username

        return super().update(instance, validated_data)

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    cashier_id = serializers.IntegerField(write_only=True, required=False)
    term = serializers.CharField(required=False)
    academic_year = serializers.IntegerField(required=False)

    class Meta:
        model = Payment
        fields = '__all__'
        extra_kwargs = {
            'cashier_name': {'read_only': True},
            'date': {'read_only': True},
            'term': {'required': False},
            'academic_year': {'required': False},
        }

    def validate(self, attrs):
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
        elif request and request.user and request.user.is_authenticated:
            user = request.user
            validated_data['cashier_name'] = user.get_full_name() or user.username
        else:
            validated_data['cashier_name'] = validated_data.get('cashier_name') or 'Unknown'

        return super().create(validated_data)

    def update(self, instance, validated_data):
        cashier_id = validated_data.pop('cashier_id', None)
        request = self.context.get('request')
        # Lifecycle rules
        # Block edits for posted payments
        if instance.status == 'posted':
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'detail': 'Posted payments cannot be edited'})
        # Only allow the original cashier or admin to edit a payment
        if request and request.user and request.user.is_authenticated:
            req_name = request.user.get_full_name() or request.user.username
            if (not request.user.is_staff and not request.user.is_superuser) and (instance.cashier_name != req_name):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('Cannot edit another cashier\'s payment')
        # Only admin can void
        new_status = validated_data.get('status', instance.status)
        if new_status == 'voided' and request and request.user and not (request.user.is_staff or request.user.is_superuser):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only admin can void payments')
        # Only pending payments can be edited (other statuses only allow status transitions as permitted above)
        if instance.status != 'pending':
            # Disallow changing core fields when not pending
            for key in ['student', 'amount', 'payment_method', 'receipt_number', 'term', 'academic_year']:
                if key in validated_data:
                    validated_data.pop(key)

        if cashier_id:
            try:
                user = User.objects.get(id=cashier_id)
                validated_data['cashier_name'] = user.get_full_name() or user.username
            except User.DoesNotExist:
                pass
        elif request and request.user and request.user.is_authenticated:
            user = request.user
            validated_data['cashier_name'] = user.get_full_name() or user.username

        return super().update(instance, validated_data)

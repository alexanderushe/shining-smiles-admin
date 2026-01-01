from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Payment
from core.permissions import get_role
from django.db import IntegrityError

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
        if self.instance is None:
            from datetime import date
            today = date.today()
            month = today.month
            if ('term' not in attrs) or (attrs.get('term') in (None, '')):
                if 1 <= month <= 3:
                    term_val = '1'
                elif 5 <= month <= 7:
                    term_val = '2'
                elif 9 <= month <= 12:
                    term_val = '3'
                elif month == 4:
                    term_val = '1'
                elif month == 8:
                    term_val = '2'
                else:
                    term_val = '3'
                attrs['term'] = term_val
            if ('academic_year' not in attrs) or (attrs.get('academic_year') in (None, '')):
                attrs['academic_year'] = today.year
        return attrs

    def to_internal_value(self, data):
        d = data.copy()
        if self.instance is None:
            from datetime import date
            today = date.today()
            month = today.month
            if ('term' not in d) or (d.get('term') in (None, '')):
                if 1 <= month <= 3:
                    term_val = '1'
                elif 5 <= month <= 7:
                    term_val = '2'
                elif 9 <= month <= 12:
                    term_val = '3'
                elif month == 4:
                    term_val = '1'
                elif month == 8:
                    term_val = '2'
                else:
                    term_val = '3'
                d['term'] = term_val
            if ('academic_year' not in d) or (d.get('academic_year') in (None, '')):
                d['academic_year'] = today.year
        return super().to_internal_value(d)

    def create(self, validated_data):
        # Enforce bank transfer details when method is Bank Transfer
        method = validated_data.get('payment_method')
        if method == 'Bank Transfer':
            for key in ['reference_number', 'transfer_date', 'bank_name']:
                if not validated_data.get(key):
                    raise serializers.ValidationError({key: 'This field is required for bank transfers'})

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

        try:
            return super().create(validated_data)
        except IntegrityError:
            raise serializers.ValidationError({'receipt_number': 'Receipt number already exists.'})

    def update(self, instance, validated_data):
        cashier_id = validated_data.pop('cashier_id', None)
        request = self.context.get('request')
        if cashier_id is not None:
            role = get_role(request.user) if request and getattr(request, 'user', None) else None
            if role != 'Admin':
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('Only admin can reassign cashier')
        # Lifecycle rules
        # Block edits for posted payments
        if instance.status == 'posted':
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'detail': 'Posted payments cannot be edited'})
        # Only allow the original cashier to edit pending payment unless admin
        if request and request.user and request.user.is_authenticated:
            req_name = request.user.get_full_name() or request.user.username
            role = get_role(request.user)
            if role != 'Admin' and (instance.cashier_name != req_name):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('Cannot edit another cashier\'s payment')
        # Only admin can void when status is being changed to voided
        if ('status' in validated_data) and (validated_data.get('status') == 'voided'):
            role = get_role(request.user) if request and getattr(request, 'user', None) else None
            if role != 'Admin':
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

        # Enforce bank transfer details on update when switching to Bank Transfer
        method = validated_data.get('payment_method', instance.payment_method)
        if method == 'Bank Transfer':
            for key in ['reference_number', 'transfer_date', 'bank_name']:
                if not (validated_data.get(key) or getattr(instance, key, None)):
                    raise serializers.ValidationError({key: 'This field is required for bank transfers'})
        return super().update(instance, validated_data)

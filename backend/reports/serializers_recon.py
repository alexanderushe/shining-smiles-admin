from rest_framework import serializers
from .models import Reconciliation
from django.contrib.auth.models import User
from datetime import date
from decimal import Decimal
from payments.models import Payment
from django.db.models import Sum

class ReconciliationSerializer(serializers.ModelSerializer):
    cashier_id = serializers.IntegerField(write_only=True, required=False)
    cashier = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = Reconciliation
        fields = '__all__'
        extra_kwargs = {
            'expected_total': {'read_only': True},
            'variance': {'read_only': True},
            'status': {'read_only': True},
        }

    def validate(self, attrs):
        req = self.context.get('request')
        cid = attrs.pop('cashier_id', None)
        if cid:
            try:
                attrs['cashier'] = User.objects.get(id=int(cid))
            except User.DoesNotExist:
                raise serializers.ValidationError({'cashier_id': 'Invalid cashier'})
        elif req and req.user and req.user.is_authenticated:
            attrs['cashier'] = req.user

        if not attrs.get('date'):
            attrs['date'] = date.today()

        user = attrs.get('cashier')
        cashier_name = (user.get_full_name() or user.username) if user else None
        if cashier_name:
            qs = Payment.objects.filter(date=attrs['date'], cashier_name=cashier_name, status='posted')
            expected_total = qs.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        else:
            expected_total = Decimal('0')
        attrs['expected_total'] = expected_total

        expected = attrs.get('expected_total')
        actual = attrs.get('actual_amount')
        expected = Decimal(str(expected or '0'))
        actual = Decimal(str(actual or '0'))
        variance = actual - expected
        attrs['variance'] = variance
        attrs['status'] = 'balanced' if variance == 0 else ('short' if variance < 0 else 'over')

        return attrs
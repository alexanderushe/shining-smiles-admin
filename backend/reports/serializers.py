from rest_framework import serializers
from payments.models import Payment
from students.models import Student
from .models import Reconciliation, Statement

class ReconciliationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reconciliation
        fields = '__all__'

class StatementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statement
        fields = '__all__'
        read_only_fields = ('school', 'generation_date')

class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'payment_method', 'receipt_number', 'status', 'cashier_name', 'date']

class ReportSerializer(serializers.ModelSerializer):
    transactions = PaymentTransactionSerializer(source='payment_set', many=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'name', 'transactions']

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

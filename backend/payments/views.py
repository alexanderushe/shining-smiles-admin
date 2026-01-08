from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from .models import Payment
from .serializers import PaymentSerializer
from core.permissions import PaymentWritePermission

class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    pagination_class = StandardPagination
    permission_classes = [PaymentWritePermission]

    @action(detail=True, methods=['post'], url_path='void')
    def void_payment(self, request, pk=None):
        """
        Void a payment with a required reason.
        Only admins can void payments.
        """
        from core.permissions import get_role
        from django.utils import timezone
        
        payment = self.get_object()
        role = get_role(request.user) if request.user else None
        
        if role != 'Admin':
            return Response(
                {'detail': 'Only admins can void payments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if payment.status == 'voided':
            return Response(
                {'detail': 'Payment is already voided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        void_reason = request.data.get('void_reason')
        if not void_reason:
            return Response(
                {'void_reason': 'Void reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update fields directly to avoid unique constraint validation
        payment.status = 'voided'
        payment.void_reason = void_reason
        payment.voided_at = timezone.now()
        payment.voided_by = request.user.get_full_name() or request.user.username if request.user else 'Unknown'
        payment.save(update_fields=['status', 'void_reason', 'voided_at', 'voided_by'])
        
        # Return serialized payment
        serializer = self.get_serializer(payment)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status == 'posted':
            return Response({'detail': 'Posted payments cannot be deleted'}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        from django.db import IntegrityError
        from rest_framework.exceptions import ValidationError
        try:
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            raise ValidationError({"detail": "Duplicate receipt number."})

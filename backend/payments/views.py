from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from .models import Payment
from .serializers import PaymentSerializer
from core.permissions import IsCashier, IsAdmin

class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    pagination_class = StandardPagination
    permission_classes = [IsCashier]
    
    def get_queryset(self):
        # Filter by current user's school for multi-tenant isolation
        if self.request.user.is_authenticated and hasattr(self.request.user, 'profile'):
            return Payment.objects.filter(school=self.request.user.profile.school)
        return Payment.objects.none()
    
    def perform_create(self, serializer):
        # Automatically assign school when creating new payment
        if self.request.user.is_authenticated and hasattr(self.request.user, 'profile'):
            serializer.save(school=self.request.user.profile.school)

    @action(detail=True, methods=['post'], url_path='void', permission_classes=[IsAdmin])
    def void_payment(self, request, pk=None):
        """
        Void a payment with a required reason.
        Only admins can void payments.
        """
        from django.utils import timezone
        
        payment = self.get_object()
        # Role check handled by permission_classes=[IsAdmin]
        
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

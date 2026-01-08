from django.http import JsonResponse
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings

# Root API endpoint
def api_root(request):
    return JsonResponse({
        "students": "/api/v1/students/",
        "payments": "/api/v1/payments/",
        "reports": "/api/v1/reports/",
        "notifications": "/api/v1/notifications/",
        "auth": {
            "login": "/api/v1/auth/login/",
            "logout": "/api/v1/auth/logout/",
            "me": "/api/v1/auth/me/",
            "password_reset": "/api/v1/auth/password-reset/",
        },
        "swagger": "/api/docs/"
    })

# Custom token login view (CSRF exempt)
@method_decorator(csrf_exempt, name='dispatch')
class CustomObtainAuthToken(ObtainAuthToken):
    """
    Returns token for valid username/password in JSON format
    Also returns user info including role and school
    """
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        # Get user profile info
        profile_data = {}
        if hasattr(user, 'profile'):
            profile_data = {
                'role': user.profile.role,
                'school': {
                    'id': user.profile.school.id if user.profile.school else None,
                    'name': user.profile.school.name if user.profile.school else None,
                    'code': user.profile.school.code if user.profile.school else None,
                } if user.profile.school else None
            }
        
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.get_full_name() or user.username,
                **profile_data
            }
        })

@api_view(['GET'])
@authentication_classes([TokenAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def me(request):
    """Get current user info including profile, role, and school"""
    user = request.user
    profile_data = {}
    
    if hasattr(user, 'profile'):
        profile_data = {
            'role': user.profile.role,
            'school': {
                'id': user.profile.school.id if user.profile.school else None,
                'name': user.profile.school.name if user.profile.school else None,
                'code': user.profile.school.code if user.profile.school else None,
                'is_active': user.profile.school.is_active if user.profile.school else None,
            } if user.profile.school else None
        }
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'full_name': user.get_full_name() or user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        **profile_data
    })

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout user by deleting their auth token
    """
    try:
        request.user.auth_token.delete()
        return Response({'detail': 'Successfully logged out'}, status=200)
    except Exception as e:
        return Response({'detail': 'Logout failed'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """
    Request password reset - generates reset token
    In production, this would send an email with reset link
    For now, returns the reset token for testing
    """
    email = request.data.get('email')
    
    if not email:
        return Response({'detail': 'Email is required'}, status=400)
    
    try:
        user = User.objects.get(email=email)
        
        # Generate reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # In production, send email with reset link:
        # reset_url = f"{settings.FRONTEND_URL}/auth/reset-password/{uid}/{token}/"
        # send_mail(...)
        
        # For development, return the token
        return Response({
            'detail': 'Password reset link sent to email',
            'uid': uid,
            'token': token,  # Remove in production
            'message': 'In production, this would be sent via email'
        }, status=200)
        
    except User.DoesNotExist:
        # Don't reveal if email exists (security best practice)
        return Response({
            'detail': 'If an account exists with this email, a password reset link has been sent'
        }, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """
    Confirm password reset with token and set new password
    """
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not all([uid, token, new_password]):
        return Response({
            'detail': 'uid, token, and new_password are required'
        }, status=400)
    
    try:
        # Decode user ID
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        # Verify token
        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'Invalid or expired token'}, status=400)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response({'detail': 'Password successfully reset'}, status=200)
        
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'detail': 'Invalid reset link'}, status=400)

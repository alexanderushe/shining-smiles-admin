from django.http import JsonResponse
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

# Root API endpoint
def api_root(request):
    return JsonResponse({
        "students": "/api/v1/students/",
        "payments": "/api/v1/payments/",
        "reports": "/api/v1/reports/",
        "notifications": "/api/v1/notifications/",
        "swagger": "/api/docs/"
    })

# Custom token login view (CSRF exempt)
@method_decorator(csrf_exempt, name='dispatch')
class CustomObtainAuthToken(ObtainAuthToken):
    """
    Returns token for valid username/password in JSON format
    """
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})


from rest_framework_simplejwt.authentication import JWTAuthentication
class QueryParamJWTAuthentication(JWTAuthentication):
    def get_header(self, request):
        token = request.query_params.get("token")
        if token:
            return f"Bearer {token}".encode()
        return super().get_header(request)

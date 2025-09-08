from django.middleware.csrf import CsrfViewMiddleware

class CustomCsrfMiddleware(CsrfViewMiddleware):
    def _get_token(self, request):
        token = request.META.get('HTTP_X_CSRFTOKEN')
        if token:
            return token
        return super()._get_token(request)
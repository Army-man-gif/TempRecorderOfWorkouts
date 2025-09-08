from django.middleware.csrf import CsrfViewMiddleware

class CustomCsrfMiddleware(CsrfViewMiddleware):
    def __init__(self, get_response):
        print("Custom CSRF middleware instantiated!")
        super().__init__(get_response)
    def _get_token(self, request):
        print("Custom CSRF Middleware hit!")
        token = request.META.get('HTTP_X_CSRFTOKEN')
        if token:
            return token
        return super()._get_token(request)
    def process_view(self, request, callback, callback_args, callback_kwargs):
        token_from_header = request.META.get('HTTP_X_CSRFTOKEN')
        if token_from_header:
            request.COOKIES['csrftoken'] = token_from_header
            print(f"Custom CSRF Middleware hit! Token from header: {token_from_header}")
        return super().process_view(request, callback, callback_args, callback_kwargs)
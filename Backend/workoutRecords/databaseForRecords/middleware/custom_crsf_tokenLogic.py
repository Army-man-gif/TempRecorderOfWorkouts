from django.middleware.csrf import CsrfViewMiddleware

class CustomCsrfMiddleware(CsrfViewMiddleware):
    def __init__(self, get_response):
        print("Custom CSRF middleware instantiated!")
        super().__init__(get_response)
    def process_view(self, request, callback, callback_args, callback_kwargs):
        token_from_header = request.META.get('HTTP_X_CSRFTOKEN')
        if token_from_header:
            request.META['CSRF_COOKIE'] = token_from_header
            print(f"Custom CSRF Middleware hit! Token from header: {token_from_header}")
        return super().process_view(request, callback, callback_args, callback_kwargs)
from django.middleware.csrf import CsrfViewMiddleware
from django.contrib.sessions.models import Session
from django.contrib.auth import get_user_model

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
            print(f"Custom CSRF Middleware hit!")
            
        session_from_header = request.META.get('HTTP_X_SESSIONID')
        if session_from_header:
            request.COOKIES['sessionid'] = session_from_header
            session = Session.objects.get(session_key=session_from_header)
            uid = session.get_decoded().get('_auth_user_id')
            User = get_user_model()
            request.user = User.objects.get(pk=uid)
            print(f"Custom session Middleware hit!")

        return super().process_view(request, callback, callback_args, callback_kwargs)
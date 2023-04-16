# views.py
from rest_framework.authentication import get_authorization_header
from .models import User
from .authentication import *
def authorization_checker(request):
    auth = get_authorization_header(request).split()

    if auth and len(auth) == 2:
        token = auth[1].decode('utf-8')
        id = decode_refresh_token(token)
        user = User.objects.filter(pk=id).first()

        return user.id

    return 'Unauthorizated'
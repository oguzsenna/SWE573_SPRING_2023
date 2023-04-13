from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, permissions
from rest_framework.exceptions import APIException, AuthenticationFailed
from rest_framework.authentication import get_authorization_header
from .serializers import UserSerializer, StorySerializer, LikeSerializer
from .models import User, Story, Like
from .authentication import create_access_token, create_refresh_token, decode_access_token, decode_refresh_token


# Create your views here.

class RegisterAPIView(APIView):
    def post(self,request):
        serializer = UserSerializer(data=request.data)
        print(serializer)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class LoginAPIView(APIView):
    def post(self,request):
        user = User.objects.filter(email=request.data['email']).first()

        if not user:
            raise APIException('Invalid credentials!')

        if not user.check_password(request.data['password']):
            raise APIException('Invalid credentials!')
        print(user.id)
        access_token = create_access_token(user.id) #will be returned in response
        refresh_token = create_refresh_token(user.id) #will be returned as a cookie

        response = Response()

        response.set_cookie(key='refreshToken', value=refresh_token, httponly=True) 
        response.data= {
            'token': access_token
        }

        return response


class UserAPIView(APIView):
    def get(self,request):
        auth = get_authorization_header(request).split() #first part will be bearer second part will be actual token
        print(auth)
        if auth and len(auth)==2:
            token = auth[1].decode('utf-8')
            id = decode_access_token(token)
            print(id)
            user= User.objects.filter(pk=id).first()


            return Response(UserSerializer(user).data)
        raise AuthenticationFailed('unauthenticated')



class RefreshAPIView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refreshToken')
        id = decode_refresh_token(refresh_token)
        access_token = create_access_token(id)
        return Response({
            'token': access_token
        })

class LogoutAPIView(APIView):
    def post(self, _):
        response = Response()
        response.delete_cookie(key='refreshToken')
        response.data= {
            'message': 'successful logout'
        }
        return response
class StoryCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = StorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LikeCreateAPIView(APIView):
    def post(self, request, story_id):
        user = request.user
        story = Story.objects.get(pk=story_id)
        like = Like.objects.filter(user=user, story=story).first()
        if like is not None:
            serializer = LikeSerializer(like)
            return Response(serializer.data)
        else:
            like = Like(user=user, story=story)
            like.save()
            serializer = LikeSerializer(like)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
class LikeDestroyAPIView(APIView):
    def delete(self, request, story_id):
        user = request.user
        story = Story.objects.get(pk=story_id)
        like = Like.objects.filter(user=user, story=story).first()
        if like is not None:
            like.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
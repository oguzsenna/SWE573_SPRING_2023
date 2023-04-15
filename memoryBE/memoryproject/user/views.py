from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import APIException, AuthenticationFailed
from rest_framework.authentication import get_authorization_header
from .serializers import UserSerializer, StorySerializer, LikeSerializer
from .models import User, Story, Like
from .authentication import create_access_token, create_refresh_token, decode_access_token, decode_refresh_token
from django.shortcuts import get_object_or_404

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
    

class LogoutAPIView(APIView):
    def post(self, _):
        response = Response()
        response.delete_cookie(key='refreshToken')
        response.data= {
            'message': 'successful logout'
        }
        return response


class UserAPIView(APIView):
    def get(self,request):
        auth = get_authorization_header(request).split() #first part will be bearer second part will be actual token
        print(auth)
        if auth and len(auth)==2:
            token = auth[1].decode('utf-8')
            print(token)
            id = decode_refresh_token(token)
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



class StoryCreateAPIView(APIView):
  
    def post(self, request):
        auth = get_authorization_header(request).split() #first part will be bearer second part will be actual token
        if auth and len(auth)==2:
            token = auth[1].decode('utf-8')
            id = decode_refresh_token(token)
            user= User.objects.filter(pk=id).first()
        
            if user:
                data=request.data
                data['author'] = user.id
                serializer = StorySerializer(data=data, context={'request':request})
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        raise AuthenticationFailed('unauthenticated')


class StoryLikeAPIView(APIView):
  
    def post(self, request, pk):
        story = get_object_or_404(Story, pk=pk)
        auth = get_authorization_header(request).split() #first part will be bearer second part will be actual token
        if auth and len(auth)==2:
            token = auth[1].decode('utf-8')
            id = decode_refresh_token(token)
            user= User.objects.filter(pk=id).first()
        
            if user:
                if user in story.likes.all():
                    story.likes.remove(user)
                else:
                    story.likes.add(user)
                serializer = StorySerializer(story, context={'request':request})
                return Response(serializer.data, status=status.HTTP_200_OK)
        raise AuthenticationFailed('unauthenticated')
    
class AuthorStoriesAPIView(APIView):
    def get(self, request, author):
        try:
            stories = Story.objects.filter(author=author)
        except Story.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = StorySerializer(stories, many=True)
        return Response(serializer.data)
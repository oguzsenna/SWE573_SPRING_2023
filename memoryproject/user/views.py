from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, permissions, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import APIException, AuthenticationFailed
from rest_framework.authentication import get_authorization_header
from .serializers import *
from .models import User, Story
from .authentication import create_access_token, create_refresh_token, decode_access_token, decode_refresh_token
from django.shortcuts import get_object_or_404
from .functions import *
import json
from django.shortcuts import render



# Create your views here.


class RegisterAPIView(APIView):
    def post(self,request):
        serializer = UserSerializer(data=request.data)
        
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
    
class UserBiographyCreateAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        user_id = authorization_checker(request)  
        user = get_object_or_404(User, id=user_id)  
        if user.biography:
            return Response({'error': 'Biography already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if 'biography' in request.data:
            user.biography = request.data['biography']
            user.save()
            serializer = self.get_serializer(user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'error': 'Biography not provided'}, status=status.HTTP_400_BAD_REQUEST)

class UserBiographyUpdateAPIView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def patch(self, request, *args, **kwargs):

        user_id = authorization_checker(request)  
        user = get_object_or_404(User, id=user_id)  
        if 'biography' in request.data:
            user.biography = request.data['biography']
            user.save()
            serializer = self.get_serializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': 'Biography not provided'}, status=status.HTTP_400_BAD_REQUEST)
    

class FollowerAPIView(APIView):
    def post(self, request, user_id):
        user_to_follow = get_object_or_404(User, id=user_id)
        user = authorization_checker(request)
        if user == user_to_follow:
            return Response({'error': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        if user_to_follow.followers.filter(id=user).exists():
            user_to_follow.followers.remove(user)
            return Response({'message': 'User unfollowed successfully.'}, status=status.HTTP_200_OK)
        else:
            user_to_follow.followers.add(user)
            return Response({'message': 'User followed successfully.'}, status=status.HTTP_200_OK)
        
class FollowerListView(APIView):
    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        followers = user.followers.all()
        serializer = UserSerializer(followers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    

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
        # auth = get_authorization_header(request).split() #first part will be bearer second part will be actual token
        # if auth and len(auth)==2:
        #     token = auth[1].decode('utf-8')
        #     id = decode_refresh_token(token)
        #     user= User.objects.filter(pk=id).first()
        
        #     if user:
        #         data=request.data
        #         data['author'] = user.id
        #         serializer = StorySerializer(data=data, context={'request':request})
        print(request.COOKIES)
        cookie_value = request.COOKIES['refreshToken']
        request_data = json.loads(request.body)
        user_id = decode_refresh_token(cookie_value)

        request_data['author'] = user_id

        serializer = StorySerializer(data=request_data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class StoryLikeAPIView(APIView):
  
    def post(self, request, pk):
        story = get_object_or_404(Story, pk=pk)
        auth = get_authorization_header(request).split() #first part will be bearer second part will be actual token
        print(auth)
        if auth and len(auth)==2:
            token = auth[1].decode('utf-8')
            id = decode_refresh_token(token)
            user= User.objects.filter(pk=id).first()
            print(user)
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
    
class CommentAPIView(APIView):
    def post(self, request, story_id):

        user= authorization_checker(request)
        request_data = json.loads(request.body)
        request_data['author'] = user
        request_data['story'] = story_id
        serializer = CommentSerializer(data=request_data)
        

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    
class StoryCommentListAPIView(generics.ListAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        story_id = self.kwargs['story_id']
        queryset = Comment.objects.filter(story_id=story_id)
        return queryset
        
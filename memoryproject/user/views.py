from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, permissions, generics, authentication
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
from rest_framework.pagination import PageNumberPagination




# Create your views here.

class FollowerStoryView(APIView):
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, to_user_id):
        # Get the current user based on the authentication token
        current_user = request.user

        # Get the from_user_id from the refresh token (assuming you have implemented this)
        from_user_id = request.auth.user_id

        # Get the followers of the to_user_id
        followers = User.objects.filter(following__to_user_id=to_user_id)

        # Get the stories of the followers
        follower_stories = Story.objects.filter(author_id__in=followers)

        # Filter the stories based on query parameters (if any)
        story_tags = request.query_params.getlist('story_tags', [])
        if story_tags:
            follower_stories = follower_stories.filter(story_tags__name__in=story_tags)

        # Paginate the stories
        paginator = PageNumberPagination()
        paginated_stories = paginator.paginate_queryset(follower_stories, request)

        # Serialize the stories and return as response
        serialized_stories = StorySerializer(paginated_stories, many=True).data
        return paginator.get_paginated_response(serialized_stories)



class GetStoryByAuthorIDView(APIView):
    def get(self, request, author_id):
        # Get the stories by the given author id
        stories = Story.objects.filter(author_id=author_id)

        # Serialize the stories and return as response
        serialized_stories = StorySerializer(stories, many=True).data
        return Response(serialized_stories)
    

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

class UserBiographyUpdateAPIView(generics.UpdateAPIView): # üstteki ile birleştir.
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def put(self, request, *args, **kwargs):

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
        print(request.COOKIES)
        cookie_value = request.COOKIES['refreshToken']
        request_data = json.loads(request.body)
        user_id = decode_refresh_token(cookie_value)
        print(request_data)
        request_data['author'] = user_id
        locations_data = request_data.pop('locations', [])
        # Extract decade data
        decade = request_data.pop('decade', None)

        # Add decade data to request_data
        if decade:
            request_data['start_year'] = decade['start_year']
            request_data['end_year'] = decade['end_year']

        # Extract date interval data
        date_interval = request_data.pop('date_interval', None)

        # Add date interval data to request_data
        if date_interval:
            request_data['start_date'] = date_interval['start_date']
            request_data['end_date'] = date_interval['end_date']
            
        # Extract date filter data
        date_filter = request_data.pop('dateFilter', None)
        season = request_data.pop('season', None)

        # Add season data to request_data
        if season:
            request_data['season'] = season

        # Process date filter data
        if date_filter == 'particular':
            request_data['date'] = date_filter['date']

        serializer = StorySerializer(data=request_data)

        if serializer.is_valid():
            story = serializer.save()

            # Create the Location instances if they don't already exist
            locations = []
            for location_data in locations_data:
                location, created = Location.objects.get_or_create(
                    name=location_data['name'],
                    latitude=location_data['latitude'],
                    longitude=location_data['longitude']
                )
                locations.append(location)

            # Associate the locations with the story
            story.locations.set(locations)
            story.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Print serializer errors for debugging purposes
        print("Serializer errors:", serializer.errors)
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
        
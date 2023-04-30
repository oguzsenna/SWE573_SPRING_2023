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
from django.core.paginator import Paginator
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.files.storage import FileSystemStorage
import os
from django.http import HttpResponse
from django.db.models import Q
from django.utils import timezone
from math import ceil,cos, radians
from datetime import datetime, timedelta



## Use these for auth problems on
##cookie_value = request.COOKIES['refreshToken']
##user_id = decode_refresh_token(cookie_value)
##user = get_object_or_404(User, pk=user_id)





# Create your views here.
class UserProfileByUsernameView(APIView):
    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        serializer = UserSerializer(user)
        return Response(serializer.data)


class UsernamesByIDsView(APIView):
    def get(self, request):

        user_ids = request.GET.getlist('user_ids[]')
        usernames = User.objects.filter(id__in=user_ids).values_list('username', flat=True)
        return Response(list(usernames))
    

class UserPhotoView(APIView):

    def get(self, request, user_id=None):
        
        
        if user_id:
            user = get_object_or_404(User, pk=user_id)
        else:
            cookie_value = request.COOKIES['refreshToken']
            user_id = decode_refresh_token(cookie_value)
            user = get_object_or_404(User, pk=user_id)

        
        if not user.profile_photo or not user.profile_photo.name:
            return Response({'error': 'Profile photo does not exist'}, status=status.HTTP_404_NOT_FOUND)

   

        serializer = UserPhotoSerializer(user)

        file_ext = os.path.splitext(user.profile_photo.name)[-1].lower()
        content_type = 'image/jpeg' if file_ext == '.jpg' or file_ext == '.jpeg' else 'image/png'

        response = HttpResponse(user.profile_photo, content_type=content_type)
        response['Content-Disposition'] = f'inline; filename="{user.profile_photo.name}"'

        return response

    def put(self, request):
        
        cookie_value = request.COOKIES['refreshToken']
        user_id = decode_refresh_token(cookie_value)
        user = get_object_or_404(User, pk=user_id)

        if not isinstance(request.FILES.get('profile_photo'), InMemoryUploadedFile):
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserPhotoSerializer(user, data= {'profile_photo': request.FILES['profile_photo']}) # type: ignore
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    def delete(self, request):
        cookie_value = request.COOKIES['refreshToken']
        user_id = decode_refresh_token(cookie_value)
        user = get_object_or_404(User, pk=user_id)

        if user.profile_photo:
            # Create a FileSystemStorage object to interact with the file system
            storage = FileSystemStorage()
            # Delete the file from the storage
            storage.delete(user.profile_photo.name)
            # Update the user model to remove the profile photo
            user.profile_photo = None # type: ignore
            user.save()
            return Response({'success': 'Profile photo deleted'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Profile photo does not exist'}, status=status.HTTP_404_NOT_FOUND)


class FollowerStoryView(APIView):
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, to_user_id):
        current_user = request.user

        from_user_id = request.auth.user_id

        followers = User.objects.filter(following__to_user_id=to_user_id)

        follower_stories = Story.objects.filter(author_id__in=followers)

        story_tags = request.query_params.getlist('story_tags', [])
        if story_tags:
            follower_stories = follower_stories.filter(story_tags__name__in=story_tags)


class GetStoryByAuthorIDView(APIView):
    def get(self, request):
        page = request.query_params.get('page', 1)
        per_page = request.query_params.get('perPage', 5)
        try:
            page = int(page)
            per_page = int(per_page)
        except ValueError:
            return Response({'error': 'Invalid page or perPage value'}, status=status.HTTP_400_BAD_REQUEST)

        cookie_value = request.COOKIES['refreshToken']
        user_id = decode_refresh_token(cookie_value)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        followed_users_ids = user.following.values_list('id', flat=True) # type: ignore

        stories = Story.objects.filter(author_id__in=followed_users_ids).order_by('-created_at')

        paginator = Paginator(stories, per_page)
        total_pages = paginator.num_pages
        stories_page = paginator.page(page)
        serializer = StorySerializer(stories_page, many=True)

        return Response({'stories': serializer.data, 'totalPages': total_pages}, status=status.HTTP_200_OK)


class GetStoryByUserIDView(APIView):
    def get(self, request):
        page = request.query_params.get('page', 1)
        per_page = request.query_params.get('perPage', 5)
        try:
            page = int(page)
            per_page = int(per_page)
        except ValueError:
            return Response({'error': 'Invalid page or perPage value'}, status=status.HTTP_400_BAD_REQUEST)

        cookie_value = request.COOKIES['refreshToken']
        if not cookie_value:
            return Response({'error': 'Refresh token not found.'}, status=status.HTTP_401_UNAUTHORIZED)
        user_id = decode_refresh_token(cookie_value)
        if not user_id:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            stories = Story.objects.filter(author_id=user_id).order_by('-created_at')
            paginator = Paginator(stories, per_page)
            total_pages = paginator.num_pages
            stories_page = paginator.page(page)
            serializer = StorySerializer(stories_page, many=True)

            return Response({'stories': serializer.data, 'totalPages': total_pages}, status=status.HTTP_200_OK)
        except Story.DoesNotExist:
            return Response({'error': 'User has no stories.'}, status=status.HTTP_404_NOT_FOUND)
    

class GetStoryByUsernameView(APIView):
    def get(self, request, username):
        page = request.query_params.get('page', 1)
        per_page = request.query_params.get('perPage', 5)
        try:
            page = int(page)
            per_page = int(per_page)
        except ValueError:
            return Response({'error': 'Invalid page or perPage value'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        stories = Story.objects.filter(author=user).order_by('-created_at')

        paginator = Paginator(stories, per_page)
        total_pages = paginator.num_pages
        stories_page = paginator.page(page)
        serializer = StorySerializer(stories_page, many=True)

        return Response({'stories': serializer.data, 'totalPages': total_pages}, status=status.HTTP_200_OK)
    

class GetStoryDetailsView(APIView):
    def get(self, request, story_id):
        try:
            story = Story.objects.get(pk=story_id)
        except Story.DoesNotExist:
            return Response({'message': 'Story not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = StorySerializer(story)

        print(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
        print(user.id) # type: ignore
        access_token = create_access_token(user.id) # type: ignore #will be returned in response
        refresh_token = create_refresh_token(user.id) # type: ignore #will be returned as a cookie

        response = Response()

        response.set_cookie(key='refreshToken', value=refresh_token, httponly=True) 
        response.data= {
            'token': access_token
        }

        return response
    

class LogoutAPIView(APIView):
    def post(self, request):

        response = Response()
        response.delete_cookie('refreshToken')
        response.data = {
            'message': 'success'
        }
        return response


class UserAPIView(APIView):
    def get(self, request, user_id=None):

        if user_id:
            user = get_object_or_404(User, pk=user_id)
        else:
            cookie_value = request.COOKIES['refreshToken']
            user_id = decode_refresh_token(cookie_value)
            user = get_object_or_404(User, pk=user_id)

        serializer = UserSerializer(user)
        return Response(serializer.data)
    

class UserBiographyAPIView(APIView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        cookie_value = request.COOKIES['refreshToken']
        user_id = decode_refresh_token(cookie_value)
        user = get_object_or_404(User, pk=user_id)
        if user.biography:
            return Response({'error': 'Biography already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if 'biography' in request.data:
            user.biography = request.data['biography']
            user.save()
            serializer = self.serializer_class(user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'error': 'Biography not provided'}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        cookie_value = request.COOKIES['refreshToken']
        user_id = decode_refresh_token(cookie_value)
        user = get_object_or_404(User, pk=user_id)
        if 'biography' in request.data:
            user.biography = request.data['biography']
            user.save()
            serializer = self.serializer_class(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': 'Biography not provided'}, status=status.HTTP_400_BAD_REQUEST)


class FollowerAPIView(APIView):
    def post(self, request, user_id):
        user_to_follow = get_object_or_404(User, id=user_id)
        cookie_value = request.COOKIES['refreshToken']
        user_id = decode_refresh_token(cookie_value)
        user = User.objects.filter(pk=user_id).first()

        if user == user_to_follow:
            return Response({'error': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        if user_to_follow.followers.filter(id=user_id).exists():
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
        #request_data = json.loads(request.body)
        request_data = json.loads(request.body.decode('utf-8'))
        locations_data = request_data.pop('locations', [])
        print(request.body)
        

        user_id = decode_refresh_token(cookie_value)
        print(request_data)
        request_data['author'] = user_id
        
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


        serializer = StorySerializer(data=request_data, context={"locations_data": locations_data})

        print(request_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Print serializer errors for debugging purposes
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StoryLikeAPIView(APIView):
  
    def post(self, request, pk):
        story = get_object_or_404(Story, pk=pk)
        cookie_value = request.COOKIES['refreshToken']
        user_id = decode_refresh_token(cookie_value)
        
            
        user= User.objects.filter(pk=user_id).first()
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

        cookie_value = request.COOKIES['refreshToken']
        user_id = decode_refresh_token(cookie_value)
        user = User.objects.filter(pk=user_id).first()

        request_data = json.loads(request.body)
        request_data['author'] = user.id # type: ignore
        request_data['story'] = story_id
        print(request_data)
        serializer = CommentSerializer(data=request_data)
        

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    
class StoryCommentListAPIView(APIView):
    serializer_class = CommentSerializer

    def get(self, request, story_id, *args, **kwargs):
        queryset = Comment.objects.filter(story_id=story_id)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        

class SearchUserView(APIView):


    

    def get(self, request, *args, **kwargs):

        cookie_value = request.COOKIES['refreshToken']
        user_id = decode_refresh_token(cookie_value)
        user = get_object_or_404(User, pk=user_id)

        search_query = request.query_params.get('search', '')

        # Search for users by username
        user_queryset = User.objects.filter(Q(username__icontains=search_query))
        users_serializer = UserSerializer(user_queryset, many=True)

        return Response({
            "users": users_serializer.data,
        }, status=status.HTTP_200_OK)
    

class SearchStoryView(APIView):
    def get(self, request, *args, **kwargs):
        cookie_value = request.COOKIES['refreshToken']
        user_id = decode_refresh_token(cookie_value)
        user = get_object_or_404(User, pk=user_id)

        title_search = request.query_params.get('title', '')
        author_search = request.query_params.get('author', '')
        time_type = request.query_params.get('time_type', '')
        time_value = request.query_params.get('time_value', '')
        location = request.query_params.get('location', '')
        radius = float(request.query_params.get('radius', 25))  
        print(radius)


        query_filter = Q()
        if title_search:
            query_filter &= Q(title__icontains=title_search)
        if author_search:
            query_filter &= Q(author__username__icontains=author_search)
        print(time_type)
        print(time_value)
        if time_type and time_value:

            time_value_dict = json.loads(time_value)
            print(time_value_dict)

            if time_type == 'season':
                season_name = time_value_dict["seasonName"]
                query_filter &= Q(season__icontains=season_name)  

            elif time_type == 'decade':
                year = time_value_dict["year"]
                query_filter &= Q(year__gte=year)

            elif time_type == 'normal_date':
                given_date = datetime.strptime(time_value["date"], "%Y-%m-%d").date()

                # Calculate the date range
                start_date = given_date - timedelta(days=2)
                end_date = given_date + timedelta(days=2)
                query_filter &= Q(date__range=(start_date, end_date)) 
                #time_value = time_value["date"]
                ##query_filter &= Q(date=time_value)
            elif time_type == 'interval_date':
                query_filter &= Q(
                    start_date__gte=time_value['startDate'],
                    end_date__lte=time_value['endDate']
                )
            
            elif time_type == 'seasonAndYear':  
                season_name = time_value_dict["seasonName"]
                start_year= time_value_dict["start_year"]
                end_year = time_value_dict["end_year"]
                query_filter &= Q(season__icontains=season_name, start_year__gte=start_year, end_year__lte=end_year)

        if location != "null":
            location = json.loads(location)
            lat = location['latitude']
            lng = location['longitude']
            #radius = 25  

            query_filter &= Q(
                locations__latitude__range=(lat - radius / 110.574, lat + radius / 110.574),
                locations__longitude__range=(lng - radius / (111.320 * cos(radians(lat))), lng + radius / (111.320 * cos(radians(lat))))
            )
        stories = Story.objects.filter(query_filter)
        serializer = StorySerializer(stories, many=True)


        return Response(serializer.data, status=201)


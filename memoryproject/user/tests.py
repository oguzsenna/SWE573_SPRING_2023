from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock
from .models import Story
from datetime import date, timedelta
from django.contrib.auth.models import User
from django.test import RequestFactory, TestCase
from rest_framework.test import force_authenticate
from .models import Location, Story
from .serializers import StorySerializer
from .views import SearchStoryView
from unittest.mock import patch
from .views import StoryCreateAPIView
import json




# Create your tests here.

from django.test import TestCase
from .models import User, Location, Story, Comment


#Model Tests
class UserModelTestCase(TestCase):
    def test_user_creation(self):
        user = User.objects.create_user(email='test@example.com', username='testuser', password='testpassword') # type: ignore
        
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.username, 'testuser')
        self.assertTrue(user.check_password('testpassword'))

        # Add assertions for other fields and behaviors

class LocationModelTestCase(TestCase):
    def test_location_creation(self):
        location = Location.objects.create(name='Test Location', latitude=0.0, longitude=0.0)
        
        self.assertEqual(location.name, 'Test Location')
        self.assertEqual(location.latitude, 0.0)
        self.assertEqual(location.longitude, 0.0)

        # Add assertions for other fields and behaviors

class StoryModelTestCase(TestCase):
    def test_story_creation(self):
        user = User.objects.create_user(email='test@example.com', username='testuser', password='testpassword') # type: ignore
        story = Story.objects.create(author=user, title='Test Story', content='Lorem ipsum dolor sit amet.')
        
        self.assertEqual(story.author, user)
        self.assertEqual(story.title, 'Test Story')
        self.assertEqual(story.content, 'Lorem ipsum dolor sit amet.')

        # Add assertions for other fields and behaviors

class CommentModelTestCase(TestCase):
    def test_comment_creation(self):
        user = User.objects.create_user(email='test@example.com', username='testuser', password='testpassword') # type: ignore
        story = Story.objects.create(author=user, title='Test Story', content='Lorem ipsum dolor sit amet.')
        comment = Comment.objects.create(author=user, story=story, content='Test Comment')
        
        self.assertEqual(comment.author, user)
        self.assertEqual(comment.story, story)
        self.assertEqual(comment.content, 'Test Comment')

        # Add assertions for other fields and behaviors


#View and APIs Tests

def create_user(username, email, password):
    return User.objects.create_user(username=username, email=email, password=password) # type: ignore

def create_location(latitude, longitude):
    return Location.objects.create(latitude=latitude, longitude=longitude)

def create_story(author, title, content, date, season, start_year, end_year, start_date, end_date):
    story = Story.objects.create(
        author=author, title=title, content=content, date=date, season=season,
        start_year=start_year, end_year=end_year, start_date=start_date, end_date=end_date)
    return story

class SearchStoryViewTestCase(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = create_user(username="testuser", email="testuser@example.com", password="testpassword")
        self.view = SearchStoryView.as_view()

    def create_request(self, query_params=None):
        request = self.factory.get('/search_story', query_params)
        force_authenticate(request, user=self.user)
        return request
    
class StoryCreateAPIViewTestCase(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = create_user(username="testuser", email="testuser@example.com", password="testpassword")
        self.view = StoryCreateAPIView.as_view()

    def create_request(self, data, cookies=None):
        request = self.factory.post('/create_story', content_type='application/json', data=data)
        if cookies:
            request.COOKIES.update(cookies)
        force_authenticate(request, user=self.user)
        return request

    def test_create_story_with_minimal_data(self):
        with patch('user.views.decode_refresh_token') as mock_decode_refresh_token:
            mock_decode_refresh_token.return_value = self.user.pk

            story_data = {
                "title": "Test Story",
                "content": "This is a test story."
            }

            request = self.create_request(data=json.dumps(story_data), cookies={'refreshToken': 'fake_token'})
            response = self.view(request)

            self.assertEqual(response.status_code, 201)
            self.assertEqual(response.data['title'], 'Test Story')
            self.assertEqual(response.data['content'], 'This is a test story.')
            self.assertEqual(response.data['author'], self.user.pk)







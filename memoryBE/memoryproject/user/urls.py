
from django.urls import path

from .views import *
urlpatterns = [
    path("register", RegisterAPIView.as_view()),
    path("login", LoginAPIView.as_view()),
    path("user", UserAPIView.as_view()),
    path("refresh", RefreshAPIView.as_view()),
    path("logout", LogoutAPIView.as_view()),
    path("create_story", StoryCreateAPIView.as_view()),
    path('like/<int:pk>', StoryLikeAPIView.as_view(), name='like-story'),
    path('get_stories/<int:user_id>', AuthorStoriesAPIView.as_view(), name='author-stories'),


    
]
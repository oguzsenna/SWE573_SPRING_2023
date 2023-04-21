
from django.urls import path
from . import views
from .views import *
from django.views.generic import TemplateView



urlpatterns = [
    path("login", LoginAPIView.as_view()),
    path("user", UserAPIView.as_view()),
    path("refresh", RefreshAPIView.as_view()),
    path("logout", LogoutAPIView.as_view()),
    path("create_story", StoryCreateAPIView.as_view()),
    path('like/<int:pk>', StoryLikeAPIView.as_view(), name='like-story'),
    path('get_stories/<int:author>', AuthorStoriesAPIView.as_view(), name='author-stories'),
    path('user/follow/<int:user_id>', FollowerAPIView.as_view()),
    path('user/<int:user_id>/followers/', FollowerListView.as_view()),
    path('stories/comment/<int:story_id>', CommentAPIView.as_view(), name='comment-list'),
    path('biography', UserBiographyAPIView.as_view(), name='user-biography'),    
    path('register/', views.RegisterAPIView.as_view()),
    path('stories/author', GetStoryByAuthorIDView.as_view()),
    path('stories/user', GetStoryByUserIDView.as_view(), name='get-story-by-user-id'),
    path('stories/<int:story_id>/comments/', StoryCommentListAPIView.as_view(), name='story-comment-list'),


   
]











    

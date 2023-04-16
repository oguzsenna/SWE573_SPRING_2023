
from django.urls import path
from . import views
from .views import *
from django.views.generic import TemplateView



urlpatterns = [
    path("register", RegisterAPIView.as_view()),
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
    path('stories/<int:story_id>/allcomments/', StoryCommentListAPIView.as_view(), name='story-comment-list'),
    path('user/bio/create', UserBiographyCreateAPIView.as_view(), name='user-biography-create'),
    path('user/bio/update', UserBiographyUpdateAPIView.as_view(), name='user-biography-update'),
    path('register/', views.RegisterAPIView.as_view()),

]







    


from django.urls import path

from .views import RegisterAPIView, LoginAPIView, UserAPIView, RefreshAPIView, LogoutAPIView, StoryCreateAPIView, LikeCreateAPIView, LikeDestroyAPIView

urlpatterns = [
    path("register", RegisterAPIView.as_view()),
    path("login", LoginAPIView.as_view()),
    path("user", UserAPIView.as_view()),
    path("refresh", RefreshAPIView.as_view()),
    path("logout", LogoutAPIView.as_view()),
    path("create_story", StoryCreateAPIView.as_view())
    #path('stories/<int:uuid>/likes/', LikeCreateAPIView.as_view(), name='like_create'),
    #path('stories/<int:uuid>/likes/<int:pk>/', LikeDestroyAPIView.as_view(), name='like_destroy'),
    
]
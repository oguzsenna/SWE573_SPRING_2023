from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField


# Create your models here.
class User(AbstractUser):
    email = models.EmailField(unique=True, null=False)
    username = models.CharField(unique =True, max_length=32)
    biography = models.CharField(max_length=255)
    followings = models.IntegerField(null = True)
    followers = models.IntegerField(null=True)
    repassword = models.CharField(max_length=255)
    

class Story(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, null=True)
    content = models.TextField(null=True)
    story_tags = ArrayField(models.CharField(max_length=255, null=True))
    location = models.CharField(max_length=255, null=True)
    date = models.DateField(null= True)


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    story = models.ForeignKey(Story, on_delete=models.CASCADE)
    liked_date = models.DateTimeField(auto_now_add=True)

    class Meta: unique_together = ('user', 'story')




'''
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(default='default.jpg', upload_to='profile_pics')
    bio = models.TextField(blank=True)
    stories = models.ManyToManyField(Story, blank=True, related_name='author_stories')
    followers = models.ManyToManyField(User, blank=True, related_name='following')

class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following_set')
    followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follower_set')
    followed_date = models.DateTimeField(auto_now_add=True)

'''


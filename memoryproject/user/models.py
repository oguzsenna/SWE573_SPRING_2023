from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.db.models import Value



# Create your models here.
class User(AbstractUser):
    email = models.EmailField(unique=True, null=False)
    username = models.CharField(unique =True, max_length=32)
    repassword = models.CharField(max_length=255)
    biography = models.TextField(blank=True)
    followers = models.ManyToManyField('self', related_name='following', symmetrical=False, blank=True)
    
class Location(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=19, decimal_places=10)
    longitude = models.DecimalField(max_digits=19, decimal_places=10)

    def __str__(self):
        return self.name  

class Story(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, null=True)
    content = models.TextField(null=True)
    story_tags = ArrayField(models.CharField(max_length=255, null=True), default=list)
    date = models.DateField(null= True)
    likes = models.ManyToManyField(User, related_name='liked_stories', blank=True)
    locations = models.ManyToManyField(Location, blank=True)



    def __str__(self):
        return self.title
    


class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(null=True)
    date = models.DateTimeField(auto_now_add=True)







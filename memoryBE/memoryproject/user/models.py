from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    email = models.EmailField(unique=True, null=False)
    username = models.CharField(unique=True, null = False , max_length= 32)
    biography = models.CharField(max_length= 255)
    followings = models.IntegerField()
    followers = models.IntegerField()
    
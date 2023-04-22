from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from .models import *
from datetime import datetime
from rest_framework.fields import SerializerMethodField


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username', 'email', 'password','biography','repassword','profile_photo')
        extra_kwargs = {
            "password": {"write_only": True},
            "re-password": {"write_only": True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['repassword']:
            raise serializers.ValidationError("Passwords do not match!")
        return attrs


    def create(self, validate_data):
        password = validate_data.pop("password",None)
        instance = self.Meta.model(**validate_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['name', 'latitude', 'longitude']


class LocationDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'  


class StorySerializer(serializers.ModelSerializer):
    locations = LocationDetailsSerializer(many=True, read_only=True)

    class Meta:
        model = Story
        fields = ['id','author', 'title', 'content', 'story_tags', 'locations', 'date', 'season', 'start_year', 'end_year', 'start_date', 'end_date','likes']


    def create(self, validated_data):
        locations_data = self.context.get('locations_data', [])
        #locations_data = validated_data.pop('locations')
        print(locations_data)
        story = Story.objects.create(**validated_data)
        for location_data in locations_data:
            location = Location.objects.create(**location_data)
            print(location)
            story.locations.add(location)

            
        return story
    

class CommentSerializer(serializers.ModelSerializer): 

    
    class Meta:
        model = Comment
        fields = ['id', 'author', 'story', 'content', 'date']


class UserPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['profile_photo']
    
    def update(self, instance, validated_data):
        instance.profile_photo = validated_data.get('profile_photo', instance.profile_photo)
        instance.save()
        return instance
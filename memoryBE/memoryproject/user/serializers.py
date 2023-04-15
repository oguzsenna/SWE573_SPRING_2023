from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from .models import User, Story, Like


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username', 'email', 'password')
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


class StorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Story
        fields = ['author', 'title', 'content', 'story_tags', 'location', 'date']

    def create(self, validated_data):
        story = Story.objects.create(**validated_data)
        return story
    
class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'
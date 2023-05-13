from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock
from .models import Story




# Create your tests here.



class StoryCreateAPIViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('create-story')
        self.valid_payload = {
            'title': 'Test Story',
            'content': 'Lorem ipsum dolor sit amet.',
            # Add other required fields as needed
        }

    def test_create_story_success(self):
        # Mock the decode_refresh_token function to return a valid user_id
        with patch('user.views.decode_refresh_token') as mock_decode_token:
            mock_decode_token.return_value = 1

            # Mock the StorySerializer save method
            mock_serializer_save = MagicMock()
            with patch('user.views.StorySerializer') as mock_serializer:
                mock_serializer.return_value = MagicMock(save=mock_serializer_save)

                # Set the cookie value
                self.client.cookies['refreshToken'] = 'your_refresh_token'

                # Send the POST request to the view
                response = self.client.post(self.url, self.valid_payload, format='json')

                # Assert that the response status code is 201 (Created)
                self.assertEqual(response.status_code, status.HTTP_201_CREATED)

                # Assert that the StorySerializer save method is called
                mock_serializer_save.assert_called_once()

    def test_create_story_invalid_data(self):
        # Send the POST request with an invalid payload
        response = self.client.post(self.url, {'invalid_field': 'Invalid Value'}, format='json')

        # Assert that the response status code is 400 (Bad Request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Assert that the response contains serializer errors
        self.assertIn('serializer errors', str(response.data).lower())

    # Add other test methods for edge cases, such as handling missing or invalid refreshToken cookie, or testing the behavior when specific fields or data are missing in the request payload





   
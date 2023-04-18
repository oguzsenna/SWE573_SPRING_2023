import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Autocomplete, Marker } from '@react-google-maps/api';
import { Loader } from "@googlemaps/js-api-loader";


function CreateStory() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [storyTags, setStoryTags] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [locations, setLocations] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [searchBox, setSearchBox] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response =  await axios.post('http://localhost:8000/api/create_story', {
        title,
        content,
        story_tags: storyTags.split(',').map(tag => tag.trim()),
        location,
        date,
      }, {
        withCredentials: true,
      });
      setTitle('');
      setContent('');
      setStoryTags('');
      setLocation('');
      setDate('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className='big-heading'>Create Story</h1>


      <form onSubmit={handleSubmit}>
      <label>
      Title:
      <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <br />
      <label>
      Content:
      <textarea value={content} onChange={(event) => setContent(event.target.value)}></textarea>
      </label>
      <br />
      <label>
      Story tags (comma-separated):
      <input type="text" value={storyTags} onChange={(event) => setStoryTags(event.target.value)} />
      </label>
      <br />
      <label>
      Location:
      <input type="text" value={location} onChange={(event) => setLocation(event.target.value)} />
      </label>
      <br />
      <br />
      <label>
      Date:
      <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>
      <br />
      <br />
      <button type="submit">Create Story</button>
      </form>

      </div>
    );
}
  
  export default CreateStory;
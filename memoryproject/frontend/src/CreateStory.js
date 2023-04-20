import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Autocomplete, Marker } from '@react-google-maps/api';
import 'react-datepicker/dist/react-datepicker.css';
import './story.css';



function CreateStory() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [storyTags, setStoryTags] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [locations, setLocations] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [searchBox, setSearchBox] = useState(null);
  const autocompleteRef = useRef(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [date, setDate] = useState(null); // Add a new state for date
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
    console.log(event.target.value);
  };

  const handleSeasonChange = (event) => {
    setSelectedSeason(event.target.value);
    console.log(event.target.value);
  };
 
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response =  await axios.post('http://localhost:8000/api/create_story', {
        title,
        content,
        story_tags: storyTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        locations,
        date, // Include the date field
      }, {
        withCredentials: true,
      });
      setTitle('');
      setContent('');
      setStoryTags('');
      setLocations([]);
      setDateFilter(null);
    } catch (error) {
      console.error(error);
    }
  };

//  useEffect(()=>{
//    setSelectedSeason(null);
//    setDate(null);
 //   setStartDate(null);
  //  setEndDate(null);
    //setParticularDate(null);
  //}, [dateFilter])
  

  const handleLocationSelect = () => {
    const place = autocompleteRef.current.getPlace();
    const locationData = {
      name: place.name,
      latitude: Number(place.geometry.location.lat().toFixed(6)),
      longitude: Number(place.geometry.location.lng().toFixed(6)),
    };
    setLocations([...locations, locationData]);
  };

  const handleLocationChange = (e) => {
    const locationData = e.target.value.split(';').map(loc => {
      const json = loc.trim().replace(/^{/, '').replace(/}$/, '');
      const {name, latitude, longitude} = JSON.parse(`{${json}}`);
      return {
        name: name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      };
    });
    setLocations(locationData);
  };


  const handleMapClick = async (e) => {
    const { latLng } = e;
    const lat = latLng.lat();
    const lng = latLng.lng();
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`);
      const { results } = response.data;
      if (results.length > 0) {
        const locationData = {
          name: results[0].formatted_address,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6))
        };
        setLocations([...locations, locationData]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMapLoad = (map) => {
    setSearchBox(new window.google.maps.places.SearchBox(map.getDiv()));
  };

  const handleLocationRemove = (index) => {
    setLocations(locations.filter((loc, i) => i !== index));
  };

  const handlePlacesChanged = () => {
    const place = searchBox.getPlaces()[0];
    if (place) {
      const locationData = {
        name: place.name,
        latitude: Number(place.geometry.location.lat().toFixed(6)),
        longitude: Number(place.geometry.location.lng().toFixed(6)),
      };
      setLocations([...locations, locationData]);
    }
  };
  const handleClearFilter = () => {
    setDateFilter(null);
  };
  
  const renderDateFilter = () => {
    console.log('Rendering date filter:', dateFilter);
  
    switch (dateFilter) {
      case 'season':
      return (
        <div>
          <select value={selectedSeason} style={{ display: 'inline-block', marginRight: '10px' }} onChange={handleSeasonChange}>
            <option value="">Select a season</option>
            <option value="Winter">Winter</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
          </select>
          <button type="button" onClick={handleClearFilter}>Clear filter</button>
        </div>
      );
      case 'decade':
        return (
          <div>
            <input type="text" placeholder="Start year" />
            {' - '}
            <input type="text" placeholder="End year" />
            <button type="button" onClick={handleClearFilter}>Clear filter</button>
          </div>
        );
      case 'interval':
          return (
            <div>
              <input type= "date" className="form-control" onChange={(date) => setStartDate(date)} />
              {' - '}
              <input type= "date" className="form-control" onChange={(date) => setEndDate(date)} />
              <button type="button" onClick={handleClearFilter}>Clear filter</button>
            </div>
          );
        case 'particular':
          return (
            <form>
              <div className="form-group">
                <input type= "date" className="form-control" onChange={(date) => setDate(date.target.value)} />
                
              </div> 
              <button type="button" onClick={handleClearFilter}>Clear filter</button>
            </form>
          );
      default:
        return (
          <select value={dateFilter} style={{ display: 'inline-block', marginRight: '10px' }} onChange={handleDateFilterChange}>
            <option value="">Select a date filter</option>
            <option value="season">Season</option>
            <option value="decade">Decade</option>
            <option value="interval">Date Interval</option>
            <option value="particular">Particular Date</option>
          </select>
        );
    }
  };
  

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <div>
        <h1 className='big-heading'>Create Story</h1>
        <div className="create-story-container">
          <div className="create-story-form">
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
            <div className="form-group">
              <label>Locations:</label>
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                }}
                onPlaceChanged={handleLocationSelect}
              >
                <input type="text" className="form-control" />
              </Autocomplete>
              <ul>
                {locations.map((loc, index) => (
                  <div key={index}>
                    <li>{loc.name || `${loc.latitude}, ${loc.longitude}`}</li>
                    <button type="button" onClick={() => handleLocationRemove(index)}>Remove</button>
                  </div>
                ))}
              </ul>
            </div>
            <br />
            
            <label>
              Date Filter:
              {renderDateFilter()}
            </label>
        
            <br />
            <br />

            <button type="submit">Create Story</button>
            </form>
          <br />
        </div>
        <div className="create-story-map">
        <GoogleMap
          mapContainerStyle={{ height: '400px', width: '400px' }}
          center={mapCenter}
          zoom={1}
          onClick={handleMapClick}
          onLoad={handleMapLoad}
        >
          {searchBox &&
            <Autocomplete
              bounds={null}
              onLoad={() => console.log('autocomplete loaded')}
              onPlaceChanged={handlePlacesChanged}
            >
              <input type="text" placeholder="Search on map" />
            </Autocomplete>
          }
          {locations.map((loc, index) => (
            <Marker
              key={index}
              position={{ lat: loc.latitude, lng: loc.longitude }}
              onClick={() => {
                // handle marker click here
              }}
            />
          ))}
        </GoogleMap>
      </div>
    </div>
  </div>
</LoadScript>
  );
}

export default CreateStory;



import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";
import mapStyle from './mapStyle.json';


const StorySearch = () => {
  const [titleSearch, setTitleSearch] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");
  const [stories, setStories] = useState([]);
  const [timeType, setTimeType] = useState("");
  const [seasonName, setSeasonName] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [start_year, setStartYear] = useState(null);
  const [end_year, setEndYear] = useState(null);
  const [radius, setRadius] = useState(25);
  const [locationSearch, setLocationSearch] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [markerPosition, setMarkerPosition] = useState(mapCenter);
  const autocompleteRef = useRef(null);
  

  const navigate = useNavigate();

  const [isEmptySearch, setIsEmptySearch] = useState(false);

  const handleStoryClick = async (story_id) => {
    navigate(`/stories/details/${story_id}`);
  };

  const handleUserClick = async (username) => {
    navigate(`/users/${username}`);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    setStories([]); // Clear the previous search results


    let timeValueObj = {};

    switch (timeType) {
      case "season":
        timeValueObj = { seasonName };
        break;
      case "decade":
        timeValueObj = { year };
        break;
      case "particular":
        timeValueObj = { date };
        break;
      case "interval":
        timeValueObj = { startDate, endDate };
        break;
      case "seasonAndYear":
        timeValueObj = { seasonName, start_year, end_year };
        break;
      default:
        break;
    }

    try {
    const response = await axios.get(
      `http://${process.env.REACT_APP_BACKEND_HOST_NAME}:8000/api/search_story`,
      {
        params: {
          title: titleSearch,
          author: authorSearch,
          time_type: timeType,
          time_value: JSON.stringify(timeValueObj),
          location: JSON.stringify(locationSearch),
          radius: radius,
        },
        withCredentials: true,
      }
    );
    if (response.data.length > 0) {
      setIsEmptySearch(false);
      setStories(response.data);
    } else {
      setIsEmptySearch(true);
    }
  } catch (error) {
    console.error("Error fetching stories:", error);
  }
};








  const renderTimeInput = () => {
    switch (timeType) {
      case "season":
        return (
          <>
            <label htmlFor="seasonName">Season Name:</label>
            <input
              type="text"
              id="seasonName"
              value={seasonName}
              onChange={(e) => setSeasonName(e.target.value)}
            />
          </>
        );
      case "decade":
        return (
          <>
            <label htmlFor="start_year">Start Year:</label>
            <input
              type="number"
              id="start_year"
              value={start_year}
              onChange={(e) => setStartYear(e.target.value)}
            />
            <label htmlFor="end_year">End Year:</label>
            <input
              type="number"
              id="end_year"
              value={end_year}
              onChange={(e) => setEndYear(e.target.value)}
            />
          </>
        );
      case "particular":
        return (
          <>
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </>
        );
      case "interval":
        return (
          <>
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <br />
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </>
        );

      case "seasonAndYear":
        return (
          <>
            <label htmlFor="seasonName">Season Name:</label>
            <input
              type="text"
              id="seasonName"
              value={seasonName}
              onChange={(e) => setSeasonName(e.target.value)}
            />
            <br />
            <label htmlFor="start_year">Start Year:</label>
            <input
              type="number"
              id="start_year"
              value={start_year}
              onChange={(e) => setStartYear(e.target.value)}
            />
            <label htmlFor="end_year">End Year:</label>
            <input
              type="number"
              id="end_year"
              value={end_year}
              onChange={(e) => setEndYear(e.target.value)}
            />
          </>
        );
      default:
        return null;
    }
  };

  const handleRadiusChange = (e) => {
    setRadius(e.target.value);
  };

  const handleLocationSelect = () => {
    if (!autocompleteRef.current) {
      return;
    }
    const place = autocompleteRef.current.getPlace();

    if (!place || !place.geometry || !place.geometry.location) {
      return;
    }

    const locationData = {
      name: place.name,
      latitude: Number(place.geometry.location.lat().toFixed(6)),
      longitude: Number(place.geometry.location.lng().toFixed(6)),
    };

    setLocationSearch(locationData);
    setMapCenter({ lat: locationData.latitude, lng: locationData.longitude });
  };

  const handleMarker = (e) => {
    const newPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setMarkerPosition(newPosition);
    setLocationSearch({
      name: "Custom Location",
      latitude: Number(newPosition.lat.toFixed(6)),
      longitude: Number(newPosition.lng.toFixed(6)),
    });
  };

  return (
    <div>
      <h2>Story Search</h2>
      <form onSubmit={handleSearch}>
        <label htmlFor="titleSearch">Search Title:</label>
        <input
          type="text"
          id="titleSearch"
          value={titleSearch}
          onChange={(e) => setTitleSearch(e.target.value)}
        />
        <br />
        <label htmlFor="authorSearch">Search Username:</label>
        <input
          type="text"
          id="authorSearch"
          value={authorSearch}
          onChange={(e) => setAuthorSearch(e.target.value)}
        />
        <br />
        <div className="form-group">
          <label htmlFor="timeType">Date Type:</label>
          <select
            className="form-control"
            id="timeType"
            value={timeType}
            onChange={(e) => setTimeType(e.target.value)}
          >
            <option value="">Select time type</option>
            <option value="particular">Particular</option>
            <option value="decade">Year Interval</option>
            <option value="interval">Date Interval</option>
            <option value="seasonAndYear">Season and Year</option>
          </select>
        </div>
        {renderTimeInput()}
        <div className="form-group">
          <label>Location:</label>
          <Autocomplete
            onLoad={(autocomplete) => {
              autocompleteRef.current = autocomplete;
            }}
            onPlaceChanged={handleLocationSelect}
          >
            <input type="text" className="form-control" />
          </Autocomplete>
        </div>
        <br />
        <div className="form-group">
          <GoogleMap
            id="search-map"
            mapContainerStyle={{
              width: "100%",
              height: "500px",
            }}
            zoom={2}
            center={markerPosition}
            onClick={(e) => handleMarker(e)}
            options={{
              styles: mapStyle
            }}
          >
            {locationSearch && (
              <Marker
                position={markerPosition}
                draggable={true}
                onDragEnd={(e) => handleMarker(e)}
              />
            )}
          </GoogleMap>
          <br />
          <div className="form-group">
            <label htmlFor="radius">Radius: {radius} km</label>
            <input
              type="range"
              id="radius"
              min="5"
              max="100"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
            />
          </div>
        </div>
        <button className="button" type="submit">
          Search
        </button>
      </form>
      {stories.length > 0 && (
        <>
          <h3>Search Results:</h3>
          <ul>
            {stories.map((story) => (
              <li key={story.id}>
                <p>
                  <strong>Title:</strong> {story.title} <br />
                  <span
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => handleUserClick(story.author_username)}
                  >
                    {story.author_username}
                  </span>
                </p>
                <button onClick={() => handleStoryClick(story.id)}>
                  Read Story
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {isEmptySearch && (
        <div>
          <h3>No results found. Please try a different search query.</h3>
        </div>
      )}
    </div>
  );
};

export default StorySearch;

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 0.0236,
  lng: 37.9062
};

const IncidentReportPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    incident_type: 'illegal_logging',
    title: '',
    description: '',
    location_name: '',
    latitude: center.lat,
    longitude: center.lng,
    image: null
  });
  const [markerPosition, setMarkerPosition] = useState(center);
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyBCqzpJMk_YpZTMm4VeBl0IUvM9a4K6ZXc',
    libraries
  });

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;
    
    // Redirect to login if not authenticated
    if (!user) {
      alert('Please login to report incidents');
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    setMarkerPosition({ lat, lng });
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  }, []);

  const onAutocompleteLoad = useCallback((autocomplete) => {
    setAutocomplete(autocomplete);
  }, []);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setMarkerPosition({ lat, lng });
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          location_name: place.formatted_address || prev.location_name
        }));
        
        map.panTo({ lat, lng });
        map.setZoom(15);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      let token = localStorage.getItem('token');
      
      // Try to refresh token if expired
      const refreshToken = localStorage.getItem('refreshToken');
      if (!token && refreshToken) {
        try {
          const refreshResponse = await axios.post('http://localhost:8000/api/auth/refresh/', {
            refresh: refreshToken
          });
          token = refreshResponse.data.access;
          localStorage.setItem('token', token);
        } catch (refreshError) {
          // Refresh failed, need to login again
          alert('Your session has expired. Please login again.');
          navigate('/login');
          return;
        }
      }
      
      if (!token) {
        alert('Please login to report incidents');
        navigate('/login');
        return;
      }

      const submitData = new FormData();
      
      submitData.append('incident_type', formData.incident_type);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('location_name', formData.location_name);
      submitData.append('latitude', formData.latitude);
      submitData.append('longitude', formData.longitude);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      await axios.post(
        'http://localhost:8000/api/incidents/',
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage({ type: 'success', text: 'Incident report submitted successfully! Rangers will investigate.' });
      
      // Reset form
      setFormData({
        incident_type: 'illegal_logging',
        title: '',
        description: '',
        location_name: '',
        latitude: center.lat,
        longitude: center.lng,
        image: null
      });
      setMarkerPosition(center);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Error submitting incident:', error);
      
      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      } else {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.detail || 'Failed to submit incident report. Please try again.' 
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (loadError) return <div className="container mx-auto px-4 py-8">Error loading maps</div>;
  if (!isLoaded) return <div className="container mx-auto px-4 py-8">Loading maps...</div>;
  if (!user) return null; // Will redirect to login

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Report Forest Incident</h1>
            <p className="text-gray-600">Help protect our forests by reporting incidents with exact GPS location</p>
          </div>

          {/* Alert Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Incident Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident Type *
              </label>
              <select
                name="incident_type"
                value={formData.incident_type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="illegal_logging">Illegal Logging</option>
                <option value="fire">Forest Fire</option>
                <option value="poaching">Wildlife Poaching</option>
                <option value="encroachment">Land Encroachment</option>
                <option value="pollution">Environmental Pollution</option>
                <option value="vandalism">Vandalism</option>
                <option value="other">Other Incident</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Brief incident title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Describe what you witnessed in detail..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Location Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Location
              </label>
              <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                <input
                  type="text"
                  placeholder="Search for a location or forest..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </Autocomplete>
            </div>

            {/* Location Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Name *
              </label>
              <input
                type="text"
                name="location_name"
                value={formData.location_name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Karura Forest, Nairobi"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Google Map */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident Location * (Click on map to set exact location)
              </label>
              <div className="border-4 border-gray-200 rounded-lg overflow-hidden">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  zoom={6}
                  center={markerPosition}
                  onClick={onMapClick}
                  onLoad={onLoad}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: true
                  }}
                >
                  <Marker 
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={(event) => {
                      const lat = event.latLng.lat();
                      const lng = event.latLng.lng();
                      setMarkerPosition({ lat, lng });
                      setFormData(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng
                      }));
                    }}
                  />
                </GoogleMap>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                📍 Selected: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence Photo (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {formData.image && (
                <p className="mt-2 text-sm text-green-600">📷 Image selected: {formData.image.name}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '⏳ Submitting Report...' : '🚨 Submit Incident Report'}
              </button>
            </div>
          </form>

          {/* Info Card */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📌 Reporting Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be as specific as possible about the location</li>
              <li>• Include evidence photos when available</li>
              <li>• Reports are reviewed by rangers within 24 hours</li>
              <li>• Urgent incidents (fires, poaching) receive priority</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentReportPage;

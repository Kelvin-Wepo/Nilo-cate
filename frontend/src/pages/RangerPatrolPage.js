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

const RangerPatrolPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    incident_type: 'illegal_logging',
    title: '',
    description: '',
    location_name: '',
    latitude: center.lat,
    longitude: center.lng,
    image: null,
    // Ranger-specific fields
    severity: 'medium',
    immediate_action_taken: '',
    backup_required: false,
    witnesses_present: false,
    evidence_collected: '',
    follow_up_required: true,
    estimated_damage: '',
    suspects_description: '',
    vehicle_details: '',
    time_of_incident: '',
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
    
    // Check if user is logged in and is a ranger
    if (!user) {
      alert('Please login as a ranger to access patrol features');
      navigate('/login');
    } else if (user.user_type !== 'ranger') {
      alert('This feature is only available to rangers');
      navigate('/');
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
          location_name: place.formatted_address || place.name || ''
        }));
        
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('access_token');
      const submitData = new FormData();
      
      // Basic incident data
      submitData.append('incident_type', formData.incident_type);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('location_name', formData.location_name);
      submitData.append('latitude', formData.latitude);
      submitData.append('longitude', formData.longitude);
      
      // Ranger-specific data
      submitData.append('severity', formData.severity);
      submitData.append('immediate_action_taken', formData.immediate_action_taken);
      submitData.append('backup_required', formData.backup_required);
      submitData.append('witnesses_present', formData.witnesses_present);
      submitData.append('evidence_collected', formData.evidence_collected);
      submitData.append('follow_up_required', formData.follow_up_required);
      submitData.append('estimated_damage', formData.estimated_damage);
      submitData.append('suspects_description', formData.suspects_description);
      submitData.append('vehicle_details', formData.vehicle_details);
      submitData.append('time_of_incident', formData.time_of_incident);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const response = await axios.post(
        'http://localhost:8000/api/monitoring/incidents/',
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage({
        type: 'success',
        text: 'Patrol report submitted successfully! Report ID: ' + response.data.id
      });

      // Reset form
      setFormData({
        incident_type: 'illegal_logging',
        title: '',
        description: '',
        location_name: '',
        latitude: center.lat,
        longitude: center.lng,
        image: null,
        severity: 'medium',
        immediate_action_taken: '',
        backup_required: false,
        witnesses_present: false,
        evidence_collected: '',
        follow_up_required: true,
        estimated_damage: '',
        suspects_description: '',
        vehicle_details: '',
        time_of_incident: '',
      });
      setMarkerPosition(center);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Redirect to ranger dashboard after 2 seconds
      setTimeout(() => {
        navigate('/ranger');
      }, 2000);

    } catch (error) {
      console.error('Error submitting patrol report:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to submit patrol report. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (loadError) return <div className="text-center p-8">Error loading maps</div>;
  if (!isLoaded) return <div className="text-center p-8">Loading maps...</div>;
  if (!user || user.user_type !== 'ranger') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🚁</div>
            <h1 className="text-4xl font-bold text-forest-green mb-2">Active Patrol Report</h1>
            <p className="text-gray-600">Submit field observations and incident reports</p>
            <div className="mt-4 inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <span className="font-semibold">Ranger:</span>
              <span>{user.username}</span>
              {user.certification_number && (
                <>
                  <span>|</span>
                  <span className="text-sm">ID: {user.certification_number}</span>
                </>
              )}
            </div>
          </div>

          {message.text && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Incident Type & Severity */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🚨 Incident Type *
                </label>
                <select
                  name="incident_type"
                  value={formData.incident_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="illegal_logging">🪓 Illegal Logging</option>
                  <option value="fire">🔥 Wildfire / Fire Hazard</option>
                  <option value="poaching">🦌 Wildlife Poaching</option>
                  <option value="encroachment">🏘️ Land Encroachment</option>
                  <option value="pollution">☣️ Environmental Pollution</option>
                  <option value="vandalism">🔨 Vandalism / Damage</option>
                  <option value="suspicious_activity">👁️ Suspicious Activity</option>
                  <option value="other">❓ Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ⚠️ Severity Level *
                </label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="low">🟢 Low - Monitoring Required</option>
                  <option value="medium">🟡 Medium - Attention Needed</option>
                  <option value="high">🟠 High - Urgent Response</option>
                  <option value="critical">🔴 Critical - Immediate Action</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📝 Report Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Illegal logging activity near ranger station"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Time of Incident */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                🕐 Time of Incident
              </label>
              <input
                type="datetime-local"
                name="time_of_incident"
                value={formData.time_of_incident}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📋 Detailed Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Provide comprehensive details about what you observed, actions taken, and current situation..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Immediate Action Taken */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ⚡ Immediate Action Taken
              </label>
              <textarea
                name="immediate_action_taken"
                value={formData.immediate_action_taken}
                onChange={handleChange}
                rows="3"
                placeholder="Describe actions you took on-site (e.g., secured perimeter, documented evidence, contacted authorities...)"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Checkboxes */}
            <div className="grid md:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-lg">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="backup_required"
                  checked={formData.backup_required}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="font-medium">🚔 Backup Required</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="witnesses_present"
                  checked={formData.witnesses_present}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="font-medium">👥 Witnesses Present</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="follow_up_required"
                  checked={formData.follow_up_required}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="font-medium">🔄 Follow-up Required</span>
              </label>
            </div>

            {/* Evidence & Suspects */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📦 Evidence Collected
                </label>
                <textarea
                  name="evidence_collected"
                  value={formData.evidence_collected}
                  onChange={handleChange}
                  rows="3"
                  placeholder="List evidence collected (photos, samples, tools, etc.)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  💰 Estimated Damage/Loss
                </label>
                <textarea
                  name="estimated_damage"
                  value={formData.estimated_damage}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Estimate environmental/financial impact"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Suspects & Vehicle */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  👤 Suspects Description
                </label>
                <textarea
                  name="suspects_description"
                  value={formData.suspects_description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Physical description, clothing, distinguishing features..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🚗 Vehicle Details
                </label>
                <textarea
                  name="vehicle_details"
                  value={formData.vehicle_details}
                  onChange={handleChange}
                  rows="3"
                  placeholder="License plate, make, model, color..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Map */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📍 Incident Location *
              </label>
              <Autocomplete
                onLoad={onAutocompleteLoad}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  type="text"
                  name="location_name"
                  value={formData.location_name}
                  onChange={handleChange}
                  placeholder="Search for location or click on map"
                  className="w-full px-4 py-3 mb-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </Autocomplete>
              
              <div className="rounded-lg overflow-hidden border-4 border-gray-300 shadow-lg">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  zoom={10}
                  center={markerPosition}
                  onClick={onMapClick}
                  onLoad={onLoad}
                >
                  <Marker position={markerPosition} />
                </GoogleMap>
              </div>
              
              <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded">
                📌 Current coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📸 Photo Evidence
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-600">
                📷 Upload photos of the incident scene, evidence, or damage
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-blue-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
            >
              {submitting ? '📡 Submitting Patrol Report...' : '🚁 Submit Patrol Report'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RangerPatrolPage;

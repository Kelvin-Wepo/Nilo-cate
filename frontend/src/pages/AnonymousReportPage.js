import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AnonymousReportPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    incident_type: 'ILLEGAL_LOGGING',
    severity: 'MEDIUM',
    latitude: '',
    longitude: '',
    location_description: '',
    description: '',
    evidence: '',
    is_anonymous: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [blockchainStats, setBlockchainStats] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchBlockchainStats();
  }, []);

  const fetchBlockchainStats = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/incidents/blockchain_stats/`);
      setBlockchainStats(response.data);
    } catch (err) {
      console.error('Failed to fetch blockchain stats:', err);
    }
  };

  const getCurrentLocation = () => {
    setUseCurrentLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          });
          setUseCurrentLocation(false);
        },
        (error) => {
          setError('Unable to get your location. Please enter manually.');
          setUseCurrentLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setUseCurrentLocation(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);

    // Validate coordinates
    if (!formData.latitude || !formData.longitude) {
      setError('Please provide location coordinates');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/incidents/report_anonymous_blockchain/`,
        formData
      );

      setSuccess({
        message: 'Report submitted successfully to blockchain!',
        reportId: response.data.report_id,
        transactionHash: response.data.transaction_hash,
        reportHash: response.data.report_hash,
        blockNumber: response.data.block_number
      });

      // Reset form
      setFormData({
        incident_type: 'ILLEGAL_LOGGING',
        severity: 'MEDIUM',
        latitude: '',
        longitude: '',
        location_description: '',
        description: '',
        evidence: '',
        is_anonymous: true
      });

      // Refresh stats
      fetchBlockchainStats();

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const incidentTypes = [
    { value: 'ILLEGAL_LOGGING', label: '🪓 Illegal Logging' },
    { value: 'WILDFIRE', label: '🔥 Wildfire' },
    { value: 'POACHING', label: '🦏 Poaching' },
    { value: 'DEFORESTATION', label: '🌲 Deforestation' },
    { value: 'POLLUTION', label: '🏭 Pollution' },
    { value: 'TREE_DISEASE', label: '🍂 Tree Disease' },
    { value: 'OTHER', label: '📋 Other' }
  ];

  const severityLevels = [
    { value: 'LOW', label: 'Low', color: 'text-green-600' },
    { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600' },
    { value: 'HIGH', label: 'High', color: 'text-orange-600' },
    { value: 'CRITICAL', label: 'Critical', color: 'text-red-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔒 Anonymous Incident Reporting
          </h1>
          <p className="text-lg text-gray-600">
            Report forest incidents anonymously using blockchain technology
          </p>
          
          {blockchainStats && (
            <div className="mt-4 inline-flex items-center space-x-4 bg-white px-6 py-3 rounded-full shadow-sm">
              <span className={`flex items-center ${blockchainStats.connected ? 'text-green-600' : 'text-red-600'}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${blockchainStats.connected ? 'bg-green-600' : 'bg-red-600'}`}></span>
                {blockchainStats.connected ? 'Blockchain Connected' : 'Blockchain Offline'}
              </span>
              <span className="text-gray-600">
                {blockchainStats.total_reports} Reports Submitted
              </span>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Your Privacy is Protected:</strong> Reports are stored on blockchain with cryptographic hashing. 
                Your identity remains anonymous while ensuring report authenticity.
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{success.message}</h3>
                <div className="mt-2 text-sm text-green-700 space-y-1">
                  <p><strong>Report ID:</strong> #{success.reportId}</p>
                  <p><strong>Transaction:</strong> <code className="text-xs">{success.transactionHash?.substring(0, 20)}...</code></p>
                  <p><strong>Block:</strong> #{success.blockNumber}</p>
                  <button
                    onClick={() => navigate('/incidents')}
                    className="mt-2 text-green-600 hover:text-green-500 underline"
                  >
                    View All Incidents →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Incident Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident Type *
              </label>
              <select
                name="incident_type"
                value={formData.incident_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {incidentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity Level *
              </label>
              <div className="grid grid-cols-4 gap-3">
                {severityLevels.map(level => (
                  <label
                    key={level.value}
                    className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.severity === level.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={level.value}
                      checked={formData.severity === level.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className={`font-medium ${formData.severity === level.value ? 'text-green-700' : level.color}`}>
                      {level.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  name="latitude"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  placeholder="-1.270000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  name="longitude"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  placeholder="36.820000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={useCurrentLocation}
              className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{useCurrentLocation ? 'Getting location...' : 'Use My Current Location'}</span>
            </button>

            {/* Location Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Description
              </label>
              <input
                type="text"
                name="location_description"
                value={formData.location_description}
                onChange={handleChange}
                placeholder="e.g., Karura Forest, near main gate"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Provide detailed description of the incident..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Evidence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence (Optional)
              </label>
              <input
                type="text"
                name="evidence"
                value={formData.evidence}
                onChange={handleChange}
                placeholder="IPFS hash, photo URL, or description of evidence"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter photo hash, IPFS URL, or description of evidence
              </p>
            </div>

            {/* Anonymous Checkbox */}
            <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
              <input
                type="checkbox"
                id="is_anonymous"
                name="is_anonymous"
                checked={formData.is_anonymous}
                onChange={handleChange}
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="is_anonymous" className="text-sm text-gray-700">
                <strong>Submit Anonymously</strong> - Your identity will be protected on blockchain
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !blockchainStats?.connected}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting to Blockchain...
                </span>
              ) : (
                '🔒 Submit Anonymous Report to Blockchain'
              )}
            </button>

            {!blockchainStats?.connected && (
              <p className="text-center text-sm text-red-600">
                Blockchain service is currently unavailable. Please try again later.
              </p>
            )}
          </form>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 flex items-center justify-center mx-auto space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnonymousReportPage;

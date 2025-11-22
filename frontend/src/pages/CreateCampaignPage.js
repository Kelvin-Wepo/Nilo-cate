import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignService } from '../services/campaignService';
import { useAuth } from '../context/AuthContext';

const CreateCampaignPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    campaign_type: 'species',
    status: 'active',
    forest_name: '',
    forest_area_hectares: '',
    county: '',
    latitude: '',
    longitude: '',
    funding_goal: '',
    trees_target: '',
    start_date: '',
    end_date: '',
    video_url: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from title
      ...(name === 'title' && { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to create a campaign');
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      const response = await campaignService.createCampaign({
        ...formData,
        creator_id: user.id,
      });
      alert('Campaign created successfully!');
      navigate(`/campaigns/${response.slug}`);
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-forest-green mb-2">Create Campaign</h1>
            <p className="text-gray-600">Launch a forest conservation campaign for your community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold mb-4">📝 Basic Information</h2>
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">Campaign Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 rounded-lg"
                  placeholder="e.g., Save Karura Forest - 2025"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold mb-2">Campaign Type *</label>
                <select
                  name="campaign_type"
                  value={formData.campaign_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 rounded-lg"
                  required
                >
                  <option value="emergency">🚨 Emergency Response</option>
                  <option value="species">🌳 Species Protection</option>
                  <option value="restoration">🌲 Forest Restoration</option>
                  <option value="education">🎓 Community Education</option>
                  <option value="research">🔬 Research Project</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-semibold mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 rounded-lg"
                  rows="6"
                  placeholder="Describe your campaign goals, why it's important, and what you plan to achieve..."
                  required
                ></textarea>
              </div>
            </div>

            {/* Location */}
            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold mb-4">📍 Location Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-semibold mb-2">Forest Name *</label>
                  <input
                    type="text"
                    name="forest_name"
                    value={formData.forest_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 rounded-lg"
                    placeholder="e.g., Karura Forest"
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-semibold mb-2">County *</label>
                  <input
                    type="text"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 rounded-lg"
                    placeholder="e.g., Nairobi"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block font-semibold mb-2">Forest Area (hectares) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="forest_area_hectares"
                    value={formData.forest_area_hectares}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-semibold mb-2">Latitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 rounded-lg"
                    placeholder="-1.2345"
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-semibold mb-2">Longitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 rounded-lg"
                    placeholder="36.7890"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Goals */}
            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold mb-4">🎯 Campaign Goals</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-semibold mb-2">Funding Goal (KES) *</label>
                  <input
                    type="number"
                    name="funding_goal"
                    value={formData.funding_goal}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 rounded-lg"
                    placeholder="500000"
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-semibold mb-2">Trees Target *</label>
                  <input
                    type="number"
                    name="trees_target"
                    value={formData.trees_target}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 rounded-lg"
                    placeholder="100"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold mb-4">📅 Timeline</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-semibold mb-2">Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-semibold mb-2">End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 rounded-lg"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Optional */}
            <div>
              <h2 className="text-2xl font-bold mb-4">🎥 Media (Optional)</h2>
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">Video URL</label>
                <input
                  type="url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 rounded-lg"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {submitting ? 'Creating...' : '🚀 Launch Campaign'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/campaigns')}
                className="px-8 bg-gray-300 text-gray-700 font-bold py-4 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignPage;

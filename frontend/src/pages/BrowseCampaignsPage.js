import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { campaignService } from '../services/campaignService';

const BrowseCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'active',
    campaign_type: '',
    county: '',
    search: '',
  });

  useEffect(() => {
    loadCampaigns();
    loadStats();
  }, [filters]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignService.getAllCampaigns(filters);
      setCampaigns(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await campaignService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getCampaignTypeEmoji = (type) => {
    const emojis = {
      emergency: '🚨',
      species: '🌳',
      restoration: '🌲',
      education: '🎓',
      research: '🔬',
    };
    return emojis[type] || '🌿';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      funded: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-forest-green mb-4">
            🌳 Forest Conservation Campaigns
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join communities, schools, and organizations to protect Kenya's endangered forests
          </p>
        </div>

        {/* Stats Banner */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.total_campaigns}</div>
              <div className="text-gray-600">Total Campaigns</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.active_campaigns}</div>
              <div className="text-gray-600">Active Now</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600">
                KES {stats.total_raised.toLocaleString()}
              </div>
              <div className="text-gray-600">Total Raised</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.total_participants}</div>
              <div className="text-gray-600">Participants</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="funded">Fully Funded</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <select
                name="campaign_type"
                value={filters.campaign_type}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="emergency">🚨 Emergency</option>
                <option value="species">🌳 Species Protection</option>
                <option value="restoration">🌲 Restoration</option>
                <option value="education">🎓 Education</option>
                <option value="research">🔬 Research</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">County</label>
              <input
                type="text"
                name="county"
                value={filters.county}
                onChange={handleFilterChange}
                placeholder="e.g., Nairobi"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search campaigns..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Create Campaign Button */}
        <div className="mb-6 text-right">
          <Link
            to="/campaigns/create"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg"
          >
            <span className="mr-2">+</span>
            Create Campaign
          </Link>
        </div>

        {/* Campaign Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-2xl">Loading campaigns...</div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌳</div>
            <div className="text-2xl text-gray-600">No campaigns found</div>
            <p className="text-gray-500 mt-2">Try adjusting your filters or create a new campaign</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                to={`/campaigns/${campaign.slug}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1"
              >
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 relative">
                  {campaign.cover_image ? (
                    <img
                      src={campaign.cover_image}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white text-6xl">
                      {getCampaignTypeEmoji(campaign.campaign_type)}
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(campaign.status)}`}>
                      {campaign.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {campaign.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <span className="mr-4">📍 {campaign.forest_name}</span>
                    <span>{campaign.county}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {campaign.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">
                        KES {parseFloat(campaign.current_funding).toLocaleString()}
                      </span>
                      <span className="text-gray-600">
                        of KES {parseFloat(campaign.funding_goal).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(campaign.funding_percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {campaign.funding_percentage.toFixed(1)}% funded
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-sm text-gray-600 pt-4 border-t">
                    <span>👥 {campaign.participant_count} participants</span>
                    <span>⏰ {campaign.days_remaining} days left</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseCampaignsPage;

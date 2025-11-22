import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignService } from '../services/campaignService';
import { useAuth } from '../context/AuthContext';

const CampaignDetailPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  
  const [joinData, setJoinData] = useState({
    participant_type: 'individual',
    organization_name: '',
  });
  
  const [contributeData, setContributeData] = useState({
    amount: '',
    payment_method: 'mpesa',
    phone_number: '',
    message: '',
    is_anonymous: false,
  });

  useEffect(() => {
    loadCampaign();
  }, [slug]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const data = await campaignService.getCampaign(slug);
      setCampaign(data);
    } catch (error) {
      console.error('Error loading campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to join this campaign');
      navigate('/login');
      return;
    }

    try {
      await campaignService.joinCampaign(slug, joinData);
      alert('Successfully joined campaign!');
      setShowJoinModal(false);
      loadCampaign();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to join campaign');
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to contribute');
      navigate('/login');
      return;
    }

    try {
      await campaignService.contribute(slug, {
        ...contributeData,
        participant_type: joinData.participant_type,
        organization_name: joinData.organization_name,
      });
      alert('Contribution successful! Thank you for supporting this campaign.');
      setShowContributeModal(false);
      loadCampaign();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to process contribution');
    }
  };

  if (loading) return <div className="text-center p-8">Loading campaign...</div>;
  if (!campaign) return <div className="text-center p-8">Campaign not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="h-96 bg-gradient-to-br from-green-400 to-blue-500 relative">
            {campaign.cover_image && (
              <img src={campaign.cover_image} alt={campaign.title} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-8 text-white w-full">
                <h1 className="text-4xl font-bold mb-2">{campaign.title}</h1>
                <div className="flex items-center space-x-4 text-lg">
                  <span>📍 {campaign.forest_name}, {campaign.county}</span>
                  <span>🌳 {campaign.trees_target} trees</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  KES {parseFloat(campaign.current_funding).toLocaleString()}
                </div>
                <div className="text-gray-600">raised of KES {parseFloat(campaign.funding_goal).toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{campaign.participant_count}</div>
                <div className="text-gray-600">participants</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">{campaign.days_remaining}</div>
                <div className="text-gray-600">days remaining</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-600 h-4 rounded-full transition-all"
                  style={{ width: `${Math.min(campaign.funding_percentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-center text-lg font-semibold mt-2">
                {campaign.funding_percentage.toFixed(1)}% funded
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowContributeModal(true)}
                className="flex-1 bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition text-lg"
              >
                💚 Contribute Now
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition text-lg"
              >
                🤝 Join Campaign
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex border-b mb-6">
            {['about', 'updates', 'participants', 'milestones'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold ${
                  activeTab === tab
                    ? 'border-b-4 border-green-600 text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'about' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">About This Campaign</h2>
              <p className="text-gray-700 whitespace-pre-wrap mb-6">{campaign.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <strong>Forest Area:</strong> {campaign.forest_area_hectares} hectares
                </div>
                <div>
                  <strong>Campaign Type:</strong> {campaign.campaign_type}
                </div>
                <div>
                  <strong>Start Date:</strong> {new Date(campaign.start_date).toLocaleDateString()}
                </div>
                <div>
                  <strong>End Date:</strong> {new Date(campaign.end_date).toLocaleDateString()}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-3">Budget Breakdown</h3>
              {campaign.budget_breakdown && Object.keys(campaign.budget_breakdown).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(campaign.budget_breakdown).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-semibold">{category}</span>
                      <span>KES {parseFloat(amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Budget breakdown will be added soon</p>
              )}
            </div>
          )}

          {activeTab === 'updates' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Campaign Updates</h2>
              {campaign.updates && campaign.updates.length > 0 ? (
                <div className="space-y-4">
                  {campaign.updates.map(update => (
                    <div key={update.id} className="border-l-4 border-green-600 pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{update.title}</h3>
                        <span className="text-sm text-gray-500">
                          {new Date(update.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{update.content}</p>
                      <div className="text-sm text-gray-500 mt-2">
                        By {update.author.username} | {update.likes_count} ❤️
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No updates yet</p>
              )}
            </div>
          )}

          {activeTab === 'participants' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Campaign Participants</h2>
              {campaign.participants && campaign.participants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaign.participants.map(participant => (
                    <div key={participant.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold">
                            {participant.organization_name || participant.user.username}
                          </div>
                          <div className="text-sm text-gray-600">{participant.participant_type}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            KES {parseFloat(participant.total_contributed).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">contributed</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No participants yet. Be the first to join!</p>
              )}
            </div>
          )}

          {activeTab === 'milestones' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Campaign Milestones</h2>
              {campaign.milestones && campaign.milestones.length > 0 ? (
                <div className="space-y-4">
                  {campaign.milestones.map(milestone => (
                    <div key={milestone.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold">{milestone.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {milestone.status}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{milestone.description}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${milestone.progress_percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {milestone.progress_percentage}% complete | Target: {new Date(milestone.target_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No milestones defined yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Join Campaign</h2>
            <form onSubmit={handleJoin}>
              <div className="mb-4">
                <label className="block font-semibold mb-2">Join as:</label>
                <select
                  value={joinData.participant_type}
                  onChange={(e) => setJoinData({...joinData, participant_type: e.target.value})}
                  className="w-full px-4 py-2 border-2 rounded-lg"
                >
                  <option value="individual">👤 Individual Citizen</option>
                  <option value="community">🏘️ Community</option>
                  <option value="school">🎓 School</option>
                  <option value="organization">🏢 Organization</option>
                  <option value="corporate">🏭 Corporate Sponsor</option>
                </select>
              </div>
              
              {joinData.participant_type !== 'individual' && (
                <div className="mb-4">
                  <label className="block font-semibold mb-2">Organization/School Name:</label>
                  <input
                    type="text"
                    value={joinData.organization_name}
                    onChange={(e) => setJoinData({...joinData, organization_name: e.target.value})}
                    className="w-full px-4 py-2 border-2 rounded-lg"
                    required
                  />
                </div>
              )}
              
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">
                  Join
                </button>
                <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContributeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Contribute to Campaign</h2>
            <form onSubmit={handleContribute}>
              <div className="mb-4">
                <label className="block font-semibold mb-2">Amount (KES):</label>
                <input
                  type="number"
                  min="10"
                  value={contributeData.amount}
                  onChange={(e) => setContributeData({...contributeData, amount: e.target.value})}
                  className="w-full px-4 py-2 border-2 rounded-lg"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">Payment Method:</label>
                <select
                  value={contributeData.payment_method}
                  onChange={(e) => setContributeData({...contributeData, payment_method: e.target.value})}
                  className="w-full px-4 py-2 border-2 rounded-lg"
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="card">Credit/Debit Card</option>
                </select>
              </div>
              
              {contributeData.payment_method === 'mpesa' && (
                <div className="mb-4">
                  <label className="block font-semibold mb-2">Phone Number:</label>
                  <input
                    type="tel"
                    value={contributeData.phone_number}
                    onChange={(e) => setContributeData({...contributeData, phone_number: e.target.value})}
                    placeholder="254712345678"
                    className="w-full px-4 py-2 border-2 rounded-lg"
                    required
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">Message (optional):</label>
                <textarea
                  value={contributeData.message}
                  onChange={(e) => setContributeData({...contributeData, message: e.target.value})}
                  className="w-full px-4 py-2 border-2 rounded-lg"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={contributeData.is_anonymous}
                    onChange={(e) => setContributeData({...contributeData, is_anonymous: e.target.checked})}
                    className="mr-2"
                  />
                  <span>Contribute anonymously</span>
                </label>
              </div>
              
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">
                  Contribute
                </button>
                <button type="button" onClick={() => setShowContributeModal(false)} className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetailPage;

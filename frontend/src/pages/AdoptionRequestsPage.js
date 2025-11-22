import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdoptionRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rangerNotes, setRangerNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:8000/api/adoption-requests/ranger_requests/',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      if (error.response?.status === 403) {
        alert('Access denied. Only rangers can view adoption requests.');
        navigate('/');
      }
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this adoption request?')) {
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8000/api/adoption-requests/${requestId}/approve/`,
        { notes: rangerNotes },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Adoption request approved successfully!');
      setSelectedRequest(null);
      setRangerNotes('');
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      alert(error.response?.data?.error || 'Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId) => {
    const notes = window.prompt('Please provide a reason for rejection:');
    if (!notes) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8000/api/adoption-requests/${requestId}/reject/`,
        { notes },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Adoption request rejected.');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'pending') return req.status === 'pending';
    if (filter === 'payment_pending') return req.status === 'payment_pending';
    if (filter === 'completed') return req.status === 'completed';
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      payment_pending: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      payment_failed: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl">Loading adoption requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Adoption Requests</h1>
          <p className="text-gray-600">Review and approve tree adoption requests from citizens</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-2 mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md font-medium transition ${
              filter === 'all'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md font-medium transition ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('payment_pending')}
            className={`px-4 py-2 rounded-md font-medium transition ${
              filter === 'payment_pending'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Payment Pending ({requests.filter(r => r.status === 'payment_pending').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-md font-medium transition ${
              filter === 'completed'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Completed ({requests.filter(r => r.status === 'completed').length})
          </button>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🌳</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">There are no adoption requests matching the selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRequests.map(request => (
              <div key={request.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(request.status)}`}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                        {request.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{request.user.username}</div>
                        <div className="text-sm text-gray-500">{request.user.email}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      📞 {request.phone_number}
                    </div>
                  </div>

                  {/* Tree Info */}
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <div className="font-semibold text-green-900 mb-1">
                      🌲 {request.tree_details.species_name}
                    </div>
                    <div className="text-sm text-green-700">
                      ID: {request.tree_details.tree_id}
                    </div>
                    <div className="text-sm text-green-600">
                      📍 {request.tree_details.location_name}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">Message:</div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {request.message}
                    </div>
                  </div>

                  {/* Payment Info */}
                  {request.payment_details && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-blue-900 mb-1">💳 Payment Info</div>
                      <div className="text-sm text-blue-700">
                        Amount: KES {request.payment_details.amount}
                      </div>
                      <div className="text-sm text-blue-700">
                        Status: {request.payment_details.status}
                      </div>
                      {request.payment_details.mpesa_receipt_number && (
                        <div className="text-sm text-blue-700">
                          Receipt: {request.payment_details.mpesa_receipt_number}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ranger Notes (if any) */}
                  {request.ranger_notes && (
                    <div className="mb-4 bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Ranger Notes:</div>
                      <div className="text-sm text-gray-600">{request.ranger_notes}</div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {request.status === 'pending' && request.payment_details?.status === 'completed' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setRangerNotes('');
                        }}
                        disabled={processing}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={processing}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}

                  {request.status === 'payment_pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                      <div className="text-sm text-yellow-800">⏳ Waiting for payment confirmation</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approval Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Approve Adoption Request</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ranger Notes (Optional)
                </label>
                <textarea
                  value={rangerNotes}
                  onChange={(e) => setRangerNotes(e.target.value)}
                  rows={4}
                  placeholder="Add any notes or instructions for the adopter..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  disabled={processing}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Confirm Approval'}
                </button>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setRangerNotes('');
                  }}
                  disabled={processing}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdoptionRequestsPage;

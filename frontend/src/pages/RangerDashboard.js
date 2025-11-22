import React, { useState, useEffect } from 'react';
import { reportService, alertService, incidentService, adoptionService, aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function RangerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    pendingReports: 0,
    activeAlerts: 0,
    pendingAdoptions: 0,
    myIncidents: 0,
    criticalAlerts: 0
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [realtimeAlerts, setRealtimeAlerts] = useState([]);

  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    if (!user || user.user_type !== 'ranger') {
      navigate('/');
      return;
    }
    loadData();
    
    // Set up real-time alert polling
    const alertInterval = setInterval(loadAlerts, 30000); // Poll every 30 seconds
    
    return () => clearInterval(alertInterval);
  }, [user]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadReports(),
        loadAlerts(),
        loadAdoptionRequests(),
        loadIncidents()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const data = await reportService.getReports({ status: 'pending' });
      const reportsList = data.results || data;
      setReports(reportsList);
      setStats(prev => ({ ...prev, pendingReports: reportsList.length }));
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await alertService.getAlerts({ is_resolved: 'false' });
      const alertsList = data.results || data;
      setAlerts(alertsList);
      
      // Check for new critical alerts
      const critical = alertsList.filter(a => a.severity === 'critical');
      setStats(prev => ({ 
        ...prev, 
        activeAlerts: alertsList.length,
        criticalAlerts: critical.length
      }));
      
      // Show browser notification for new critical alerts
      if (critical.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
        critical.forEach(alert => {
          if (!realtimeAlerts.find(a => a.id === alert.id)) {
            new Notification('🚨 Critical Alert', {
              body: alert.message,
              icon: '/logo192.png'
            });
          }
        });
      }
      
      setRealtimeAlerts(alertsList);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const loadAdoptionRequests = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/trees/adoption-requests/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        params: { status: 'pending' }
      });
      const requests = response.data.results || response.data;
      setAdoptionRequests(requests);
      setStats(prev => ({ ...prev, pendingAdoptions: requests.length }));
    } catch (error) {
      console.error('Error loading adoption requests:', error);
    }
  };

  const loadIncidents = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/incidents/my_incidents/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      const incidentsList = response.data.results || response.data;
      setIncidents(incidentsList);
      setStats(prev => ({ ...prev, myIncidents: incidentsList.length }));
    } catch (error) {
      console.error('Error loading incidents:', error);
    }
  };

  const handleVerify = async (reportId) => {
    try {
      await reportService.verifyReport(reportId, 'Verified by ranger');
      alert('Report verified successfully');
      loadReports();
    } catch (error) {
      alert('Failed to verify report');
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await alertService.resolveAlert(alertId);
      alert('Alert resolved successfully');
      loadAlerts();
    } catch (error) {
      alert('Failed to resolve alert');
    }
  };

  const handleApproveAdoption = async (requestId) => {
    try {
      await axios.post(`${baseUrl}/api/trees/adoption-requests/${requestId}/approve/`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      alert('Adoption request approved successfully');
      loadAdoptionRequests();
    } catch (error) {
      alert('Failed to approve adoption request');
    }
  };

  const handleRejectAdoption = async (requestId, reason) => {
    const rejectionReason = reason || prompt('Please provide a reason for rejection:');
    if (!rejectionReason) return;
    
    try {
      await axios.post(`${baseUrl}/api/trees/adoption-requests/${requestId}/reject/`, 
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }}
      );
      alert('Adoption request rejected');
      loadAdoptionRequests();
    } catch (error) {
      alert('Failed to reject adoption request');
    }
  };

  const handleAnalyzeWithAI = async (report) => {
    if (!report.image) {
      alert('No image available for AI analysis');
      return;
    }

    setSelectedReport(report);
    setAnalyzingImage(true);
    setAiAnalysis(null);

    try {
      const response = await axios.post(`${baseUrl}/api/reports/${report.id}/analyze_ai/`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      
      setAiAnalysis(response.data);
    } catch (error) {
      alert('Failed to analyze image with AI');
      console.error(error);
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleAssignIncident = async (incidentId) => {
    try {
      await axios.post(`${baseUrl}/api/incidents/${incidentId}/assign/`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      alert('Incident assigned to you successfully');
      loadIncidents();
    } catch (error) {
      alert('Failed to assign incident');
    }
  };

  const handleResolveIncident = async (incidentId, notes) => {
    const resolutionNotes = notes || prompt('Please provide resolution notes:');
    if (!resolutionNotes) return;

    try {
      await axios.post(`${baseUrl}/api/incidents/${incidentId}/resolve/`, 
        { notes: resolutionNotes },
        { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }}
      );
      alert('Incident resolved successfully');
      loadIncidents();
    } catch (error) {
      alert('Failed to resolve incident');
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading ranger dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🌳 Ranger Command Center</h1>
          <p className="text-gray-600">Welcome back, Ranger {user?.username || 'User'}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Reports</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingReports}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Critical Alerts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.criticalAlerts}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Alerts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeAlerts}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Adoption Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingAdoptions}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">My Incidents</p>
                <p className="text-3xl font-bold text-gray-900">{stats.myIncidents}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'overview', label: '📊 Overview', icon: '📊' },
                { id: 'reports', label: '📝 Reports', badge: stats.pendingReports },
                { id: 'alerts', label: '🚨 Real-time Alerts', badge: stats.criticalAlerts },
                { id: 'adoptions', label: '💚 Adoptions', badge: stats.pendingAdoptions },
                { id: 'incidents', label: '🔍 Incidents', badge: stats.myIncidents },
                { id: 'ai', label: '🤖 AI Analysis' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
                
                {/* Critical Alerts Section */}
                {stats.criticalAlerts > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          <strong>⚠️ {stats.criticalAlerts} Critical Alert{stats.criticalAlerts > 1 ? 's' : ''} Requiring Immediate Attention!</strong>
                        </p>
                        <button 
                          onClick={() => setActiveTab('alerts')}
                          className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                        >
                          View Critical Alerts →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-blue-900">Recent Reports</h3>
                    {reports.slice(0, 3).map(report => (
                      <div key={report.id} className="bg-white rounded-lg p-3 mb-2 shadow-sm">
                        <p className="font-medium text-sm">{report.title}</p>
                        <p className="text-xs text-gray-500">Tree: {report.tree_id}</p>
                      </div>
                    ))}
                    <button 
                      onClick={() => setActiveTab('reports')}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All Reports →
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-purple-900">Pending Adoptions</h3>
                    {adoptionRequests.slice(0, 3).map(req => (
                      <div key={req.id} className="bg-white rounded-lg p-3 mb-2 shadow-sm">
                        <p className="font-medium text-sm">{req.user_name}</p>
                        <p className="text-xs text-gray-500">Tree: {req.tree_id}</p>
                      </div>
                    ))}
                    <button 
                      onClick={() => setActiveTab('adoptions')}
                      className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Review Adoptions →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Pending Reports ({reports.length})</h2>
                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-gray-600">No pending reports</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold">{report.title}</h3>
                              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm">
                                {report.report_type?.replace('_', ' ').toUpperCase()}
                              </span>
                              {report.has_ai_analysis && (
                                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-sm">
                                  🤖 AI Analyzed
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 mb-2">{report.description}</p>
                            <p className="text-gray-600 mb-2">
                              <strong>Tree ID:</strong> {report.tree_id}
                            </p>
                            <p className="text-sm text-gray-500">
                              Reported by: {report.reporter_username} on {new Date(report.created_at).toLocaleString()}
                            </p>
                            {report.image && (
                              <img src={report.image} alt="Report" className="mt-3 w-48 h-48 object-cover rounded-lg" />
                            )}
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => handleVerify(report.id)}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition whitespace-nowrap"
                            >
                              ✓ Verify Report
                            </button>
                            {report.image && (
                              <button
                                onClick={() => handleAnalyzeWithAI(report)}
                                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition whitespace-nowrap"
                              >
                                🤖 AI Analysis
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Real-time Alerts Tab */}
            {activeTab === 'alerts' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Real-time Alerts ({alerts.length})</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Auto-refresh every 30s</span>
                    <button
                      onClick={loadAlerts}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                    >
                      🔄 Refresh Now
                    </button>
                  </div>
                </div>
                {alerts.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2 text-gray-600">No active alerts</p>
                    <p className="text-sm text-gray-500">All systems normal</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
                        alert.severity === 'critical' ? 'border-red-600 bg-red-50' :
                        alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                        alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {alert.severity === 'critical' && <span className="text-2xl">🚨</span>}
                              {alert.severity === 'high' && <span className="text-2xl">⚠️</span>}
                              {alert.severity === 'medium' && <span className="text-2xl">⚡</span>}
                              <h3 className="text-xl font-bold">{alert.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                alert.severity === 'critical' ? 'bg-red-600 text-white' :
                                alert.severity === 'high' ? 'bg-orange-500 text-white' :
                                alert.severity === 'medium' ? 'bg-yellow-500 text-white' :
                                'bg-blue-500 text-white'
                              }`}>
                                {alert.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-900 font-medium mb-2">{alert.message}</p>
                            <p className="text-sm text-gray-600">
                              <strong>Tree:</strong> {alert.tree_info?.tree_id} at {alert.tree_info?.location_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Created: {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition font-semibold whitespace-nowrap ml-4"
                          >
                            ✓ Resolve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Adoptions Tab */}
            {activeTab === 'adoptions' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Pending Adoption Requests ({adoptionRequests.length})</h2>
                {adoptionRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <p className="mt-2 text-gray-600">No pending adoption requests</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {adoptionRequests.map((request) => (
                      <div key={request.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition p-6">
                        <div className="flex items-start gap-4">
                          {request.tree_image && (
                            <img src={request.tree_image} alt="Tree" className="w-20 h-20 rounded-lg object-cover" />
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-bold mb-1">{request.user_name}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Tree:</strong> {request.tree_species} (ID: {request.tree_id})
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Location:</strong> {request.tree_location}
                            </p>
                            <p className="text-sm text-gray-500 mb-3">
                              {request.message || 'No message provided'}
                            </p>
                            <p className="text-xs text-gray-400">
                              Requested: {new Date(request.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleApproveAdoption(request.id)}
                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleRejectAdoption(request.id)}
                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Incidents Tab */}
            {activeTab === 'incidents' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">My Assigned Incidents ({incidents.length})</h2>
                {incidents.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="mt-2 text-gray-600">No incidents assigned to you</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {incidents.map((incident) => (
                      <div key={incident.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold">{incident.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                incident.status === 'resolved' ? 'bg-green-100 text-green-600' :
                                incident.status === 'investigating' ? 'bg-blue-100 text-blue-600' :
                                'bg-yellow-100 text-yellow-600'
                              }`}>
                                {incident.status}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                incident.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                incident.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {incident.priority}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{incident.description}</p>
                            <p className="text-sm text-gray-600">
                              <strong>Type:</strong> {incident.incident_type?.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Location:</strong> {incident.location_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Reported: {new Date(incident.created_at).toLocaleString()}
                            </p>
                          </div>
                          {incident.status !== 'resolved' && (
                            <button
                              onClick={() => handleResolveIncident(incident.id)}
                              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition whitespace-nowrap ml-4"
                            >
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI Analysis Tab */}
            {activeTab === 'ai' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">🤖 AI Plant Disease Detection</h2>
                
                {!selectedReport ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 mb-2">Select a report with an image to analyze</p>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="text-purple-600 hover:text-purple-700 underline"
                    >
                      Go to Reports →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Selected Report</h3>
                      <div className="flex gap-4">
                        {selectedReport.image && (
                          <img src={selectedReport.image} alt="Tree" className="w-48 h-48 object-cover rounded-lg" />
                        )}
                        <div>
                          <p className="font-bold text-lg">{selectedReport.title}</p>
                          <p className="text-gray-600">Tree ID: {selectedReport.tree_id}</p>
                          <p className="text-sm text-gray-500 mt-2">{selectedReport.description}</p>
                        </div>
                      </div>
                    </div>

                    {analyzingImage && (
                      <div className="bg-purple-50 rounded-lg p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-purple-700">Analyzing image with AI...</p>
                        <p className="text-sm text-purple-600 mt-2">This may take a few moments</p>
                      </div>
                    )}

                    {aiAnalysis && (
                      <div className="bg-white border-2 border-purple-200 rounded-lg p-6">
                        <h3 className="text-xl font-bold mb-4 text-purple-900">AI Analysis Results</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Disease Detection:</p>
                            <p className="text-lg font-bold text-gray-900">{aiAnalysis.disease || 'No disease detected'}</p>
                          </div>
                          
                          {aiAnalysis.confidence && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">Confidence Level:</p>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-200 rounded-full h-4">
                                  <div 
                                    className="bg-purple-600 h-4 rounded-full" 
                                    style={{width: `${aiAnalysis.confidence * 100}%`}}
                                  ></div>
                                </div>
                                <span className="font-bold">{(aiAnalysis.confidence * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          )}
                          
                          {aiAnalysis.recommendations && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">Recommendations:</p>
                              <div className="bg-purple-50 rounded-lg p-4">
                                <p className="text-gray-800">{aiAnalysis.recommendations}</p>
                              </div>
                            </div>
                          )}
                          
                          {aiAnalysis.severity && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">Severity:</p>
                              <span className={`px-4 py-2 rounded-full font-bold ${
                                aiAnalysis.severity === 'high' ? 'bg-red-100 text-red-600' :
                                aiAnalysis.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-green-100 text-green-600'
                              }`}>
                                {aiAnalysis.severity.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedReport(null);
                        setAiAnalysis(null);
                      }}
                      className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
                    >
                      Close Analysis
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RangerDashboard;

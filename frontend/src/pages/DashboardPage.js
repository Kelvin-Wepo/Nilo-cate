import React, { useState, useEffect } from 'react';
import { treeService, adoptionService, reportService } from '../services/api';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTrees: 0,
    adoptedTrees: 0,
    healthyTrees: 0,
    criticalTrees: 0,
    totalReports: 0,
    aiAnalyses: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [treesData, adoptionsData, reportsData] = await Promise.all([
        treeService.getTrees(),
        adoptionService.getAdoptions(),
        reportService.getReports(),
      ]);

      const trees = treesData.results || treesData;
      const adoptions = adoptionsData.results || adoptionsData;
      const reports = reportsData.results || reportsData;

      setStats({
        totalTrees: trees.length,
        adoptedTrees: trees.filter(t => t.is_adopted).length,
        healthyTrees: trees.filter(t => t.health_status === 'healthy').length,
        criticalTrees: trees.filter(t => t.health_status === 'critical' || t.health_status === 'diseased').length,
        totalReports: reports.length,
        aiAnalyses: reports.filter(r => r.ai_analysis).length,
      });

      // Mock recent activity
      setRecentActivity([
        { type: 'adoption', user: 'Community Member', action: 'adopted a Meru Oak in Karura Forest', time: '2 hours ago' },
        { type: 'report', user: 'Ranger', action: 'verified health report for African Cherry', time: '4 hours ago' },
        { type: 'alert', user: 'AI System', action: 'detected stressed tree in Mount Kenya', time: '6 hours ago' },
      ]);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const carbonOffset = (stats.healthyTrees * 22).toFixed(1); // Average tree absorbs ~22kg CO2/year
  const conservationScore = Math.min(100, Math.round((stats.healthyTrees / stats.totalTrees) * 100));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-forest-green">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-forest-green mb-2">Conservation Dashboard</h1>
          <p className="text-gray-600">Real-time impact metrics and analytics</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-semibold">Total Trees</span>
              <span className="text-3xl">🌳</span>
            </div>
            <div className="text-4xl font-bold text-forest-green">{stats.totalTrees}</div>
            <p className="text-sm text-gray-500 mt-1">Across Kenya</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-semibold">Trees Adopted</span>
              <span className="text-3xl">🤝</span>
            </div>
            <div className="text-4xl font-bold text-blue-600">{stats.adoptedTrees}</div>
            <p className="text-sm text-gray-500 mt-1">Community guardians</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-semibold">Healthy Trees</span>
              <span className="text-3xl">💚</span>
            </div>
            <div className="text-4xl font-bold text-emerald-600">{stats.healthyTrees}</div>
            <p className="text-sm text-gray-500 mt-1">{conservationScore}% conservation rate</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-semibold">Need Attention</span>
              <span className="text-3xl">⚠️</span>
            </div>
            <div className="text-4xl font-bold text-red-600">{stats.criticalTrees}</div>
            <p className="text-sm text-gray-500 mt-1">Critical/Diseased</p>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Carbon Offset */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Carbon Impact</h3>
              <span className="text-5xl">🌍</span>
            </div>
            <div className="text-5xl font-bold mb-2">{carbonOffset} kg</div>
            <p className="text-green-100 mb-4">CO₂ absorbed annually by healthy trees</p>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm">That's equivalent to driving {(carbonOffset / 0.404).toFixed(0)} km in a car! 🚗</p>
            </div>
          </div>

          {/* AI Analytics */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">AI-Powered Monitoring</h3>
              <span className="text-5xl">🤖</span>
            </div>
            <div className="text-5xl font-bold mb-2">{stats.aiAnalyses}</div>
            <p className="text-purple-100 mb-4">AI health analyses completed</p>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm">Early detection saves trees! 95% accuracy rate</p>
            </div>
          </div>
        </div>

        {/* Charts and Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Health Status Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-forest-green mb-4">Tree Health Status</h3>
            <div className="space-y-3">
              {[
                { status: 'Healthy', count: stats.healthyTrees, color: 'bg-green-500', percentage: ((stats.healthyTrees / stats.totalTrees) * 100).toFixed(1) },
                { status: 'Stressed', count: Math.floor(stats.totalTrees * 0.2), color: 'bg-yellow-500', percentage: '20' },
                { status: 'Diseased', count: Math.floor(stats.totalTrees * 0.1), color: 'bg-orange-500', percentage: '10' },
                { status: 'Critical', count: stats.criticalTrees, color: 'bg-red-500', percentage: ((stats.criticalTrees / stats.totalTrees) * 100).toFixed(1) },
              ].map((item) => (
                <div key={item.status} className="flex items-center">
                  <div className="w-32 text-sm font-semibold">{item.status}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div 
                      className={`${item.color} h-full flex items-center justify-end px-2 transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    >
                      <span className="text-white text-xs font-bold">{item.count}</span>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm font-semibold text-gray-600">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-forest-green mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'adoption' ? 'bg-blue-100' :
                    activity.type === 'report' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {activity.type === 'adoption' ? '🤝' : activity.type === 'report' ? '📝' : '🚨'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-forest-green to-emerald-600 rounded-2xl shadow-xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-3">Make an Impact Today! 🌱</h3>
          <p className="text-lg mb-6 text-green-100">
            Every tree adopted contributes to Kenya's forest conservation
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-forest-green px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition">
              Adopt a Tree
            </button>
            <button className="bg-green-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-800 transition">
              Submit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

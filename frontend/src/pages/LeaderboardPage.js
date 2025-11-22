import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function LeaderboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('adopters');
  
  // Mock leaderboard data - in production, fetch from API
  const topAdopters = [
    { rank: 1, name: 'Sarah Kamau', adoptions: 15, location: 'Nairobi', badge: '🏆' },
    { rank: 2, name: 'John Mwangi', adoptions: 12, location: 'Nakuru', badge: '🥈' },
    { rank: 3, name: 'Grace Wanjiru', adoptions: 10, location: 'Nyeri', badge: '🥉' },
    { rank: 4, name: 'David Ochieng', adoptions: 8, location: 'Kakamega', badge: '⭐' },
    { rank: 5, name: 'Mary Akinyi', adoptions: 7, location: 'Mombasa', badge: '⭐' },
  ];

  const topReporters = [
    { rank: 1, name: 'Ranger James', reports: 45, verified: 43, badge: '🏆' },
    { rank: 2, name: 'Alice Njeri', reports: 38, verified: 35, badge: '🥈' },
    { rank: 3, name: 'Peter Kamau', reports: 32, verified: 30, badge: '🥉' },
    { rank: 4, name: 'Ruth Maina', reports: 28, verified: 26, badge: '⭐' },
    { rank: 5, name: 'Daniel Kiprop', reports: 25, verified: 24, badge: '⭐' },
  ];

  const topCounties = [
    { rank: 1, county: 'Nairobi', trees: 45, adoptions: 38, badge: '🏆' },
    { rank: 2, county: 'Nakuru', trees: 38, adoptions: 32, badge: '🥈' },
    { rank: 3, county: 'Nyeri', trees: 35, adoptions: 28, badge: '🥉' },
    { rank: 4, county: 'Kakamega', trees: 28, adoptions: 22, badge: '⭐' },
    { rank: 5, county: 'Mombasa', trees: 25, adoptions: 20, badge: '⭐' },
  ];

  const achievements = [
    { name: 'Tree Guardian', icon: '🛡️', description: 'Adopt 5 trees', unlocked: true },
    { name: 'Forest Protector', icon: '🌲', description: 'Adopt 10 trees', unlocked: true },
    { name: 'Conservation Hero', icon: '🦸', description: 'Adopt 20 trees', unlocked: false },
    { name: 'AI Expert', icon: '🤖', description: 'Submit 10 AI reports', unlocked: true },
    { name: 'Eagle Eye', icon: '🦅', description: 'Find 5 critical trees', unlocked: false },
    { name: 'Team Player', icon: '🤝', description: 'Collaborate with rangers', unlocked: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-forest-green mb-3">🏆 Leaderboard</h1>
          <p className="text-xl text-gray-700">Top Conservation Champions Across Kenya</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full shadow-lg p-2 inline-flex">
            {[
              { id: 'adopters', label: '🤝 Top Adopters' },
              { id: 'reporters', label: '📝 Top Reporters' },
              { id: 'counties', label: '🗺️ Counties' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-forest-green text-white'
                    : 'text-gray-600 hover:text-forest-green'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Leaderboard */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Top 3 Podium */}
              {activeTab === 'adopters' && (
                <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 p-8">
                  <div className="flex items-end justify-center space-x-4">
                    {/* 2nd Place */}
                    <div className="text-center bg-white/90 backdrop-blur rounded-xl p-4 w-32 mb-4">
                      <div className="text-4xl mb-2">🥈</div>
                      <div className="font-bold text-gray-800">{topAdopters[1].name}</div>
                      <div className="text-2xl font-bold text-yellow-600">{topAdopters[1].adoptions}</div>
                      <div className="text-xs text-gray-600">adoptions</div>
                    </div>

                    {/* 1st Place */}
                    <div className="text-center bg-white/90 backdrop-blur rounded-xl p-6 w-36 shadow-2xl">
                      <div className="text-6xl mb-2">🏆</div>
                      <div className="font-bold text-gray-800 text-lg">{topAdopters[0].name}</div>
                      <div className="text-3xl font-bold text-yellow-600">{topAdopters[0].adoptions}</div>
                      <div className="text-xs text-gray-600">adoptions</div>
                      <div className="mt-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-bold">CHAMPION</div>
                    </div>

                    {/* 3rd Place */}
                    <div className="text-center bg-white/90 backdrop-blur rounded-xl p-4 w-32">
                      <div className="text-4xl mb-2">🥉</div>
                      <div className="font-bold text-gray-800">{topAdopters[2].name}</div>
                      <div className="text-2xl font-bold text-amber-600">{topAdopters[2].adoptions}</div>
                      <div className="text-xs text-gray-600">adoptions</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full List */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-forest-green mb-4">
                  {activeTab === 'adopters' && 'All Top Adopters'}
                  {activeTab === 'reporters' && 'All Top Reporters'}
                  {activeTab === 'counties' && 'All Counties'}
                </h3>

                <div className="space-y-2">
                  {activeTab === 'adopters' && topAdopters.map((person) => (
                    <div key={person.rank} className="flex items-center justify-between p-4 hover:bg-green-50 rounded-lg transition">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                          person.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                          person.rank === 2 ? 'bg-gray-100 text-gray-600' :
                          person.rank === 3 ? 'bg-orange-100 text-orange-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          #{person.rank}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{person.name}</div>
                          <div className="text-sm text-gray-600">📍 {person.location}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-forest-green">{person.adoptions}</div>
                        <div className="text-xs text-gray-600">adoptions</div>
                      </div>
                    </div>
                  ))}

                  {activeTab === 'reporters' && topReporters.map((person) => (
                    <div key={person.rank} className="flex items-center justify-between p-4 hover:bg-green-50 rounded-lg transition">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                          person.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                          person.rank === 2 ? 'bg-gray-100 text-gray-600' :
                          person.rank === 3 ? 'bg-orange-100 text-orange-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          #{person.rank}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{person.name}</div>
                          <div className="text-sm text-gray-600">{person.verified} verified reports</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{person.reports}</div>
                        <div className="text-xs text-gray-600">total reports</div>
                      </div>
                    </div>
                  ))}

                  {activeTab === 'counties' && topCounties.map((county) => (
                    <div key={county.rank} className="flex items-center justify-between p-4 hover:bg-green-50 rounded-lg transition">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                          county.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                          county.rank === 2 ? 'bg-gray-100 text-gray-600' :
                          county.rank === 3 ? 'bg-orange-100 text-orange-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          #{county.rank}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{county.county} County</div>
                          <div className="text-sm text-gray-600">{county.adoptions} adoptions</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{county.trees}</div>
                        <div className="text-xs text-gray-600">trees</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            {user && (
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Rank</span>
                    <span className="text-2xl font-bold">#24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Adoptions</span>
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Reports</span>
                    <span className="text-2xl font-bold">7</span>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 mt-4">
                    <div className="text-sm mb-2">Progress to Top 10</div>
                    <div className="bg-white/30 rounded-full h-3 overflow-hidden">
                      <div className="bg-white h-full w-1/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-forest-green mb-4">🏅 Achievements</h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      achievement.unlocked
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">{achievement.name}</div>
                      <div className="text-xs text-gray-600">{achievement.description}</div>
                    </div>
                    {achievement.unlocked && (
                      <div className="text-green-600 text-xl">✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardPage;

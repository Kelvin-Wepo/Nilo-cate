import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import TreeDetailPage from './pages/TreeDetailPage';
import MyAdoptionsPage from './pages/MyAdoptionsPage';
import ReportPage from './pages/ReportPage';
import SpeciesPage from './pages/SpeciesPage';
import RangerDashboard from './pages/RangerDashboard';
import DashboardPage from './pages/DashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import IncidentReportPage from './pages/IncidentReportPage';
import RangerPatrolPage from './pages/RangerPatrolPage';
import RangerProfilePage from './pages/RangerProfilePage';
import AdoptionRequestsPage from './pages/AdoptionRequestsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BrowseCampaignsPage from './pages/BrowseCampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import { AuthProvider, useAuth } from './context/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = location.pathname === '/';

  return (
    <nav 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomePage
          ? 'nav-glass shadow-2xl'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="text-4xl transform group-hover:rotate-12 transition-transform duration-300">
              🌿
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Nilocate
              </h1>
              <p className="text-xs text-green-200 hidden lg:block">Preserving Nature</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {user && user.user_type === 'ranger' ? (
              /* Ranger Navigation */
              <>
                <Link 
                  to="/ranger" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium flex items-center space-x-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">🛡️</span>
                  <span>Command Center</span>
                </Link>
                <Link 
                  to="/species" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium flex items-center space-x-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">🔬</span>
                  <span>Species Intel</span>
                </Link>
                <Link 
                  to="/ranger-patrol" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium flex items-center space-x-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">🚁</span>
                  <span>Active Patrol</span>
                </Link>
                <Link 
                  to="/campaigns" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium flex items-center space-x-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">🌲</span>
                  <span>Campaigns</span>
                </Link>
                <Link 
                  to="/ranger-profile" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium flex items-center space-x-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">👤</span>
                  <span>Profile</span>
                </Link>
                <button 
                  onClick={logout} 
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
                >
                  🚪 Logout
                </button>
              </>
            ) : user ? (
              /* Citizen Navigation */
              <>
                <Link 
                  to="/map" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium flex items-center space-x-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">🗺️</span>
                  <span>Tree Map</span>
                </Link>
                <Link 
                  to="/species" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium flex items-center space-x-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">🌳</span>
                  <span>Species</span>
                </Link>
                <Link 
                  to="/dashboard" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium flex items-center space-x-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">📊</span>
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/leaderboard" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium flex items-center space-x-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">🏆</span>
                  <span>Leaderboard</span>
                </Link>
                <Link 
                  to="/my-adoptions" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium flex items-center space-x-2"
                >
                  <span>🌲</span>
                  <span>My Trees</span>
                </Link>
                <Link 
                  to="/incident-report" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium flex items-center space-x-2"
                >
                  <span>🚨</span>
                  <span>Report</span>
                </Link>
                <Link 
                  to="/campaigns" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium flex items-center space-x-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">🌲</span>
                  <span>Campaigns</span>
                </Link>
                <button 
                  onClick={logout} 
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              /* Guest Navigation */
              <>
                <Link 
                  to="/map" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium flex items-center space-x-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">🗺️</span>
                  <span>Explore</span>
                </Link>
                <Link 
                  to="/species" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium flex items-center space-x-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">🌳</span>
                  <span>Species</span>
                </Link>
                <Link 
                  to="/campaigns" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium flex items-center space-x-2 group"
                >
                  <span className="group-hover:scale-110 transition-transform">🌲</span>
                  <span>Campaigns</span>
                </Link>
                <Link 
                  to="/login" 
                  className="text-white hover:text-green-300 transition-all duration-300 font-medium px-6 py-2"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 font-medium shadow-lg pulse-glow"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white text-3xl focus:outline-none"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden glass-dark rounded-lg p-6 mb-4 space-y-4">
            {user && user.user_type === 'ranger' ? (
              /* Ranger Mobile Menu */
              <>
                <Link to="/ranger" className="block text-white hover:text-green-300 transition py-2">
                  🛡️ Command Center
                </Link>
                <Link to="/species" className="block text-white hover:text-green-300 transition py-2">
                  🔬 Species Intel
                </Link>
                <Link to="/ranger-patrol" className="block text-white hover:text-green-300 transition py-2">
                  🚁 Active Patrol
                </Link>
                <Link to="/ranger-profile" className="block text-white hover:text-green-300 transition py-2">
                  👤 Profile
                </Link>
                <Link to="/campaigns" className="block text-white hover:text-green-300 transition py-2">
                  🌲 Campaigns
                </Link>
                <Link to="/adoption-requests" className="block text-white hover:text-green-300 transition py-2">
                  📋 Adoption Requests
                </Link>
                <button onClick={logout} className="block w-full text-left text-white hover:text-red-300 transition py-2">
                  🚪 Logout
                </button>
              </>
            ) : user ? (
              /* Citizen Mobile Menu */
              <>
                <Link to="/map" className="block text-white hover:text-green-300 transition py-2">
                  🗺️ Tree Map
                </Link>
                <Link to="/species" className="block text-white hover:text-green-300 transition py-2">
                  🌳 Species
                </Link>
                <Link to="/dashboard" className="block text-white hover:text-green-300 transition py-2">
                  📊 Dashboard
                </Link>
                <Link to="/leaderboard" className="block text-white hover:text-green-300 transition py-2">
                  🏆 Leaderboard
                </Link>
                <Link to="/my-adoptions" className="block text-white hover:text-green-300 transition py-2">
                  🌲 My Trees
                </Link>
                <Link to="/incident-report" className="block text-white hover:text-green-300 transition py-2">
                  🚨 Report Incident
                </Link>
                <Link to="/campaigns" className="block text-white hover:text-green-300 transition py-2">
                  🌲 Campaigns
                </Link>
                <button onClick={logout} className="block w-full text-left text-white hover:text-red-300 transition py-2">
                  🚪 Logout
                </button>
              </>
            ) : (
              /* Guest Mobile Menu */
              <>
                <Link to="/map" className="block text-white hover:text-green-300 transition py-2">
                  🗺️ Explore Trees
                </Link>
                <Link to="/species" className="block text-white hover:text-green-300 transition py-2">
                  🌳 Species
                </Link>
                <Link to="/campaigns" className="block text-white hover:text-green-300 transition py-2">
                  🌲 Campaigns
                </Link>
                <Link to="/login" className="block text-white hover:text-green-300 transition py-2">
                  🔐 Login
                </Link>
                <Link to="/register" className="block text-white hover:text-green-300 transition py-2">
                  ✨ Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navigation />
          <div className="pt-0">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/tree/:id" element={<TreeDetailPage />} />
              <Route path="/my-adoptions" element={<MyAdoptionsPage />} />
              <Route path="/report/:treeId" element={<ReportPage />} />
              <Route path="/species" element={<SpeciesPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/incident-report" element={<IncidentReportPage />} />
              <Route path="/ranger-patrol" element={<RangerPatrolPage />} />
              <Route path="/ranger" element={<RangerDashboard />} />
              <Route path="/ranger-profile" element={<RangerProfilePage />} />
              <Route path="/adoption-requests" element={<AdoptionRequestsPage />} />
              <Route path="/campaigns" element={<BrowseCampaignsPage />} />
              <Route path="/campaigns/create" element={<CreateCampaignPage />} />
              <Route path="/campaigns/:slug" element={<CampaignDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

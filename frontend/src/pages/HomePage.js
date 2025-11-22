import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ForestBackground from '../components/ForestBackground';

function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ species: 0, counties: 0, adopters: 0 });

  useEffect(() => {
    // Animate stats counting up
    const targetStats = { species: 32, counties: 10, adopters: 150 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setStats({
        species: Math.floor(targetStats.species * progress),
        counties: Math.floor(targetStats.counties * progress),
        adopters: Math.floor(targetStats.adopters * progress),
      });

      if (currentStep >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Animated Forest Background */}
      <ForestBackground>
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="relative z-10 text-center px-4 py-32">
            <div className="mb-12 animate-fade-in">
              <div className="inline-block mb-6">
                <div className="text-8xl md:text-9xl float mb-4">🌿</div>
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-6 drop-shadow-2xl tracking-tight">
                Nilocate
              </h1>
              <div className="w-40 h-1.5 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto mb-8 rounded-full"></div>
              <p className="text-3xl md:text-4xl lg:text-5xl text-green-100 mb-6 font-light tracking-wide">
                Preserving Kenya's Natural Heritage
              </p>
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                AI-Powered Platform to Locate, Adopt, and Protect Endangered Trees Across Kenya's Forests
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16 animate-fade-in">
              <Link
                to="/map"
                className="btn-primary text-white px-12 py-5 rounded-full text-xl font-bold transition transform hover:scale-110 shadow-2xl ripple flex items-center justify-center space-x-3"
              >
                <span className="text-2xl">🗺️</span>
                <span>Explore Tree Map</span>
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="glass text-white border-2 border-white px-12 py-5 rounded-full text-xl font-bold transition transform hover:scale-110 shadow-2xl ripple"
                >
                  ✨ Get Started Free
                </Link>
              )}
            </div>

            {/* Animated Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto mt-20">
              <div className="glass-dark rounded-2xl p-8 hover:scale-105 transition-transform duration-300 card-hover">
                <div className="text-6xl font-bold gradient-text mb-3">{stats.species}+</div>
                <div className="text-white text-lg font-medium">Endangered Species</div>
                <div className="text-green-300 text-sm mt-2">🌳 Protected & Monitored</div>
              </div>
              <div className="glass-dark rounded-2xl p-8 hover:scale-105 transition-transform duration-300 card-hover">
                <div className="text-6xl font-bold gradient-text mb-3">{stats.counties}+</div>
                <div className="text-white text-lg font-medium">Counties Covered</div>
                <div className="text-green-300 text-sm mt-2">🗺️ Across Kenya</div>
              </div>
              <div className="glass-dark rounded-2xl p-8 hover:scale-105 transition-transform duration-300 card-hover">
                <div className="text-6xl font-bold gradient-text mb-3">{stats.adopters}+</div>
                <div className="text-white text-lg font-medium">Tree Guardians</div>
                <div className="text-green-300 text-sm mt-2">🤝 Active Adopters</div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="flex flex-col items-center glass-dark px-4 py-3 rounded-full">
              <span className="text-white text-sm mb-2">Discover More</span>
              <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </ForestBackground>

      {/* Features Section */}
      <section className="relative py-24 bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Powerful Conservation Tools</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge technology meets environmental stewardship
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {[
              {
                icon: '🗺️',
                title: 'Interactive Map',
                desc: 'Explore endangered trees across Kenya\'s forests with real-time locations, species information, and health status indicators powered by Google Maps.',
                features: ['Real-time GPS tracking', 'Species identification', 'Health metrics', 'Satellite imagery']
              },
              {
                icon: '🌳',
                title: 'Adopt & Monitor',
                desc: 'Become a guardian of endangered trees. Track their health, receive updates, earn conservation badges and certificates.',
                features: ['Personal tree adoption', 'Regular health updates', 'Achievement badges', 'Impact certificates']
              },
              {
                icon: '🤖',
                title: 'AI Health Analysis',
                desc: 'Upload tree photos for instant Google Gemini AI-powered analysis to detect diseases, stress, fire damage and environmental threats.',
                features: ['Disease detection', 'Stress analysis', 'Drought monitoring', 'Fire alerts']
              }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 card-hover h-full border-2 border-transparent hover:border-green-400">
                  <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
                    {feature.icon}
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.desc}
                  </p>
                  <ul className="space-y-2">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center text-gray-700">
                        <span className="text-green-500 mr-3 text-xl">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="relative py-24 bg-gradient-to-br from-red-50 via-white to-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="gradient-text">Why Nilocate Exists</span>
              </h2>
              <p className="text-xl text-gray-600">Addressing the critical challenges facing Kenya's forests</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Problem */}
              <div className="relative">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-10 shadow-2xl border-4 border-red-200 transform hover:scale-105 transition-transform duration-500">
                  <div className="flex items-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg transform -rotate-6">
                      <span className="text-4xl">⚠️</span>
                    </div>
                    <h3 className="text-4xl font-bold text-red-700">The Problem</h3>
                  </div>
                  <div className="space-y-5">
                    {[
                      'Limited visibility of endangered tree locations across vast forest areas',
                      'Weak community participation in conservation efforts',
                      'Slow detection of tree health threats and diseases',
                      'Increasing species extinction due to illegal logging',
                      'Lack of real-time monitoring and satellite data integration'
                    ].map((problem, i) => (
                      <div key={i} className="flex items-start group">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-200 rounded-full flex items-center justify-center mr-4 group-hover:scale-125 transition-transform">
                          <span className="text-red-600 font-bold">✗</span>
                        </div>
                        <p className="text-gray-800 text-lg leading-relaxed">{problem}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Solution */}
              <div className="relative">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-10 shadow-2xl border-4 border-green-300 transform hover:scale-105 transition-transform duration-500">
                  <div className="flex items-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg transform rotate-6">
                      <span className="text-4xl">✨</span>
                    </div>
                    <h3 className="text-4xl font-bold text-green-700">Our Solution</h3>
                  </div>
                  <div className="space-y-5">
                    {[
                      'Interactive map with GPS-tagged endangered tree locations',
                      'Gamified adoption system with badges and certificates',
                      'AI-powered health analysis using Google Gemini',
                      'NASA FIRMS satellite fire alerts within 10km radius',
                      'SMS/USSD reporting for feature phone users in rural areas'
                    ].map((solution, i) => (
                      <div key={i} className="flex items-start group">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mr-4 group-hover:scale-125 transition-transform">
                          <span className="text-green-600 font-bold">✓</span>
                        </div>
                        <p className="text-gray-800 text-lg leading-relaxed">{solution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section 
        className="relative py-28 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `linear-gradient(rgba(26, 77, 46, 0.92), rgba(13, 38, 23, 0.95)), url('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070')`,
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Simple. Powerful. Impactful.
            </h2>
            <p className="text-2xl text-green-200 max-w-3xl mx-auto">
              Four easy steps to start protecting endangered trees
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              { 
                num: '01', 
                icon: '🗺️', 
                title: 'Explore Map', 
                desc: 'Browse endangered trees across Kenya with GPS locations, species data, and health indicators',
                color: 'from-blue-500 to-cyan-500'
              },
              { 
                num: '02', 
                icon: '🤝', 
                title: 'Adopt Tree', 
                desc: 'Select your tree and become its official guardian with a KES 500 adoption fee',
                color: 'from-green-500 to-emerald-500'
              },
              { 
                num: '03', 
                icon: '📸', 
                title: 'Monitor Health', 
                desc: 'Upload photos for AI analysis, receive fire alerts, and track vegetation health via NDVI',
                color: 'from-purple-500 to-pink-500'
              },
              { 
                num: '04', 
                icon: '🏆', 
                title: 'Earn Rewards', 
                desc: 'Get badges, certificates, and recognition on the leaderboard for your conservation efforts',
                color: 'from-orange-500 to-red-500'
              }
            ].map((step, index) => (
              <div key={step.num} className="group">
                <div className="relative glass-dark rounded-3xl p-8 hover:scale-105 transition-all duration-500 card-hover h-full border border-white/10 overflow-hidden">
                  {/* Step Number */}
                  <div className={`absolute -top-6 -right-6 text-9xl font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-10`}>
                    {step.num}
                  </div>
                  
                  <div className="relative z-10">
                    <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-2xl transform group-hover:rotate-12 transition-transform duration-300`}>
                      {step.icon}
                    </div>
                    <h4 className="font-bold text-white text-2xl mb-4 text-center">{step.title}</h4>
                    <p className="text-green-100 text-center leading-relaxed">{step.desc}</p>
                  </div>

                  {/* Connector Arrow (desktop only) */}
                  {index < 3 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-20">
                      <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              <span className="gradient-text">Powered by Cutting-Edge Tech</span>
            </h2>
            <p className="text-xl text-gray-600">Next-generation conservation platform</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { icon: '🤖', name: 'Google Gemini AI', desc: 'Tree health analysis' },
              { icon: '🛰️', name: 'NASA FIRMS', desc: 'Fire alerts & monitoring' },
              { icon: '🗺️', name: 'Google Maps', desc: 'Interactive mapping' },
              { icon: '📱', name: 'PWA Support', desc: 'Offline functionality' },
              { icon: '💳', name: 'M-Pesa API', desc: 'Secure payments' },
              { icon: '📡', name: 'SMS/USSD', desc: 'Feature phone access' },
              { icon: '☁️', name: 'Weather API', desc: 'Climate tracking' },
              { icon: '🌿', name: 'NDVI Tracking', desc: 'Vegetation health' }
            ].map((tech, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="text-5xl mb-3 transform group-hover:scale-125 transition-transform duration-300">
                    {tech.icon}
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">{tech.name}</h4>
                  <p className="text-sm text-gray-600">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="relative py-32 bg-cover bg-center bg-fixed overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.75)), url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071')`,
        }}
      >
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${10 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              {['🌿', '🍃', '🌳', '🌲', '🌱'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <div className="glass-dark px-6 py-3 rounded-full text-green-300 font-semibold">
                🌍 Join 150+ Tree Guardians
              </div>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Ready to Make <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                A Real Difference?
              </span>
            </h2>
            
            <p className="text-2xl text-green-100 mb-12 leading-relaxed">
              Join our community of tree guardians and help protect Kenya's endangered forest species for future generations. Every tree adopted is a step towards a greener tomorrow.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
              <Link
                to="/map"
                className="group btn-primary text-white px-14 py-6 rounded-full text-xl font-bold transition transform hover:scale-110 shadow-2xl ripple flex items-center justify-center space-x-3"
              >
                <span className="text-2xl group-hover:animate-bounce">🌲</span>
                <span>Start Exploring Trees</span>
              </Link>
              <Link
                to="/species"
                className="glass text-white border-2 border-white px-14 py-6 rounded-full text-xl font-bold transition transform hover:scale-110 shadow-2xl ripple flex items-center justify-center space-x-3"
              >
                <span className="text-2xl">📚</span>
                <span>Learn About Species</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-16">
              {[
                { icon: '🔒', text: 'Secure Payments' },
                { icon: '✓', text: 'Verified Trees' },
                { icon: '🏆', text: 'Earn Rewards' },
                { icon: '📊', text: 'Track Impact' }
              ].map((item, i) => (
                <div key={i} className="glass-dark rounded-xl px-4 py-3 flex items-center justify-center space-x-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-white font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <span className="text-3xl mr-2">🌿</span> Nilocate
              </h3>
              <p className="text-gray-400">
                Preserving Kenya's natural heritage through technology and community action.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/map" className="hover:text-green-400 transition">Tree Map</Link></li>
                <li><Link to="/species" className="hover:text-green-400 transition">Species</Link></li>
                <li><Link to="/dashboard" className="hover:text-green-400 transition">Dashboard</Link></li>
                <li><Link to="/leaderboard" className="hover:text-green-400 transition">Leaderboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition">API Documentation</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Conservation Guide</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Species Database</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Report Issue</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 info@nilocate.co.ke</li>
                <li>📱 +254 700 000 000</li>
                <li>📍 Nairobi, Kenya</li>
                <li>🕐 24/7 SMS Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Nilocate. All rights reserved. Built with 💚 for Kenya's forests.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;

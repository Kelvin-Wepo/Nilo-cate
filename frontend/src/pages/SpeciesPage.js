import React, { useState, useEffect } from 'react';
import { speciesService } from '../services/api';

function SpeciesPage() {
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real tree images from Unsplash
  const speciesImages = {
    'Vitex keniensis': 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2070',
    'Podocarpus latifolius': 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074',
    'Prunus africana': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2084',
    'Juniperus procera': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071',
    'Brachylaena huillensis': 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2089',
  };

  useEffect(() => {
    loadSpecies();
  }, []);

  const loadSpecies = async () => {
    try {
      const data = await speciesService.getSpecies();
      setSpecies(data.results || data);
    } catch (error) {
      console.error('Error loading species:', error);
    } finally {
      setLoading(false);
    }
  };

  const riskColors = {
    critically_endangered: 'bg-red-600',
    endangered: 'bg-orange-500',
    vulnerable: 'bg-yellow-500',
  };

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-forest-green mb-4">🌳 Endangered Tree Species</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Discover the magnificent endangered trees we're protecting across Kenya's forests
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {species.map((sp) => {
            // Get species image URL with proper path construction
            const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api').replace('/api', '');
            const imageUrl = sp.image 
              ? (sp.image.startsWith('http') ? sp.image : `${baseUrl}/media/${sp.image}`)
              : speciesImages[sp.scientific_name] || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074';
            
            return (
              <div key={sp.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={sp.name} 
                    className="w-full h-full object-cover hover:scale-110 transition duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074';
                    }}
                  />
                  {/* Real Photo Badge */}
                  <div className="absolute top-4 left-4 bg-green-500 bg-opacity-90 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    📸 Real Photo
                  </div>
                  {/* Risk Level Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`${riskColors[sp.risk_level]} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg`}>
                      {sp.risk_level.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  {/* Gradient overlay for species name */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <div className="text-white font-bold text-lg">{sp.name}</div>
                    <div className="text-white text-sm italic opacity-90">{sp.scientific_name}</div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-forest-green mb-2">{sp.name}</h2>
                    <p className="text-sm italic text-gray-500">{sp.scientific_name}</p>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">{sp.description}</p>

                  <div className="space-y-3 border-t pt-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <span className="font-bold text-sm text-forest-green block mb-1">📍 Native Region</span>
                      <p className="text-sm text-gray-700">{sp.native_region}</p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <span className="font-bold text-sm text-blue-900 block mb-1">🔍 Characteristics</span>
                      <p className="text-sm text-gray-700">{sp.characteristics}</p>
                    </div>
                    
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <span className="font-bold text-sm text-amber-900 block mb-1">⚠️ Main Threats</span>
                      <p className="text-sm text-gray-700">{sp.threats}</p>
                    </div>

                    <div className="bg-purple-50 p-3 rounded-lg">
                      <span className="font-bold text-sm text-purple-900 block mb-1">💚 Conservation Importance</span>
                      <p className="text-sm text-gray-700">{sp.conservation_importance}</p>
                    </div>
                    
                    {sp.tree_count !== undefined && (
                      <div className="flex items-center justify-between bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-lg">
                        <span className="font-bold text-sm text-forest-green">🌲 Trees in Database</span>
                        <span className="bg-forest-green text-white px-3 py-1 rounded-full text-sm font-bold">
                          {sp.tree_count}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SpeciesPage;

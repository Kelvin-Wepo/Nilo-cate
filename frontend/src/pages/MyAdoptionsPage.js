import React, { useState, useEffect } from 'react';
import { adoptionService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function MyAdoptionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadAdoptions();
  }, [user]);

  const loadAdoptions = async () => {
    try {
      const data = await adoptionService.getMyAdoptions();
      setAdoptions(data);
    } catch (error) {
      console.error('Error loading adoptions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-forest-green mb-8">My Adopted Trees</h1>

      {adoptions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🌳</div>
          <h2 className="text-2xl font-bold text-gray-600 mb-4">No Trees Adopted Yet</h2>
          <p className="text-gray-500 mb-6">Start your conservation journey by adopting your first tree!</p>
          <button
            onClick={() => navigate('/map')}
            className="bg-leaf-green text-white px-8 py-3 rounded-lg hover:bg-forest-green transition"
          >
            Browse Trees
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adoptions.map((adoption) => {
            // Get tree or species image URL
            const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api').replace('/api', '');
            const imageUrl = adoption.tree.image 
              ? (adoption.tree.image.startsWith('http') ? adoption.tree.image : `${baseUrl}/media/${adoption.tree.image}`)
              : adoption.tree.species_image
              ? (adoption.tree.species_image.startsWith('http') ? adoption.tree.species_image : `${baseUrl}/media/${adoption.tree.species_image}`)
              : 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80';
            
            return (
              <div key={adoption.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={`${adoption.tree.species_name} - ${adoption.tree.tree_id}`}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80';
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-green-500 bg-opacity-90 text-white px-2 py-1 rounded-full text-xs font-bold">
                    📸 Real Photo
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-xl font-bold text-forest-green mb-2">
                    {adoption.tree.species_name}
                  </h3>
                <p className="text-sm text-gray-600 mb-3">
                  ID: {adoption.tree.tree_id}<br />
                  Location: {adoption.tree.location_name}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm px-2 py-1 rounded ${
                    adoption.tree.health_status === 'healthy' ? 'bg-green-100 text-green-600' :
                    adoption.tree.health_status === 'stressed' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {adoption.tree.health_status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Adopted: {new Date(adoption.adoption_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-gray-50 rounded p-2 mb-3">
                  <p className="text-xs text-gray-600">Certificate: <span className="font-mono font-bold">{adoption.certificate_number}</span></p>
                </div>

                  <button
                    onClick={() => navigate(`/tree/${adoption.tree.id}`)}
                    className="w-full bg-leaf-green text-white py-2 rounded hover:bg-forest-green transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyAdoptionsPage;

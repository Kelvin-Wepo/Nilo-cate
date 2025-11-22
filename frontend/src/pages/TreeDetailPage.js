import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { treeService } from '../services/api';
import { useAuth } from '../context/AuthContext';

function TreeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adopting, setAdopting] = useState(false);

  useEffect(() => {
    loadTree();
  }, [id]);

  const loadTree = async () => {
    try {
      const data = await treeService.getTree(id);
      setTree(data);
    } catch (error) {
      console.error('Error loading tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdopt = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Prompt for phone number
    const phoneNumber = prompt('Enter your M-Pesa phone number (e.g., 0712345678):');
    if (!phoneNumber) {
      return;
    }

    // Prompt for amount
    const amount = prompt('Enter adoption amount (default 500 KES):', '500');
    if (!amount) {
      return;
    }

    setAdopting(true);
    try {
      const response = await treeService.adoptTree(id, {
        phone_number: phoneNumber,
        amount: parseInt(amount),
        message: 'Adopted via web interface'
      });

      if (response.success) {
        alert('M-Pesa payment request sent! Please check your phone and enter your PIN.\n\nYou will receive an SMS confirmation after payment is completed.');
        
        // Optionally poll for payment status
        setTimeout(() => {
          loadTree();
        }, 10000); // Reload after 10 seconds to see if payment completed
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to initiate adoption payment');
    } finally {
      setAdopting(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (!tree) return <div className="container mx-auto px-4 py-8">Tree not found</div>;

  const healthColors = {
    healthy: 'text-green-600 bg-green-100',
    stressed: 'text-yellow-600 bg-yellow-100',
    diseased: 'text-orange-600 bg-orange-100',
    critical: 'text-red-600 bg-red-100',
  };

  // Determine which image to display: tree image > species image > placeholder
  const getTreeImageUrl = () => {
    const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api').replace('/api', '');
    
    if (tree.image) {
      return tree.image.startsWith('http') ? tree.image : `${baseUrl}/media/${tree.image}`;
    } else if (tree.species.image) {
      return tree.species.image.startsWith('http') ? tree.species.image : `${baseUrl}/media/${tree.species.image}`;
    }
    return `https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Tree Image */}
        <div className="relative">
          <img 
            src={getTreeImageUrl()} 
            alt={`${tree.species.name} - ${tree.tree_id}`}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80';
            }}
          />
          {/* Real Photo Badge */}
          <div className="absolute top-4 left-4 bg-green-500 bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            📸 Real Photo
          </div>
          {/* Species Label */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 rounded-b-lg">
            <div className="text-white font-bold text-lg">{tree.species.name}</div>
            <div className="text-white text-sm italic opacity-90">{tree.species.scientific_name}</div>
          </div>
        </div>

        {/* Tree Details */}
        <div>
          <h1 className="text-3xl font-bold text-forest-green mb-4">{tree.species.name}</h1>
          <p className="text-gray-600 italic mb-4">{tree.species.scientific_name}</p>

          <div className="space-y-3 mb-6">
            <div>
              <span className="font-bold">Tree ID:</span> {tree.tree_id}
            </div>
            <div>
              <span className="font-bold">Location:</span> {tree.location_name}
            </div>
            <div>
              <span className="font-bold">Health Status:</span>{' '}
              <span className={`px-3 py-1 rounded ${healthColors[tree.health_status]}`}>
                {tree.health_status}
              </span>
            </div>
            <div>
              <span className="font-bold">Risk Level:</span>{' '}
              <span className="px-3 py-1 rounded bg-red-100 text-red-600">
                {tree.species.risk_level.replace('_', ' ')}
              </span>
            </div>
            {tree.estimated_age && (
              <div>
                <span className="font-bold">Estimated Age:</span> {tree.estimated_age} years
              </div>
            )}
            {tree.height && (
              <div>
                <span className="font-bold">Height:</span> {tree.height}m
              </div>
            )}
            <div>
              <span className="font-bold">Times Adopted:</span> {tree.adoption_count}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAdopt}
              disabled={adopting}
              className="w-full bg-leaf-green text-white py-3 rounded-lg hover:bg-forest-green transition disabled:bg-gray-400"
            >
              {adopting ? 'Adopting...' : '🤝 Adopt This Tree'}
            </button>
            
            {user && (
              <button
                onClick={() => navigate(`/report/${tree.id}`)}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
              >
                📷 Submit Report
              </button>
            )}
          </div>

          {tree.notes && (
            <div className="mt-6 bg-gray-50 p-4 rounded">
              <h3 className="font-bold mb-2">Notes</h3>
              <p className="text-gray-700">{tree.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Species Information */}
      <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-forest-green mb-6">About This Species</h2>
        
        {/* Species Image if different from main image */}
        {tree.species.image && (
          <div className="mb-8">
            <img 
              src={tree.species.image.startsWith('http') 
                ? tree.species.image 
                : `${(process.env.REACT_APP_API_URL || 'http://localhost:8000/api').replace('/api', '')}/media/${tree.species.image}`
              }
              alt={tree.species.name}
              className="w-full h-64 object-cover rounded-lg shadow-md"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <p className="text-center text-sm text-gray-500 mt-2 italic">
              Reference photo of {tree.species.name} ({tree.species.scientific_name})
            </p>
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-2">Description</h3>
            <p className="text-gray-700">{tree.species.description}</p>
            
            <h3 className="font-bold text-lg mt-4 mb-2">Characteristics</h3>
            <p className="text-gray-700">{tree.species.characteristics}</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Conservation Importance</h3>
            <p className="text-gray-700">{tree.species.conservation_importance}</p>
            
            <h3 className="font-bold text-lg mt-4 mb-2">Threats</h3>
            <p className="text-gray-700">{tree.species.threats}</p>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      {tree.recent_reports && tree.recent_reports.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-forest-green mb-4">Recent Reports</h2>
          <div className="space-y-4">
            {tree.recent_reports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{report.title}</h3>
                    <p className="text-sm text-gray-600">
                      By {report.reporter_username} • {new Date(report.created_at).toLocaleDateString()}
                    </p>
                    <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-600">
                      {report.report_type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    report.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TreeDetailPage;

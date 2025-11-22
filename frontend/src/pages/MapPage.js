import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useNavigate } from 'react-router-dom';
import { treeService } from '../services/api';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

// Major forest areas in Kenya with coordinates
const KENYA_FORESTS = [
  { name: 'Kakamega Forest', center: { lat: 0.2724, lng: 34.8522 }, radius: 25000, type: 'tropical' },
  { name: 'Mau Forest Complex', center: { lat: -0.4833, lng: 35.5333 }, radius: 50000, type: 'montane' },
  { name: 'Aberdare Forest', center: { lat: -0.3667, lng: 36.7167 }, radius: 35000, type: 'montane' },
  { name: 'Mount Kenya Forest', center: { lat: -0.1521, lng: 37.3084 }, radius: 40000, type: 'montane' },
  { name: 'Cherangani Hills', center: { lat: 1.1667, lng: 35.3167 }, radius: 30000, type: 'montane' },
  { name: 'Mount Elgon Forest', center: { lat: 1.1167, lng: 34.5597 }, radius: 28000, type: 'montane' },
  { name: 'Arabuko Sokoke Forest', center: { lat: -3.3333, lng: 39.9000 }, radius: 20000, type: 'coastal' },
  { name: 'Shimba Hills', center: { lat: -4.2333, lng: 39.3833 }, radius: 15000, type: 'coastal' },
  { name: 'Taita Hills', center: { lat: -3.3500, lng: 38.3500 }, radius: 18000, type: 'montane' },
  { name: 'Karura Forest', center: { lat: -1.2394, lng: 36.8492 }, radius: 8000, type: 'urban' },
  { name: 'Ngong Forest', center: { lat: -1.3667, lng: 36.6500 }, radius: 10000, type: 'highland' },
  { name: 'Loita Forest', center: { lat: -1.4167, lng: 35.6667 }, radius: 25000, type: 'highland' },
  { name: 'Mathews Range', center: { lat: 1.2167, lng: 37.5667 }, radius: 30000, type: 'dry' },
  { name: 'Chyulu Hills', center: { lat: -2.6667, lng: 37.8833 }, radius: 22000, type: 'volcanic' },
];

function MapPage() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [trees, setTrees] = useState([]);
  const [selectedTree, setSelectedTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForests, setShowForests] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [forestCircles, setForestCircles] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [filters, setFilters] = useState({
    health_status: '',
    is_adopted: '',
    forest_type: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    initializeMap();
    loadTrees();
  }, []);

  useEffect(() => {
    if (map && trees.length > 0) {
      displayMarkers();
    }
  }, [map, trees]);

  const initializeMap = async () => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['visualization'],
    });

    try {
      const google = await loader.load();
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 0.0236, lng: 37.9062 }, // Center of Kenya
        zoom: 6.5,
        mapTypeControl: true,
        mapTypeId: 'terrain',
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'poi.park',
            elementType: 'geometry.fill',
            stylers: [{ color: '#c8e6c9' }]
          },
          {
            featureType: 'landscape.natural',
            elementType: 'geometry.fill',
            stylers: [{ color: '#e8f5e9' }]
          }
        ]
      });
      setMap(mapInstance);
      
      // Add forest overlays
      displayForestAreas(mapInstance);
    } catch (error) {
      console.error('Error loading Google Maps:', error);
    }
  };

  const displayForestAreas = (mapInstance) => {
    const circles = KENYA_FORESTS.map((forest) => {
      const forestColors = {
        tropical: '#1B5E20',
        montane: '#2E7D32',
        coastal: '#388E3C',
        urban: '#43A047',
        highland: '#4CAF50',
        dry: '#66BB6A',
        volcanic: '#558B2F'
      };

      const circle = new window.google.maps.Circle({
        strokeColor: forestColors[forest.type] || '#2E7D32',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: forestColors[forest.type] || '#2E7D32',
        fillOpacity: 0.25,
        map: mapInstance,
        center: forest.center,
        radius: forest.radius,
        clickable: true,
      });

      // Add forest name label
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h4 style="margin: 0 0 4px 0; font-weight: bold; color: #1B5E20;">${forest.name}</h4>
            <p style="margin: 0; font-size: 12px; color: #666;">
              <strong>Type:</strong> ${forest.type.charAt(0).toUpperCase() + forest.type.slice(1)} Forest<br/>
              <strong>Coverage:</strong> ~${Math.round(Math.PI * Math.pow(forest.radius / 1000, 2))} km²
            </p>
          </div>
        `,
      });

      circle.addListener('click', () => {
        infoWindow.setPosition(forest.center);
        infoWindow.open(mapInstance);
      });

      return circle;
    });

    setForestCircles(circles);
  };

  const loadTrees = async () => {
    setLoading(true);
    try {
      const data = await treeService.getMapData();
      setTrees(data);
    } catch (error) {
      console.error('Error loading trees:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayMarkers = () => {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps not loaded yet');
      return;
    }

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers = [];

    // Filter trees based on current filters
    const filteredTrees = trees.filter(tree => {
      if (filters.health_status && tree.health_status !== filters.health_status) return false;
      if (filters.is_adopted === 'true' && !tree.is_adopted) return false;
      if (filters.is_adopted === 'false' && tree.is_adopted) return false;
      return true;
    });

    filteredTrees.forEach((tree) => {
      // Create tree icon based on health status
      const healthBorderColors = {
        healthy: '#4CAF50',
        stressed: '#FFC107',
        diseased: '#FF9800',
        critical: '#F44336',
        deceased: '#9E9E9E',
      };

      const borderColor = healthBorderColors[tree.health_status] || '#4CAF50';
      const isAdopted = tree.is_adopted;

      // Enhanced tree icon with adoption indicator
      const treeIcon = {
        url: `data:image/svg+xml,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="60" viewBox="0 0 50 60">
            <!-- Shadow -->
            <ellipse cx="25" cy="56" rx="10" ry="3" fill="rgba(0,0,0,0.3)"/>
            
            <!-- Tree trunk -->
            <rect x="21" y="33" width="8" height="18" fill="#6D4C41" rx="2"/>
            <rect x="22" y="34" width="2" height="16" fill="#8D6E63" opacity="0.5"/>
            
            <!-- Tree foliage - layered circles -->
            <circle cx="25" cy="18" r="12" fill="#1B5E20" opacity="0.9"/>
            <circle cx="17" cy="24" r="10" fill="#2E7D32" opacity="0.9"/>
            <circle cx="33" cy="24" r="10" fill="#2E7D32" opacity="0.9"/>
            <circle cx="25" cy="30" r="11" fill="#388E3C" opacity="0.9"/>
            
            <!-- Highlight on foliage -->
            <circle cx="22" cy="16" r="4" fill="#4CAF50" opacity="0.6"/>
            
            <!-- Health status border ring -->
            <circle cx="25" cy="25" r="20" fill="none" stroke="${borderColor}" stroke-width="4" opacity="0.9">
              <animate attributeName="r" values="20;22;20" dur="2s" repeatCount="indefinite"/>
            </circle>
            
            <!-- Health status indicator dot -->
            <circle cx="40" cy="12" r="5" fill="${borderColor}" stroke="white" stroke-width="2">
              <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            
            ${isAdopted ? `
              <!-- Adoption heart badge -->
              <g transform="translate(40, 40)">
                <circle r="7" fill="#E91E63"/>
                <path d="M -3,-1 Q -3,-3 -1.5,-3 Q 0,-3 0,-1 Q 0,-3 1.5,-3 Q 3,-3 3,-1 Q 3,1 0,3 Q -3,1 -3,-1" 
                      fill="white" transform="scale(0.8)"/>
              </g>
            ` : `
              <!-- Available badge -->
              <g transform="translate(40, 40)">
                <circle r="7" fill="#4CAF50"/>
                <text x="0" y="2" text-anchor="middle" font-size="10" font-weight="bold" fill="white">✓</text>
              </g>
            `}
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(50, 60),
        anchor: new window.google.maps.Point(25, 60),
      };

      const marker = new window.google.maps.Marker({
        position: { lat: parseFloat(tree.latitude), lng: parseFloat(tree.longitude) },
        map: map,
        title: tree.tree_id,
        icon: treeIcon,
        animation: tree.health_status === 'critical' ? window.google.maps.Animation.BOUNCE : null,
      });

      const riskLevelColors = {
        critical: '#B71C1C',
        endangered: '#D32F2F',
        vulnerable: '#F57C00',
        low: '#388E3C'
      };

      // Format threats text (first 2 sentences only for map view)
      const threatsSummary = tree.species__threats 
        ? tree.species__threats.split('.').slice(0, 2).join('.') + (tree.species__threats.split('.').length > 2 ? '...' : '')
        : 'No threat data available';

      // Determine which image to use: tree image > species image > placeholder
      // Backend URL without /api suffix for media files
      const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api').replace('/api', '');
      const treeImageUrl = tree.image 
        ? `${baseUrl}/media/${tree.image}`
        : tree.species__image
        ? `${baseUrl}/media/${tree.species__image}`
        : `https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=300&fit=crop`;

      // Log for debugging
      console.log(`Tree ${tree.tree_id} - Image URL: ${treeImageUrl}`);

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 18px; max-width: 420px; font-family: 'Inter', sans-serif; background: white; border-radius: 12px;">
            <!-- Tree Image -->
            <div style="width: 100%; height: 220px; border-radius: 10px; overflow: hidden; margin-bottom: 14px; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
              <img 
                src="${treeImageUrl}" 
                alt="${tree.species__name}"
                style="width: 100%; height: 100%; object-fit: cover;"
                onerror="this.src='https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=300&fit=crop'; console.error('Failed to load tree image: ${treeImageUrl}');"
              />
              <!-- Gradient overlay for better text readability -->
              <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 60px; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);"></div>
              
              <!-- Species Name on Image -->
              <div style="position: absolute; bottom: 8px; left: 8px; right: 8px;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  <div style="background: rgba(76, 175, 80, 0.9); padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 700; color: white; text-transform: uppercase; letter-spacing: 0.5px;">
                    📸 Real Photo
                  </div>
                </div>
                <div style="color: white; font-weight: 700; font-size: 15px; text-shadow: 0 2px 4px rgba(0,0,0,0.8); line-height: 1.2;">
                  ${tree.species__name}
                </div>
                <div style="color: rgba(255,255,255,0.95); font-size: 11px; font-style: italic; text-shadow: 0 1px 2px rgba(0,0,0,0.8); margin-top: 2px;">
                  ${tree.species__scientific_name || ''}
                </div>
              </div>
              
              <!-- Health Status Badge -->
              <div style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.95); padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${healthBorderColors[tree.health_status]}; backdrop-filter: blur(10px); box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                ${tree.health_status}
              </div>
              
              <!-- Adoption Status Badge -->
              ${!isAdopted ? `
                <div style="position: absolute; top: 8px; left: 8px; background: linear-gradient(135deg, #4CAF50, #66BB6A); padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; color: white; backdrop-filter: blur(10px); box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                  ✨ AVAILABLE
                </div>
              ` : `
                <div style="position: absolute; top: 8px; left: 8px; background: linear-gradient(135deg, #E91E63, #EC407A); padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; color: white; backdrop-filter: blur(10px); box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                  💚 ADOPTED
                </div>
              `}
            </div>
            
            <!-- Basic Info -->
            <div style="background: linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 100%); padding: 12px; border-radius: 10px; margin-bottom: 14px; border-left: 4px solid #4CAF50;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>🆔 ID:</strong> ${tree.tree_id}</p>
                <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>🎂 Age:</strong> ${tree.estimated_age ? tree.estimated_age + ' years' : 'Unknown'}</p>
                <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>📏 Height:</strong> ${tree.height ? tree.height + ' m' : 'N/A'}</p>
                <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>⭕ Diameter:</strong> ${tree.diameter ? tree.diameter + ' cm' : 'N/A'}</p>
              </div>
              <p style="margin: 6px 0 0 0; font-size: 13px;"><strong>📍 Location:</strong> ${tree.location_name}</p>
            </div>
            
            <!-- Status Badges -->
            <div style="display: flex; gap: 8px; margin-bottom: 14px;">
              <span style="flex: 1; padding: 8px 12px; background: ${healthBorderColors[tree.health_status]}; color: white; border-radius: 20px; font-size: 11px; text-transform: uppercase; text-align: center; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                ${tree.health_status}
              </span>
              <span style="flex: 1; padding: 8px 12px; background: ${riskLevelColors[tree.species__risk_level] || '#9E9E9E'}; color: white; border-radius: 20px; font-size: 11px; text-transform: uppercase; text-align: center; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                ${(tree.species__risk_level || 'unknown').replace('_', ' ')}
              </span>
            </div>

            <!-- Threats Section -->
            <div style="background: #FFF3E0; padding: 12px; border-radius: 10px; margin-bottom: 14px; border-left: 4px solid #FF9800;">
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #E65100; font-size: 13px; display: flex; align-items: center;">
                <span style="margin-right: 6px;">⚠️</span> Main Threats
              </p>
              <p style="margin: 0; font-size: 12px; color: #555; line-height: 1.5;">${threatsSummary}</p>
            </div>
            
            <!-- Adoption Status -->
            ${isAdopted 
              ? `<div style="background: linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 50%); padding: 12px; border-radius: 10px; margin-bottom: 14px; text-align: center; border: 2px solid #E91E63;">
                  <span style="font-size: 24px;">💚</span>
                  <p style="margin: 6px 0 2px 0; color: #C2185B; font-weight: 700; font-size: 14px;">Tree Already Adopted</p>
                  <p style="margin: 0; color: #880E4F; font-size: 11px;">${tree.adoption_count || 1} adoption(s)</p>
                </div>`
              : `<div style="background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%); padding: 12px; border-radius: 10px; margin-bottom: 14px; text-align: center; border: 2px solid #4CAF50; animation: pulse 2s infinite;">
                  <span style="font-size: 24px;">✨</span>
                  <p style="margin: 6px 0 2px 0; color: #1B5E20; font-weight: 700; font-size: 14px;">Available for Adoption!</p>
                  <p style="margin: 0; color: #2E7D32; font-size: 11px;">Help protect this endangered tree</p>
                </div>`
            }
            
            <!-- Action Buttons -->
            <div style="display: flex; gap: 8px;">
              <button 
                onclick="window.location.href='/tree/${tree.id}'" 
                style="flex: 1; background: linear-gradient(135deg, #2E7D32 0%, #43A047 100%); color: white; padding: 12px 16px; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 13px; box-shadow: 0 4px 12px rgba(46, 125, 50, 0.4); transition: all 0.2s;"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(46, 125, 50, 0.5)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(46, 125, 50, 0.4)'"
              >
                📄 Full Details
              </button>
              ${!isAdopted ? `
                <button 
                  onclick="window.location.href='/tree/${tree.id}#adopt'" 
                  style="flex: 1; background: linear-gradient(135deg, #FF6F00 0%, #FF9800 100%); color: white; padding: 12px 16px; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 13px; box-shadow: 0 4px 12px rgba(255, 111, 0, 0.4); transition: all 0.2s;"
                  onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(255, 111, 0, 0.5)'"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(255, 111, 0, 0.4)'"
                >
                  💚 Adopt Now
                </button>
              ` : ''}
            </div>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        setSelectedTree(tree);
        // Smooth pan to marker
        map.panTo(marker.getPosition());
        if (map.getZoom() < 12) {
          map.setZoom(12);
        }
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  };

  const getHealthColor = (status) => {
    const colors = {
      healthy: 'bg-green-500',
      stressed: 'bg-yellow-500',
      diseased: 'bg-orange-500',
      critical: 'bg-red-500',
      deceased: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const toggleForestOverlay = () => {
    const newShowForests = !showForests;
    setShowForests(newShowForests);
    forestCircles.forEach(circle => {
      circle.setVisible(newShowForests);
    });
  };

  const filteredTreesCount = trees.filter(tree => {
    if (filters.health_status && tree.health_status !== filters.health_status) return false;
    if (filters.is_adopted === 'true' && !tree.is_adopted) return false;
    if (filters.is_adopted === 'false' && tree.is_adopted) return false;
    return true;
  }).length;

  return (
    <div className="h-screen flex pt-16">
      {/* Sidebar */}
      <div className="w-96 bg-gradient-to-b from-green-50 to-white shadow-2xl overflow-y-auto border-r-4 border-green-200">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <span className="text-5xl mr-3">🗺️</span>
              <div>
                <h2 className="text-3xl font-bold gradient-text">Forest Map</h2>
                <p className="text-sm text-gray-600">Endangered Trees & Forest Coverage</p>
              </div>
            </div>
          </div>

          {/* Map Controls */}
          <div className="mb-6 bg-white rounded-xl shadow-md p-4 border-2 border-green-100">
            <h3 className="font-bold mb-3 text-gray-800 flex items-center">
              <span className="mr-2">⚙️</span> Map Layers
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition">
                <span className="flex items-center text-sm font-medium">
                  <span className="mr-2">🌲</span> Forest Areas
                </span>
                <input
                  type="checkbox"
                  checked={showForests}
                  onChange={toggleForestOverlay}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
              </label>
            </div>
          </div>
          
          {/* Filters */}
          <div className="mb-6 bg-white rounded-xl shadow-md p-4 border-2 border-green-100">
            <h3 className="font-bold mb-3 text-gray-800 flex items-center">
              <span className="mr-2">🔍</span> Filters
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Health Status</label>
                <select
                  value={filters.health_status}
                  onChange={(e) => setFilters({ ...filters, health_status: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 transition"
                >
                  <option value="">All Trees ({trees.length})</option>
                  <option value="healthy">🟢 Healthy ({trees.filter(t => t.health_status === 'healthy').length})</option>
                  <option value="stressed">🟡 Stressed ({trees.filter(t => t.health_status === 'stressed').length})</option>
                  <option value="diseased">🟠 Diseased ({trees.filter(t => t.health_status === 'diseased').length})</option>
                  <option value="critical">🔴 Critical ({trees.filter(t => t.health_status === 'critical').length})</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Adoption Status</label>
                <select
                  value={filters.is_adopted}
                  onChange={(e) => setFilters({ ...filters, is_adopted: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 transition"
                >
                  <option value="">All Trees</option>
                  <option value="false">✨ Available ({trees.filter(t => !t.is_adopted).length})</option>
                  <option value="true">💚 Adopted ({trees.filter(t => t.is_adopted).length})</option>
                </select>
              </div>

              {(filters.health_status || filters.is_adopted) && (
                <button
                  onClick={() => setFilters({ health_status: '', is_adopted: '', forest_type: '' })}
                  className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mb-6 bg-white rounded-xl shadow-md p-4 border-2 border-green-100">
            <h3 className="font-bold mb-3 text-gray-800 flex items-center">
              <span className="mr-2">📊</span> Legend
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Tree Health Status</p>
                <div className="space-y-2">
                  {[
                    { color: 'bg-green-500', label: 'Healthy', icon: '🟢' },
                    { color: 'bg-yellow-500', label: 'Stressed', icon: '🟡' },
                    { color: 'bg-orange-500', label: 'Diseased', icon: '🟠' },
                    { color: 'bg-red-500', label: 'Critical', icon: '🔴' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full ${item.color} mr-3`}></div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <span>{item.icon}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2 mt-4">Forest Types</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { color: '#1B5E20', label: 'Tropical' },
                    { color: '#2E7D32', label: 'Montane' },
                    { color: '#388E3C', label: 'Coastal' },
                    { color: '#43A047', label: 'Urban' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
            <h3 className="font-bold mb-4 flex items-center text-lg">
              <span className="mr-2">📈</span> Live Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-3xl font-bold">{trees.length}</div>
                <div className="text-xs mt-1 opacity-90">Total Trees</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-3xl font-bold">{KENYA_FORESTS.length}</div>
                <div className="text-xs mt-1 opacity-90">Forest Areas</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-3xl font-bold">{trees.filter(t => t.is_adopted).length}</div>
                <div className="text-xs mt-1 opacity-90">Adopted</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-3xl font-bold">{trees.filter(t => !t.is_adopted).length}</div>
                <div className="text-xs mt-1 opacity-90">Available</div>
              </div>
            </div>

            {filteredTreesCount < trees.length && (
              <div className="mt-4 p-3 bg-white/20 backdrop-blur rounded-lg text-center">
                <div className="text-sm">Showing <span className="font-bold">{filteredTreesCount}</span> filtered trees</div>
              </div>
            )}
          </div>

          {/* Urgent Adoptions Needed */}
          {trees.filter(t => !t.is_adopted && (t.health_status === 'critical' || t.health_status === 'diseased')).length > 0 && (
            <div className="mt-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-md p-4 border-2 border-red-200">
              <h3 className="font-bold mb-3 text-red-800 flex items-center">
                <span className="mr-2">🚨</span> Urgent: Trees Needing Adoption
              </h3>
              <p className="text-xs text-red-700 mb-3">
                These endangered trees are in critical condition and need immediate support
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {trees
                  .filter(t => !t.is_adopted && (t.health_status === 'critical' || t.health_status === 'diseased'))
                  .slice(0, 5)
                  .map((tree, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const marker = markers.find(m => m.getTitle() === tree.tree_id);
                        if (marker) {
                          map.panTo(marker.getPosition());
                          map.setZoom(14);
                          window.google.maps.event.trigger(marker, 'click');
                        }
                      }}
                      className="w-full text-left p-3 bg-white hover:bg-red-50 rounded-lg transition border-l-4 border-red-500 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-bold text-sm text-gray-800 group-hover:text-red-700">
                            {tree.species__name}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            ID: {tree.tree_id} • {tree.location_name}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              tree.health_status === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                            } text-white font-bold`}>
                              {tree.health_status.toUpperCase()}
                            </span>
                            {tree.estimated_age && (
                              <span className="text-xs text-gray-600">
                                🎂 {tree.estimated_age} years old
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xl group-hover:scale-125 transition-transform">📍</span>
                      </div>
                    </button>
                  ))}
              </div>
              {trees.filter(t => !t.is_adopted && (t.health_status === 'critical' || t.health_status === 'diseased')).length > 5 && (
                <p className="text-xs text-center text-red-600 mt-2">
                  + {trees.filter(t => !t.is_adopted && (t.health_status === 'critical' || t.health_status === 'diseased')).length - 5} more trees need urgent help
                </p>
              )}
            </div>
          )}

          {/* Available Trees for Adoption */}
          <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md p-4 border-2 border-green-200">
            <h3 className="font-bold mb-3 text-green-800 flex items-center">
              <span className="mr-2">✨</span> Available for Adoption
            </h3>
            <p className="text-xs text-green-700 mb-3">
              Click on any tree to view details and adopt
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {trees
                .filter(t => !t.is_adopted)
                .slice(0, 6)
                .map((tree, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const marker = markers.find(m => m.getTitle() === tree.tree_id);
                      if (marker) {
                        map.panTo(marker.getPosition());
                        map.setZoom(14);
                        window.google.maps.event.trigger(marker, 'click');
                      }
                    }}
                    className="w-full text-left p-3 bg-white hover:bg-green-50 rounded-lg transition border-l-4 border-green-500 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-sm text-gray-800 group-hover:text-green-700">
                          {tree.species__name}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {tree.location_name}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            tree.health_status === 'healthy' ? 'bg-green-100 text-green-800' :
                            tree.health_status === 'stressed' ? 'bg-yellow-100 text-yellow-800' :
                            tree.health_status === 'diseased' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {tree.health_status}
                          </span>
                          {tree.estimated_age && (
                            <span className="text-xs text-gray-600">
                              {tree.estimated_age} yrs
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xl group-hover:scale-125 transition-transform">🌳</span>
                    </div>
                  </button>
                ))}
            </div>
            <div className="mt-3 text-center">
              <button
                onClick={() => setFilters({ ...filters, is_adopted: 'false' })}
                className="text-xs text-green-700 hover:text-green-900 font-medium"
              >
                View all {trees.filter(t => !t.is_adopted).length} available trees →
              </button>
            </div>
          </div>

          {/* Major Forests List */}
          <div className="mt-6 bg-white rounded-xl shadow-md p-4 border-2 border-green-100">
            <h3 className="font-bold mb-3 text-gray-800 flex items-center">
              <span className="mr-2">🌳</span> Major Forests
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {KENYA_FORESTS.map((forest, i) => (
                <button
                  key={i}
                  onClick={() => {
                    map.panTo(forest.center);
                    map.setZoom(10);
                  }}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-green-50 rounded-lg transition group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm group-hover:text-green-700">{forest.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{forest.type} Forest</div>
                    </div>
                    <span className="text-xl group-hover:scale-125 transition-transform">📍</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full"></div>
        
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <div className="text-2xl font-bold gradient-text">Loading Forest Data...</div>
              <p className="text-gray-600 mt-2">Fetching tree locations and forest coverage</p>
            </div>
          </div>
        )}

        {/* Map Info Badge */}
        <div className="absolute top-4 left-4 glass-dark text-white px-6 py-3 rounded-xl shadow-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🌍</span>
            <div>
              <div className="font-bold">Kenya Forest Map</div>
              <div className="text-xs opacity-90">Real-time Endangered Tree Tracking</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapPage;

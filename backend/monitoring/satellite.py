"""
Satellite Data Integration Service
Handles NASA FIRMS fire alerts and NDVI monitoring
"""
import requests
import os
from datetime import datetime, timedelta
from django.conf import settings
from trees.models import Tree
from .models import Alert


class SatelliteDataService:
    """Integration with satellite data sources for forest monitoring"""
    
    def __init__(self):
        self.firms_api_key = os.environ.get('NASA_FIRMS_API_KEY', '')
        self.firms_url = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"
        
    def get_fire_alerts(self, days=1):
        """
        Fetch fire alerts from NASA FIRMS within Kenya
        Returns fires detected in the last N days
        """
        # Kenya bounding box
        min_lat, max_lat = -5.0, 5.0
        min_lon, max_lon = 33.0, 42.0
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        params = {
            'source': 'VIIRS_SNPP_NRT',  # VIIRS satellite
            'area': f'{min_lat},{min_lon},{max_lat},{max_lon}',
            'date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'daynight': 'D'  # Daytime only for better accuracy
        }
        
        try:
            # Note: In production, use actual API key
            # For demo, return mock data if API key not set
            if not self.firms_api_key:
                return self._get_mock_fire_data()
            
            headers = {'Authorization': f'Bearer {self.firms_api_key}'}
            response = requests.get(
                f"{self.firms_url}/{self.firms_api_key}",
                params=params,
                timeout=30
            )
            
            if response.status_code == 200:
                return self._parse_firms_data(response.text)
            else:
                print(f"FIRMS API error: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"Error fetching FIRMS data: {e}")
            return []
    
    def _parse_firms_data(self, csv_data):
        """Parse FIRMS CSV response"""
        fires = []
        lines = csv_data.strip().split('\n')
        
        if len(lines) < 2:
            return fires
        
        headers = lines[0].split(',')
        lat_idx = headers.index('latitude')
        lon_idx = headers.index('longitude')
        brightness_idx = headers.index('brightness')
        confidence_idx = headers.index('confidence')
        date_idx = headers.index('acq_date')
        time_idx = headers.index('acq_time')
        
        for line in lines[1:]:
            fields = line.split(',')
            fires.append({
                'latitude': float(fields[lat_idx]),
                'longitude': float(fields[lon_idx]),
                'brightness': float(fields[brightness_idx]),
                'confidence': fields[confidence_idx],
                'date': fields[date_idx],
                'time': fields[time_idx]
            })
        
        return fires
    
    def _get_mock_fire_data(self):
        """Return mock fire data for demonstration"""
        return [
            {
                'latitude': -1.2921,
                'longitude': 36.8219,
                'brightness': 325.5,
                'confidence': 'high',
                'date': datetime.now().strftime('%Y-%m-%d'),
                'time': '1430'
            }
        ]
    
    def check_fires_near_trees(self, radius_km=10):
        """
        Check for fires near endangered trees
        Creates alerts if fires detected within radius
        """
        fires = self.get_fire_alerts(days=2)
        trees = Tree.objects.all()
        alerts_created = 0
        
        for tree in trees:
            tree_point = Point(float(tree.longitude), float(tree.latitude))
            
            for fire in fires:
                fire_point = Point(fire['longitude'], fire['latitude'])
                
                # Calculate distance (approximate)
                distance_km = self._haversine_distance(
                    float(tree.latitude), float(tree.longitude),
                    fire['latitude'], fire['longitude']
                )
                
                if distance_km <= radius_km:
                    # Create high-severity alert
                    alert, created = Alert.objects.get_or_create(
                        tree=tree,
                        severity='critical',
                        title=f'Fire Alert: {distance_km:.1f}km from tree',
                        defaults={
                            'message': f"Fire detected at {fire['date']} {fire['time']} "
                                     f"with brightness {fire['brightness']}K and "
                                     f"{fire['confidence']} confidence. "
                                     f"Distance: {distance_km:.1f}km. "
                                     f"Immediate ranger response required."
                        }
                    )
                    
                    if created:
                        alerts_created += 1
                        print(f"Alert created for tree {tree.tree_id}")
        
        return alerts_created
    
    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two points in km"""
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Earth radius in km
        
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    def get_ndvi_estimate(self, latitude, longitude):
        """
        Get estimated NDVI (Normalized Difference Vegetation Index)
        In production, this would query Sentinel-2 or Landsat data
        """
        # Mock NDVI data for demonstration
        # Real implementation would use Google Earth Engine API
        # NDVI ranges from -1 to 1, where >0.6 indicates healthy vegetation
        
        import random
        base_ndvi = 0.7  # Healthy forest baseline
        variation = random.uniform(-0.15, 0.1)
        
        ndvi = base_ndvi + variation
        
        return {
            'ndvi': round(ndvi, 3),
            'status': self._classify_ndvi(ndvi),
            'date': datetime.now().strftime('%Y-%m-%d')
        }
    
    def _classify_ndvi(self, ndvi):
        """Classify NDVI value into health status"""
        if ndvi > 0.6:
            return 'Healthy'
        elif ndvi > 0.4:
            return 'Moderate'
        elif ndvi > 0.2:
            return 'Stressed'
        else:
            return 'Critical'
    
    def get_weather_data(self, latitude, longitude):
        """
        Fetch weather data for tree location
        Uses OpenWeatherMap API
        """
        api_key = os.environ.get('OPENWEATHER_API_KEY', '')
        
        if not api_key:
            return self._get_mock_weather()
        
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather"
            params = {
                'lat': latitude,
                'lon': longitude,
                'appid': api_key,
                'units': 'metric'
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'temperature': data['main']['temp'],
                    'humidity': data['main']['humidity'],
                    'rainfall': data.get('rain', {}).get('1h', 0),
                    'description': data['weather'][0]['description']
                }
        except Exception as e:
            print(f"Weather API error: {e}")
            return self._get_mock_weather()
    
    def _get_mock_weather(self):
        """Return mock weather data"""
        return {
            'temperature': 24.5,
            'humidity': 65,
            'rainfall': 0,
            'description': 'partly cloudy'
        }

# Nilocate Public Conservation API Documentation

## 🌍 Overview

The Nilocate Public Conservation API provides access to endangered tree data, adoption statistics, and forest monitoring information for researchers, schools, NGOs, and conservation partners in Kenya.

**Base URL:** `https://api.nilocate.co.ke/api/v1/`

**Authentication:** Most endpoints are public. Rate limiting applies.

## 🔑 Authentication

### Public Endpoints
No authentication required. Rate limited to **1000 requests/hour** per IP.

### Authenticated Endpoints
Require API key for higher rate limits and access to write operations.

**Request Header:**
```
Authorization: Api-Key YOUR_API_KEY
```

**Get API Key:**
1. Sign up at https://nilocate.co.ke/register
2. Navigate to Settings > Developer
3. Generate API key

## 📊 Rate Limits

| Tier | Requests/Hour | Cost |
|------|---------------|------|
| Public | 1,000 | Free |
| Basic | 10,000 | Free (requires API key) |
| Pro | 100,000 | Contact us |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🌳 Endpoints

### Tree Species

#### List All Species
```http
GET /species/
```

**Response:**
```json
{
  "count": 45,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Mukau",
      "scientific_name": "Melia volkensii",
      "conservation_status": "endangered",
      "description": "Drought-resistant indigenous tree",
      "average_height": 15.5,
      "average_canopy_spread": 8.2,
      "native_regions": ["Eastern", "Coast"],
      "total_trees": 342,
      "adopted_trees": 215
    }
  ]
}
```

**Query Parameters:**
- `conservation_status`: Filter by status (`endangered`, `vulnerable`, `near_threatened`)
- `region`: Filter by region (`nairobi`, `coast`, `rift_valley`, etc.)
- `search`: Search by name or scientific name

**Example:**
```bash
curl "https://api.nilocate.co.ke/api/v1/species/?conservation_status=endangered&region=nairobi"
```

### Trees

#### Get Trees Map Data
```http
GET /trees/map/
```

Returns all trees with location coordinates for map visualization.

**Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [36.8219, -1.2921]
      },
      "properties": {
        "id": "NAIROBI-MUKAU-001",
        "species": "Mukau",
        "health_status": "healthy",
        "adoption_status": "adopted",
        "age_years": 5,
        "height": 12.5,
        "last_check": "2024-01-15T10:30:00Z",
        "risk_level": "low"
      }
    }
  ]
}
```

**Query Parameters:**
- `species`: Filter by species ID
- `health_status`: Filter by health (`healthy`, `moderate`, `stressed`, `critical`)
- `adoption_status`: Filter by adoption status (`available`, `adopted`)
- `bounds`: Geographic bounds `sw_lat,sw_lng,ne_lat,ne_lng`

**Example:**
```bash
curl "https://api.nilocate.co.ke/api/v1/trees/map/?bounds=-1.4,36.7,-1.1,36.9"
```

#### Get Tree Details
```http
GET /trees/{tree_id}/
```

**Response:**
```json
{
  "id": "NAIROBI-MUKAU-001",
  "species": {
    "id": 1,
    "name": "Mukau",
    "scientific_name": "Melia volkensii"
  },
  "location": {
    "latitude": -1.2921,
    "longitude": 36.8219,
    "region": "Nairobi",
    "forest": "Karura Forest"
  },
  "metrics": {
    "height": 12.5,
    "diameter": 0.35,
    "canopy_spread": 7.8,
    "age_years": 5
  },
  "health": {
    "status": "healthy",
    "last_check": "2024-01-15T10:30:00Z",
    "ndvi": 0.72,
    "notes": "Strong growth, no visible stress"
  },
  "adoption": {
    "status": "adopted",
    "adopted_by": "John Kamau",
    "adopted_date": "2023-06-10",
    "certificate_id": "CERT-2023-00142"
  },
  "monitoring": {
    "fire_alerts": 0,
    "recent_incidents": [],
    "weather": {
      "temperature": 22.5,
      "humidity": 65,
      "rainfall_last_7_days": 15.2
    }
  }
}
```

### Conservation Statistics

#### Get Overall Statistics
```http
GET /statistics/
```

**Response:**
```json
{
  "trees": {
    "total": 8547,
    "adopted": 5231,
    "available": 3316,
    "health_distribution": {
      "healthy": 6842,
      "moderate": 1205,
      "stressed": 384,
      "critical": 116
    }
  },
  "species": {
    "total_species": 45,
    "endangered": 18,
    "vulnerable": 15,
    "near_threatened": 12
  },
  "users": {
    "total_adopters": 4127,
    "active_rangers": 89,
    "total_organizations": 23
  },
  "conservation_impact": {
    "co2_sequestered_tons": 1247.5,
    "area_protected_hectares": 342.8,
    "trees_planted_this_year": 1834
  },
  "monitoring": {
    "active_fire_alerts": 3,
    "incidents_reported_30_days": 47,
    "health_checks_30_days": 892
  }
}
```

#### Get Statistics by Region
```http
GET /statistics/region/{region_name}/
```

Regions: `nairobi`, `coast`, `rift_valley`, `western`, `nyanza`, `central`, `eastern`, `north_eastern`

**Response:**
```json
{
  "region": "Nairobi",
  "trees": {
    "total": 1247,
    "adopted": 892,
    "species_count": 23
  },
  "forests": [
    {
      "name": "Karura Forest",
      "trees": 534,
      "area_hectares": 1041
    },
    {
      "name": "Ngong Forest",
      "trees": 713,
      "area_hectares": 2388
    }
  ],
  "top_species": [
    {"name": "Mukau", "count": 342},
    {"name": "African Olive", "count": 289}
  ]
}
```

### Fire Alerts

#### Get Active Fire Alerts
```http
GET /fire-alerts/
```

**Response:**
```json
{
  "count": 3,
  "results": [
    {
      "id": 147,
      "tree_id": "NAIROBI-MUKAU-001",
      "severity": "critical",
      "fire_location": {
        "latitude": -1.2945,
        "longitude": 36.8198,
        "distance_km": 2.3
      },
      "detected_at": "2024-01-15T14:22:00Z",
      "source": "NASA FIRMS VIIRS",
      "confidence": 85,
      "status": "active",
      "notified_users": 5
    }
  ]
}
```

**Query Parameters:**
- `severity`: Filter by severity (`low`, `medium`, `high`, `critical`)
- `status`: Filter by status (`active`, `monitoring`, `resolved`)
- `region`: Filter by region
- `within_km`: Distance from tree in kilometers

### Adoption Data

#### Get Recent Adoptions
```http
GET /adoptions/recent/
```

**Response:**
```json
{
  "count": 50,
  "results": [
    {
      "id": 5234,
      "tree_id": "NAIROBI-MUKAU-001",
      "adopter_name": "Green Schools Initiative",
      "adoption_date": "2024-01-14",
      "duration_years": 1,
      "amount_paid": 500,
      "certificate_issued": true
    }
  ]
}
```

**Query Parameters:**
- `days`: Recent adoptions (default: 30)
- `species`: Filter by species ID
- `region`: Filter by region

### Incidents

#### Get Recent Incidents
```http
GET /incidents/
```

**Response:**
```json
{
  "count": 47,
  "results": [
    {
      "id": 892,
      "tree_id": "NAIROBI-MUKAU-001",
      "incident_type": "fire",
      "severity": "high",
      "description": "Smoke visible near tree area",
      "location": {
        "latitude": -1.2921,
        "longitude": 36.8219
      },
      "reported_by": "Ranger John M.",
      "reported_at": "2024-01-15T08:15:00Z",
      "status": "under_investigation",
      "photo_url": "https://cdn.nilocate.co.ke/incidents/892.jpg"
    }
  ]
}
```

**Query Parameters:**
- `incident_type`: Filter by type (`fire`, `disease`, `vandalism`, `illegal_logging`, etc.)
- `severity`: Filter by severity (`low`, `medium`, `high`, `critical`)
- `status`: Filter by status (`reported`, `under_investigation`, `resolved`)
- `days`: Recent incidents (default: 30)

### Health Analysis

#### Get Tree Health Trends
```http
GET /health/trends/
```

**Response:**
```json
{
  "period": "last_90_days",
  "overall_health": {
    "average_ndvi": 0.68,
    "trend": "improving"
  },
  "by_species": [
    {
      "species": "Mukau",
      "average_ndvi": 0.72,
      "health_distribution": {
        "healthy": 85.2,
        "moderate": 10.5,
        "stressed": 3.8,
        "critical": 0.5
      }
    }
  ],
  "stress_factors": [
    {
      "factor": "drought",
      "affected_trees": 142,
      "regions": ["Eastern", "North Eastern"]
    }
  ]
}
```

### Weather Data

#### Get Weather for Region
```http
GET /weather/{region_name}/
```

**Response:**
```json
{
  "region": "Nairobi",
  "current": {
    "temperature": 22.5,
    "humidity": 65,
    "conditions": "Partly Cloudy",
    "wind_speed": 12.3
  },
  "forecast_7_days": [
    {
      "date": "2024-01-16",
      "temperature_high": 25,
      "temperature_low": 16,
      "rainfall_mm": 0,
      "conditions": "Sunny"
    }
  ],
  "rainfall_summary": {
    "last_7_days": 15.2,
    "last_30_days": 87.5,
    "drought_risk": "low"
  }
}
```

## 🔔 Webhooks (Authenticated)

Subscribe to real-time events for your organization.

### Available Events
- `tree.adopted` - New tree adoption
- `tree.health.critical` - Tree health becomes critical
- `fire.alert.created` - New fire alert
- `incident.reported` - New incident reported

### Register Webhook
```http
POST /webhooks/
Authorization: Api-Key YOUR_API_KEY
Content-Type: application/json

{
  "url": "https://your-domain.com/webhook",
  "events": ["fire.alert.created", "incident.reported"],
  "secret": "your_webhook_secret"
}
```

### Webhook Payload Example
```json
{
  "event": "fire.alert.created",
  "timestamp": "2024-01-15T14:22:00Z",
  "data": {
    "alert_id": 147,
    "tree_id": "NAIROBI-MUKAU-001",
    "severity": "critical",
    "distance_km": 2.3
  },
  "signature": "sha256_hmac_signature"
}
```

## 📈 Use Cases

### For Schools & Researchers

**Track tree growth over time:**
```python
import requests

# Get tree details
tree = requests.get("https://api.nilocate.co.ke/api/v1/trees/NAIROBI-MUKAU-001/").json()

# Monitor NDVI trends
health = requests.get("https://api.nilocate.co.ke/api/v1/health/trends/?species=1").json()

# Analyze regional statistics
stats = requests.get("https://api.nilocate.co.ke/api/v1/statistics/region/nairobi/").json()
```

### For NGOs & Conservation Partners

**Monitor fire threats:**
```python
import requests

# Get active fire alerts
alerts = requests.get(
    "https://api.nilocate.co.ke/api/v1/fire-alerts/",
    params={"region": "coast", "severity": "critical"}
).json()

# Get incident reports
incidents = requests.get(
    "https://api.nilocate.co.ke/api/v1/incidents/",
    params={"incident_type": "illegal_logging", "days": 7}
).json()
```

### For Data Visualization

**Create interactive conservation map:**
```javascript
// Fetch GeoJSON data
fetch('https://api.nilocate.co.ke/api/v1/trees/map/?bounds=-1.4,36.7,-1.1,36.9')
  .then(res => res.json())
  .then(data => {
    // Add to map layer
    map.addSource('trees', { type: 'geojson', data });
    
    // Style by health status
    map.addLayer({
      id: 'trees-layer',
      type: 'circle',
      source: 'trees',
      paint: {
        'circle-color': [
          'match',
          ['get', 'health_status'],
          'healthy', '#10b981',
          'moderate', '#fbbf24',
          'stressed', '#f97316',
          'critical', '#ef4444',
          '#6b7280'
        ],
        'circle-radius': 8
      }
    });
  });
```

## 🛠️ SDKs

### Python SDK
```bash
pip install nilocate-sdk
```

```python
from nilocate import NilocateClient

client = NilocateClient(api_key="YOUR_API_KEY")

# Get species
species = client.species.list(conservation_status="endangered")

# Get trees in area
trees = client.trees.get_in_bounds(
    sw_lat=-1.4, sw_lng=36.7,
    ne_lat=-1.1, ne_lng=36.9
)

# Subscribe to fire alerts
client.webhooks.subscribe(
    url="https://your-domain.com/webhook",
    events=["fire.alert.created"]
)
```

### JavaScript SDK
```bash
npm install @nilocate/sdk
```

```javascript
import { NilocateClient } from '@nilocate/sdk';

const client = new NilocateClient({ apiKey: 'YOUR_API_KEY' });

// Get statistics
const stats = await client.statistics.getOverall();

// Get recent adoptions
const adoptions = await client.adoptions.getRecent({ days: 7 });
```

## 📞 Support

- **Documentation:** https://docs.nilocate.co.ke
- **API Status:** https://status.nilocate.co.ke
- **Email:** api@nilocate.co.ke
- **GitHub:** https://github.com/nilocate/api-examples

## 📄 Terms of Use

- Data is provided for conservation, education, and research purposes
- Attribution required: "Data provided by Nilocate Conservation Platform"
- Commercial use requires written permission
- Rate limits apply - contact us for enterprise access
- No warranty provided - data is for informational purposes

## 🔄 Changelog

### v1.0.0 (2024-01-15)
- Initial public API release
- GeoJSON support for tree locations
- Fire alert monitoring
- Health trend analysis
- Webhook support for real-time events

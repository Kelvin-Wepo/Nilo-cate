# 🌿 Nilocate - Setup and Running Guide

## Quick Start

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Activate virtual environment:**
   ```bash
   source venv/bin/activate
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys:
   # - GEMINI_API_KEY (get from https://makersuite.google.com/app/apikey)
   # - GOOGLE_MAPS_API_KEY (get from Google Cloud Console)
   ```

4. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

   The API will be available at `http://localhost:8000`
   - Admin: `http://localhost:8000/admin/`
   - API Docs: `http://localhost:8000/swagger/`

5. **Create a superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add:
   # - REACT_APP_GOOGLE_MAPS_API_KEY
   ```

4. **Run the development server:**
   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3000`

## API Keys Required

### 1. Google Maps API Key
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing
- Enable **Maps JavaScript API**
- Create credentials (API Key)
- Add to both backend and frontend `.env` files

### 2. Gemini API Key
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create API key
- Add to backend `.env` file

## Project Structure

```
Nilo-cate/
├── backend/
│   ├── manage.py
│   ├── nilocate_project/     # Django project settings
│   ├── users/                # User management app
│   ├── trees/                # Tree & adoption management
│   ├── monitoring/           # Reports & AI analysis
│   ├── media/                # Uploaded images
│   └── db.sqlite3            # Database (development)
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/       # Reusable components
    │   ├── pages/            # Page components
    │   ├── services/         # API services
    │   └── context/          # React context
    └── package.json
```

## Key Features Implemented

### Backend (Django REST API)
✅ User authentication with JWT
✅ Tree species and individual tree management
✅ Tree adoption system with certificates
✅ Community reporting system
✅ **Gemini AI integration for tree health analysis**
✅ Alert system for tree threats
✅ Ranger verification workflow
✅ Badge/achievement system
✅ Swagger API documentation

### Frontend (React)
✅ **Interactive Google Maps with tree markers**
✅ User authentication (login/register)
✅ Tree browsing and adoption
✅ Photo upload with AI analysis
✅ Personal adoption dashboard
✅ Endangered species information
✅ Ranger dashboard for verification
✅ Responsive design with Tailwind CSS

## API Endpoints

### Authentication
- `POST /api/auth/login/` - Login
- `POST /api/auth/refresh/` - Refresh token

### Trees
- `GET /api/trees/` - List all trees
- `GET /api/trees/{id}/` - Get tree details
- `GET /api/trees/map_data/` - Get optimized map data
- `POST /api/trees/{id}/adopt/` - Adopt a tree

### Reports
- `GET /api/reports/` - List reports
- `POST /api/reports/` - Create report
- `POST /api/reports/{id}/analyze/` - Run AI analysis
- `POST /api/reports/{id}/verify/` - Verify report (rangers)

### Species
- `GET /api/species/` - List endangered species
- `GET /api/species/{id}/` - Get species details

### Alerts
- `GET /api/alerts/` - List active alerts
- `POST /api/alerts/{id}/resolve/` - Resolve alert (rangers)

## Adding Sample Data

Create sample data through Django admin:

1. Access admin at `http://localhost:8000/admin/`
2. Add TreeSpecies entries
3. Add Tree entries with coordinates
4. Create ranger users with `user_type='ranger'`

Or use Django shell:

```bash
python manage.py shell
```

```python
from trees.models import TreeSpecies, Tree
from users.models import User

# Create species
species = TreeSpecies.objects.create(
    name="Meru Oak",
    scientific_name="Vitex keniensis",
    description="Endangered hardwood tree native to Kenya",
    risk_level="endangered",
    native_region="Central Kenya",
    characteristics="Large canopy, dark green leaves",
    conservation_importance="Critical for local ecosystem",
    threats="Deforestation, illegal logging"
)

# Create tree
Tree.objects.create(
    species=species,
    tree_id="TREE-001",
    latitude=-1.2921,
    longitude=36.8219,
    location_name="Karura Forest",
    health_status="healthy"
)
```

## Deployment Notes

### Backend Deployment
- Use PostgreSQL for production
- Set `DEBUG=False`
- Configure `ALLOWED_HOSTS`
- Use proper secret key
- Serve static/media files via CDN or web server

### Frontend Deployment
- Build: `npm run build`
- Deploy `build/` folder to hosting service
- Update `REACT_APP_API_URL` to production API

## Troubleshooting

### Backend Issues
- **Import errors**: Ensure virtual environment is activated
- **Database errors**: Run `python manage.py migrate`
- **API key errors**: Check `.env` file configuration

### Frontend Issues
- **Module not found**: Run `npm install`
- **Map not loading**: Check Google Maps API key
- **CORS errors**: Ensure backend CORS settings allow frontend origin

## Contributing

See CONTRIBUTING.md for development guidelines.

## License

MIT License - See LICENSE file

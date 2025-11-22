# 🚀 Quick Start Guide

## Your Nilocate Platform is Running! 🌿

### ✅ Current Status

**Backend Server**: http://localhost:8000 (Django REST API)
**Frontend App**: http://localhost:3000 (React App)
**API Documentation**: http://localhost:8000/swagger/

Both servers are currently running in the background!

---

## 📋 Next Steps

### 1. Add API Keys (Required for Full Functionality)

Edit these files and add your API keys:

**Backend** (`backend/.env`):
```bash
# Get from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-actual-gemini-api-key

# Get from: https://console.cloud.google.com/
GOOGLE_MAPS_API_KEY=your-actual-google-maps-key
```

**Frontend** (`frontend/.env`):
```bash
# Same Google Maps key as backend
REACT_APP_GOOGLE_MAPS_API_KEY=your-actual-google-maps-key
```

After adding keys, restart both servers (Ctrl+C then `./start.sh`)

---

### 2. Create Sample Data

Populate the database with endangered tree species and sample trees:

```bash
cd backend
source venv/bin/activate
python manage.py shell < create_sample_data.py
```

This creates:
- 3 endangered tree species (Meru Oak, East African Yellowwood, African Cherry)
- 10 sample trees across Kenya (Karura Forest, Ngong Forest, Mount Kenya, etc.)

---

### 3. Create Admin User

Create a superuser account to access the Django admin:

```bash
cd backend
source venv/bin/activate
python manage.py createsuperuser
```

Then visit: http://localhost:8000/admin/

---

### 4. Test the Platform

Open http://localhost:3000 in your browser and try:

1. **Register** - Create a new citizen account
2. **Browse Map** - View trees on the interactive map
3. **Adopt Tree** - Click a tree marker and adopt it
4. **Submit Report** - Upload a photo for AI health analysis
5. **View Species** - Explore endangered species catalog

For ranger features:
- Create a user with `user_type='ranger'` in Django admin
- Login to access the Ranger Dashboard

---

## 🛠️ Development Commands

### Start Both Servers
```bash
./start.sh
```

### Start Backend Only
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

### Start Frontend Only
```bash
cd frontend
npm start
```

### Run Migrations
```bash
cd backend
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
```

### Create Sample Data
```bash
cd backend
source venv/bin/activate
python manage.py shell < create_sample_data.py
```

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login/` - Login
- `POST /api/auth/refresh/` - Refresh token
- `POST /api/users/` - Register

### Trees
- `GET /api/trees/` - List all trees
- `GET /api/trees/{id}/` - Tree details
- `POST /api/trees/{id}/adopt/` - Adopt tree
- `GET /api/trees/map_data/` - Map markers data

### Reports
- `GET /api/reports/` - List reports
- `POST /api/reports/` - Submit report
- `POST /api/reports/{id}/analyze/` - Trigger AI analysis
- `POST /api/reports/{id}/verify/` - Verify report (rangers)

### Species
- `GET /api/species/` - List endangered species
- `GET /api/species/{id}/` - Species details

Full API docs: http://localhost:8000/swagger/

---

## 🧪 Testing Features

### Without API Keys (Limited Mode)
- ✅ User registration and login
- ✅ Browse trees on map (without actual map tiles)
- ✅ View tree and species information
- ✅ Adopt trees and get certificates
- ❌ Google Maps display (needs API key)
- ❌ AI health analysis (needs Gemini key)

### With API Keys (Full Mode)
- ✅ All features above
- ✅ Interactive Google Maps with custom markers
- ✅ AI-powered tree health analysis
- ✅ Automatic alert generation
- ✅ Species identification

---

## 📱 Default Test Users

After creating sample data, you can create test users:

**Citizen User**:
```
Username: citizen1
Password: (your choice)
User Type: citizen
```

**Ranger User** (create via Django admin):
```
Username: ranger1
Password: (your choice)
User Type: ranger
```

**Admin User** (via createsuperuser):
```
Username: admin
Password: (your choice)
```

---

## 🎯 Hackathon Demo Flow

1. **Show the Problem** (Landing Page)
   - 32 endangered species in Kenya
   - Limited visibility and community engagement

2. **Interactive Map** (Map Page)
   - Real-time tree locations
   - Color-coded health status
   - Filter by status and adoption

3. **Tree Adoption** (Tree Detail Page)
   - View tree details and species info
   - Adopt and get unique certificate
   - Track in "My Adoptions"

4. **AI Health Analysis** (Report Page)
   - Upload tree photo
   - Get instant AI assessment
   - View detected issues and recommendations

5. **Ranger Verification** (Ranger Dashboard)
   - Review community reports
   - Verify or reject with notes
   - Manage critical alerts

6. **Educational Content** (Species Page)
   - Learn about endangered species
   - Conservation importance
   - Threats and characteristics

---

## 🐛 Troubleshooting

### Backend won't start
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
```

### Frontend won't start
```bash
cd frontend
npm install
npm start
```

### Database errors
```bash
cd backend
rm db.sqlite3
python manage.py migrate
python manage.py shell < create_sample_data.py
```

### Port already in use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Documentation

- `README.md` - Project overview
- `SETUP.md` - Detailed setup instructions
- `PROJECT_SUMMARY.md` - Technical summary
- `IMPLEMENTATION_REPORT.md` - Complete implementation details
- `CONTRIBUTING.md` - Contribution guidelines

---

## 🌟 Key Features Implemented

✅ User authentication (JWT)
✅ Role-based access (Citizen, Ranger, Admin)
✅ Interactive map with Google Maps
✅ Tree adoption system
✅ Digital certificates
✅ Photo upload
✅ AI health analysis (Gemini)
✅ Community reporting
✅ Ranger verification
✅ Alert system
✅ Badge/gamification
✅ Endangered species catalog
✅ Responsive design
✅ REST API with Swagger docs

---

## 🚀 Ready for Demo!

Your platform is fully functional and ready for demonstration. Add the API keys for the complete experience, or demo the core features without them.

Good luck with your hackathon! 🌳🇰🇪

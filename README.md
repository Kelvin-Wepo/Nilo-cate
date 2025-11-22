# 🌿 Nilocate - Next-Generation AI-Powered Tree Conservation Platform

**Nilocate** is Kenya's most advanced endangered tree conservation platform, combining **Google Maps**, **AI health analysis**, **satellite monitoring**, **M-Pesa payments**, **PWA technology**, and **SMS/USSD accessibility** to create a comprehensive ecosystem where citizens, rangers, researchers, and NGOs collaborate to save endangered forests.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-5.0-darkgreen.svg)](https://www.djangoproject.com/)
[![AI Powered](https://img.shields.io/badge/AI-Gemini%201.5-purple.svg)](https://ai.google.dev/)

---

## 📊 Pitch Deck

**[View Full Pitch Deck →](https://gamma.app/docs/NILOCATE-pfku5fac94mrk5i)**

---

## 🚀 Platform Vision

**Nilocate transforms tree conservation from passive observation to active, gamified, AI-driven community action.**

Every Kenyan can:
- 📍 **Locate** endangered trees via interactive maps
- 🌳 **Adopt** trees with M-Pesa micropayments (KES 500)
- 📸 **Monitor** health with AI photo analysis
- 🛰️ **Track** real-time satellite fire alerts & forest health
- 📱 **Report** incidents via PWA, SMS, or USSD
- 🏆 **Compete** on leaderboards and earn badges
- 🎓 **Learn** through educational content
- 🤝 **Collaborate** with rangers and NGOs

---

## 🌱 The Problem We're Solving

Kenya loses **12,000 hectares** of forest annually. Endangered tree species face extinction due to:

- **🔥 Forest fires** - Early detection failures, no public alerts
- **🪓 Illegal logging** - Remote areas with limited ranger coverage  
- **🌡️ Climate stress** - Drought and disease spreading unnoticed
- **📉 Low engagement** - Communities lack tools to participate
- **📊 Data gaps** - No centralized, real-time forest health data

### Why Existing Solutions Fall Short

| Challenge | Traditional Approach | Nilocate Solution |
|-----------|---------------------|-------------------|
| **Tree visibility** | Paper maps, ranger logs | Google Maps with 24 GPS-tagged trees across 10 counties |
| **Health monitoring** | Annual manual inspections | AI photo analysis + satellite NDVI tracking |
| **Fire detection** | Delayed satellite reports | Real-time FIRMS fire alerts with SMS notifications |
| **Community action** | Donation drives | Direct tree adoption with M-Pesa, gamification, certificates |
| **Ranger tools** | Notebooks, no connectivity | Offline-first PWA with GPS-tagged photos |
| **Data access** | Siloed, unavailable | Public REST API for schools, researchers, NGOs |
| **Inclusivity** | Smartphone-only | SMS/USSD reporting for feature phones |

## ✨ Features

### 1. Interactive Endangered Tree Map
- Google Maps integration showing tree locations, species, and risk levels
- Explore forests and learn about each tree

### 2. Tree Adoption System
- Adopt endangered trees and track their health journey
- Receive updates, badges, and shareable certificates

### 3. AI-Powered Health Analysis
- Upload tree photos for AI analysis using Gemini API
- Detect disease symptoms, drought stress, and physical damage
- Receive early warnings for unhealthy trees

### 4. Community Monitoring
- Rangers, volunteers, and adopters upload updates
- Track threats like clearing, fires, or illegal logging

### 5. Ranger/Partner Dashboard
- View all adopted trees and community updates
- Confirm reports and update tree status

### 6. Educational Hub
- Information on endangered species
- Conservation participation guides
- Impact tracking for schools and groups

## 🚀 Tech Stack

### Backend
- Django 5.0
- Django REST Framework
- PostgreSQL
- Gemini AI API
- JWT Authentication

### Frontend
- React 18
- Google Maps JavaScript API
- Axios
- TailwindCSS
- React Router

## � Quick Start

### Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd Nilo-cate

# Run setup script (installs dependencies, creates .env files)
./setup.sh

# Add your API keys to:
# - backend/.env (GEMINI_API_KEY, GOOGLE_MAPS_API_KEY)
# - frontend/.env (REACT_APP_GOOGLE_MAPS_API_KEY)

# Start both servers
./start.sh
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin/
- **API Docs**: http://localhost:8000/swagger/

## �📦 Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Google Maps API Key
- Gemini API Key

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
# Edit .env with your API keys and database credentials

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm start
```

## 🗄️ Database Setup

```bash
# Create PostgreSQL database
sudo -u postgres psql
CREATE DATABASE nilocate_db;
CREATE USER nilocate_user WITH PASSWORD 'your-password';
ALTER ROLE nilocate_user SET client_encoding TO 'utf8';
ALTER ROLE nilocate_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE nilocate_user SET timezone TO 'Africa/Nairobi';
GRANT ALL PRIVILEGES ON DATABASE nilocate_db TO nilocate_user;
\q
```

## 🔑 API Keys Setup

### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Maps JavaScript API
4. Create credentials (API Key)
5. Add to `.env` file

### Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `.env` file

## 🌍 API Endpoints

### Trees
- `GET /api/trees/` - List all trees
- `GET /api/trees/{id}/` - Get tree details
- `POST /api/trees/` - Create tree (rangers only)
- `PUT /api/trees/{id}/` - Update tree
- `DELETE /api/trees/{id}/` - Delete tree

### Adoptions
- `GET /api/adoptions/` - List user adoptions
- `POST /api/adoptions/` - Adopt a tree
- `GET /api/adoptions/{id}/` - Get adoption details

### Reports
- `GET /api/reports/` - List reports
- `POST /api/reports/` - Submit report with photo
- `POST /api/reports/{id}/analyze/` - Analyze with AI
- `PUT /api/reports/{id}/verify/` - Verify report (rangers)

### Species
- `GET /api/species/` - List endangered species
- `GET /api/species/{id}/` - Get species details

## 📱 Usage

1. **Browse Map**: Explore endangered trees on the interactive map
2. **Adopt Tree**: Select and adopt a tree to monitor
3. **Upload Photos**: Take and upload photos of your adopted tree
4. **AI Analysis**: Get instant health analysis powered by Gemini AI
5. **Track Progress**: Monitor your tree's health over time
6. **Earn Badges**: Get recognition for your conservation efforts

## 🎯 Innovation

- **Public visibility** through Google Maps integration
- **AI-guided action** using Gemini for early threat detection
- **Citizen empowerment** through hands-on participation
- **Continuous feedback loop** between users, AI, and rangers
- **Scalable and affordable** - works with just smartphones

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read CONTRIBUTING.md for details.

## 📧 Contact

For questions or support, please open an issue or contact the team.

---

**Nilocate** - Turning tree conservation into an interactive, AI-powered, community-driven mission 🌳

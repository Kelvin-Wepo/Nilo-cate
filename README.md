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

## 📱 User Flows

### 👤 Citizen User Journey

```
1. Registration/Login
   └─> Select User Type: Citizen or Ranger
   └─> Complete Profile (phone, location)

2. Tree Adoption Flow
   └─> Browse Interactive Map (Google Maps)
   └─> Filter by Species/Location/Health Status
   └─> Select Endangered Tree
   └─> View Tree Details (species, location, health history)
   └─> Pay KES 500 via M-Pesa
   └─> Receive Adoption Certificate
   └─> Get SMS/Email Confirmation

3. Monitoring & Reporting
   └─> Navigate to "My Trees" Dashboard
   └─> View Health Timeline & Photos
   └─> Upload New Photo of Tree
   └─> AI Analysis (Gemini) → Instant Health Report
   └─> Submit Additional Observations
   └─> Receive Health Alerts via SMS

4. Campaign Participation
   └─> Browse Active Conservation Campaigns
   └─> Join Campaign (Individual/School/Organization)
   └─> Contribute Funds (any amount ≥ KES 10)
   └─> Vote on Conservation Priorities
   └─> Track Campaign Progress & Updates
   └─> Receive Impact Reports

5. Incident Reporting
   └─> Report Forest Threat (fire, logging, disease)
   └─> Upload Photo Evidence
   └─> Add GPS Location (auto-detected)
   └─> Choose Anonymous (Blockchain) or Public
   └─> Ranger receives alert
   └─> Track response status

6. Gamification
   └─> Earn Points for Actions
   └─> Unlock Badges (Seedling, Guardian, Forest Hero)
   └─> Climb Leaderboard
   └─> Share Achievements on Social Media
```

### 🛡️ Ranger User Journey

```
1. Ranger Registration
   └─> Provide Certification Number
   └─> Add Years of Experience
   └─> Specify Assigned Forest/County
   └─> Select Specialization
   └─> Admin Approval

2. Dashboard Access
   └─> View Command Center with Real-Time Stats
   └─> Monitor All Trees in Assigned Area
   └─> See Pending Incident Reports
   └─> Track Campaign Activities

3. Field Patrol Workflow
   └─> Access "Active Patrol" Page
   └─> Fill Advanced Incident Report:
       - Severity Level (Low/Medium/High/Critical)
       - Immediate Action Taken
       - Backup Required (Yes/No)
       - Witnesses Present
       - Evidence Collected
       - Suspect Descriptions
       - Vehicle Details
       - Estimated Damage
   └─> Upload Multiple Photos with GPS Tags
   └─> Submit to Blockchain (if sensitive)
   └─> Auto-alert nearby rangers if backup needed

4. Tree Verification
   └─> Review Citizen Reports
   └─> Verify Tree Health via Photos
   └─> Approve/Reject AI Analysis
   └─> Update Tree Status
   └─> Add Expert Comments

5. Campaign Management
   └─> Get Assigned to Campaigns
   └─> Post Weekly Field Updates (photos/videos)
   └─> Update Milestone Progress
   └─> Respond to Community Questions
   └─> Submit Spending Reports

6. Adoption Request Management
   └─> Review Tree Adoption Requests
   └─> Approve/Reject with Comments
   └─> Assign Monitoring Schedule
```

### 🏫 School/Organization User Journey

```
1. Campaign Creation
   └─> Create Forest Conservation Campaign
   └─> Set Funding Goal & Timeline
   └─> Define Budget Breakdown
   └─> Add Milestones
   └─> Invite Community Members

2. Group Participation
   └─> Join as School/Organization
   └─> Enter Organization Name
   └─> Pool Student/Employee Contributions
   └─> Track Collective Impact
   └─> Vote on Decisions Together

3. Educational Integration
   └─> Access Species Information
   └─> Download Educational Materials
   └─> Schedule Field Trips with Rangers
   └─> Monitor "School Forest"
   └─> Compete on School Leaderboard
```

---

## ⚙️ Backend Workflows

### 🔄 Tree Adoption Workflow

```
User Request → API Endpoint (/api/adoptions/)
    ↓
1. Validate User Authentication (JWT)
2. Check Tree Availability (not already adopted)
3. Initiate M-Pesa STK Push
    ↓
4. M-Pesa Callback Received
    ↓
5. Payment Verification
    ├─> Success:
    │   ├─ Create AdoptionRequest (status: pending)
    │   ├─ Assign to Ranger for Review
    │   ├─ Send SMS to User & Ranger
    │   └─ Create Blockchain Record (optional)
    └─> Failure:
        └─ Return Error + Refund Instructions
    ↓
6. Ranger Approval
    ├─> Approved:
    │   ├─ Create TreeAdoption Record
    │   ├─ Update Tree Status
    │   ├─ Generate PDF Certificate
    │   ├─ Send Certificate via Email
    │   ├─ Award Points to User
    │   └─ Update Leaderboard
    └─> Rejected:
        └─ Initiate Refund + Notify User
```

### 🔥 Real-Time Alert Workflow

```
NASA FIRMS Satellite Feed (15-min intervals)
    ↓
1. Celery Task: Check Fire Data
2. Filter by Kenya Bounding Box
3. Match with Forest Coordinates
    ↓
    Fire Detected Near Monitored Tree?
    ├─> Yes:
    │   ├─ Create Alert in Database
    │   ├─ Calculate Distance & Severity
    │   ├─ Identify Affected Trees
    │   ├─ Find Responsible Rangers
    │   ├─ Send SMS to Rangers (Africa's Talking API)
    │   ├─ Notify Tree Adopters via SMS
    │   ├─ Push Notification to PWA
    │   ├─ Update Dashboard Stats
    │   └─ Log to Blockchain
    └─> No:
        └─ Continue Monitoring
```

### 🤖 AI Health Analysis Workflow

```
User Uploads Tree Photo → /api/reports/ endpoint
    ↓
1. Image Validation (format, size)
2. Store in Media Storage (/media/reports/)
3. Extract EXIF Data (GPS, timestamp)
4. Create Report Record (status: pending)
    ↓
5. Trigger AI Analysis (/api/reports/{id}/analyze/)
    ↓
6. Send Image to Gemini 1.5 Flash
7. Prompt: "Analyze tree health, identify diseases, stress indicators"
    ↓
8. AI Response Processing
    ├─ Parse JSON Response
    ├─ Extract Health Score (0-100)
    ├─ Identify Threats (disease, drought, pests)
    ├─ Generate Recommendations
    └─ Assign Urgency Level
    ↓
9. Update Report with AI Results
10. Notify Ranger if Urgency = High
11. Send Summary to User via SMS
12. Update Tree Health History
13. Trigger Alerts if Health < 50%
```

### 🌲 Campaign Contribution Workflow

```
User Clicks "Contribute" → /api/campaigns/{slug}/contribute/
    ↓
1. Validate Authentication
2. Check Campaign Status (active/funded)
3. Validate Amount (≥ KES 10)
    ↓
4. Get or Create CampaignParticipant
    ├─ First-time: Create new participant record
    └─ Existing: Load existing record
    ↓
5. Initiate Payment (M-Pesa/Card/Bank)
6. Generate Unique Transaction ID
    ↓
7. Payment Callback
    ├─> Success:
    │   ├─ Create CampaignContribution (status: completed)
    │   ├─ Update campaign.current_funding += amount
    │   ├─ Update participant.total_contributed += amount
    │   ├─ Check if fully funded → Change status
    │   ├─ Send Thank You SMS/Email
    │   ├─ Update Leaderboard
    │   └─ Notify Campaign Creator
    └─> Failure:
        └─ Mark contribution as failed + Notify user
    ↓
8. Trigger Milestone Check
    └─ If funding goal reached → Send celebration notifications
```

### 🔐 Anonymous Incident Reporting (Blockchain)

```
Sensitive Report → /api/incidents/ (anonymous=true)
    ↓
1. User Data Anonymization
    ├─ Strip User ID
    ├─ Remove IP Address
    ├─ Mask Location (fuzzy GPS)
    └─ Generate Anonymous Hash
    ↓
2. Store in Local Database (minimal info)
3. Prepare Blockchain Transaction
    ├─ Incident Type
    ├─ Hashed Location
    ├─ Severity Level
    ├─ Timestamp
    └─ Evidence Hash (IPFS)
    ↓
4. Submit to Ethereum Smart Contract
    └─> AnonymousIncidentReporting.sol
        ├─ recordIncident(hash, severity, location)
        ├─ Emit IncidentRecorded event
        └─ Return Transaction Hash
    ↓
5. Store Blockchain TX Hash in DB
6. Rangers See Alert (no user identity)
7. Response Logged On-Chain
8. Immutable Audit Trail Created
```

### 📊 Background Task Scheduler (Celery)

```
Every 15 Minutes:
├─ check_fire_alerts() → NASA FIRMS API
├─ update_satellite_imagery() → Google Earth Engine
└─ sync_weather_data() → OpenWeatherMap API

Every Hour:
├─ generate_health_reports() → AI batch analysis
├─ send_pending_notifications() → SMS queue
└─ update_campaign_stats()

Daily (6 AM):
├─ calculate_leaderboard_rankings()
├─ send_daily_digest_emails()
├─ cleanup_old_reports()
└─ backup_critical_data()

Weekly:
├─ generate_ranger_performance_reports()
├─ send_campaign_progress_updates()
└─ audit_blockchain_records()
```

---

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

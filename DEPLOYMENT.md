# Nilocate Platform - Deployment & Configuration Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Redis (for Celery tasks)
- PostgreSQL (production) or SQLite (development)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys (see API Keys section below)
```

5. **Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Start development server**
```bash
python manage.py runserver
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Create .env file with:
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

4. **Start development server**
```bash
npm start
```

### Celery Setup (Background Tasks)

1. **Install Redis** (if not already installed)
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Start Redis
redis-server
```

2. **Start Celery worker** (in backend directory)
```bash
celery -A nilocate_project worker -l info
```

3. **Start Celery beat** (scheduled tasks - in separate terminal)
```bash
celery -A nilocate_project beat -l info
```

## 🔑 API Keys Configuration

### Required API Keys

#### 1. Google Maps API
- **Get key:** https://console.cloud.google.com/
- **Enable APIs:**
  - Maps JavaScript API
  - Places API
  - Geocoding API
- **Add to `.env`:** `GOOGLE_MAPS_API_KEY=your-key`

#### 2. Google Gemini (AI Tree Health Analysis)
- **Get key:** https://makersuite.google.com/app/apikey
- **Add to `.env`:** `GEMINI_API_KEY=your-key`

#### 3. NASA FIRMS (Fire Alerts)
- **Get key:** https://firms.modaps.eosdis.nasa.gov/api/area/
- Free for non-commercial use
- **Add to `.env`:** `NASA_FIRMS_API_KEY=your-key`

#### 4. OpenWeatherMap (Weather Data)
- **Get key:** https://openweathermap.org/api
- Free tier: 1000 calls/day
- **Add to `.env`:** `OPENWEATHER_API_KEY=your-key`

#### 5. Africa's Talking (SMS/USSD)
- **Sign up:** https://africastalking.com/
- Get API key from dashboard
- **Add to `.env`:**
  ```env
  AFRICAS_TALKING_USERNAME=sandbox  # or your username
  AFRICAS_TALKING_API_KEY=your-key
  AFRICAS_TALKING_SENDER_ID=NILOCATE
  ```

#### 6. M-Pesa Daraja API (Payments)
- **Get credentials:** https://developer.safaricom.co.ke/
- Complete documentation: https://developer.safaricom.co.ke/docs
- **Add to `.env`:**
  ```env
  MPESA_CONSUMER_KEY=your-key
  MPESA_CONSUMER_SECRET=your-secret
  MPESA_SHORTCODE=your-shortcode
  MPESA_PASSKEY=your-passkey
  MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback/
  ```

## 📱 Testing SMS/USSD Features

### SMS Commands

Test SMS functionality using **Africa's Talking simulator:**
https://simulator.africastalking.com/

**Webhook URL:** `https://yourdomain.com/api/sms/webhook/`

**Supported Commands:**

1. **Report Incident**
   ```
   REPORT TREE-001 FIRE Smoke visible near tree
   ```
   Response: "Incident reported successfully. Reference: INC-XXXXX"

2. **Check Tree Status**
   ```
   STATUS TREE-001
   ```
   Response: Tree health info (species, status, location, adoption status)

3. **Adoption Info**
   ```
   ADOPT TREE-001
   ```
   Response: Adoption details and payment instructions

4. **Help**
   ```
   HELP
   ```
   Response: List of available commands

### USSD Menu

**Dial:** `*384*2550#` (sandbox code)

**Webhook URL:** `https://yourdomain.com/api/ussd/webhook/`

**Menu Structure:**
```
Welcome to Nilocate
1. Report Incident
2. Check Tree Status
3. My Adoptions
4. Help
```

**Testing Flow:**
1. Dial USSD code in simulator
2. Select option (e.g., "1" for Report Incident)
3. Enter tree ID when prompted
4. Select incident type
5. Enter description
6. Receive confirmation

## 🌍 Production Deployment

### Environment Configuration

1. **Update .env for production**
```env
DEBUG=False
SECRET_KEY=your-strong-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@localhost:5432/nilocate_db
```

2. **Install PostgreSQL**
```bash
sudo apt-get install postgresql postgresql-contrib
pip install psycopg2-binary
```

3. **Create production database**
```bash
sudo -u postgres createdb nilocate_db
sudo -u postgres createuser nilocate_user
```

### Gunicorn (WSGI Server)

1. **Install Gunicorn**
```bash
pip install gunicorn
```

2. **Create systemd service** (`/etc/systemd/system/nilocate.service`)
```ini
[Unit]
Description=Nilocate Gunicorn Daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/Nilo-cate/backend
ExecStart=/path/to/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    nilocate_project.wsgi:application

[Install]
WantedBy=multi-user.target
```

3. **Enable and start service**
```bash
sudo systemctl enable nilocate
sudo systemctl start nilocate
```

### Nginx (Reverse Proxy)

1. **Install Nginx**
```bash
sudo apt-get install nginx
```

2. **Create Nginx configuration** (`/etc/nginx/sites-available/nilocate`)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /path/to/Nilo-cate/backend/staticfiles/;
    }

    location /media/ {
        alias /path/to/Nilo-cate/backend/media/;
    }
}
```

3. **Enable site and restart Nginx**
```bash
sudo ln -s /etc/nginx/sites-available/nilocate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Celery System Services

1. **Create Celery worker service** (`/etc/systemd/system/celery.service`)
```ini
[Unit]
Description=Celery Worker for Nilocate
After=network.target redis.service

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/path/to/Nilo-cate/backend
ExecStart=/path/to/venv/bin/celery -A nilocate_project worker -l info --detach
ExecStop=/path/to/venv/bin/celery -A nilocate_project worker --pidfile=/var/run/celery/worker.pid
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

2. **Create Celery beat service** (`/etc/systemd/system/celerybeat.service`)
```ini
[Unit]
Description=Celery Beat for Nilocate
After=network.target redis.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/path/to/Nilo-cate/backend
ExecStart=/path/to/venv/bin/celery -A nilocate_project beat -l info
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

3. **Enable and start services**
```bash
sudo systemctl enable celery celerybeat
sudo systemctl start celery celerybeat
```

## 📊 Monitoring Background Tasks

### Celery Task Schedule

| Task | Schedule | Purpose |
|------|----------|---------|
| `check_fire_alerts` | Every 6 hours (00:00, 06:00, 12:00, 18:00 EAT) | Fetch NASA FIRMS fire data, create alerts for fires within 10km |
| `update_tree_ndvi` | Daily at 2:00 AM EAT | Update vegetation health index, create alerts for stressed trees |
| `cleanup_old_alerts` | Weekly on Sunday at 3:00 AM EAT | Remove resolved alerts older than 90 days |

### Check Celery Status

```bash
# List active tasks
celery -A nilocate_project inspect active

# List scheduled tasks
celery -A nilocate_project inspect scheduled

# Check worker stats
celery -A nilocate_project inspect stats

# View registered tasks
celery -A nilocate_project inspect registered
```

### Manual Task Execution (Testing)

```python
# In Django shell (python manage.py shell)
from monitoring.tasks import check_fire_alerts, update_tree_ndvi

# Run fire alert check immediately
check_fire_alerts.delay()

# Update NDVI for all trees
update_tree_ndvi.delay()
```

## 📱 PWA Features

### Installation Instructions for Users

**On Android:**
1. Visit Nilocate website in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home Screen"
4. Confirm installation
5. App icon appears on home screen

**On iOS:**
1. Visit Nilocate website in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Confirm installation

### Offline Functionality

**Features available offline:**
- View cached tree map data
- Submit incident reports (queued)
- View previously loaded tree details
- Access ranger profile

**Background Sync:**
- Reports submitted offline are stored in IndexedDB
- Automatic sync when connection restored
- Visual indicator shows pending sync items

### Service Worker Caching Strategy

- **Static resources:** Cache-first (instant load)
- **API requests:** Network-first with cache fallback
- **Map tiles:** Cached for offline viewing
- **Photos:** Stored in IndexedDB for upload queue

## 🔧 Troubleshooting

### Redis Connection Issues

**Problem:** Celery can't connect to Redis
```
Error: redis.exceptions.ConnectionError
```

**Solution:**
```bash
# Check if Redis is running
redis-cli ping  # Should return PONG

# Start Redis if not running
redis-server

# Check Redis connection
redis-cli
> ping
> exit
```

### SMS Not Sending

**Problem:** SMS notifications not received

**Checklist:**
1. Verify Africa's Talking credentials in `.env`
2. Check sandbox vs production mode
3. Ensure phone numbers include country code (+254)
4. Check Celery worker logs for errors
5. Test webhook URL is publicly accessible
6. Verify sufficient SMS balance (production)

**Test in sandbox:**
```bash
curl -X POST https://yourdomain.com/api/sms/webhook/ \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "from=+254700000000&text=STATUS TREE-001"
```

### Fire Alerts Not Updating

**Problem:** No fire alerts being created

**Checklist:**
1. Verify NASA FIRMS API key
2. Check Celery beat is running: `ps aux | grep celery`
3. Review task logs: `celery -A nilocate_project events`
4. Manually trigger task to test: `check_fire_alerts.delay()`
5. Check if trees exist in database
6. Verify tree coordinates are in Kenya

**Test NASA FIRMS API:**
```python
from monitoring.satellite import SatelliteDataService

service = SatelliteDataService()
fires = service.get_fire_alerts()
print(f"Found {len(fires)} fires")
```

### Google Maps Not Loading

**Problem:** Map appears blank or shows "For development purposes only"

**Checklist:**
1. Verify Google Maps API key in `.env`
2. Check browser console for errors
3. Ensure billing is enabled on Google Cloud
4. Verify API restrictions (if any) allow your domain
5. Check API quota limits

**Test API key:**
```bash
curl "https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"
```

### M-Pesa Payment Failures

**Problem:** STK push not received or payment fails

**Checklist:**
1. Verify M-Pesa credentials (sandbox vs production)
2. Check phone number format: 254XXXXXXXXX
3. Ensure callback URL is publicly accessible (use ngrok for local testing)
4. Check Daraja API status: https://developer.safaricom.co.ke/
5. Review M-Pesa transaction logs

**Test with ngrok:**
```bash
ngrok http 8000
# Use ngrok URL as MPESA_CALLBACK_URL
```

### Database Migration Errors

**Problem:** Migrations fail or create duplicate fields

**Solution:**
```bash
# Reset migrations (development only)
python manage.py migrate --fake-initial

# Or start fresh
python manage.py migrate --run-syncdb

# Check migration status
python manage.py showmigrations
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
python manage.py test

# Run specific app tests
python manage.py test trees
python manage.py test monitoring

# With coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report
```

### Frontend Tests

```bash
cd frontend
npm test

# With coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### Integration Testing

**Test SMS webhook locally:**
```bash
# Terminal 1: Run Django server
python manage.py runserver

# Terminal 2: Send test SMS
curl -X POST http://localhost:8000/api/sms/webhook/ \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "from=+254700000000&text=REPORT TREE-001 FIRE Smoke visible"
```

**Test USSD webhook:**
```bash
curl -X POST http://localhost:8000/api/ussd/webhook/ \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "sessionId=ATUid_12345&phoneNumber=+254700000000&text="
```

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Celery Documentation](https://docs.celeryproject.org/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Africa's Talking API Docs](https://developers.africastalking.com/)
- [M-Pesa Daraja API Guide](https://developer.safaricom.co.ke/docs)
- [NASA FIRMS Documentation](https://firms.modaps.eosdis.nasa.gov/api/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## 🆘 Support & Contributing

**For Issues:**
- GitHub Issues: https://github.com/yourusername/nilocate/issues
- Email: support@nilocate.co.ke

**Documentation:**
- API Documentation: http://localhost:8000/swagger/
- User Guide: https://docs.nilocate.co.ke

**Contributing:**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

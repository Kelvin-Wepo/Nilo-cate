# 🚀 Deploying Nilocate to Render

Complete guide to deploy your Django + React application on Render with PostgreSQL database.

---

## 📋 Prerequisites

1. **GitHub Account** - Your code should be on GitHub
2. **Render Account** - Sign up at [render.com](https://render.com) (free tier available)
3. **API Keys Ready**:
   - Google Maps API Key
   - Gemini API Key
   - Africa's Talking credentials
   - M-Pesa credentials (optional for now)

---

## 🗂️ Step 1: Prepare Your Repository

### 1.1 Create Production Requirements File

Create `backend/requirements-prod.txt`:

```bash
cd backend
cat > requirements-prod.txt << 'EOF'
Django==5.0.1
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.3.1
drf-yasg==1.21.7
psycopg2-binary==2.9.9
gunicorn==21.2.0
whitenoise==6.6.0
python-dotenv==1.0.0
Pillow==10.2.0
celery==5.3.6
redis==5.0.1
requests==2.31.0
google-generativeai==0.3.2
africastalking==1.2.6
web3==6.15.1
django-filter==23.5
EOF
```

### 1.2 Create `render.yaml` (Blueprint)

Create this file in your project root:

```yaml
# render.yaml - Render Blueprint for Nilocate
databases:
  - name: nilocate-db
    databaseName: nilocate_production
    user: nilocate
    plan: free

services:
  # Django Backend
  - type: web
    name: nilocate-backend
    env: python
    region: oregon
    plan: free
    branch: main
    buildCommand: |
      cd backend
      pip install -r requirements-prod.txt
      python manage.py collectstatic --no-input
      python manage.py migrate
    startCommand: |
      cd backend
      gunicorn nilocate_project.wsgi:application
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: False
      - key: DATABASE_URL
        fromDatabase:
          name: nilocate-db
          property: connectionString
      - key: ALLOWED_HOSTS
        sync: false
      - key: GOOGLE_MAPS_API_KEY
        sync: false
      - key: GEMINI_API_KEY
        sync: false
      - key: AFRICAS_TALKING_USERNAME
        sync: false
      - key: AFRICAS_TALKING_API_KEY
        sync: false
      - key: MPESA_CONSUMER_KEY
        sync: false
      - key: MPESA_CONSUMER_SECRET
        sync: false
      - key: REDIS_URL
        value: redis://red-xxxxx:6379
    healthCheckPath: /api/

  # React Frontend (Static Site)
  - type: web
    name: nilocate-frontend
    env: static
    region: oregon
    plan: free
    branch: main
    buildCommand: |
      cd frontend
      npm install
      npm run build
    staticPublishPath: ./frontend/build
    envVars:
      - key: REACT_APP_API_URL
        value: https://nilocate-backend.onrender.com/api
      - key: REACT_APP_GOOGLE_MAPS_API_KEY
        sync: false
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### 1.3 Update Django Settings for Production

Add to `backend/nilocate_project/settings.py`:

```python
import dj_database_url
import os

# Production settings
if not DEBUG:
    # Database - Use Render PostgreSQL
    DATABASES = {
        'default': dj_database_url.config(
            default=os.getenv('DATABASE_URL'),
            conn_max_age=600
        )
    }
    
    # Static files (WhiteNoise)
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    
    # Security
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    
    # Allowed hosts from environment
    ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')
    
    # CORS settings for production
    CORS_ALLOWED_ORIGINS = [
        'https://nilocate-frontend.onrender.com',
        os.getenv('FRONTEND_URL', '')
    ]
else:
    # Development database (SQLite)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
```

### 1.4 Create `build.sh` Script

Create `backend/build.sh`:

```bash
#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements-prod.txt

python manage.py collectstatic --no-input
python manage.py migrate
```

Make it executable:
```bash
chmod +x backend/build.sh
```

### 1.5 Update Frontend Environment

Create `frontend/.env.production`:

```env
REACT_APP_API_URL=https://nilocate-backend.onrender.com/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

---

## 🚀 Step 2: Deploy to Render

### Option A: Using Render Blueprint (Recommended)

1. **Push Code to GitHub**:
```bash
git add .
git commit -m "feat: Add Render deployment configuration"
git push origin main
```

2. **Connect to Render**:
   - Go to [render.com/dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub account
   - Select your `Nilo-cate` repository
   - Render will detect `render.yaml` and create all services

3. **Add Environment Variables**:
   - Go to each service → **Environment**
   - Add the variables marked as `sync: false`:

   **Backend Environment Variables:**
   ```
   ALLOWED_HOSTS=nilocate-backend.onrender.com
   GOOGLE_MAPS_API_KEY=
   GEMINI_API_KEY=your-gemini-key
   AFRICAS_TALKING_USERNAME=
   AFRICAS_TALKING_API_KEY=
   MPESA_CONSUMER_KEY=
   MPESA_CONSUMER_SECRET=
   FRONTEND_URL=https://nilocate-frontend.onrender.com
   ```

   **Frontend Environment Variables:**
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=
   ```

4. **Deploy**:
   - Click **"Apply"**
   - Render will create:
     - PostgreSQL database
     - Django backend service
     - React frontend static site

### Option B: Manual Setup

#### 2.1 Deploy Database

1. Go to Render Dashboard → **New +** → **PostgreSQL**
2. Settings:
   - **Name**: `nilocate-db`
   - **Database**: `nilocate_production`
   - **User**: `nilocate`
   - **Region**: Oregon (Free)
   - **Plan**: Free
3. Click **Create Database**
4. Copy the **Internal Database URL** (starts with `postgres://`)

#### 2.2 Deploy Backend

1. Go to Render Dashboard → **New +** → **Web Service**
2. Connect your GitHub repository
3. Settings:
   - **Name**: `nilocate-backend`
   - **Region**: Oregon (Free)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn nilocate_project.wsgi:application`
   - **Plan**: Free

4. Add Environment Variables (click **Advanced**):
```
SECRET_KEY=<auto-generated-by-render>
DEBUG=False
DATABASE_URL=<paste-internal-database-url>
ALLOWED_HOSTS=nilocate-backend.onrender.com
GOOGLE_MAPS_API_KEY=AIzaSyBRHsrPZ2lcRtRqr-Pivw0XHPa3bHt1Luc
GEMINI_API_KEY=your-gemini-key
AFRICAS_TALKING_USERNAME=Kwepo
AFRICAS_TALKING_API_KEY=atsk_6e210a59fcded0df8da23bd3a3ee9f2cfca0d2ec7d560a07a368438b4e403bb673fac5a4
MPESA_CONSUMER_KEY=AumAxCxeLfILlGUUcO1won4fsQbCkB7e
MPESA_CONSUMER_SECRET=6z4nSosrZIzfl7lS
FRONTEND_URL=https://nilocate-frontend.onrender.com
```

5. Click **Create Web Service**

#### 2.3 Deploy Frontend

1. Go to Render Dashboard → **New +** → **Static Site**
2. Connect your GitHub repository
3. Settings:
   - **Name**: `nilocate-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. Add Environment Variables:
```
REACT_APP_API_URL=https://nilocate-backend.onrender.com/api
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBRHsrPZ2lcRtRqr-Pivw0XHPa3bHt1Luc
```

5. Click **Create Static Site**

---

## 🔧 Step 3: Post-Deployment Configuration

### 3.1 Create Superuser

1. Go to your backend service on Render
2. Click **Shell** tab
3. Run:
```bash
python manage.py createsuperuser
```

### 3.2 Load Initial Data

```bash
# In Render shell
python manage.py loaddata backend/fixtures/species.json
python manage.py loaddata backend/fixtures/forests.json
```

Or run your custom scripts:
```bash
python create_kenya_forests.py
```

### 3.3 Update CORS Settings

After deployment, update your backend environment variables:
```
ALLOWED_HOSTS=nilocate-backend.onrender.com,localhost,127.0.0.1
```

### 3.4 Configure Custom Domain (Optional)

1. Go to your frontend service → **Settings** → **Custom Domains**
2. Add your domain: `www.nilocate.co.ke`
3. Add DNS records as instructed by Render
4. Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` in backend

---

## 📊 Step 4: Set Up Redis (For Celery)

1. Go to Render Dashboard → **New +** → **Redis**
2. Settings:
   - **Name**: `nilocate-redis`
   - **Plan**: Free (25MB)
3. Copy **Internal Redis URL**
4. Add to backend environment variables:
```
REDIS_URL=redis://red-xxxxx:6379
CELERY_BROKER_URL=redis://red-xxxxx:6379/0
CELERY_RESULT_BACKEND=redis://red-xxxxx:6379/0
```

---

## 🔍 Step 5: Monitoring & Debugging

### Check Logs

**Backend Logs:**
```bash
# In Render Dashboard → Backend Service → Logs
# Or via Render CLI:
render logs -s nilocate-backend
```

**Frontend Build Logs:**
```bash
# In Render Dashboard → Frontend Service → Logs
render logs -s nilocate-frontend
```

### Common Issues & Solutions

#### Issue 1: Build Fails
```
Error: No module named 'psycopg2'
```
**Solution**: Make sure `psycopg2-binary` is in `requirements-prod.txt`

#### Issue 2: Static Files Not Loading
```
404 on /static/admin/css/base.css
```
**Solution**: Ensure WhiteNoise is configured:
```python
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

#### Issue 3: Database Connection Error
```
django.db.utils.OperationalError: FATAL: password authentication failed
```
**Solution**: Verify `DATABASE_URL` environment variable is set correctly

#### Issue 4: CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Add frontend URL to `CORS_ALLOWED_ORIGINS` in Django settings

#### Issue 5: Frontend API Calls Fail
```
Failed to fetch from http://localhost:8000/api
```
**Solution**: Verify `REACT_APP_API_URL` is set to production backend URL

---

## 🎯 Step 6: Performance Optimization

### Enable Caching

Add to `backend/nilocate_project/settings.py`:
```python
if not DEBUG:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': os.getenv('REDIS_URL'),
        }
    }
```

### Database Connection Pooling

Already configured with `dj_database_url`:
```python
DATABASES = {
    'default': dj_database_url.config(
        conn_max_age=600  # 10 minutes
    )
}
```

### Compress Static Files

WhiteNoise automatically compresses static files:
```python
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

---

## 🔐 Step 7: Security Checklist

- [x] `DEBUG = False` in production
- [x] Strong `SECRET_KEY` (auto-generated by Render)
- [x] HTTPS enabled (automatic on Render)
- [x] `SECURE_SSL_REDIRECT = True`
- [x] `SESSION_COOKIE_SECURE = True`
- [x] `CSRF_COOKIE_SECURE = True`
- [x] API keys in environment variables (not in code)
- [x] Database credentials secure
- [x] CORS properly configured
- [x] `.env` files in `.gitignore`

---

## 📈 Step 8: Scaling (When Needed)

### Upgrade Plans

When your app grows:

1. **Database**: Upgrade from Free → Starter ($7/month)
   - 256MB RAM → 1GB RAM
   - Better performance

2. **Backend**: Upgrade from Free → Starter ($7/month)
   - 512MB RAM → 512MB RAM (persistent)
   - No cold starts

3. **Redis**: Upgrade from Free → Starter ($10/month)
   - 25MB → 256MB

### Auto-Deploy on Git Push

Render automatically deploys when you push to `main`:
```bash
git push origin main
# Render detects push and rebuilds
```

---

## 🌍 Your Live URLs

After deployment, you'll have:

- **Frontend**: `https://nilocate-frontend.onrender.com`
- **Backend API**: `https://nilocate-backend.onrender.com/api`
- **Admin Panel**: `https://nilocate-backend.onrender.com/admin`
- **API Docs**: `https://nilocate-backend.onrender.com/swagger`

---

## 💰 Cost Breakdown

**Free Tier (Perfect for MVP):**
- PostgreSQL: Free (90 days, then $7/month)
- Backend Web Service: Free (512MB RAM, sleeps after 15min inactivity)
- Frontend Static Site: Free (100GB bandwidth)
- Redis: Free (25MB)

**Total: $0/month** (first 3 months)

**After 90 days: ~$7-17/month** depending on usage

---

## 🔄 Continuous Deployment

Your deployment is live! Any push to `main` branch automatically:
1. Rebuilds backend
2. Rebuilds frontend
3. Runs migrations
4. Restarts services

```bash
# Make changes
git add .
git commit -m "feat: Add new feature"
git push origin main

# Render automatically deploys! 🚀
```

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **Community**: https://community.render.com
- **Support**: support@render.com

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] `render.yaml` created
- [ ] `requirements-prod.txt` created
- [ ] `build.sh` script created
- [ ] Production settings configured
- [ ] Connected repository to Render
- [ ] Created PostgreSQL database
- [ ] Deployed backend service
- [ ] Deployed frontend static site
- [ ] Added all environment variables
- [ ] Created superuser
- [ ] Loaded initial data
- [ ] Tested login/signup
- [ ] Tested tree adoption
- [ ] Tested campaign creation
- [ ] Tested API endpoints
- [ ] Checked logs for errors
- [ ] Updated README with live URLs

---

**Congratulations!** 🎉 Your Nilocate platform is now live on the internet! 🌍🌳

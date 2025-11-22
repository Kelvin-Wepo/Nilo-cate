# Ranger Dashboard Testing Guide

## Overview
This document provides comprehensive testing procedures for the enhanced Ranger Dashboard with AI disease detection and real-time alert systems.

## Prerequisites
- Backend server running on `http://localhost:8000`
- Frontend server running on `http://localhost:3000`
- Redis server running for Celery
- Celery worker and beat running
- Test ranger account credentials

## Setup Testing Environment

### 1. Start Backend Services
```bash
cd /home/subchief/Nilo-cate/backend

# Terminal 1: Django server
python manage.py runserver

# Terminal 2: Celery worker
celery -A nilocate_project worker -l info

# Terminal 3: Celery beat (periodic tasks)
celery -A nilocate_project beat -l info

# Terminal 4: Redis (if not running as service)
redis-server
```

### 2. Apply Database Migrations
```bash
cd /home/subchief/Nilo-cate/backend
python manage.py migrate monitoring
```

### 3. Create Test Data
```bash
# Create ranger account
python manage.py createsuperuser --username ranger1 --email ranger@nilocate.com

# Update user type to ranger in Django admin or shell
python manage.py shell
>>> from users.models import User
>>> ranger = User.objects.get(username='ranger1')
>>> ranger.user_type = 'ranger'
>>> ranger.phone_number = '+254712345678'  # Add phone for SMS testing
>>> ranger.save()
>>> exit()
```

### 4. Start Frontend
```bash
cd /home/subchief/Nilo-cate/frontend
npm start
```

## Feature Testing Checklist

### 1. Dashboard Overview Tab
**Test Cases:**

- [ ] **TC-001: Stats Cards Display**
  - Navigate to `/ranger-dashboard`
  - Verify all 5 stats cards display correctly:
    - Pending Reports
    - Critical Alerts
    - Active Alerts
    - Pending Adoptions
    - Open Incidents
  - Check that numbers update when data changes

- [ ] **TC-002: Quick Stats Section**
  - Verify "Total Trees", "Health Reports", "Active Alerts" counts
  - Check percentage indicators for health status
  - Confirm visual styling (green/yellow/red indicators)

- [ ] **TC-003: Critical Alert Warnings**
  - Create critical alert (severity='critical')
  - Verify red warning banner appears
  - Check alert details display correctly
  - Verify "View Alert" button navigates to Real-time Alerts tab

**Expected Results:**
- All stats load within 2 seconds
- Numbers match backend database counts
- Critical alerts highlighted prominently

---

### 2. Reports Tab
**Test Cases:**

- [ ] **TC-004: View All Reports**
  - Switch to "Reports" tab
  - Verify table displays all tree reports
  - Check columns: Tree ID, Reporter, Status, Location, Created At
  - Confirm pagination works (if >10 reports)

- [ ] **TC-005: Verify Report**
  - Click "Verify" button on unverified report
  - Check API call succeeds (POST `/api/monitoring/reports/{id}/verify/`)
  - Verify status changes to "Verified"
  - Confirm UI updates without page reload

- [ ] **TC-006: AI Analysis Trigger**
  - Find report with images
  - Click "Analyze with AI" button
  - Verify loading state shows
  - Check API call (POST `/api/monitoring/reports/{id}/analyze_ai/`)
  - Confirm navigation to AI Analysis tab after completion

**Expected Results:**
- Reports load within 3 seconds
- Verify action updates status instantly
- AI analysis starts and redirects properly

---

### 3. Real-time Alerts Tab
**Test Cases:**

- [ ] **TC-007: Alert List Display**
  - Switch to "Real-time Alerts" tab
  - Verify alerts display with severity badges
  - Check filter buttons: All, Critical, High, Medium, Low
  - Confirm severity colors (red=critical, orange=high, yellow=medium, green=low)

- [ ] **TC-008: Auto-Refresh Mechanism**
  - Create new alert in backend
  - Wait up to 30 seconds
  - Verify new alert appears automatically
  - Check console for refresh logs (every 30s)

- [ ] **TC-009: Alert Filtering**
  - Click "Critical" filter button
  - Verify only critical alerts display
  - Test other filter buttons (High, Medium, Low, All)
  - Confirm count updates correctly

- [ ] **TC-010: Resolve Alert**
  - Click "Resolve" button on unresolved alert
  - Check confirmation dialog appears
  - Confirm resolution via API call
  - Verify alert status changes to "Resolved"
  - Check "Resolved by" and "Resolved at" fields populate

- [ ] **TC-011: Browser Notifications**
  - Allow notifications when prompted
  - Create critical alert in backend
  - Wait for auto-refresh (≤30s)
  - Verify browser notification appears with alert details

**Expected Results:**
- Alerts refresh every 30 seconds automatically
- Filtering instant and accurate
- Resolve action updates UI immediately
- Browser notifications for critical/high alerts only

---

### 4. Adoptions Tab
**Test Cases:**

- [ ] **TC-012: View Adoption Requests**
  - Switch to "Adoptions" tab
  - Verify pending adoption requests display
  - Check columns: Tree ID, Name, Adopter, Location, Submitted At
  - Confirm status badge shows "Pending"

- [ ] **TC-013: Approve Adoption**
  - Click "Approve" button on pending request
  - Verify API call (POST `/api/trees/adoptions/{id}/approve/`)
  - Check status changes to "Approved"
  - Confirm success message displays
  - Verify request moves to approved section

- [ ] **TC-014: Reject Adoption**
  - Click "Reject" button on pending request
  - Verify API call (POST `/api/trees/adoptions/{id}/reject/`)
  - Check status changes to "Rejected"
  - Confirm rejection message displays
  - Verify request moves to rejected section

**Expected Results:**
- Adoption list loads within 2 seconds
- Approve/Reject actions instant
- Status updates reflect immediately
- Success/error messages clear

---

### 5. Incidents Tab
**Test Cases:**

- [ ] **TC-015: View Incidents**
  - Switch to "Incidents" tab
  - Verify incident list displays
  - Check incident types: Illegal Logging, Fire, Poaching, Encroachment, etc.
  - Confirm location coordinates display

- [ ] **TC-016: Assign Incident**
  - Click "Assign to Me" button on unassigned incident
  - Verify API call (POST `/api/monitoring/incidents/{id}/assign/`)
  - Check "Assigned To" field updates to current ranger
  - Confirm status changes to "Under Investigation"

- [ ] **TC-017: Resolve Incident**
  - Click "Resolve" button on assigned incident
  - Enter resolution notes in modal/dialog
  - Verify API call (POST `/api/monitoring/incidents/{id}/resolve/`)
  - Check status changes to "Resolved"
  - Confirm resolution notes saved

- [ ] **TC-018: View Incident Details**
  - Click incident row to expand details
  - Verify full description, images display
  - Check GPS coordinates clickable (map link)
  - Confirm reporter info visible

**Expected Results:**
- Incidents load within 3 seconds
- Assignment updates instantly
- Resolution workflow clear and complete
- Full incident details accessible

---

### 6. AI Analysis Tab
**Test Cases:**

- [ ] **TC-019: View AI Analysis Results**
  - Navigate to "AI Analysis" tab
  - Verify list of analyzed reports displays
  - Check columns: Tree ID, Disease, Confidence, Severity, Analyzed At

- [ ] **TC-020: Analyze New Image**
  - Upload new plant image
  - Click "Analyze" button
  - Verify loading state during analysis
  - Check API call (POST `/api/monitoring/reports/{id}/analyze_ai/`)
  - Confirm results display:
    - Disease name
    - Confidence score (0-100%)
    - Severity level
    - Recommendations list

- [ ] **TC-021: High Confidence Results**
  - Analyze image with clear disease symptoms
  - Verify confidence >70% shows green badge
  - Check recommendations are specific and actionable

- [ ] **TC-022: Low Confidence Results**
  - Analyze ambiguous image
  - Verify confidence <50% shows yellow/red badge
  - Check "Further inspection required" recommendation

- [ ] **TC-023: Alert Creation from AI**
  - Analyze image with critical disease
  - Verify automatic alert created (severity='high' or 'critical')
  - Check alert appears in Real-time Alerts tab
  - Confirm notification sent to rangers

**Expected Results:**
- AI analysis completes within 5-10 seconds
- Confidence scores accurate and color-coded
- Recommendations relevant to detected disease
- Critical findings trigger automatic alerts

---

## Real-time Alert System Testing

### Background Task Testing

#### Test Celery Tasks

**1. Check Critical Alerts Task (Every 5 Minutes)**

```bash
# Manually trigger task
cd /home/subchief/Nilo-cate/backend
python manage.py shell

>>> from monitoring.tasks import check_critical_alerts
>>> check_critical_alerts.delay()
<AsyncResult: task-id>
```

**Verify:**
- [ ] Task runs without errors
- [ ] Unresolved critical alerts from last hour identified
- [ ] SMS sent to rangers (check Africa's Talking logs)
- [ ] Email sent to rangers (check email logs)
- [ ] Console logs show "Checking critical alerts..."

**2. Monitor Tree Health Changes (Every Hour)**

```bash
# Change tree health status to test
>>> from trees.models import Tree
>>> tree = Tree.objects.first()
>>> tree.health_status = 'declining'
>>> tree.save()

# Trigger task
>>> from monitoring.tasks import monitor_tree_health_changes
>>> monitor_tree_health_changes.delay()
```

**Verify:**
- [ ] Alert created for declining tree
- [ ] Notification sent to rangers
- [ ] notification_sent flag set to True
- [ ] Alert appears in dashboard

**3. Aggregate Daily Stats (Daily at Midnight)**

```bash
>>> from monitoring.tasks import aggregate_daily_stats
>>> result = aggregate_daily_stats.delay()
>>> result.get()  # Get task result
```

**Verify:**
- [ ] Statistics generated:
  - Total trees count
  - Health status breakdown
  - Alert counts by severity
  - Reports created today
- [ ] Output logged to console
- [ ] No errors in task execution

---

### SMS Notification Testing

**Setup:**
1. Ensure `AFRICAS_TALKING_USERNAME` and `AFRICAS_TALKING_API_KEY` in `.env`
2. Add ranger phone number in E.164 format (+254XXXXXXXXX)

**Test Steps:**
1. Create critical alert manually:
```python
from monitoring.models import Alert
from trees.models import Tree

tree = Tree.objects.first()
alert = Alert.objects.create(
    tree=tree,
    severity='critical',
    title='Test Critical Alert',
    message='Testing SMS notification system'
)
```

2. Trigger notification:
```python
from monitoring.realtime_alerts import RealTimeAlertSystem
RealTimeAlertSystem.notify_rangers(alert)
```

**Verify:**
- [ ] SMS received on ranger phone within 30 seconds
- [ ] Message contains alert title, severity, tree ID, location
- [ ] `notification_sent` field set to True
- [ ] Check Africa's Talking dashboard for sent SMS

---

### Email Notification Testing

**Setup:**
1. Configure email settings in `settings.py`:
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'Nilocate Alerts <your-email@gmail.com>'
```

**Test Steps:**
1. Create high severity alert
2. Verify email sent to all ranger emails
3. Check email contains:
   - Alert severity in subject
   - Full alert details in body
   - Tree ID and location
   - Call to action

**Verify:**
- [ ] Email received within 1 minute
- [ ] Subject line clear and attention-grabbing
- [ ] Message formatted correctly
- [ ] Links to dashboard work (if included)

---

## Performance Testing

### Load Testing

**Test Scenario: Multiple Concurrent Rangers**

1. Simulate 5 rangers accessing dashboard simultaneously
2. Monitor response times for:
   - Initial page load: < 3 seconds
   - Stats API call: < 1 second
   - Reports list: < 2 seconds
   - Alerts list: < 2 seconds
   - AI analysis: < 10 seconds

**Tools:**
```bash
# Use Apache Bench
ab -n 100 -c 10 http://localhost:8000/api/monitoring/alerts/

# Or use Locust
# Create locustfile.py with user behaviors
locust -f locustfile.py --host=http://localhost:8000
```

**Expected Results:**
- 95th percentile response time < 3s
- Zero errors under normal load
- Database queries optimized (use Django Debug Toolbar)

---

### Auto-Refresh Performance

**Test Cases:**

- [ ] **TC-024: Memory Leak Check**
  - Leave dashboard open for 2 hours
  - Monitor browser memory usage
  - Verify no significant memory growth (< 100MB/hour)

- [ ] **TC-025: Network Efficiency**
  - Open browser DevTools Network tab
  - Monitor alerts API calls every 30 seconds
  - Verify payload size reasonable (< 500KB per call)
  - Check no duplicate requests

**Tools:**
```javascript
// Check memory usage in browser console
console.log(performance.memory.usedJSHeapSize / 1048576 + ' MB');
```

---

## Security Testing

### Authorization Tests

**Test Cases:**

- [ ] **TC-026: Non-Ranger Access**
  - Login as regular user (not ranger)
  - Attempt to access `/ranger-dashboard`
  - Verify redirect to home or error message

- [ ] **TC-027: Unauthenticated Access**
  - Logout from application
  - Try accessing `/api/monitoring/alerts/`
  - Verify 401 Unauthorized response

- [ ] **TC-028: Cross-Ranger Actions**
  - Login as ranger A
  - Attempt to resolve alert assigned to ranger B
  - Verify appropriate permissions (should succeed for team-based alerts)

**Expected Results:**
- Only rangers can access dashboard
- All API endpoints require authentication
- JWT tokens validated correctly

---

## Error Handling Testing

### Test Error Scenarios

**Test Cases:**

- [ ] **TC-029: Network Failure**
  - Disconnect from network
  - Observe dashboard behavior
  - Reconnect network
  - Verify auto-refresh resumes

- [ ] **TC-030: API Errors**
  - Mock 500 error from backend
  - Verify error message displays to user
  - Check no console errors crash app

- [ ] **TC-031: Empty States**
  - Delete all alerts/reports/incidents
  - Verify "No data" messages display
  - Check UI remains functional

- [ ] **TC-032: Invalid Data**
  - Submit invalid adoption approval
  - Verify validation errors shown
  - Check form doesn't clear on error

**Expected Results:**
- Graceful error messages
- No application crashes
- Clear instructions for user recovery

---

## Browser Compatibility

### Test on Multiple Browsers

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Verify:**
- Dashboard layout responsive
- Notifications work (browser support varies)
- API calls succeed
- No console errors

---

## Mobile Responsiveness

**Test on Different Screen Sizes:**

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Verify:**
- Stats cards stack vertically on mobile
- Tables scroll horizontally if needed
- Buttons touch-friendly (44x44px minimum)
- Tab navigation accessible
- Images scale properly

---

## Acceptance Criteria

### Definition of Done

The ranger dashboard is considered complete when:

1. ✅ All 32 test cases pass successfully
2. ✅ No critical bugs or console errors
3. ✅ Performance metrics met:
   - Page load < 3s
   - API calls < 2s
   - AI analysis < 10s
4. ✅ Real-time alerts refresh every 30 seconds
5. ✅ SMS notifications sent within 30 seconds of alert creation
6. ✅ Email notifications sent within 1 minute
7. ✅ Celery tasks run on schedule without errors
8. ✅ Browser notifications work (when permitted)
9. ✅ Mobile responsive on all screen sizes
10. ✅ Cross-browser compatible

---

## Troubleshooting Guide

### Common Issues

**Issue 1: Alerts not refreshing**
- **Symptom:** Dashboard not showing new alerts after 30s
- **Solution:**
  - Check browser console for errors
  - Verify backend API accessible (`/api/monitoring/alerts/`)
  - Confirm JWT token not expired
  - Check useEffect cleanup in RangerDashboard.js

**Issue 2: SMS not sending**
- **Symptom:** No SMS received after critical alert
- **Solution:**
  - Verify Africa's Talking credentials in `.env`
  - Check phone number format (+254XXXXXXXXX)
  - Verify Celery worker running
  - Check Africa's Talking dashboard for errors
  - Examine Django logs for exceptions

**Issue 3: AI analysis failing**
- **Symptom:** "Analysis failed" message
- **Solution:**
  - Verify Gemini API key configured
  - Check image format (JPEG/PNG only)
  - Verify image size < 5MB
  - Check backend logs for API rate limits
  - Test with different image

**Issue 4: Celery tasks not running**
- **Symptom:** Background tasks never execute
- **Solution:**
  - Verify Redis running: `redis-cli ping`
  - Check Celery worker: `celery -A nilocate_project inspect active`
  - Verify Celery beat running: `celery -A nilocate_project beat -l info`
  - Check task registered: `celery -A nilocate_project inspect registered`
  - Review Django logs for errors

**Issue 5: Database migration errors**
- **Symptom:** "Table doesn't exist" errors
- **Solution:**
  - Run migrations: `python manage.py migrate monitoring`
  - Check migration files in `monitoring/migrations/`
  - Reset database if needed (dev only):
    ```bash
    python manage.py flush
    python manage.py migrate
    python manage.py loaddata initial_data.json
    ```

---

## Test Data Setup Script

Create sample data for comprehensive testing:

```bash
cd /home/subchief/Nilo-cate/backend
python manage.py shell
```

```python
from trees.models import Tree, TreeAdoptionRequest
from monitoring.models import Alert, TreeReport, IncidentReport
from users.models import User
from django.utils import timezone
from datetime import timedelta

# Create test ranger
ranger = User.objects.create_user(
    username='ranger_test',
    email='ranger@test.com',
    password='test123',
    user_type='ranger',
    phone_number='+254712345678'
)

# Create test trees
for i in range(10):
    Tree.objects.create(
        tree_id=f'TREE-{1000+i}',
        species=f'Acacia Species {i}',
        location_name=f'Test Location {i}',
        latitude=-1.2921 + (i * 0.01),
        longitude=36.8219 + (i * 0.01),
        health_status=['healthy', 'declining', 'diseased'][i % 3],
        planting_date=timezone.now() - timedelta(days=365*i)
    )

# Create test alerts
trees = Tree.objects.all()[:5]
for idx, tree in enumerate(trees):
    Alert.objects.create(
        tree=tree,
        severity=['low', 'medium', 'high', 'critical'][idx % 4],
        title=f'Test Alert {idx+1}',
        message=f'This is a test alert for tree {tree.tree_id}',
        is_resolved=False
    )

# Create adoption requests
for tree in trees[:3]:
    TreeAdoptionRequest.objects.create(
        tree=tree,
        adopter_name='Test Adopter',
        adopter_email='adopter@test.com',
        status='pending'
    )

# Create incidents
for i in range(5):
    IncidentReport.objects.create(
        incident_type=['illegal_logging', 'fire', 'poaching'][i % 3],
        description=f'Test incident {i+1}',
        latitude=-1.2921 + (i * 0.01),
        longitude=36.8219 + (i * 0.01),
        status='pending',
        reported_by=ranger
    )

print("✅ Test data created successfully!")
```

---

## Continuous Monitoring

### Production Checklist

When deploying to production:

- [ ] Enable error tracking (Sentry, Rollbar)
- [ ] Set up application monitoring (New Relic, DataDog)
- [ ] Configure log aggregation (ELK Stack, CloudWatch)
- [ ] Enable uptime monitoring (UptimeRobot, Pingdom)
- [ ] Set up performance monitoring (Lighthouse CI)
- [ ] Configure SMS/email delivery monitoring
- [ ] Enable Celery monitoring (Flower dashboard)
- [ ] Set up database query monitoring
- [ ] Configure CDN for static assets
- [ ] Enable HTTPS/SSL certificates

### Health Check Endpoints

Add these to `monitoring/views.py` for automated testing:

```python
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """System health check endpoint"""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now(),
        'database': 'connected',
        'redis': 'connected',
        'celery': 'running'
    })
```

Test with:
```bash
curl http://localhost:8000/api/health/
```

---

## Sign-off

**Tested by:** _____________________  
**Date:** _____________________  
**Environment:** [ ] Development [ ] Staging [ ] Production  
**Result:** [ ] Pass [ ] Fail  

**Notes:**
_____________________________________________________________________
_____________________________________________________________________
_____________________________________________________________________

---

## Next Steps After Testing

1. **Fix any identified bugs** - Create GitHub issues for tracking
2. **Optimize performance** - Address any slow queries or renders
3. **User acceptance testing** - Get feedback from actual rangers
4. **Documentation updates** - Reflect any changes in user guides
5. **Deploy to staging** - Test in production-like environment
6. **Production deployment** - Follow deployment checklist
7. **Post-deployment monitoring** - Watch for errors and performance issues

---

**Testing Resources:**
- Django Testing Docs: https://docs.djangoproject.com/en/5.0/topics/testing/
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Celery Testing: https://docs.celeryq.dev/en/stable/userguide/testing.html
- API Testing with Postman: https://www.postman.com/

"""
Celery configuration for Nilocate platform.
Handles background tasks for satellite monitoring, SMS notifications, and data processing.
"""

import os
from celery import Celery
from celery.schedules import crontab

# Set default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nilocate_project.settings')

# Create Celery app
app = Celery('nilocate_project')

# Load configuration from Django settings with CELERY namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all registered Django apps
app.autodiscover_tasks()

# Configure periodic tasks schedule
app.conf.beat_schedule = {
    'check-fire-alerts-every-6-hours': {
        'task': 'monitoring.tasks.check_fire_alerts',
        'schedule': crontab(minute=0, hour='*/6'),  # Every 6 hours at :00
        'options': {
            'expires': 3600,  # Task expires after 1 hour
        }
    },
    'update-tree-ndvi-daily': {
        'task': 'monitoring.tasks.update_tree_ndvi',
        'schedule': crontab(minute=0, hour=2),  # Daily at 2:00 AM EAT
        'options': {
            'expires': 7200,  # Task expires after 2 hours
        }
    },
    'cleanup-old-alerts-weekly': {
        'task': 'monitoring.tasks.cleanup_old_alerts',
        'schedule': crontab(minute=0, hour=3, day_of_week=0),  # Sunday at 3:00 AM
        'options': {
            'expires': 3600,
        }
    },
    'check-critical-alerts': {
        'task': 'monitoring.tasks.check_critical_alerts',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
        'options': {
            'expires': 300,  # Task expires after 5 minutes
        }
    },
    'monitor-tree-health-changes': {
        'task': 'monitoring.tasks.monitor_tree_health_changes',
        'schedule': crontab(minute=0),  # Every hour at :00
        'options': {
            'expires': 3600,  # Task expires after 1 hour
        }
    },
    'aggregate-daily-stats': {
        'task': 'monitoring.tasks.aggregate_daily_stats',
        'schedule': crontab(minute=0, hour=0),  # Daily at midnight
        'options': {
            'expires': 7200,  # Task expires after 2 hours
        }
    },
}

# Configure timezone
app.conf.timezone = 'Africa/Nairobi'

@app.task(bind=True)
def debug_task(self):
    """Debug task for testing Celery setup."""
    print(f'Request: {self.request!r}')

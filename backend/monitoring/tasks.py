"""
Celery tasks for background processing
Handles periodic satellite data updates, SMS notifications, etc.
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .satellite import SatelliteDataService
from .models import Alert, Tree


@shared_task
def check_fire_alerts():
    """
    Periodic task to check for fire alerts near trees
    Run every 6 hours
    """
    print("Starting fire alert check...")
    satellite_service = SatelliteDataService()
    
    alerts_created = satellite_service.check_fires_near_trees(radius_km=10)
    
    print(f"Fire alert check complete. {alerts_created} new alerts created.")
    
    # Send SMS notifications to adopters
    if alerts_created > 0:
        notify_fire_alerts.delay()
    
    return alerts_created


@shared_task
def notify_fire_alerts():
    """Send SMS notifications for critical fire alerts"""
    from users.models import User
    
    # Get critical unresolved fire alerts from last 24 hours
    recent_alerts = Alert.objects.filter(
        severity='critical',
        is_resolved=False,
        title__icontains='Fire Alert',
        created_at__gte=timezone.now() - timedelta(hours=24)
    ).select_related('tree')
    
    for alert in recent_alerts:
        # Get adopters of this tree
        adopters = User.objects.filter(
            adoptions__tree=alert.tree,
            adoptions__is_active=True
        ).distinct()
        
        for adopter in adopters:
            if adopter.phone_number:
                send_sms_alert.delay(
                    adopter.phone_number,
                    f"URGENT: Fire detected near your adopted tree {alert.tree.tree_id}. "
                    f"{alert.message[:100]}. Check Nilocate app for details."
                )


@shared_task
def send_sms_alert(phone_number, message):
    """
    Send SMS notification using Africa's Talking
    """
    import os
    
    # Africa's Talking credentials
    username = os.environ.get('AFRICAS_TALKING_USERNAME', 'sandbox')
    api_key = os.environ.get('AFRICAS_TALKING_API_KEY', '')
    
    if not api_key:
        print(f"SMS not configured. Would send to {phone_number}: {message}")
        return False
    
    try:
        import africastalking
        
        africastalking.initialize(username, api_key)
        sms = africastalking.SMS
        
        response = sms.send(message, [phone_number])
        print(f"SMS sent successfully: {response}")
        return True
        
    except Exception as e:
        print(f"Error sending SMS: {e}")
        return False


@shared_task
def send_adoption_sms(phone_number, user_name, tree_id, species_name, certificate_number):
    """
    Send adoption confirmation SMS via Africa's Talking
    """
    message = f"""Thank you for adopting a tree, {user_name}!

Tree Details:
- Species: {species_name}
- ID: {tree_id}
- Certificate: {certificate_number}

You're now protecting an endangered tree! We'll send you regular updates on your tree's health.

Kenya Forest Conservation Initiative"""
    
    return send_sms_alert(phone_number, message)


@shared_task
def update_tree_ndvi():
    """
    Update NDVI values for all trees
    Run daily
    """
    satellite_service = SatelliteDataService()
    trees = Tree.objects.all()
    
    updated_count = 0
    
    for tree in trees:
        ndvi_data = satellite_service.get_ndvi_estimate(
            float(tree.latitude),
            float(tree.longitude)
        )
        
        # Store NDVI in tree notes or create separate model
        tree.notes += f"\n[NDVI {ndvi_data['date']}]: {ndvi_data['ndvi']} ({ndvi_data['status']})"
        tree.save()
        
        # Create alert if NDVI shows stress
        if ndvi_data['ndvi'] < 0.4 and tree.health_status == 'healthy':
            Alert.objects.create(
                tree=tree,
                severity='medium',
                title='Vegetation stress detected',
                message=f"NDVI analysis shows vegetation stress (NDVI: {ndvi_data['ndvi']}). "
                        f"Possible drought or disease. Recommend ranger inspection."
            )
            
            updated_count += 1
    
    print(f"NDVI update complete. {updated_count} trees updated.")
    return updated_count


@shared_task
def send_adoption_certificate(adoption_id):
    """Generate and email adoption certificate"""
    from trees.models import TreeAdoption
    from django.core.mail import send_mail
    
    try:
        adoption = TreeAdoption.objects.select_related('user', 'tree').get(id=adoption_id)
        
        # In production, generate PDF certificate
        certificate_text = f"""
        🌿 NILOCATE TREE ADOPTION CERTIFICATE 🌿
        
        Certificate No: {adoption.certificate_number}
        
        This certifies that {adoption.user.username} has officially adopted:
        
        Tree ID: {adoption.tree.tree_id}
        Species: {adoption.tree.species.name}
        Location: {adoption.tree.location_name}
        Adoption Date: {adoption.adoption_date.strftime('%B %d, %Y')}
        
        Carbon Offset: ~22 kg CO₂ per year
        
        Thank you for protecting Kenya's endangered forests!
        
        - Nilocate Team
        """
        
        if adoption.user.email:
            send_mail(
                subject=f'Your Tree Adoption Certificate - {adoption.tree.tree_id}',
                message=certificate_text,
                from_email='noreply@nilocate.co.ke',
                recipient_list=[adoption.user.email],
                fail_silently=False,
            )
            
            print(f"Certificate sent to {adoption.user.email}")
            return True
    
    except Exception as e:
        print(f"Error sending certificate: {e}")
        return False


@shared_task
def process_sms_report(phone_number, message_text):
    """
    Process SMS incident report
    Format: REPORT [TREE_ID] [TYPE] [DETAILS]
    """
    from monitoring.models import IncidentReport, TreeReport
    from users.models import User
    from trees.models import Tree
    
    try:
        # Parse SMS
        parts = message_text.strip().split(' ', 3)
        
        if len(parts) < 4 or parts[0].upper() != 'REPORT':
            return False
        
        tree_id = parts[1].upper()
        incident_type = parts[2].lower()
        details = parts[3]
        
        # Find tree
        try:
            tree = Tree.objects.get(tree_id__iexact=tree_id)
        except Tree.DoesNotExist:
            send_sms_alert.delay(
                phone_number,
                f"Tree {tree_id} not found. Visit nilocate.co.ke/map to find valid tree IDs."
            )
            return False
        
        # Find user by phone
        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            # Create anonymous report
            user = User.objects.filter(user_type='admin').first()
        
        # Map incident types
        incident_type_map = {
            'fire': 'fire',
            'logging': 'illegal_logging',
            'poaching': 'poaching',
            'damage': 'vandalism'
        }
        
        incident_type = incident_type_map.get(incident_type, 'other')
        
        # Create incident report
        incident = IncidentReport.objects.create(
            reporter=user,
            incident_type=incident_type,
            title=f"SMS Report: {incident_type}",
            description=details,
            location_name=tree.location_name,
            latitude=tree.latitude,
            longitude=tree.longitude,
            priority='urgent' if incident_type == 'fire' else 'medium'
        )
        
        # Send confirmation
        send_sms_alert.delay(
            phone_number,
            f"Report received for tree {tree_id}. Reference: INC-{incident.id}. "
            f"Rangers will investigate. Thank you!"
        )
        
        return True
        
    except Exception as e:
        print(f"Error processing SMS report: {e}")
        return False


@shared_task
def cleanup_old_alerts():
    """Remove resolved alerts older than 90 days"""
    from django.utils import timezone
    from datetime import timedelta
    
    cutoff_date = timezone.now() - timedelta(days=90)
    deleted_count = Alert.objects.filter(
        is_resolved=True,
        resolved_at__lt=cutoff_date
    ).delete()[0]
    
    print(f"Cleaned up {deleted_count} old alerts")
    return deleted_count


@shared_task
def check_critical_alerts():
    """
    Real-time alert monitoring - runs every 5 minutes
    Checks for new critical conditions and notifies rangers
    """
    from .realtime_alerts import RealTimeAlertSystem
    
    # Check for declining health trends
    RealTimeAlertSystem.check_tree_health_trends()
    
    # Get unresolved critical alerts from last hour
    recent_critical = Alert.objects.filter(
        severity='critical',
        is_resolved=False,
        created_at__gte=timezone.now() - timedelta(hours=1)
    )
    
    # Notify rangers of any new critical alerts
    for alert in recent_critical:
        if not hasattr(alert, 'notification_sent') or not alert.notification_sent:
            RealTimeAlertSystem.notify_rangers(alert)
            # Mark as notified (you may want to add this field to Alert model)
    
    return recent_critical.count()


@shared_task
def monitor_tree_health_changes():
    """
    Monitor for sudden tree health status changes
    Creates alerts when trees transition to worse health states
    """
    from trees.models import Tree
    from .realtime_alerts import create_alert_from_report
    
    # Get trees that recently changed to poor health
    recently_declining = Tree.objects.filter(
        health_status__in=['declining', 'diseased', 'dead'],
        updated_at__gte=timezone.now() - timedelta(hours=1)
    )
    
    alerts_created = 0
    for tree in recently_declining:
        # Check if alert already exists
        existing_alert = Alert.objects.filter(
            tree=tree,
            is_resolved=False,
            created_at__gte=timezone.now() - timedelta(days=1)
        ).exists()
        
        if not existing_alert:
            alert = Alert.objects.create(
                tree=tree,
                severity='high' if tree.health_status == 'diseased' else 'medium',
                title=f"Tree Health Status Changed: {tree.health_status.title()}",
                message=f"Tree {tree.tree_id} at {tree.location_name} has changed to {tree.health_status} status. Immediate ranger inspection recommended."
            )
            
            from .realtime_alerts import RealTimeAlertSystem
            RealTimeAlertSystem.notify_rangers(alert)
            alerts_created += 1
    
    return alerts_created


@shared_task
def aggregate_daily_stats():
    """
    Generate daily statistics for ranger dashboard
    Runs once per day
    """
    from django.db.models import Count, Q
    from trees.models import Tree
    
    stats = {
        'date': timezone.now().date(),
        'total_trees': Tree.objects.count(),
        'healthy_trees': Tree.objects.filter(health_status='healthy').count(),
        'declining_trees': Tree.objects.filter(health_status='declining').count(),
        'diseased_trees': Tree.objects.filter(health_status='diseased').count(),
        'active_alerts': Alert.objects.filter(is_resolved=False).count(),
        'critical_alerts': Alert.objects.filter(severity='critical', is_resolved=False).count(),
        'reports_today': Tree.objects.filter(
            reports__created_at__date=timezone.now().date()
        ).count(),
    }
    
    # Log stats or store in database
    print(f"Daily Stats: {stats}")
    return stats

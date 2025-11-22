"""
Real-time Alert System for Rangers
Provides instant notifications for critical events
"""
from django.core.mail import send_mail
from django.conf import settings
from monitoring.tasks import send_sms_alert
from monitoring.models import Alert
import logging

logger = logging.getLogger(__name__)


class RealTimeAlertSystem:
    """Handles real-time alert notifications to rangers"""
    
    @staticmethod
    def notify_rangers(alert):
        """
        Send real-time notifications to all active rangers
        
        Args:
            alert: Alert instance
        """
        from users.models import User
        
        # Get all rangers
        rangers = User.objects.filter(user_type='ranger', is_active=True)
        
        if not rangers.exists():
            logger.warning("No active rangers to notify")
            return
        
        # Prepare notification message
        message = f"""
🚨 ALERT: {alert.title}

Severity: {alert.severity.upper()}
Tree: {alert.tree.tree_id}
Location: {alert.tree.location_name}

{alert.message}

Please take immediate action.
        """
        
        # Send SMS to rangers for critical alerts
        if alert.severity in ['critical', 'high']:
            for ranger in rangers:
                if ranger.phone_number:
                    try:
                        send_sms_alert.delay(
                            ranger.phone_number,
                            f"🚨 {alert.severity.upper()} ALERT: {alert.title}. Tree {alert.tree.tree_id} at {alert.tree.location_name}. Check dashboard immediately."
                        )
                    except Exception as e:
                        logger.error(f"Failed to send SMS to ranger {ranger.username}: {e}")
        
        # Send email notifications
        if settings.EMAIL_HOST:
            recipient_emails = [r.email for r in rangers if r.email]
            if recipient_emails:
                try:
                    send_mail(
                        subject=f"🚨 {alert.severity.upper()} Alert: {alert.title}",
                        message=message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=recipient_emails,
                        fail_silently=False,
                    )
                except Exception as e:
                    logger.error(f"Failed to send email alerts: {e}")
        
        # Mark alert as notified
        alert.notification_sent = True
        alert.save(update_fields=['notification_sent'])
        
        logger.info(f"Alert {alert.id} notifications sent to {rangers.count()} rangers")
    
    @staticmethod
    def check_tree_health_trends():
        """
        Background task to check for declining tree health trends
        Creates alerts if multiple trees show declining health
        """
        from trees.models import Tree
        from django.db.models import Count
        from datetime import timedelta
        from django.utils import timezone
        
        # Check for trees with declining health in the past 7 days
        week_ago = timezone.now() - timedelta(days=7)
        
        declining_trees = Tree.objects.filter(
            health_status__in=['declining', 'diseased', 'dead'],
            updated_at__gte=week_ago
        ).count()
        
        if declining_trees > 5:
            # Create alert for concerning trend
            alert = Alert.objects.create(
                tree=Tree.objects.filter(health_status='declining').first(),
                severity='high',
                title=f"Health Trend Alert: {declining_trees} Trees Declining",
                message=f"Multiple trees ({declining_trees}) showing declining health in the past week. Immediate investigation recommended.",
                alert_type='health_trend'
            )
            
            RealTimeAlertSystem.notify_rangers(alert)
    
    @staticmethod
    def create_wildfire_alert(latitude, longitude, confidence):
        """
        Create alert for wildfire detection from satellite data
        
        Args:
            latitude: Fire location latitude
            longitude: Fire location longitude
            confidence: Detection confidence (0-100)
        """
        from trees.models import Tree
        from django.contrib.gis.geos import Point
        from django.contrib.gis.measure import D
        
        # Find nearest tree
        point = Point(longitude, latitude, srid=4326)
        nearest_tree = Tree.objects.annotate(
            distance=D(point)
        ).order_by('distance').first()
        
        if nearest_tree:
            alert = Alert.objects.create(
                tree=nearest_tree,
                severity='critical',
                title=f"🔥 Wildfire Detected (Confidence: {confidence}%)",
                message=f"Satellite detected potential wildfire at coordinates ({latitude}, {longitude}). Nearest tree: {nearest_tree.tree_id}. Deploy rangers immediately.",
                alert_type='wildfire'
            )
            
            RealTimeAlertSystem.notify_rangers(alert)
            return alert
        
        return None
    
    @staticmethod
    def create_disease_outbreak_alert(species_id, disease_name, affected_count):
        """
        Create alert for disease outbreak affecting multiple trees
        
        Args:
            species_id: Affected species ID
            disease_name: Name of detected disease
            affected_count: Number of affected trees
        """
        from trees.models import Tree, TreeSpecies
        
        try:
            species = TreeSpecies.objects.get(id=species_id)
            first_affected = Tree.objects.filter(
                species=species,
                health_status='diseased'
            ).first()
            
            if first_affected:
                alert = Alert.objects.create(
                    tree=first_affected,
                    severity='critical',
                    title=f"Disease Outbreak: {disease_name}",
                    message=f"AI detected {disease_name} affecting {affected_count} {species.name} trees. Quarantine measures recommended.",
                    alert_type='disease_outbreak'
                )
                
                RealTimeAlertSystem.notify_rangers(alert)
                return alert
        except TreeSpecies.DoesNotExist:
            logger.error(f"Species {species_id} not found")
        
        return None


def create_alert_from_report(report):
    """
    Helper function to create alert from tree report
    Called automatically when critical issues are detected
    """
    if report.report_type in ['disease', 'pest_infestation', 'damage']:
        severity = 'high' if report.report_type == 'disease' else 'medium'
        
        alert = Alert.objects.create(
            tree=report.tree,
            report=report,
            severity=severity,
            title=f"Tree Report: {report.title}",
            message=f"User {report.reporter.username} reported {report.report_type} for tree {report.tree.tree_id}. Description: {report.description}"
        )
        
        RealTimeAlertSystem.notify_rangers(alert)
        return alert
    
    return None

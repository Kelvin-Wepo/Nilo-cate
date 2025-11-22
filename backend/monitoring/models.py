from django.db import models
from django.conf import settings
from trees.models import Tree


class TreeReport(models.Model):
    """Community reports about tree health and threats"""
    
    REPORT_TYPE_CHOICES = [
        ('health_check', 'Health Check'),
        ('disease', 'Disease Report'),
        ('damage', 'Physical Damage'),
        ('threat', 'Threat Detected'),
        ('fire', 'Fire Risk'),
        ('clearing', 'Illegal Clearing'),
        ('general', 'General Update'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
        ('investigating', 'Under Investigation'),
    ]
    
    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submitted_reports')
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='reports/', blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='verified_reports'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    ranger_notes = models.TextField(blank=True, help_text="Notes from ranger verification")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_report_type_display()} - {self.tree.tree_id} by {self.reporter.username}"
    
    class Meta:
        ordering = ['-created_at']


class AIAnalysis(models.Model):
    """AI analysis results for tree health from images"""
    
    HEALTH_ASSESSMENT_CHOICES = [
        ('healthy', 'Healthy'),
        ('stressed', 'Stressed'),
        ('diseased', 'Diseased'),
        ('critical', 'Critical'),
        ('unknown', 'Unknown'),
    ]
    
    report = models.OneToOneField(TreeReport, on_delete=models.CASCADE, related_name='ai_analysis')
    health_assessment = models.CharField(max_length=20, choices=HEALTH_ASSESSMENT_CHOICES)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, help_text="Confidence percentage")
    detected_issues = models.JSONField(default=list, help_text="List of detected issues")
    recommendations = models.TextField(help_text="AI-generated recommendations")
    raw_analysis = models.JSONField(help_text="Raw API response from Gemini")
    analyzed_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"AI Analysis for Report #{self.report.id} - {self.get_health_assessment_display()}"
    
    class Meta:
        verbose_name_plural = "AI Analyses"
        ordering = ['-analyzed_at']


class Alert(models.Model):
    """System alerts for tree threats"""
    
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name='alerts')
    report = models.ForeignKey(TreeReport, on_delete=models.CASCADE, related_name='alerts', null=True, blank=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_alerts'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    notification_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_severity_display()} - {self.title}"
    
    class Meta:
        ordering = ['-created_at']


class IncidentReport(models.Model):
    """General forest incident reports with GPS location"""
    
    INCIDENT_TYPE_CHOICES = [
        ('illegal_logging', 'Illegal Logging'),
        ('fire', 'Forest Fire'),
        ('poaching', 'Wildlife Poaching'),
        ('encroachment', 'Land Encroachment'),
        ('pollution', 'Environmental Pollution'),
        ('vandalism', 'Vandalism'),
        ('other', 'Other Incident'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('investigating', 'Under Investigation'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='incident_reports')
    incident_type = models.CharField(max_length=50, choices=INCIDENT_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    location_name = models.CharField(max_length=200, help_text="Forest or area name")
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    image = models.ImageField(upload_to='incidents/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=20, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')], default='medium')
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_incidents'
    )
    ranger_notes = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_incident_type_display()} - {self.location_name}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Incident Report"
        verbose_name_plural = "Incident Reports"

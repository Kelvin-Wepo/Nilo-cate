from django.db import models
from django.conf import settings


class TreeSpecies(models.Model):
    """Endangered tree species information"""
    
    RISK_LEVEL_CHOICES = [
        ('critically_endangered', 'Critically Endangered'),
        ('endangered', 'Endangered'),
        ('vulnerable', 'Vulnerable'),
    ]
    
    name = models.CharField(max_length=200)
    scientific_name = models.CharField(max_length=200)
    description = models.TextField()
    risk_level = models.CharField(max_length=50, choices=RISK_LEVEL_CHOICES)
    native_region = models.CharField(max_length=200)
    characteristics = models.TextField(help_text="Physical characteristics")
    conservation_importance = models.TextField(help_text="Why this species matters")
    threats = models.TextField(help_text="Main threats to this species")
    image = models.ImageField(upload_to='species/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.scientific_name})"
    
    class Meta:
        verbose_name_plural = "Tree Species"
        ordering = ['name']


class Tree(models.Model):
    """Individual endangered tree"""
    
    HEALTH_STATUS_CHOICES = [
        ('healthy', 'Healthy'),
        ('stressed', 'Stressed'),
        ('diseased', 'Diseased'),
        ('critical', 'Critical'),
        ('deceased', 'Deceased'),
    ]
    
    species = models.ForeignKey(TreeSpecies, on_delete=models.CASCADE, related_name='trees')
    tree_id = models.CharField(max_length=50, unique=True, help_text="Unique identifier for the tree")
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    location_name = models.CharField(max_length=200, help_text="Forest or area name")
    health_status = models.CharField(max_length=20, choices=HEALTH_STATUS_CHOICES, default='healthy')
    estimated_age = models.IntegerField(help_text="Age in years", null=True, blank=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, help_text="Height in meters", null=True, blank=True)
    diameter = models.DecimalField(max_digits=5, decimal_places=2, help_text="Trunk diameter in cm", null=True, blank=True)
    notes = models.TextField(blank=True)
    is_adopted = models.BooleanField(default=False)
    adoption_count = models.IntegerField(default=0)
    last_health_check = models.DateTimeField(null=True, blank=True)
    image = models.ImageField(upload_to='trees/', blank=True, null=True)
    added_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='added_trees')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.tree_id} - {self.species.name}"
    
    class Meta:
        ordering = ['-created_at']


class TreeAdoption(models.Model):
    """User adoption of a tree"""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='adoptions')
    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name='adoptions')
    adoption_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    certificate_number = models.CharField(max_length=100, unique=True)
    notes = models.TextField(blank=True, help_text="Personal notes about the adoption")
    
    def __str__(self):
        return f"{self.user.username} adopted {self.tree.tree_id}"
    
    def save(self, *args, **kwargs):
        if not self.certificate_number:
            # Generate unique certificate number
            import uuid
            self.certificate_number = f"NILO-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-adoption_date']
        unique_together = ['user', 'tree']


class Badge(models.Model):
    """Achievement badges for users"""
    
    BADGE_TYPE_CHOICES = [
        ('first_adoption', 'First Tree Adopted'),
        ('five_adoptions', 'Five Trees Adopted'),
        ('ten_adoptions', 'Ten Trees Adopted'),
        ('first_report', 'First Report Submitted'),
        ('ten_reports', 'Ten Reports Submitted'),
        ('ranger_verified', 'Ranger Verified'),
        ('tree_saver', 'Tree Saver'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='badges')
    badge_type = models.CharField(max_length=50, choices=BADGE_TYPE_CHOICES)
    earned_date = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=200)
    
    def __str__(self):
        return f"{self.user.username} - {self.get_badge_type_display()}"
    
    class Meta:
        ordering = ['-earned_date']
        unique_together = ['user', 'badge_type']


class Payment(models.Model):
    """M-Pesa payment transactions"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    phone_number = models.CharField(max_length=15, help_text="M-Pesa phone number")
    mpesa_checkout_request_id = models.CharField(max_length=100, unique=True)
    mpesa_receipt_number = models.CharField(max_length=100, blank=True, null=True)
    transaction_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    result_description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payment {self.mpesa_checkout_request_id} - {self.status}"
    
    class Meta:
        ordering = ['-created_at']


class AdoptionRequest(models.Model):
    """Pending tree adoption requests requiring ranger approval"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('payment_pending', 'Payment Pending'),
        ('payment_failed', 'Payment Failed'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='adoption_requests')
    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name='adoption_requests')
    message = models.TextField(help_text="User's message explaining why they want to adopt this tree")
    phone_number = models.CharField(max_length=15, help_text="M-Pesa phone number for payment")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment = models.OneToOneField(Payment, on_delete=models.SET_NULL, null=True, blank=True, related_name='adoption_request')
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_requests'
    )
    ranger_notes = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.tree.tree_id} ({self.status})"
    
    class Meta:
        ordering = ['-created_at']


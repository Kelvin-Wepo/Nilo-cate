from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model for Nilocate platform"""
    
    USER_TYPE_CHOICES = [
        ('citizen', 'Citizen'),
        ('ranger', 'Ranger'),
        ('admin', 'Admin'),
    ]
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='citizen')
    phone_number = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    location = models.CharField(max_length=200, blank=True)
    trees_adopted_count = models.IntegerField(default=0)
    reports_submitted_count = models.IntegerField(default=0)
    
    # Ranger-specific fields
    certification_number = models.CharField(max_length=100, blank=True, help_text="Official ranger certification ID")
    years_of_experience = models.IntegerField(null=True, blank=True, help_text="Years working as a ranger")
    assigned_forest = models.CharField(max_length=200, blank=True, help_text="Primary forest area assigned to")
    specialization = models.CharField(max_length=200, blank=True, help_text="e.g., Wildlife Protection, Fire Management, etc.")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    class Meta:
        ordering = ['-created_at']

from django.db import models
from django.contrib.auth import get_user_model
from trees.models import Tree
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

User = get_user_model()


class Campaign(models.Model):
    """Forest conservation campaign that communities, schools, and organizations can join"""
    
    CAMPAIGN_TYPE_CHOICES = [
        ('emergency', '🚨 Emergency Response'),
        ('species', '🌳 Species Protection'),
        ('restoration', '🌲 Forest Restoration'),
        ('education', '🎓 Community Education'),
        ('research', '🔬 Research Project'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('funded', 'Fully Funded'),
        ('ongoing', 'Implementation Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=250)
    description = models.TextField()
    campaign_type = models.CharField(max_length=20, choices=CAMPAIGN_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Forest/Location Details
    forest_name = models.CharField(max_length=200, help_text="e.g., Karura Forest")
    forest_area_hectares = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total area in hectares")
    county = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    
    # Campaign Goals
    funding_goal = models.DecimalField(max_digits=12, decimal_places=2, help_text="Target amount in KES")
    current_funding = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    trees_target = models.IntegerField(help_text="Number of endangered trees to protect")
    
    # Timeline
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Relationships
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_campaigns')
    rangers = models.ManyToManyField(User, related_name='assigned_campaigns', limit_choices_to={'user_type': 'ranger'})
    trees = models.ManyToManyField(Tree, related_name='campaigns', blank=True)
    
    # Media
    cover_image = models.ImageField(upload_to='campaigns/covers/', null=True, blank=True)
    video_url = models.URLField(blank=True, null=True)
    
    # Transparency
    budget_breakdown = models.JSONField(default=dict, help_text="JSON with budget categories and amounts")
    spending_log = models.JSONField(default=list, help_text="Array of spending records")
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['campaign_type', 'status']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def funding_percentage(self):
        if self.funding_goal > 0:
            return round((float(self.current_funding) / float(self.funding_goal)) * 100, 2)
        return 0
    
    @property
    def days_remaining(self):
        from django.utils import timezone
        remaining = (self.end_date - timezone.now().date()).days
        return max(0, remaining)
    
    @property
    def participant_count(self):
        return self.participants.count()
    
    @property
    def is_fully_funded(self):
        return self.current_funding >= self.funding_goal


class CampaignParticipant(models.Model):
    """Represents a participant in a campaign (community, school, org, or individual)"""
    
    PARTICIPANT_TYPE_CHOICES = [
        ('community', '🏘️ Community'),
        ('school', '🎓 School'),
        ('organization', '🏢 Organization'),
        ('individual', '👤 Individual Citizen'),
        ('corporate', '🏭 Corporate Sponsor'),
    ]
    
    ROLE_CHOICES = [
        ('leader', 'Campaign Leader'),
        ('member', 'Member'),
        ('sponsor', 'Sponsor'),
        ('volunteer', 'Volunteer'),
    ]
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaign_participations')
    
    participant_type = models.CharField(max_length=20, choices=PARTICIPANT_TYPE_CHOICES)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    
    # For organizations/schools
    organization_name = models.CharField(max_length=200, blank=True, null=True)
    organization_logo = models.ImageField(upload_to='campaigns/logos/', null=True, blank=True)
    
    # Contribution tracking
    total_contributed = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_contribution_date = models.DateTimeField(null=True, blank=True)
    
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['campaign', 'user']
        ordering = ['-total_contributed', '-joined_at']
    
    def __str__(self):
        org_name = f" ({self.organization_name})" if self.organization_name else ""
        return f"{self.user.username}{org_name} - {self.campaign.title}"


class CampaignContribution(models.Model):
    """Financial contribution to a campaign"""
    
    PAYMENT_METHOD_CHOICES = [
        ('mpesa', 'M-Pesa'),
        ('bank', 'Bank Transfer'),
        ('card', 'Credit/Debit Card'),
        ('corporate', 'Corporate Sponsorship'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='contributions')
    participant = models.ForeignKey(CampaignParticipant, on_delete=models.CASCADE, related_name='contributions')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('10.00'))])
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Payment details
    transaction_id = models.CharField(max_length=100, unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    receipt_number = models.CharField(max_length=100, blank=True, null=True)
    
    message = models.TextField(blank=True, help_text="Message from contributor")
    is_anonymous = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['campaign', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]
    
    def __str__(self):
        return f"KES {self.amount} - {self.campaign.title}"


class CampaignMilestone(models.Model):
    """Progress milestones for campaign tracking"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('delayed', 'Delayed'),
    ]
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='milestones')
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    target_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    order = models.IntegerField(default=0, help_text="Display order")
    
    # Progress tracking
    progress_percentage = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'target_date']
    
    def __str__(self):
        return f"{self.campaign.title} - {self.title}"


class CampaignUpdate(models.Model):
    """Regular updates posted by rangers/leaders for transparency"""
    
    UPDATE_TYPE_CHOICES = [
        ('progress', '📊 Progress Update'),
        ('milestone', '🎯 Milestone Achieved'),
        ('photo', '📸 Photo Update'),
        ('video', '🎥 Video Update'),
        ('spending', '💰 Spending Report'),
        ('alert', '🚨 Alert/Issue'),
    ]
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='updates')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    
    update_type = models.CharField(max_length=20, choices=UPDATE_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    content = models.TextField()
    
    # Media
    photos = models.JSONField(default=list, help_text="Array of photo URLs")
    video_url = models.URLField(blank=True, null=True)
    
    # Engagement
    likes_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    is_pinned = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-is_pinned', '-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.campaign.title}"


class CampaignVote(models.Model):
    """Community voting on campaign decisions"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Closed'),
    ]
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='votes')
    
    question = models.CharField(max_length=300)
    description = models.TextField()
    options = models.JSONField(help_text="Array of voting options")
    results = models.JSONField(default=dict, help_text="Vote counts per option")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    created_at = models.DateTimeField(auto_now_add=True)
    closes_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Vote: {self.question}"


class UserVote(models.Model):
    """Individual user's vote record"""
    
    vote = models.ForeignKey(CampaignVote, on_delete=models.CASCADE, related_name='user_votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    participant = models.ForeignKey(CampaignParticipant, on_delete=models.CASCADE)
    
    selected_option = models.CharField(max_length=200)
    voted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['vote', 'user']
    
    def __str__(self):
        return f"{self.user.username} voted on {self.vote.question}"

from rest_framework import serializers
from .models import (
    Campaign, CampaignParticipant, CampaignContribution,
    CampaignMilestone, CampaignUpdate, CampaignVote, UserVote
)
from users.serializers import UserSerializer


class CampaignMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignMilestone
        fields = ['id', 'title', 'description', 'target_date', 'completion_date', 
                  'status', 'order', 'progress_percentage', 'created_at', 'updated_at']


class CampaignUpdateSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    author_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = CampaignUpdate
        fields = ['id', 'update_type', 'title', 'content', 'photos', 'video_url',
                  'likes_count', 'created_at', 'is_pinned', 'author', 'author_id']


class CampaignParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = CampaignParticipant
        fields = ['id', 'campaign', 'user', 'user_id', 'participant_type', 'role',
                  'organization_name', 'organization_logo', 'total_contributed',
                  'last_contribution_date', 'joined_at', 'is_active']
        read_only_fields = ['total_contributed', 'last_contribution_date', 'joined_at']


class CampaignContributionSerializer(serializers.ModelSerializer):
    participant_details = CampaignParticipantSerializer(source='participant', read_only=True)
    
    class Meta:
        model = CampaignContribution
        fields = ['id', 'campaign', 'participant', 'participant_details', 'amount',
                  'payment_method', 'status', 'transaction_id', 'phone_number',
                  'receipt_number', 'message', 'is_anonymous', 'created_at', 'completed_at']
        read_only_fields = ['transaction_id', 'created_at', 'completed_at']


class CampaignListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for campaign listings"""
    creator = UserSerializer(read_only=True)
    funding_percentage = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    participant_count = serializers.ReadOnlyField()
    is_fully_funded = serializers.ReadOnlyField()
    
    class Meta:
        model = Campaign
        fields = ['id', 'title', 'slug', 'description', 'campaign_type', 'status',
                  'forest_name', 'county', 'funding_goal', 'current_funding',
                  'funding_percentage', 'trees_target', 'start_date', 'end_date',
                  'days_remaining', 'participant_count', 'is_fully_funded',
                  'cover_image', 'creator', 'created_at']


class CampaignDetailSerializer(serializers.ModelSerializer):
    """Full serializer with all relationships"""
    creator = UserSerializer(read_only=True)
    rangers = UserSerializer(many=True, read_only=True)
    participants = CampaignParticipantSerializer(many=True, read_only=True)
    milestones = CampaignMilestoneSerializer(many=True, read_only=True)
    updates = CampaignUpdateSerializer(many=True, read_only=True)
    recent_contributions = serializers.SerializerMethodField()
    
    funding_percentage = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    participant_count = serializers.ReadOnlyField()
    is_fully_funded = serializers.ReadOnlyField()
    
    class Meta:
        model = Campaign
        fields = '__all__'
    
    def get_recent_contributions(self, obj):
        contributions = obj.contributions.filter(status='completed').order_by('-created_at')[:10]
        return CampaignContributionSerializer(contributions, many=True).data


class CampaignCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating campaigns"""
    creator_id = serializers.IntegerField(write_only=True, required=False)
    ranger_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Campaign
        fields = ['title', 'slug', 'description', 'campaign_type', 'status',
                  'forest_name', 'forest_area_hectares', 'county', 'latitude', 'longitude',
                  'funding_goal', 'trees_target', 'start_date', 'end_date',
                  'cover_image', 'video_url', 'budget_breakdown',
                  'creator_id', 'ranger_ids']
    
    def create(self, validated_data):
        ranger_ids = validated_data.pop('ranger_ids', [])
        campaign = Campaign.objects.create(**validated_data)
        
        if ranger_ids:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            rangers = User.objects.filter(id__in=ranger_ids, user_type='ranger')
            campaign.rangers.set(rangers)
        
        return campaign


class UserVoteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserVote
        fields = ['id', 'vote', 'user', 'participant', 'selected_option', 'voted_at']
        read_only_fields = ['voted_at']


class CampaignVoteSerializer(serializers.ModelSerializer):
    user_votes = UserVoteSerializer(many=True, read_only=True)
    total_votes = serializers.SerializerMethodField()
    user_has_voted = serializers.SerializerMethodField()
    
    class Meta:
        model = CampaignVote
        fields = ['id', 'campaign', 'question', 'description', 'options', 'results',
                  'status', 'created_at', 'closes_at', 'user_votes', 'total_votes',
                  'user_has_voted']
    
    def get_total_votes(self, obj):
        return obj.user_votes.count()
    
    def get_user_has_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user_votes.filter(user=request.user).exists()
        return False

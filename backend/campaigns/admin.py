from django.contrib import admin
from .models import (
    Campaign, CampaignParticipant, CampaignContribution,
    CampaignMilestone, CampaignUpdate, CampaignVote, UserVote
)


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['title', 'campaign_type', 'status', 'funding_percentage', 'participant_count', 'start_date', 'end_date']
    list_filter = ['status', 'campaign_type', 'county']
    search_fields = ['title', 'forest_name', 'description']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['rangers', 'trees']
    readonly_fields = ['current_funding', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'campaign_type', 'status', 'cover_image', 'video_url')
        }),
        ('Location', {
            'fields': ('forest_name', 'forest_area_hectares', 'county', 'latitude', 'longitude')
        }),
        ('Goals & Timeline', {
            'fields': ('funding_goal', 'current_funding', 'trees_target', 'start_date', 'end_date')
        }),
        ('Team', {
            'fields': ('creator', 'rangers', 'trees')
        }),
        ('Transparency', {
            'fields': ('budget_breakdown', 'spending_log'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CampaignParticipant)
class CampaignParticipantAdmin(admin.ModelAdmin):
    list_display = ['user', 'campaign', 'participant_type', 'role', 'total_contributed', 'joined_at']
    list_filter = ['participant_type', 'role', 'is_active']
    search_fields = ['user__username', 'organization_name', 'campaign__title']


@admin.register(CampaignContribution)
class CampaignContributionAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'campaign', 'amount', 'payment_method', 'status', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['transaction_id', 'receipt_number', 'participant__user__username']
    readonly_fields = ['created_at', 'completed_at']


@admin.register(CampaignMilestone)
class CampaignMilestoneAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'title', 'status', 'progress_percentage', 'target_date', 'completion_date']
    list_filter = ['status', 'campaign']
    search_fields = ['title', 'description']
    ordering = ['campaign', 'order']


@admin.register(CampaignUpdate)
class CampaignUpdateAdmin(admin.ModelAdmin):
    list_display = ['title', 'campaign', 'update_type', 'author', 'likes_count', 'is_pinned', 'created_at']
    list_filter = ['update_type', 'is_pinned', 'created_at']
    search_fields = ['title', 'content', 'campaign__title']


@admin.register(CampaignVote)
class CampaignVoteAdmin(admin.ModelAdmin):
    list_display = ['question', 'campaign', 'status', 'created_at', 'closes_at']
    list_filter = ['status', 'campaign']
    search_fields = ['question', 'description']


@admin.register(UserVote)
class UserVoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'vote', 'selected_option', 'voted_at']
    list_filter = ['voted_at']
    search_fields = ['user__username', 'vote__question']

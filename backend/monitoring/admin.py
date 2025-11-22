from django.contrib import admin
from .models import TreeReport, AIAnalysis, Alert, IncidentReport


@admin.register(TreeReport)
class TreeReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'tree', 'reporter', 'report_type', 'status', 'created_at']
    list_filter = ['report_type', 'status', 'created_at']
    search_fields = ['title', 'description', 'tree__tree_id', 'reporter__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    list_display = ['report', 'health_assessment', 'confidence_score', 'analyzed_at']
    list_filter = ['health_assessment', 'analyzed_at']
    search_fields = ['report__title', 'recommendations']
    readonly_fields = ['analyzed_at']


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ['tree', 'severity', 'title', 'is_resolved', 'created_at']
    list_filter = ['severity', 'is_resolved', 'created_at']
    search_fields = ['title', 'message', 'tree__tree_id']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(IncidentReport)
class IncidentReportAdmin(admin.ModelAdmin):
    list_display = ['incident_type', 'location_name', 'reporter', 'status', 'priority', 'assigned_to', 'created_at']
    list_filter = ['incident_type', 'status', 'priority', 'created_at']
    search_fields = ['title', 'description', 'location_name', 'reporter__username']
    readonly_fields = ['created_at', 'updated_at', 'resolved_at']


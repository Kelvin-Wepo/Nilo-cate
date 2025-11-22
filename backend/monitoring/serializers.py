from rest_framework import serializers
from .models import TreeReport, AIAnalysis, Alert, IncidentReport
from trees.models import Tree
from users.serializers import UserSerializer


class AIAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for AI analysis results"""
    
    class Meta:
        model = AIAnalysis
        fields = ['id', 'health_assessment', 'confidence_score', 'detected_issues',
                  'recommendations', 'analyzed_at']


class TreeReportListSerializer(serializers.ModelSerializer):
    """Simplified serializer for report list"""
    
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    tree_id = serializers.CharField(source='tree.tree_id', read_only=True)
    has_ai_analysis = serializers.SerializerMethodField()
    
    class Meta:
        model = TreeReport
        fields = ['id', 'tree_id', 'reporter_username', 'report_type', 'title', 
                  'status', 'has_ai_analysis', 'created_at']
    
    def get_has_ai_analysis(self, obj):
        return hasattr(obj, 'ai_analysis')


class TreeReportDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for tree reports"""
    
    reporter = UserSerializer(read_only=True)
    ai_analysis = AIAnalysisSerializer(read_only=True)
    tree_info = serializers.SerializerMethodField()
    
    class Meta:
        model = TreeReport
        fields = ['id', 'tree', 'tree_info', 'reporter', 'report_type', 'title', 
                  'description', 'image', 'latitude', 'longitude', 'status',
                  'verified_by', 'verified_at', 'ranger_notes', 'ai_analysis',
                  'created_at', 'updated_at']
        read_only_fields = ['reporter', 'verified_by', 'verified_at', 'ai_analysis']
    
    def get_tree_info(self, obj):
        return {
            'id': obj.tree.id,
            'tree_id': obj.tree.tree_id,
            'species_name': obj.tree.species.name,
            'location_name': obj.tree.location_name
        }


class TreeReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reports"""
    
    class Meta:
        model = TreeReport
        fields = ['tree', 'report_type', 'title', 'description', 'image', 
                  'latitude', 'longitude']


class AlertSerializer(serializers.ModelSerializer):
    """Serializer for Alert model"""
    
    tree_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Alert
        fields = ['id', 'tree', 'tree_info', 'severity', 'title', 'message',
                  'is_resolved', 'resolved_by', 'resolved_at', 'created_at']
    
    def get_tree_info(self, obj):
        return {
            'id': obj.tree.id,
            'tree_id': obj.tree.tree_id,
            'location_name': obj.tree.location_name
        }


class IncidentReportSerializer(serializers.ModelSerializer):
    """Serializer for incident reports with GPS location"""
    
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    
    class Meta:
        model = IncidentReport
        fields = ['id', 'reporter_username', 'incident_type', 'title', 'description',
                  'location_name', 'latitude', 'longitude', 'image', 'status', 
                  'priority', 'assigned_to_username', 'ranger_notes', 'resolved_at',
                  'created_at', 'updated_at']
        read_only_fields = ['reporter_username', 'assigned_to_username', 'resolved_at']


class IncidentReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating incident reports"""
    
    class Meta:
        model = IncidentReport
        fields = ['incident_type', 'title', 'description', 'location_name', 
                  'latitude', 'longitude', 'image']


from rest_framework import serializers
from .models import TreeSpecies, Tree, TreeAdoption, Badge, Payment, AdoptionRequest


class TreeSpeciesSerializer(serializers.ModelSerializer):
    """Serializer for TreeSpecies model"""
    
    tree_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TreeSpecies
        fields = ['id', 'name', 'scientific_name', 'description', 'risk_level',
                  'native_region', 'characteristics', 'conservation_importance',
                  'threats', 'image', 'tree_count', 'created_at']
    
    def get_tree_count(self, obj):
        return obj.trees.count()


class TreeListSerializer(serializers.ModelSerializer):
    """Simplified serializer for tree list view"""
    
    species_name = serializers.CharField(source='species.name', read_only=True)
    species_risk_level = serializers.CharField(source='species.risk_level', read_only=True)
    
    class Meta:
        model = Tree
        fields = ['id', 'tree_id', 'species_name', 'species_risk_level', 'latitude', 
                  'longitude', 'location_name', 'health_status', 'is_adopted', 
                  'adoption_count', 'image']


class TreeDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual tree"""
    
    species = TreeSpeciesSerializer(read_only=True)
    species_id = serializers.PrimaryKeyRelatedField(
        queryset=TreeSpecies.objects.all(),
        source='species',
        write_only=True
    )
    recent_reports = serializers.SerializerMethodField()
    adopters = serializers.SerializerMethodField()
    
    class Meta:
        model = Tree
        fields = ['id', 'tree_id', 'species', 'species_id', 'latitude', 'longitude',
                  'location_name', 'health_status', 'estimated_age', 'height', 'diameter',
                  'notes', 'is_adopted', 'adoption_count', 'last_health_check', 'image',
                  'recent_reports', 'adopters', 'created_at', 'updated_at']
    
    def get_recent_reports(self, obj):
        from monitoring.serializers import TreeReportListSerializer
        return TreeReportListSerializer(obj.reports.all()[:5], many=True).data
    
    def get_adopters(self, obj):
        return obj.adoptions.filter(is_active=True).count()


class TreeAdoptionListSerializer(serializers.ModelSerializer):
    """Serializer for adoption list"""
    
    tree = TreeListSerializer(read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = TreeAdoption
        fields = ['id', 'user_username', 'tree', 'adoption_date', 'certificate_number', 
                  'is_active']


class TreeAdoptionSerializer(serializers.ModelSerializer):
    """Serializer for creating and viewing adoptions"""
    
    tree_id = serializers.PrimaryKeyRelatedField(
        queryset=Tree.objects.all(),
        source='tree',
        write_only=True
    )
    
    class Meta:
        model = TreeAdoption
        fields = ['id', 'tree_id', 'adoption_date', 'certificate_number', 'notes', 'is_active']
        read_only_fields = ['adoption_date', 'certificate_number']


class BadgeSerializer(serializers.ModelSerializer):
    """Serializer for Badge model"""
    
    class Meta:
        model = Badge
        fields = ['id', 'badge_type', 'description', 'earned_date']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment transactions"""
    
    tree_id = serializers.CharField(source='tree.tree_id', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'user_username', 'tree_id', 'amount', 'phone_number',
                  'mpesa_checkout_request_id', 'mpesa_receipt_number', 
                  'transaction_date', 'status', 'result_description', 'created_at']
        read_only_fields = ['mpesa_checkout_request_id', 'mpesa_receipt_number', 
                           'transaction_date', 'status', 'result_description']


class AdoptionRequestSerializer(serializers.ModelSerializer):
    """Serializer for creating adoption requests"""
    
    tree_id = serializers.PrimaryKeyRelatedField(
        queryset=Tree.objects.all(),
        source='tree',
        write_only=True
    )
    tree_details = TreeListSerializer(source='tree', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    payment_details = PaymentSerializer(source='payment', read_only=True)
    
    class Meta:
        model = AdoptionRequest
        fields = ['id', 'user_username', 'tree_id', 'tree_details', 'message', 
                  'phone_number', 'status', 'payment_details', 'ranger_notes', 
                  'reviewed_at', 'created_at']
        read_only_fields = ['status', 'ranger_notes', 'reviewed_at']


class AdoptionRequestDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for ranger viewing adoption requests"""
    
    tree = TreeDetailSerializer(read_only=True)
    user = serializers.SerializerMethodField()
    payment = PaymentSerializer(read_only=True)
    reviewed_by_username = serializers.CharField(source='reviewed_by.username', read_only=True)
    
    class Meta:
        model = AdoptionRequest
        fields = ['id', 'user', 'tree', 'message', 'phone_number', 'status', 
                  'payment', 'reviewed_by_username', 'ranger_notes', 
                  'reviewed_at', 'created_at', 'updated_at']
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'phone_number': obj.user.phone_number,
            'location': obj.user.location,
        }


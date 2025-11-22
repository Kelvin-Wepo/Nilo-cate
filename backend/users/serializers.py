from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 
                  'phone_number', 'bio', 'profile_picture', 'location', 
                  'trees_adopted_count', 'reports_submitted_count', 
                  'certification_number', 'years_of_experience', 'assigned_forest', 'specialization',
                  'created_at']
        read_only_fields = ['id', 'trees_adopted_count', 'reports_submitted_count', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    certification_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    years_of_experience = serializers.IntegerField(required=False, allow_null=True)
    assigned_forest = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    specialization = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 
                  'last_name', 'user_type', 'phone_number', 'location',
                  'certification_number', 'years_of_experience', 'assigned_forest', 'specialization']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        
        # Clean up empty strings to None for optional fields
        for field in ['certification_number', 'years_of_experience', 'assigned_forest', 'specialization']:
            if field in data and data[field] == '':
                data[field] = None
        
        # Validate ranger-specific requirements
        if data.get('user_type') == 'ranger':
            if not data.get('phone_number'):
                raise serializers.ValidationError({"phone_number": "Phone number is required for rangers"})
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Remove None values for optional fields
        validated_data = {k: v for k, v in validated_data.items() if v is not None}
        
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Detailed user profile serializer"""
    
    badges = serializers.SerializerMethodField()
    recent_adoptions = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type',
                  'phone_number', 'bio', 'profile_picture', 'location',
                  'trees_adopted_count', 'reports_submitted_count', 
                  'certification_number', 'years_of_experience', 'assigned_forest', 'specialization',
                  'badges', 'recent_adoptions', 'created_at']
    
    def get_badges(self, obj):
        from trees.serializers import BadgeSerializer
        return BadgeSerializer(obj.badges.all()[:5], many=True).data
    
    def get_recent_adoptions(self, obj):
        from trees.serializers import TreeAdoptionListSerializer
        return TreeAdoptionListSerializer(obj.adoptions.filter(is_active=True)[:3], many=True).data

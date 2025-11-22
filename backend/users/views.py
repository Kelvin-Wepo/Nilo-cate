from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import User
from .serializers import UserSerializer, UserRegistrationSerializer, UserProfileSerializer


User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User operations"""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action == 'create':
            # Allow anyone to register
            return [permissions.AllowAny()]
        elif self.action in ['me', 'update', 'partial_update', 'destroy']:
            # Only authenticated users can access these
            return [permissions.IsAuthenticated()]
        else:
            # Other actions (list, retrieve, profile) allow read-only access
            return [permissions.IsAuthenticatedOrReadOnly()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action == 'profile':
            return UserProfileSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get current user profile"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        """Get detailed user profile"""
        user = self.get_object()
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

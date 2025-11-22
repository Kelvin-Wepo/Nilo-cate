from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q, Sum
from decimal import Decimal
import uuid

from .models import (
    Campaign, CampaignParticipant, CampaignContribution,
    CampaignMilestone, CampaignUpdate, CampaignVote, UserVote
)
from .serializers import (
    CampaignListSerializer, CampaignDetailSerializer, CampaignCreateSerializer,
    CampaignParticipantSerializer, CampaignContributionSerializer,
    CampaignMilestoneSerializer, CampaignUpdateSerializer,
    CampaignVoteSerializer, UserVoteSerializer
)


class CampaignViewSet(viewsets.ModelViewSet):
    """
    Campaign CRUD operations
    """
    queryset = Campaign.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'campaign_type', 'county']
    search_fields = ['title', 'description', 'forest_name']
    ordering_fields = ['created_at', 'funding_goal', 'start_date', 'end_date']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CampaignListSerializer
        elif self.action == 'create' or self.action == 'update':
            return CampaignCreateSerializer
        return CampaignDetailSerializer
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def join(self, request, slug=None):
        """Join a campaign as a participant"""
        campaign = self.get_object()
        
        participant_type = request.data.get('participant_type', 'individual')
        organization_name = request.data.get('organization_name', '')
        
        # Check if user already joined
        if CampaignParticipant.objects.filter(campaign=campaign, user=request.user).exists():
            return Response(
                {'detail': 'You have already joined this campaign'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participant = CampaignParticipant.objects.create(
            campaign=campaign,
            user=request.user,
            participant_type=participant_type,
            organization_name=organization_name,
            role='member'
        )
        
        serializer = CampaignParticipantSerializer(participant)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def contribute(self, request, slug=None):
        """Make a financial contribution to the campaign"""
        campaign = self.get_object()
        
        # Get or create participant
        participant, created = CampaignParticipant.objects.get_or_create(
            campaign=campaign,
            user=request.user,
            defaults={
                'participant_type': request.data.get('participant_type', 'individual'),
                'organization_name': request.data.get('organization_name', ''),
            }
        )
        
        amount = Decimal(str(request.data.get('amount', 0)))
        payment_method = request.data.get('payment_method', 'mpesa')
        phone_number = request.data.get('phone_number', '')
        message = request.data.get('message', '')
        is_anonymous = request.data.get('is_anonymous', False)
        
        if amount < Decimal('10.00'):
            return Response(
                {'detail': 'Minimum contribution is KES 10'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create contribution record
        contribution = CampaignContribution.objects.create(
            campaign=campaign,
            participant=participant,
            amount=amount,
            payment_method=payment_method,
            phone_number=phone_number,
            message=message,
            is_anonymous=is_anonymous,
            transaction_id=f"CAMP-{uuid.uuid4().hex[:12].upper()}",
            status='completed',  # In production, this would be 'pending' until payment confirmed
            completed_at=timezone.now()
        )
        
        # Update campaign funding
        campaign.current_funding += amount
        campaign.save()
        
        # Update participant total
        participant.total_contributed += amount
        participant.last_contribution_date = timezone.now()
        participant.save()
        
        serializer = CampaignContributionSerializer(contribution)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def participants(self, request, slug=None):
        """Get all participants of a campaign"""
        campaign = self.get_object()
        participants = campaign.participants.all()
        
        # Filter by type if provided
        participant_type = request.query_params.get('type')
        if participant_type:
            participants = participants.filter(participant_type=participant_type)
        
        serializer = CampaignParticipantSerializer(participants, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def contributions(self, request, slug=None):
        """Get all contributions to a campaign"""
        campaign = self.get_object()
        contributions = campaign.contributions.filter(status='completed').order_by('-created_at')
        
        serializer = CampaignContributionSerializer(contributions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_update(self, request, slug=None):
        """Post an update to the campaign (rangers/leaders only)"""
        campaign = self.get_object()
        
        # Check if user is ranger or campaign creator
        is_ranger = request.user in campaign.rangers.all()
        is_creator = request.user == campaign.creator
        
        if not (is_ranger or is_creator):
            return Response(
                {'detail': 'Only rangers and campaign creators can post updates'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        update = CampaignUpdate.objects.create(
            campaign=campaign,
            author=request.user,
            update_type=request.data.get('update_type', 'progress'),
            title=request.data.get('title'),
            content=request.data.get('content'),
            photos=request.data.get('photos', []),
            video_url=request.data.get('video_url', ''),
        )
        
        serializer = CampaignUpdateSerializer(update)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def my_campaigns(self, request):
        """Get campaigns user has joined"""
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        participated = CampaignParticipant.objects.filter(user=request.user).values_list('campaign_id', flat=True)
        campaigns = Campaign.objects.filter(id__in=participated)
        
        serializer = CampaignListSerializer(campaigns, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get overall campaign statistics"""
        total_campaigns = Campaign.objects.count()
        active_campaigns = Campaign.objects.filter(status='active').count()
        total_raised = Campaign.objects.aggregate(total=Sum('current_funding'))['total'] or 0
        total_participants = CampaignParticipant.objects.count()
        
        return Response({
            'total_campaigns': total_campaigns,
            'active_campaigns': active_campaigns,
            'total_raised': float(total_raised),
            'total_participants': total_participants
        })


class CampaignMilestoneViewSet(viewsets.ModelViewSet):
    """Milestone management"""
    queryset = CampaignMilestone.objects.all()
    serializer_class = CampaignMilestoneSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['campaign', 'status']


class CampaignUpdateViewSet(viewsets.ModelViewSet):
    """Campaign updates (read-only for non-rangers)"""
    queryset = CampaignUpdate.objects.all()
    serializer_class = CampaignUpdateSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['campaign', 'update_type']
    ordering_fields = ['created_at', 'likes_count']
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """Like an update"""
        update = self.get_object()
        update.likes_count += 1
        update.save()
        return Response({'likes_count': update.likes_count})


class CampaignVoteViewSet(viewsets.ModelViewSet):
    """Community voting system"""
    queryset = CampaignVote.objects.all()
    serializer_class = CampaignVoteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['campaign', 'status']
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cast_vote(self, request, pk=None):
        """Cast a vote"""
        vote = self.get_object()
        
        if vote.status != 'active':
            return Response(
                {'detail': 'This vote is closed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is a participant
        try:
            participant = CampaignParticipant.objects.get(
                campaign=vote.campaign,
                user=request.user
            )
        except CampaignParticipant.DoesNotExist:
            return Response(
                {'detail': 'You must be a campaign participant to vote'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if already voted
        if UserVote.objects.filter(vote=vote, user=request.user).exists():
            return Response(
                {'detail': 'You have already voted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        selected_option = request.data.get('option')
        if selected_option not in vote.options:
            return Response(
                {'detail': 'Invalid option'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Record vote
        UserVote.objects.create(
            vote=vote,
            user=request.user,
            participant=participant,
            selected_option=selected_option
        )
        
        # Update results
        if selected_option not in vote.results:
            vote.results[selected_option] = 0
        vote.results[selected_option] += 1
        vote.save()
        
        serializer = self.get_serializer(vote)
        return Response(serializer.data)

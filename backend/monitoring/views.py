from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import TreeReport, AIAnalysis, Alert, IncidentReport
from trees.models import Tree, Badge
from .serializers import (
    TreeReportListSerializer, TreeReportDetailSerializer, TreeReportCreateSerializer,
    AIAnalysisSerializer, AlertSerializer, IncidentReportSerializer, 
    IncidentReportCreateSerializer
)
from .services import GeminiAIService
from .blockchain_service import BlockchainService


class TreeReportViewSet(viewsets.ModelViewSet):
    """ViewSet for TreeReport operations"""
    
    queryset = TreeReport.objects.select_related('tree', 'reporter', 'tree__species').all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['title', 'description', 'tree__tree_id']
    filterset_fields = ['report_type', 'status', 'tree']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TreeReportListSerializer
        elif self.action == 'create':
            return TreeReportCreateSerializer
        return TreeReportDetailSerializer
    
    def perform_create(self, serializer):
        report = serializer.save(reporter=self.request.user)
        
        # Update user stats
        self.request.user.reports_submitted_count += 1
        self.request.user.save()
        
        # Award badges
        self._award_report_badges(self.request.user)
        
        # Update tree's last health check
        if report.report_type == 'health_check':
            report.tree.last_health_check = timezone.now()
            report.tree.save()
    
    def _award_report_badges(self, user):
        """Award badges based on report count"""
        count = user.reports_submitted_count
        badge_types = []
        
        if count == 1:
            badge_types.append(('first_report', 'Submitted your first report!'))
        if count == 10:
            badge_types.append(('ten_reports', 'Submitted 10 reports!'))
        
        for badge_type, description in badge_types:
            Badge.objects.get_or_create(
                user=user,
                badge_type=badge_type,
                defaults={'description': description}
            )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def analyze(self, request, pk=None):
        """Trigger AI analysis on report image"""
        report = self.get_object()
        
        if not report.image:
            return Response(
                {'error': 'No image attached to this report'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if analysis already exists
        if hasattr(report, 'ai_analysis'):
            return Response(
                {'message': 'Analysis already exists for this report'},
                status=status.HTTP_200_OK
            )
        
        try:
            # Run AI analysis
            ai_service = GeminiAIService()
            analysis_result = ai_service.analyze_tree_image(report.image.path)
            
            # Create AIAnalysis record
            ai_analysis = AIAnalysis.objects.create(
                report=report,
                health_assessment=analysis_result['health_assessment'],
                confidence_score=analysis_result['confidence_score'],
                detected_issues=analysis_result['detected_issues'],
                recommendations=analysis_result['recommendations'],
                raw_analysis=analysis_result
            )
            
            # Update tree health if confidence is high
            if analysis_result['confidence_score'] > 70:
                report.tree.health_status = analysis_result['health_assessment']
                report.tree.save()
                
                # Create alert if health is critical
                if analysis_result['health_assessment'] in ['diseased', 'critical']:
                    Alert.objects.create(
                        tree=report.tree,
                        report=report,
                        severity='high' if analysis_result['health_assessment'] == 'critical' else 'medium',
                        title=f"Tree Health Alert: {analysis_result['health_assessment'].title()}",
                        message=f"AI detected {analysis_result['health_assessment']} condition. {analysis_result['recommendations']}"
                    )
            
            serializer = AIAnalysisSerializer(ai_analysis)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'AI analysis failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def analyze_ai(self, request, pk=None):
        """Enhanced AI analysis endpoint for ranger dashboard"""
        report = self.get_object()
        
        if not report.image:
            return Response(
                {'error': 'No image attached to this report'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Run AI analysis
            ai_service = GeminiAIService()
            analysis_result = ai_service.analyze_tree_image(report.image.path)
            
            # Create or update AIAnalysis record
            ai_analysis, created = AIAnalysis.objects.update_or_create(
                report=report,
                defaults={
                    'health_assessment': analysis_result['health_assessment'],
                    'confidence_score': analysis_result['confidence_score'],
                    'detected_issues': analysis_result['detected_issues'],
                    'recommendations': analysis_result['recommendations'],
                    'raw_analysis': analysis_result
                }
            )
            
            # Format response for frontend
            response_data = {
                'disease': analysis_result.get('detected_issues', 'No disease detected'),
                'confidence': analysis_result['confidence_score'] / 100.0,
                'recommendations': analysis_result['recommendations'],
                'severity': 'high' if analysis_result['health_assessment'] in ['diseased', 'critical'] else 
                           'medium' if analysis_result['health_assessment'] == 'declining' else 'low',
                'health_status': analysis_result['health_assessment'],
                'analysis_id': ai_analysis.id
            }
            
            # Create alert if health is critical
            if analysis_result['health_assessment'] in ['diseased', 'critical']:
                Alert.objects.create(
                    tree=report.tree,
                    report=report,
                    severity='critical' if analysis_result['health_assessment'] == 'critical' else 'high',
                    title=f"AI Detected Tree Health Issue",
                    message=f"AI analysis detected {analysis_result['health_assessment']} condition in {report.tree.tree_id}. {analysis_result['recommendations']}"
                )
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'AI analysis failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def verify(self, request, pk=None):
        """Verify a report (rangers only)"""
        report = self.get_object()
        
        if request.user.user_type not in ['ranger', 'admin']:
            return Response(
                {'error': 'Only rangers can verify reports'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        report.status = 'verified'
        report.verified_by = request.user
        report.verified_at = timezone.now()
        report.ranger_notes = request.data.get('notes', '')
        report.save()
        
        serializer = self.get_serializer(report)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_reports(self, request):
        """Get current user's reports"""
        reports = self.queryset.filter(reporter=request.user)
        serializer = TreeReportListSerializer(reports, many=True)
        return Response(serializer.data)


class AlertViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Alert operations"""
    
    queryset = Alert.objects.select_related('tree', 'report').all()
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['severity', 'is_resolved', 'tree']
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def resolve(self, request, pk=None):
        """Resolve an alert (rangers only)"""
        alert = self.get_object()
        
        if request.user.user_type not in ['ranger', 'admin']:
            return Response(
                {'error': 'Only rangers can resolve alerts'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        alert.is_resolved = True
        alert.resolved_by = request.user
        alert.resolved_at = timezone.now()
        alert.save()
        
        serializer = self.get_serializer(alert)
        return Response(serializer.data)


class IncidentReportViewSet(viewsets.ModelViewSet):
    """ViewSet for IncidentReport operations"""
    
    queryset = IncidentReport.objects.select_related('reporter', 'assigned_to').all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['title', 'description', 'location_name']
    filterset_fields = ['incident_type', 'status', 'priority']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return IncidentReportCreateSerializer
        return IncidentReportSerializer
    
    def perform_create(self, serializer):
        """Create incident report and assign priority"""
        incident = serializer.save(reporter=self.request.user)
        
        # Auto-assign priority based on incident type
        urgent_types = ['fire', 'poaching']
        if incident.incident_type in urgent_types:
            incident.priority = 'urgent'
            incident.save()
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def assign(self, request, pk=None):
        """Assign incident to a ranger (admin/ranger only)"""
        incident = self.get_object()
        
        if request.user.user_type not in ['ranger', 'admin']:
            return Response(
                {'error': 'Only rangers and admins can assign incidents'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        ranger_id = request.data.get('ranger_id')
        if not ranger_id:
            incident.assigned_to = request.user
        else:
            from users.models import User
            try:
                ranger = User.objects.get(id=ranger_id, user_type='ranger')
                incident.assigned_to = ranger
            except User.DoesNotExist:
                return Response(
                    {'error': 'Ranger not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        incident.status = 'investigating'
        incident.save()
        
        serializer = self.get_serializer(incident)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def resolve(self, request, pk=None):
        """Resolve an incident (assigned ranger only)"""
        incident = self.get_object()
        
        if request.user.user_type not in ['ranger', 'admin']:
            return Response(
                {'error': 'Only rangers can resolve incidents'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if incident.assigned_to and incident.assigned_to != request.user and request.user.user_type != 'admin':
            return Response(
                {'error': 'Only the assigned ranger can resolve this incident'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        incident.status = 'resolved'
        incident.ranger_notes = request.data.get('notes', incident.ranger_notes)
        incident.resolved_at = timezone.now()
        incident.save()
        
        serializer = self.get_serializer(incident)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_incidents(self, request):
        """Get incidents assigned to current ranger"""
        if request.user.user_type not in ['ranger', 'admin']:
            return Response(
                {'error': 'Only rangers can view assigned incidents'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        incidents = self.queryset.filter(assigned_to=request.user)
        serializer = self.get_serializer(incidents, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def report_anonymous_blockchain(self, request):
        """Submit an anonymous incident report to the blockchain"""
        blockchain_service = BlockchainService()
        
        if not blockchain_service.is_connected():
            return Response(
                {'error': 'Blockchain service is not available'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # Validate required fields
        required_fields = ['incident_type', 'severity', 'latitude', 'longitude', 'description']
        for field in required_fields:
            if field not in request.data:
                return Response(
                    {'error': f'Missing required field: {field}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Prepare incident data
        incident_data = {
            'incident_type': request.data.get('incident_type').upper(),
            'severity': request.data.get('severity').upper(),
            'latitude': float(request.data.get('latitude')),
            'longitude': float(request.data.get('longitude')),
            'location_description': request.data.get('location_description', ''),
            'description': request.data.get('description'),
            'evidence': request.data.get('evidence', ''),
            'is_anonymous': request.data.get('is_anonymous', True),
            'timestamp': timezone.now().isoformat()
        }
        
        # Submit to blockchain
        result = blockchain_service.submit_anonymous_report(incident_data)
        
        if result['success']:
            return Response({
                'message': 'Report submitted successfully to blockchain',
                'report_id': result['report_id'],
                'transaction_hash': result['transaction_hash'],
                'report_hash': result['report_hash'],
                'block_number': result.get('block_number')
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {'error': result.get('error', 'Failed to submit report')},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def get_blockchain_report(self, request):
        """Get a blockchain report by ID"""
        report_id = request.query_params.get('report_id')
        
        if not report_id:
            return Response(
                {'error': 'report_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        blockchain_service = BlockchainService()
        report = blockchain_service.get_report(int(report_id))
        
        if report:
            return Response(report)
        else:
            return Response(
                {'error': 'Report not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def verify_blockchain_report(self, request, pk=None):
        """Verify a blockchain report (rangers only)"""
        if request.user.user_type not in ['ranger', 'admin']:
            return Response(
                {'error': 'Only rangers can verify reports'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        is_valid = request.data.get('is_valid', True)
        comment = request.data.get('comment', 'Verified by ranger')
        
        blockchain_service = BlockchainService()
        result = blockchain_service.verify_report(int(pk), is_valid, comment)
        
        if result['success']:
            return Response({
                'message': 'Report verified successfully',
                'transaction_hash': result['transaction_hash']
            })
        else:
            return Response(
                {'error': result.get('error', 'Failed to verify report')},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def blockchain_stats(self, request):
        """Get blockchain reporting statistics"""
        blockchain_service = BlockchainService()
        
        return Response({
            'connected': blockchain_service.is_connected(),
            'total_reports': blockchain_service.get_report_count(),
            'contract_address': blockchain_service.contract_address
        })


# M-Pesa Payment Callback
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from trees.models import Payment, AdoptionRequest, TreeAdoption
from .tasks import send_adoption_sms
import json


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def mpesa_callback(request):
    """
    M-Pesa payment callback endpoint
    This gets called by Safaricom when payment is completed
    """
    try:
        data = json.loads(request.body)
        print(f"M-Pesa Callback received: {data}")
        
        # Extract payment details from callback
        callback_data = data.get('Body', {}).get('stkCallback', {})
        result_code = callback_data.get('ResultCode')
        checkout_request_id = callback_data.get('CheckoutRequestID')
        
        if not checkout_request_id:
            return Response({'message': 'Invalid callback data'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the payment record
        try:
            payment = Payment.objects.get(mpesa_checkout_request_id=checkout_request_id)
        except Payment.DoesNotExist:
            return Response({'message': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if payment was successful
        if result_code == 0:
            # Payment successful
            callback_metadata = callback_data.get('CallbackMetadata', {}).get('Item', [])
            
            # Extract transaction details
            mpesa_receipt = None
            for item in callback_metadata:
                if item.get('Name') == 'MpesaReceiptNumber':
                    mpesa_receipt = item.get('Value')
            
            # Update payment status
            payment.status = 'completed'
            payment.mpesa_receipt_number = mpesa_receipt
            payment.completed_at = timezone.now()
            payment.save()
            
            # Auto-approve the adoption request
            try:
                adoption_request = AdoptionRequest.objects.get(payment=payment)
                
                # Create actual TreeAdoption
                tree_adoption = TreeAdoption.objects.create(
                    user=adoption_request.user,
                    tree=adoption_request.tree,
                    notes=adoption_request.message
                )
                
                # Update tree
                adoption_request.tree.is_adopted = True
                adoption_request.tree.adoption_count += 1
                adoption_request.tree.save()
                
                # Update user stats
                adoption_request.user.trees_adopted_count += 1
                adoption_request.user.save()
                
                # Update adoption request status
                adoption_request.status = 'completed'
                adoption_request.reviewed_at = timezone.now()
                adoption_request.save()
                
                # Send SMS confirmation via Africa's Talking
                send_adoption_sms.delay(
                    adoption_request.phone_number,
                    adoption_request.user.username,
                    tree_adoption.tree.tree_id,
                    tree_adoption.tree.species.name,
                    tree_adoption.certificate_number
                )
                
                print(f"✅ Adoption completed! SMS sent to {adoption_request.phone_number}")
                
            except AdoptionRequest.DoesNotExist:
                print(f"No adoption request found for payment {payment.id}")
            
        else:
            # Payment failed
            payment.status = 'failed'
            payment.save()
            
            # Update adoption request
            try:
                adoption_request = AdoptionRequest.objects.get(payment=payment)
                adoption_request.status = 'payment_failed'
                adoption_request.save()
            except AdoptionRequest.DoesNotExist:
                pass
        
        return Response({'message': 'Callback processed successfully'})
        
    except Exception as e:
        print(f"Error processing M-Pesa callback: {e}")
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



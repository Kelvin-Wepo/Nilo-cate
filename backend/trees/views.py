from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import TreeSpecies, Tree, TreeAdoption, Badge, Payment, AdoptionRequest
from .serializers import (
    TreeSpeciesSerializer, TreeListSerializer, TreeDetailSerializer,
    TreeAdoptionSerializer, TreeAdoptionListSerializer, BadgeSerializer,
    PaymentSerializer, AdoptionRequestSerializer, AdoptionRequestDetailSerializer
)


class TreeSpeciesViewSet(viewsets.ModelViewSet):
    """ViewSet for TreeSpecies"""
    
    queryset = TreeSpecies.objects.all()
    serializer_class = TreeSpeciesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'scientific_name', 'native_region']
    filterset_fields = ['risk_level']


class TreeViewSet(viewsets.ModelViewSet):
    """ViewSet for Tree operations"""
    
    queryset = Tree.objects.select_related('species').all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['tree_id', 'location_name', 'species__name']
    filterset_fields = ['health_status', 'is_adopted', 'species']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TreeListSerializer
        return TreeDetailSerializer
    
    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def map_data(self, request):
        """Get all trees optimized for map display"""
        trees = self.filter_queryset(self.get_queryset())
        data = trees.values(
            'id', 'tree_id', 'latitude', 'longitude', 'location_name',
            'health_status', 'is_adopted', 'estimated_age', 'height', 'diameter',
            'species__name', 'species__scientific_name', 'species__risk_level',
            'species__threats', 'adoption_count', 'image', 'species__image', 'species_id'
        )
        return Response(data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def adopt_tree(self, request, pk=None):
        """Adopt a tree with M-Pesa payment"""
        tree = self.get_object()
        
        if tree.is_adopted:
            return Response(
                {'error': 'This tree has already been adopted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get phone number and amount from request
        phone_number = request.data.get('phone_number')
        amount = request.data.get('amount', 500)  # Default 500 KES
        message = request.data.get('message', 'Adopted via web interface')
        
        if not phone_number:
            return Response(
                {'error': 'Phone number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Format phone number (remove + and spaces)
        phone_number = phone_number.replace('+', '').replace(' ', '')
        if not phone_number.startswith('254'):
            phone_number = '254' + phone_number.lstrip('0')
        
        # Create adoption request
        adoption_request = AdoptionRequest.objects.create(
            user=request.user,
            tree=tree,
            message=message,
            phone_number=phone_number,
            status='pending'
        )
        
        # Initiate M-Pesa payment
        from monitoring.mpesa import MpesaService
        mpesa = MpesaService()
        
        result = mpesa.initiate_stk_push(
            phone_number=phone_number,
            amount=amount,
            account_reference=f"ADOPT-{tree.tree_id}",
            transaction_desc=f"Tree Adoption: {tree.species.name}"
        )
        
        if result['success']:
            # Create payment record
            payment = Payment.objects.create(
                user=request.user,
                tree=tree,
                amount=amount,
                phone_number=phone_number,
                mpesa_checkout_request_id=result['checkout_request_id'],
                status='pending'
            )
            
            # Link payment to adoption request
            adoption_request.payment = payment
            adoption_request.status = 'payment_pending'
            adoption_request.save()
            
            return Response({
                'success': True,
                'message': 'Payment initiated. Please enter your M-Pesa PIN on your phone',
                'checkout_request_id': result['checkout_request_id'],
                'payment_id': payment.id,
                'adoption_request_id': adoption_request.id
            })
        else:
            adoption_request.delete()
            return Response({
                'success': False,
                'error': result.get('error', 'Payment initiation failed')
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def adopt(self, request, pk=None):
        """Adopt a tree"""
        tree = self.get_object()
        
        # Check if already adopted by this user
        if TreeAdoption.objects.filter(user=request.user, tree=tree, is_active=True).exists():
            return Response(
                {'error': 'You have already adopted this tree'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create adoption
        adoption = TreeAdoption.objects.create(
            user=request.user,
            tree=tree,
            notes=request.data.get('notes', '')
        )
        
        # Update tree and user stats
        tree.is_adopted = True
        tree.adoption_count += 1
        tree.save()
        
        request.user.trees_adopted_count += 1
        request.user.save()
        
        # Award badges
        self._award_adoption_badges(request.user)
        
        serializer = TreeAdoptionSerializer(adoption)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def _award_adoption_badges(self, user):
        """Award badges based on adoption count"""
        count = user.trees_adopted_count
        badge_types = []
        
        if count == 1:
            badge_types.append(('first_adoption', 'Adopted your first tree!'))
        if count == 5:
            badge_types.append(('five_adoptions', 'Adopted 5 trees!'))
        if count == 10:
            badge_types.append(('ten_adoptions', 'Adopted 10 trees!'))
        
        for badge_type, description in badge_types:
            Badge.objects.get_or_create(
                user=user,
                badge_type=badge_type,
                defaults={'description': description}
            )


class TreeAdoptionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing tree adoptions"""
    
    queryset = TreeAdoption.objects.select_related('user', 'tree', 'tree__species').all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active', 'user']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TreeAdoptionListSerializer
        return TreeAdoptionSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_adoptions(self, request):
        """Get current user's adoptions"""
        adoptions = self.queryset.filter(user=request.user, is_active=True)
        serializer = TreeAdoptionListSerializer(adoptions, many=True)
        return Response(serializer.data)


class AdoptionRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for adoption requests with payment integration"""
    
    queryset = AdoptionRequest.objects.select_related(
        'user', 'tree', 'tree__species', 'payment', 'reviewed_by'
    ).all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'tree']
    
    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'ranger_requests':
            return AdoptionRequestDetailSerializer
        return AdoptionRequestSerializer
    
    def perform_create(self, serializer):
        """Create adoption request"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def initiate_payment(self, request, pk=None):
        """Initiate M-Pesa STK push for adoption fee"""
        adoption_request = self.get_object()
        
        if adoption_request.user != request.user:
            return Response(
                {'error': 'You can only pay for your own adoption requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if adoption_request.status != 'pending':
            return Response(
                {'error': 'This adoption request is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get amount from request or use default
        amount = request.data.get('amount', 500)  # Default 500 KES
        phone_number = adoption_request.phone_number
        
        # Import M-Pesa service
        from monitoring.mpesa import MpesaService
        mpesa = MpesaService()
        
        # Initiate STK push
        result = mpesa.initiate_stk_push(
            phone_number=phone_number,
            amount=amount,
            account_reference=f"ADOPT-{adoption_request.tree.tree_id}",
            transaction_desc=f"Tree Adoption Fee for {adoption_request.tree.tree_id}"
        )
        
        if result['success']:
            # Create payment record
            payment = Payment.objects.create(
                user=request.user,
                tree=adoption_request.tree,
                amount=amount,
                phone_number=phone_number,
                mpesa_checkout_request_id=result['checkout_request_id'],
                status='pending'
            )
            
            # Link payment to adoption request
            adoption_request.payment = payment
            adoption_request.status = 'payment_pending'
            adoption_request.save()
            
            return Response({
                'success': True,
                'message': 'Payment initiated. Please enter your M-Pesa PIN',
                'checkout_request_id': result['checkout_request_id'],
                'payment_id': payment.id
            })
        else:
            return Response({
                'success': False,
                'error': result.get('error', 'Payment initiation failed')
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """Get current user's adoption requests"""
        requests_qs = self.queryset.filter(user=request.user)
        serializer = self.get_serializer(requests_qs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def ranger_requests(self, request):
        """Get pending adoption requests for rangers to approve"""
        if request.user.user_type not in ['ranger', 'admin']:
            return Response(
                {'error': 'Only rangers can view adoption requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Show requests with completed payment
        requests_qs = self.queryset.filter(
            status__in=['payment_pending', 'pending'],
            payment__status='completed'
        ) | self.queryset.filter(status='pending')
        
        serializer = AdoptionRequestDetailSerializer(requests_qs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve adoption request (rangers only)"""
        from django.utils import timezone
        
        if request.user.user_type not in ['ranger', 'admin']:
            return Response(
                {'error': 'Only rangers can approve adoption requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        adoption_request = self.get_object()
        
        # Check if payment is completed
        if adoption_request.payment and adoption_request.payment.status != 'completed':
            return Response(
                {'error': 'Payment has not been completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
        
        # Update request status
        adoption_request.status = 'completed'
        adoption_request.reviewed_by = request.user
        adoption_request.reviewed_at = timezone.now()
        adoption_request.ranger_notes = request.data.get('notes', '')
        adoption_request.save()
        
        # Send SMS confirmation
        from monitoring.tasks import send_adoption_sms
        send_adoption_sms.delay(
            adoption_request.phone_number,
            adoption_request.user.username,
            tree_adoption.tree.tree_id,
            tree_adoption.tree.species.name,
            tree_adoption.certificate_number
        )
        
        return Response({
            'success': True,
            'message': 'Adoption approved successfully',
            'certificate_number': tree_adoption.certificate_number
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject adoption request (rangers only)"""
        from django.utils import timezone
        
        if request.user.user_type not in ['ranger', 'admin']:
            return Response(
                {'error': 'Only rangers can reject adoption requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        adoption_request = self.get_object()
        adoption_request.status = 'rejected'
        adoption_request.reviewed_by = request.user
        adoption_request.reviewed_at = timezone.now()
        adoption_request.ranger_notes = request.data.get('notes', '')
        adoption_request.save()
        
        return Response({
            'success': True,
            'message': 'Adoption request rejected'
        })


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing payments"""
    
    queryset = Payment.objects.select_related('user', 'tree').all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Users can only see their own payments"""
        if self.request.user.user_type in ['ranger', 'admin']:
            return self.queryset
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def callback(self, request):
        """M-Pesa payment callback webhook"""
        from django.utils import timezone
        
        # Extract M-Pesa callback data
        callback_data = request.data
        result_code = callback_data.get('Body', {}).get('stkCallback', {}).get('ResultCode')
        checkout_request_id = callback_data.get('Body', {}).get('stkCallback', {}).get('CheckoutRequestID')
        
        try:
            payment = Payment.objects.get(mpesa_checkout_request_id=checkout_request_id)
            
            if result_code == 0:  # Success
                # Extract metadata
                callback_metadata = callback_data.get('Body', {}).get('stkCallback', {}).get('CallbackMetadata', {}).get('Item', [])
                receipt_number = None
                transaction_date = None
                
                for item in callback_metadata:
                    if item.get('Name') == 'MpesaReceiptNumber':
                        receipt_number = item.get('Value')
                    elif item.get('Name') == 'TransactionDate':
                        transaction_date = item.get('Value')
                
                payment.status = 'completed'
                payment.mpesa_receipt_number = receipt_number
                payment.transaction_date = timezone.now()
                payment.result_description = 'Payment successful'
                payment.save()
                
                # Update adoption request status
                if hasattr(payment, 'adoption_request'):
                    payment.adoption_request.status = 'pending'  # Ready for ranger approval
                    payment.adoption_request.save()
            else:
                payment.status = 'failed'
                payment.result_description = callback_data.get('Body', {}).get('stkCallback', {}).get('ResultDesc', 'Payment failed')
                payment.save()
                
                # Update adoption request
                if hasattr(payment, 'adoption_request'):
                    payment.adoption_request.status = 'payment_failed'
                    payment.adoption_request.save()
            
            return Response({'success': True})
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)


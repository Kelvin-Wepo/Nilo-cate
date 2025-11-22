from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CampaignViewSet, CampaignMilestoneViewSet,
    CampaignUpdateViewSet, CampaignVoteViewSet
)

router = DefaultRouter()
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'milestones', CampaignMilestoneViewSet, basename='milestone')
router.register(r'updates', CampaignUpdateViewSet, basename='update')
router.register(r'votes', CampaignVoteViewSet, basename='vote')

urlpatterns = [
    path('', include(router.urls)),
]

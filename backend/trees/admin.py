from django.contrib import admin
from .models import TreeSpecies, Tree, TreeAdoption, Badge, Payment, AdoptionRequest


@admin.register(TreeSpecies)
class TreeSpeciesAdmin(admin.ModelAdmin):
    list_display = ['name', 'scientific_name', 'risk_level', 'native_region', 'created_at']
    list_filter = ['risk_level']
    search_fields = ['name', 'scientific_name', 'native_region']


@admin.register(Tree)
class TreeAdmin(admin.ModelAdmin):
    list_display = ['tree_id', 'species', 'location_name', 'health_status', 'is_adopted', 
                    'adoption_count', 'created_at']
    list_filter = ['health_status', 'is_adopted', 'species']
    search_fields = ['tree_id', 'location_name', 'notes']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TreeAdoption)
class TreeAdoptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'tree', 'certificate_number', 'adoption_date', 'is_active']
    list_filter = ['is_active', 'adoption_date']
    search_fields = ['certificate_number', 'user__username', 'tree__tree_id']
    readonly_fields = ['adoption_date', 'certificate_number']


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge_type', 'earned_date']
    list_filter = ['badge_type', 'earned_date']
    search_fields = ['user__username', 'description']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'tree', 'amount', 'phone_number', 'status', 'mpesa_receipt_number', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['mpesa_checkout_request_id', 'mpesa_receipt_number', 'phone_number', 'user__username']
    readonly_fields = ['mpesa_checkout_request_id', 'mpesa_receipt_number', 'transaction_date', 'created_at', 'updated_at']


@admin.register(AdoptionRequest)
class AdoptionRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'tree', 'status', 'phone_number', 'reviewed_by', 'created_at']
    list_filter = ['status', 'created_at', 'reviewed_at']
    search_fields = ['user__username', 'tree__tree_id', 'message']
    readonly_fields = ['created_at', 'updated_at']


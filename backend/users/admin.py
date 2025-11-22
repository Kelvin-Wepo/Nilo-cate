from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'user_type', 'trees_adopted_count', 'reports_submitted_count', 'created_at']
    list_filter = ['user_type', 'is_staff', 'is_active']
    search_fields = ['username', 'email', 'phone_number']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Nilocate Info', {
            'fields': ('user_type', 'phone_number', 'bio', 'profile_picture', 'location', 
                      'trees_adopted_count', 'reports_submitted_count')
        }),
    )

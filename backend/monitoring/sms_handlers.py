"""
SMS and USSD handlers for feature phone access
Uses Africa's Talking API
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import HttpResponse
from .tasks import process_sms_report, send_sms_alert
from trees.models import Tree, TreeAdoption
from users.models import User


@api_view(['POST'])
@permission_classes([AllowAny])
def sms_webhook(request):
    """
    Handle incoming SMS from Africa's Talking
    """
    phone_number = request.data.get('from')
    message_text = request.data.get('text', '').strip()
    
    if not phone_number or not message_text:
        return Response({'status': 'error', 'message': 'Invalid request'})
    
    # Check message type
    if message_text.upper().startswith('REPORT'):
        # Incident report
        process_sms_report.delay(phone_number, message_text)
        
    elif message_text.upper().startswith('STATUS'):
        # Check tree status
        handle_status_query(phone_number, message_text)
        
    elif message_text.upper().startswith('ADOPT'):
        # Check adoption info
        handle_adoption_query(phone_number, message_text)
        
    else:
        # Send help message
        help_text = (
            "Nilocate SMS Commands:\n"
            "REPORT [TREE_ID] [TYPE] [DETAILS] - Report incident\n"
            "STATUS [TREE_ID] - Check tree health\n"
            "ADOPT [TREE_ID] - Get adoption info\n"
            "HELP - Show this message"
        )
        send_sms_alert.delay(phone_number, help_text)
    
    return Response({'status': 'success'})


def handle_status_query(phone_number, message_text):
    """Handle STATUS command"""
    try:
        parts = message_text.split(' ')
        if len(parts) < 2:
            send_sms_alert.delay(
                phone_number,
                "Usage: STATUS [TREE_ID]. Example: STATUS NAIROBI-OAK-001"
            )
            return
        
        tree_id = parts[1].upper()
        tree = Tree.objects.get(tree_id__iexact=tree_id)
        
        response = (
            f"Tree: {tree.tree_id}\n"
            f"Species: {tree.species.name}\n"
            f"Health: {tree.health_status}\n"
            f"Location: {tree.location_name}\n"
            f"Adopted: {'Yes' if tree.is_adopted else 'Available'}\n"
            f"Last check: {tree.last_health_check.strftime('%Y-%m-%d') if tree.last_health_check else 'N/A'}"
        )
        
        send_sms_alert.delay(phone_number, response)
        
    except Tree.DoesNotExist:
        send_sms_alert.delay(
            phone_number,
            f"Tree {parts[1]} not found. Visit nilocate.co.ke/map"
        )
    except Exception as e:
        print(f"Error in status query: {e}")


def handle_adoption_query(phone_number, message_text):
    """Handle ADOPT command"""
    try:
        parts = message_text.split(' ')
        if len(parts) < 2:
            send_sms_alert.delay(
                phone_number,
                "Usage: ADOPT [TREE_ID] to get adoption info"
            )
            return
        
        tree_id = parts[1].upper()
        tree = Tree.objects.get(tree_id__iexact=tree_id)
        
        response = (
            f"Adopt {tree.tree_id}\n"
            f"Species: {tree.species.name}\n"
            f"Fee: KES 500/year\n"
            f"To adopt:\n"
            f"1. Visit nilocate.co.ke/tree/{tree.id}\n"
            f"2. Pay via M-Pesa\n"
            f"3. Get certificate\n"
            f"Benefits: Monthly updates, carbon offset certificate, badges"
        )
        
        send_sms_alert.delay(phone_number, response)
        
    except Tree.DoesNotExist:
        send_sms_alert.delay(
            phone_number,
            f"Tree {parts[1]} not found."
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def ussd_webhook(request):
    """
    Handle USSD sessions from Africa's Talking
    USSD code: *384*2550#
    """
    session_id = request.data.get('sessionId')
    service_code = request.data.get('serviceCode')
    phone_number = request.data.get('phoneNumber')
    text = request.data.get('text', '')
    
    response_text = ""
    
    if text == '':
        # Main menu
        response_text = "CON Welcome to Nilocate\n"
        response_text += "1. Report Incident\n"
        response_text += "2. Check Tree Status\n"
        response_text += "3. My Adoptions\n"
        response_text += "4. Help"
        
    elif text == '1':
        # Report incident - select type
        response_text = "CON Select Incident Type:\n"
        response_text += "1. Forest Fire\n"
        response_text += "2. Illegal Logging\n"
        response_text += "3. Wildlife Poaching\n"
        response_text += "4. Other"
        
    elif text.startswith('1*'):
        # Incident reporting flow
        response_text = handle_ussd_incident(text, phone_number)
        
    elif text == '2':
        # Check tree status
        response_text = "CON Enter Tree ID:\n(e.g., NAIROBI-OAK-001)"
        
    elif text.startswith('2*'):
        # Show tree status
        tree_id = text.split('*')[1].upper()
        try:
            tree = Tree.objects.get(tree_id__iexact=tree_id)
            response_text = f"END Tree: {tree.tree_id}\n"
            response_text += f"Species: {tree.species.name}\n"
            response_text += f"Health: {tree.health_status}\n"
            response_text += f"Location: {tree.location_name}"
        except:
            response_text = "END Tree not found"
            
    elif text == '3':
        # My adoptions
        try:
            user = User.objects.get(phone_number=phone_number)
            adoptions = TreeAdoption.objects.filter(user=user, is_active=True)
            
            if adoptions.count() == 0:
                response_text = "END You have no active adoptions.\nVisit nilocate.co.ke to adopt"
            else:
                response_text = "END Your Adopted Trees:\n"
                for adoption in adoptions[:3]:
                    response_text += f"{adoption.tree.tree_id} - {adoption.tree.health_status}\n"
                    
        except User.DoesNotExist:
            response_text = "END Register at nilocate.co.ke first"
            
    elif text == '4':
        # Help
        response_text = "END Nilocate - Tree Conservation\n"
        response_text += "SMS: REPORT [ID] [TYPE] [DETAILS]\n"
        response_text += "Web: nilocate.co.ke\n"
        response_text += "Email: info@nilocate.co.ke"
    
    else:
        response_text = "END Invalid option"
    
    return HttpResponse(response_text, content_type='text/plain')


def handle_ussd_incident(text, phone_number):
    """Handle incident reporting in USSD"""
    parts = text.split('*')
    
    if len(parts) == 2:
        # Got incident type, ask for tree ID
        return "CON Enter Tree ID near incident:"
    
    elif len(parts) == 3:
        # Got tree ID, ask for description
        return "CON Describe the incident:"
    
    elif len(parts) == 4:
        # Complete - process report
        incident_types = {
            '1': 'fire',
            '2': 'illegal_logging',
            '3': 'poaching',
            '4': 'other'
        }
        
        incident_type = incident_types.get(parts[1], 'other')
        tree_id = parts[2].upper()
        description = parts[3]
        
        # Create SMS report format
        message = f"REPORT {tree_id} {incident_type} {description}"
        process_sms_report.delay(phone_number, message)
        
        return f"END Report submitted.\nRef: {tree_id}-{incident_type}\nThank you!"
    
    return "END Error processing request"

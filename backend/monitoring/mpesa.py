# M-Pesa Payment Integration
import requests
import base64
from datetime import datetime
from django.conf import settings
import os

class MpesaService:
    """
    M-Pesa STK Push Integration for Tree Adoption Payments
    """
    
    def __init__(self):
        self.consumer_key = os.getenv('MPESA_CONSUMER_KEY', '')
        self.consumer_secret = os.getenv('MPESA_CONSUMER_SECRET', '')
        self.business_shortcode = os.getenv('MPESA_SHORTCODE', '174379')
        self.passkey = os.getenv('MPESA_PASSKEY', '')
        self.callback_url = os.getenv('MPESA_CALLBACK_URL', 'https://yourdomain.com/api/mpesa/callback/')
        
        # Sandbox URLs (change to production when live)
        self.base_url = 'https://sandbox.safaricom.co.ke'
        self.access_token_url = f'{self.base_url}/oauth/v1/generate?grant_type=client_credentials'
        self.stk_push_url = f'{self.base_url}/mpesa/stkpush/v1/processrequest'
    
    def get_access_token(self):
        """Get OAuth access token from M-Pesa API"""
        try:
            auth_string = f"{self.consumer_key}:{self.consumer_secret}"
            encoded_auth = base64.b64encode(auth_string.encode()).decode()
            
            headers = {
                'Authorization': f'Basic {encoded_auth}'
            }
            
            response = requests.get(self.access_token_url, headers=headers)
            response.raise_for_status()
            
            return response.json().get('access_token')
        except Exception as e:
            print(f"Error getting access token: {e}")
            return None
    
    def generate_password(self):
        """Generate password for STK push"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data_to_encode = f"{self.business_shortcode}{self.passkey}{timestamp}"
        encoded_password = base64.b64encode(data_to_encode.encode()).decode()
        return encoded_password, timestamp
    
    def initiate_stk_push(self, phone_number, amount, account_reference, transaction_desc):
        """
        Initiate STK Push for tree adoption payment
        
        Args:
            phone_number (str): Phone number in format 254XXXXXXXXX
            amount (int): Amount to charge
            account_reference (str): Tree ID or adoption reference
            transaction_desc (str): Description of transaction
        
        Returns:
            dict: Response from M-Pesa API
        """
        access_token = self.get_access_token()
        
        if not access_token:
            return {
                'success': False,
                'message': 'Failed to get access token'
            }
        
        password, timestamp = self.generate_password()
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'BusinessShortCode': self.business_shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': amount,
            'PartyA': phone_number,
            'PartyB': self.business_shortcode,
            'PhoneNumber': phone_number,
            'CallBackURL': self.callback_url,
            'AccountReference': account_reference,
            'TransactionDesc': transaction_desc
        }
        
        try:
            response = requests.post(self.stk_push_url, json=payload, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            
            if result.get('ResponseCode') == '0':
                return {
                    'success': True,
                    'message': 'STK Push sent successfully',
                    'checkout_request_id': result.get('CheckoutRequestID'),
                    'merchant_request_id': result.get('MerchantRequestID')
                }
            else:
                return {
                    'success': False,
                    'message': result.get('ResponseDescription', 'Payment failed')
                }
        
        except Exception as e:
            return {
                'success': False,
                'message': f'Error initiating payment: {str(e)}'
            }
    
    def query_transaction_status(self, checkout_request_id):
        """Query the status of a transaction"""
        # Implementation for checking transaction status
        pass

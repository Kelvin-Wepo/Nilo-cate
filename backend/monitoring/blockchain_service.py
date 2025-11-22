"""
Blockchain service for anonymous incident reporting using the deployed smart contract.
"""
from web3 import Web3
from eth_account import Account
import json
import os
from django.conf import settings
import hashlib
from decimal import Decimal

class BlockchainService:
    """Service to interact with the AnonymousIncidentReporting smart contract"""
    
    # Incident types (matching smart contract enum)
    INCIDENT_TYPES = {
        'ILLEGAL_LOGGING': 0,
        'WILDFIRE': 1,
        'POACHING': 2,
        'DEFORESTATION': 3,
        'POLLUTION': 4,
        'TREE_DISEASE': 5,
        'OTHER': 6
    }
    
    # Severity levels
    SEVERITY_LEVELS = {
        'LOW': 0,
        'MEDIUM': 1,
        'HIGH': 2,
        'CRITICAL': 3
    }
    
    # Report status
    REPORT_STATUS = {
        0: 'PENDING',
        1: 'INVESTIGATING',
        2: 'VERIFIED',
        3: 'RESOLVED',
        4: 'DISMISSED'
    }
    
    def __init__(self):
        """Initialize Web3 connection and contract"""
        # Get blockchain configuration from settings
        self.rpc_url = getattr(settings, 'BLOCKCHAIN_RPC_URL', 'http://127.0.0.1:8545')
        self.contract_address = getattr(settings, 'BLOCKCHAIN_CONTRACT_ADDRESS', None)
        self.private_key = getattr(settings, 'BLOCKCHAIN_PRIVATE_KEY', None)
        
        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        # Load contract ABI
        abi_path = os.path.join(os.path.dirname(__file__), 'contract_abi.json')
        with open(abi_path, 'r') as f:
            self.contract_abi = json.load(f)
        
        # Initialize contract if address is provided
        self.contract = None
        if self.contract_address:
            self.contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(self.contract_address),
                abi=self.contract_abi
            )
        
        # Initialize account if private key is provided
        self.account = None
        if self.private_key:
            self.account = Account.from_key(self.private_key)
    
    def is_connected(self):
        """Check if connected to blockchain"""
        try:
            return self.w3.is_connected()
        except:
            return False
    
    def generate_report_hash(self, incident_data):
        """Generate unique hash for report"""
        data_string = f"{incident_data.get('incident_type')}_{incident_data.get('description')}_{incident_data.get('timestamp')}"
        return Web3.keccak(text=data_string).hex()
    
    def generate_evidence_hash(self, evidence_data):
        """Generate hash for evidence (could be IPFS hash in production)"""
        if not evidence_data:
            return '0x' + '0' * 64  # Empty bytes32
        evidence_string = str(evidence_data)
        return Web3.keccak(text=evidence_string).hex()
    
    def submit_anonymous_report(self, incident_data):
        """
        Submit an anonymous incident report to the blockchain
        
        Args:
            incident_data (dict): {
                'incident_type': str,  # 'ILLEGAL_LOGGING', 'WILDFIRE', etc.
                'severity': str,       # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
                'latitude': float,
                'longitude': float,
                'location_description': str,
                'description': str,
                'evidence': str (optional),
                'is_anonymous': bool
            }
        
        Returns:
            dict: {
                'success': bool,
                'report_id': int,
                'transaction_hash': str,
                'report_hash': str
            }
        """
        if not self.contract or not self.account:
            return {
                'success': False,
                'error': 'Blockchain not configured'
            }
        
        try:
            # Generate hashes
            report_hash = self.generate_report_hash(incident_data)
            evidence_hash = self.generate_evidence_hash(incident_data.get('evidence', ''))
            
            # Convert coordinates to integer (multiply by 1e6)
            latitude_int = int(incident_data['latitude'] * 1_000_000)
            longitude_int = int(incident_data['longitude'] * 1_000_000)
            
            # Get incident type and severity enums
            incident_type = self.INCIDENT_TYPES.get(incident_data['incident_type'], 6)
            severity = self.SEVERITY_LEVELS.get(incident_data['severity'], 1)
            
            # Build transaction
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            transaction = self.contract.functions.submitReport(
                Web3.to_bytes(hexstr=report_hash),
                incident_type,
                severity,
                latitude_int,
                longitude_int,
                incident_data.get('location_description', ''),
                Web3.to_bytes(hexstr=evidence_hash),
                incident_data.get('is_anonymous', True)
            ).build_transaction({
                'from': self.account.address,
                'nonce': nonce,
                'gas': 500000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            
            # Wait for transaction receipt
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Get report ID from event logs
            report_id = None
            if tx_receipt['logs']:
                # Decode the IncidentReported event
                event_signature_hash = Web3.keccak(text="IncidentReported(uint256,bytes32,uint8,uint8,bool,uint256)")
                for log in tx_receipt['logs']:
                    if log['topics'][0] == event_signature_hash:
                        report_id = int(log['topics'][1].hex(), 16)
                        break
            
            return {
                'success': True,
                'report_id': report_id,
                'transaction_hash': tx_hash.hex(),
                'report_hash': report_hash,
                'block_number': tx_receipt['blockNumber']
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_report(self, report_id):
        """
        Get report details from blockchain
        
        Args:
            report_id (int): Report ID
        
        Returns:
            dict: Report details
        """
        if not self.contract:
            return None
        
        try:
            report = self.contract.functions.getReport(report_id).call()
            
            return {
                'report_hash': report[0].hex(),
                'incident_type': list(self.INCIDENT_TYPES.keys())[report[1]],
                'severity': list(self.SEVERITY_LEVELS.keys())[report[2]],
                'status': self.REPORT_STATUS[report[3]],
                'timestamp': report[4],
                'latitude': report[5] / 1_000_000,
                'longitude': report[6] / 1_000_000,
                'location_description': report[7],
                'evidence_hash': report[8].hex(),
                'is_anonymous': report[9],
                'verification_count': report[10],
                'reward_amount': Web3.from_wei(report[11], 'ether')
            }
        except Exception as e:
            return None
    
    def verify_report(self, report_id, is_valid, comment):
        """
        Verify a report (rangers only)
        
        Args:
            report_id (int): Report ID
            is_valid (bool): Whether report is valid
            comment (str): Verification comment
        
        Returns:
            dict: Transaction result
        """
        if not self.contract or not self.account:
            return {
                'success': False,
                'error': 'Blockchain not configured'
            }
        
        try:
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            transaction = self.contract.functions.verifyReport(
                report_id,
                is_valid,
                comment
            ).build_transaction({
                'from': self.account.address,
                'nonce': nonce,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex(),
                'block_number': tx_receipt['blockNumber']
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def update_report_status(self, report_id, new_status):
        """
        Update report status (rangers only)
        
        Args:
            report_id (int): Report ID
            new_status (str): 'PENDING', 'INVESTIGATING', 'VERIFIED', 'RESOLVED', 'DISMISSED'
        
        Returns:
            dict: Transaction result
        """
        if not self.contract or not self.account:
            return {
                'success': False,
                'error': 'Blockchain not configured'
            }
        
        try:
            status_map = {v: k for k, v in self.REPORT_STATUS.items()}
            status_enum = status_map.get(new_status)
            
            if status_enum is None:
                return {
                    'success': False,
                    'error': 'Invalid status'
                }
            
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            transaction = self.contract.functions.updateReportStatus(
                report_id,
                status_enum
            ).build_transaction({
                'from': self.account.address,
                'nonce': nonce,
                'gas': 100000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex(),
                'block_number': tx_receipt['blockNumber']
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_report_count(self):
        """Get total number of reports"""
        if not self.contract:
            return 0
        try:
            return self.contract.functions.reportCount().call()
        except:
            return 0

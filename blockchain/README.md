# Anonymous Incident Reporting - Blockchain Integration

This module implements anonymous incident reporting using blockchain technology (Ethereum smart contracts) for the Nilocate forest conservation platform.

## Overview

The system allows users to report forest incidents (illegal logging, wildfires, poaching, deforestation, etc.) anonymously using blockchain technology. Reports are stored immutably on-chain, ensuring transparency and protecting reporter identity.

## Features

- **Anonymous Reporting**: Submit incident reports without revealing identity
- **Immutable Records**: Reports stored permanently on blockchain
- **Decentralized Verification**: Rangers can verify reports on-chain
- **Reward System**: Verified reports are eligible for rewards (0.01 ETH)
- **Multiple Incident Types**: Support for 7 incident categories
- **Severity Levels**: LOW, MEDIUM, HIGH, CRITICAL
- **GPS Coordinates**: Precise location tracking
- **Evidence Hashing**: IPFS-compatible evidence storage

## Architecture

### Smart Contract (`AnonymousIncidentReporting.sol`)
- Written in Solidity 0.8.20
- Uses OpenZeppelin contracts for security
- Features:
  - `submitReport()`: Submit anonymous incident reports
  - `verifyReport()`: Rangers verify report validity
  - `updateReportStatus()`: Update investigation status
  - `claimReward()`: Claim rewards for verified reports
  - `authorizeRanger()`: Admin authorizes rangers

### Backend Service (`blockchain_service.py`)
- Web3.py integration for blockchain interaction
- Functions:
  - `submit_anonymous_report()`: Submit report to blockchain
  - `get_report()`: Retrieve report details
  - `verify_report()`: Ranger verification
  - `update_report_status()`: Status management

### API Endpoints
- `POST /api/incidents/report_anonymous_blockchain/`: Submit anonymous report
- `GET /api/incidents/get_blockchain_report/?report_id=X`: Get report details
- `POST /api/incidents/{id}/verify_blockchain_report/`: Verify report (rangers)
- `GET /api/incidents/blockchain_stats/`: Get blockchain statistics

## Setup Instructions

### Prerequisites
- Node.js 18+ (for Hardhat)
- Python 3.8+ with pip
- Ethereum wallet/account
- Local blockchain (Hardhat) or testnet access

### 1. Install Blockchain Dependencies

```bash
cd blockchain
npm install
```

Dependencies installed:
- hardhat@2.22.0
- @nomicfoundation/hardhat-toolbox
- @openzeppelin/contracts
- ethers
- dotenv

### 2. Install Python Dependencies

```bash
cd backend
source venv/bin/activate
pip install web3 eth-account
```

### 3. Configure Environment Variables

#### Blockchain (`.env`)
```bash
# Local Development
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BLOCKCHAIN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
BLOCKCHAIN_PRIVATE_KEY=<your_private_key>

# Sepolia Testnet
# BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
# BLOCKCHAIN_CONTRACT_ADDRESS=<deployed_address>
# BLOCKCHAIN_PRIVATE_KEY=<your_private_key>
```

#### Django Settings
Already configured in `nilocate_project/settings.py`:
```python
BLOCKCHAIN_RPC_URL = os.getenv('BLOCKCHAIN_RPC_URL', 'http://127.0.0.1:8545')
BLOCKCHAIN_CONTRACT_ADDRESS = os.getenv('BLOCKCHAIN_CONTRACT_ADDRESS', '')
BLOCKCHAIN_PRIVATE_KEY = os.getenv('BLOCKCHAIN_PRIVATE_KEY', '')
```

### 4. Compile Smart Contracts

```bash
cd blockchain
npx hardhat compile
```

Expected output:
```
Compiled 4 Solidity files successfully
```

### 5. Run Tests

```bash
npx hardhat test
```

Expected: 15+ tests passing

### 6. Deploy to Local Network

#### Start Hardhat Local Node
```bash
npx hardhat node
```
Keeps running on `http://127.0.0.1:8545`

#### Deploy Contract (in another terminal)
```bash
npx hardhat run scripts/deploy.js --network localhost
```

Expected output:
```
✅ Contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
📄 Deployment data saved to deployments/localhost.json
✅ ABI copied to backend/monitoring/contract_abi.json
```

### 7. Deploy to Sepolia Testnet

#### Configure Sepolia RPC in `blockchain/.env`:
```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=<your_private_key>  # Must have Sepolia ETH
```

#### Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

#### Verify on Etherscan (optional):
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### 8. Authorize Rangers

After deployment, authorize ranger addresses:

```bash
npx hardhat console --network localhost

> const contract = await ethers.getContractAt("AnonymousIncidentReporting", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
> await contract.authorizeRanger("0xRANGER_ADDRESS")
```

Or use Django shell:
```python
from monitoring.blockchain_service import BlockchainService
bs = BlockchainService()
# Rangers are authorized through contract owner
```

### 9. Start Django Server

```bash
cd backend
python manage.py runserver
```

## Usage

### Submit Anonymous Report (API)

```bash
curl -X POST http://localhost:8000/api/incidents/report_anonymous_blockchain/ \
  -H "Content-Type: application/json" \
  -d '{
    "incident_type": "ILLEGAL_LOGGING",
    "severity": "HIGH",
    "latitude": -1.270000,
    "longitude": 36.820000,
    "location_description": "Karura Forest, near main gate",
    "description": "Observed truck loading timber at night",
    "evidence": "photo_hash_or_ipfs_url",
    "is_anonymous": true
  }'
```

Response:
```json
{
  "message": "Report submitted successfully to blockchain",
  "report_id": 1,
  "transaction_hash": "0x...",
  "report_hash": "0x...",
  "block_number": 12345
}
```

### Get Report Details

```bash
curl http://localhost:8000/api/incidents/get_blockchain_report/?report_id=1
```

Response:
```json
{
  "report_hash": "0x...",
  "incident_type": "ILLEGAL_LOGGING",
  "severity": "HIGH",
  "status": "PENDING",
  "timestamp": 1673456789,
  "latitude": -1.27,
  "longitude": 36.82,
  "location_description": "Karura Forest",
  "is_anonymous": true,
  "verification_count": 0
}
```

### Verify Report (Rangers Only)

```bash
curl -X POST http://localhost:8000/api/incidents/1/verify_blockchain_report/ \
  -H "Authorization: Bearer <ranger_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "is_valid": true,
    "comment": "Verified through field investigation"
  }'
```

## Smart Contract Details

### Incident Types (Enum)
```solidity
0: ILLEGAL_LOGGING
1: WILDFIRE
2: POACHING
3: DEFORESTATION
4: POLLUTION
5: TREE_DISEASE
6: OTHER
```

### Severity Levels
```solidity
0: LOW
1: MEDIUM
2: HIGH
3: CRITICAL
```

### Report Status
```solidity
0: PENDING
1: INVESTIGATING
2: VERIFIED
3: RESOLVED
4: DISMISSED
```

## Testing

### Run All Tests
```bash
cd blockchain
npx hardhat test
```

### Test Specific File
```bash
npx hardhat test test/AnonymousIncidentReporting.test.js
```

### Gas Report
```bash
REPORT_GAS=true npx hardhat test
```

## Deployment Addresses

### Local Hardhat Network
- Contract: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- Deployer: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

### Sepolia Testnet (TBD)
- Contract: `<deploy and update here>`
- Explorer: `https://sepolia.etherscan.io/address/<contract_address>`

### Polygon Mainnet (Production - TBD)
- Contract: `<deploy when ready>`
- Explorer: `https://polygonscan.com/address/<contract_address>`

## Security Considerations

1. **Private Keys**: Never commit private keys to Git. Use environment variables.
2. **Anonymous Reports**: Reporter addresses are set to `address(0)` for anonymity
3. **Ranger Authorization**: Only authorized rangers can verify reports
4. **Reentrancy Protection**: Contract uses OpenZeppelin's ReentrancyGuard
5. **Input Validation**: Coordinates and data validated before submission

## Gas Costs (Approximate)

- Deploy contract: ~1,856,628 gas
- Submit report: ~280,144 gas
- Verify report: ~134,311 gas
- Claim reward: ~42,189 gas

## Troubleshooting

### Connection Issues
```python
from monitoring.blockchain_service import BlockchainService
bs = BlockchainService()
print(bs.is_connected())  # Should return True
```

### Missing ABI
If `contract_abi.json` is missing, redeploy:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Contract Not Found
Ensure Hardhat node is running and contract is deployed:
```bash
# Terminal 1
npx hardhat node

# Terminal 2
npx hardhat run scripts/deploy.js --network localhost
```

## Future Enhancements

- [ ] IPFS integration for evidence storage
- [ ] Mobile app for anonymous reporting
- [ ] Multi-signature verification (require multiple rangers)
- [ ] NFT certificates for verified reporters
- [ ] DAO governance for reward pool management
- [ ] Zero-knowledge proofs for enhanced anonymity

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Web3.py Documentation](https://web3py.readthedocs.io/)
- [Ethereum Development](https://ethereum.org/developers)

## Support

For issues or questions:
1. Check deployment logs in `blockchain/deployments/`
2. Review Hardhat console output
3. Test connection: `npx hardhat console --network localhost`
4. Contact development team

---

**Last Updated**: January 2025  
**Contract Version**: 1.0.0  
**Solidity Version**: 0.8.20

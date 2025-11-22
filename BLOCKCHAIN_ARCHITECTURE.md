# Anonymous Blockchain Reporting System - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NILOCATE PLATFORM                             │
│                   Endangered Tree Conservation System                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐      ┌──────────────────┐                     │
│  │  Web Browser    │      │  Mobile App      │                     │
│  │  (React 18)     │      │  (Future)        │                     │
│  └────────┬────────┘      └────────┬─────────┘                     │
│           │                        │                                 │
│           └────────────┬───────────┘                                 │
│                        │                                             │
│              ┌─────────▼─────────┐                                  │
│              │ AnonymousReport   │                                  │
│              │     Page.js       │                                  │
│              │                   │                                  │
│              │ ✓ Incident Form   │                                  │
│              │ ✓ GPS Location    │                                  │
│              │ ✓ Evidence Input  │                                  │
│              │ ✓ Anonymous Mode  │                                  │
│              └─────────┬─────────┘                                  │
└──────────────────────┼──────────────────────────────────────────────┘
                        │
                        │ HTTP/HTTPS
                        │
┌───────────────────────▼──────────────────────────────────────────────┐
│                      BACKEND API LAYER                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              Django REST Framework                             │ │
│  │                                                                │ │
│  │  /api/incidents/report_anonymous_blockchain/  (POST)          │ │
│  │  /api/incidents/get_blockchain_report/?id=X   (GET)           │ │
│  │  /api/incidents/{id}/verify_blockchain_report/ (POST)         │ │
│  │  /api/incidents/blockchain_stats/             (GET)           │ │
│  └────────────────────────┬───────────────────────────────────────┘ │
│                           │                                          │
│                           │                                          │
│  ┌────────────────────────▼───────────────────────────────────────┐ │
│  │           Blockchain Service (blockchain_service.py)           │ │
│  │                                                                │ │
│  │  ✓ submit_anonymous_report()                                  │ │
│  │  ✓ get_report()                                               │ │
│  │  ✓ verify_report()                                            │ │
│  │  ✓ update_report_status()                                     │ │
│  │  ✓ generate_report_hash()                                     │ │
│  │                                                                │ │
│  │  Technology: Web3.py 7.14.0                                   │ │
│  └────────────────────────┬───────────────────────────────────────┘ │
└───────────────────────────┼──────────────────────────────────────────┘
                            │
                            │ JSON-RPC
                            │ (Web3 Protocol)
                            │
┌───────────────────────────▼──────────────────────────────────────────┐
│                      BLOCKCHAIN LAYER                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │           Ethereum/Polygon Network                             │ │
│  │                                                                │ │
│  │  Networks:                                                     │ │
│  │  • Local Hardhat (Development)   - http://127.0.0.1:8545     │ │
│  │  • Sepolia Testnet               - Infura/Alchemy RPC         │ │
│  │  • Polygon Mainnet (Production)  - Lower gas costs           │ │
│  └────────────────────────┬───────────────────────────────────────┘ │
│                           │                                          │
│  ┌────────────────────────▼───────────────────────────────────────┐ │
│  │         Smart Contract: AnonymousIncidentReporting.sol         │ │
│  │                    Address: 0x5FbDB...                         │ │
│  │                                                                │ │
│  │  Contract Functions:                                           │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ submitReport(...)          → Submit anonymous report     │ │ │
│  │  │ verifyReport(id, valid, comment) → Ranger verification   │ │ │
│  │  │ updateReportStatus(id, status)   → Update status         │ │ │
│  │  │ claimReward(id, address)         → Claim rewards          │ │ │
│  │  │ getReport(id)                    → Get report details     │ │ │
│  │  │ authorizeRanger(address)         → Add ranger (owner)    │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  Storage:                                                      │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ • reportCount: uint256                                   │ │ │
│  │  │ • reports: mapping(id => IncidentReport)                 │ │ │
│  │  │ • reportVerifications: mapping(id => Verification[])     │ │ │
│  │  │ • authorizedRangers: mapping(address => bool)            │ │ │
│  │  │ • rewardPool: uint256                                    │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  Security:                                                     │ │
│  │  ✓ OpenZeppelin Ownable                                       │ │
│  │  ✓ ReentrancyGuard                                            │ │
│  │  ✓ Input validation                                           │ │
│  │  ✓ Solidity 0.8.20                                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        DATA FLOW DIAGRAM                              │
└──────────────────────────────────────────────────────────────────────┘

1. ANONYMOUS REPORT SUBMISSION
   ────────────────────────────
   
   User (Anonymous) → Frontend Form → API Endpoint
                                         │
                                         ▼
                               blockchain_service.py
                                         │
                         ┌───────────────┴───────────────┐
                         │                               │
                         ▼                               ▼
              Generate report_hash           Format coordinates
              keccak256(data)                (lat/lng * 1e6)
                         │                               │
                         └───────────────┬───────────────┘
                                         │
                                         ▼
                              Smart Contract
                           submitReport(...)
                                         │
                         ┌───────────────┴───────────────┐
                         │                               │
                         ▼                               ▼
                  Store on-chain              Emit IncidentReported
                  (immutable)                      event
                         │                               │
                         └───────────────┬───────────────┘
                                         │
                                         ▼
                           Return transaction_hash
                           report_id, block_number
                                         │
                                         ▼
                                  Show success to user


2. RANGER VERIFICATION FLOW
   ─────────────────────────
   
   Ranger (Authenticated) → Verification API
                                  │
                                  ▼
                        blockchain_service.py
                          verify_report()
                                  │
                                  ▼
                          Smart Contract
                       verifyReport(id, valid)
                                  │
                  ┌───────────────┴────────────────┐
                  │                                │
                  ▼                                ▼
         Store verification              Check verification_count
         Add to array                         >= 3?
                  │                                │
                  │                           Yes  │
                  │                                ▼
                  │                    Auto-update status
                  │                    to VERIFIED
                  │                    Set reward = 0.01 ETH
                  │                                │
                  └────────────────┬───────────────┘
                                   │
                                   ▼
                          Emit ReportVerified
                                   │
                                   ▼
                         Return transaction_hash


3. DATA STRUCTURES
   ───────────────
   
   struct IncidentReport {
       bytes32 reportHash;          // Unique report identifier
       IncidentType incidentType;   // 0-6 (enum)
       SeverityLevel severity;      // 0-3 (enum)
       ReportStatus status;         // 0-4 (enum)
       uint256 timestamp;           // Block timestamp
       int256 latitude;             // * 1e6 (e.g., -1.27 → -1270000)
       int256 longitude;            // * 1e6 (e.g., 36.82 → 36820000)
       string locationDescription;  // Human-readable location
       bytes32 evidenceHash;        // IPFS hash or evidence hash
       address reporter;            // address(0) if anonymous
       uint256 verificationCount;   // Number of verifications
       bool isAnonymous;            // True for anonymous reports
       uint256 rewardAmount;        // 0.01 ETH if verified
   }
   
   struct Verification {
       address verifier;            // Ranger address
       bool isValid;                // True/false
       string comment;              // Verification notes
       uint256 timestamp;           // Verification time
   }


4. SECURITY MODEL
   ──────────────
   
   ┌──────────────────────────────────────────────────────┐
   │                  ANONYMITY LAYER                     │
   ├──────────────────────────────────────────────────────┤
   │  • Reporter address = address(0)                     │
   │  • Report hash = keccak256(data + timestamp)         │
   │  • No personally identifiable information            │
   │  • Evidence stored as hash (not raw data)            │
   └──────────────────────────────────────────────────────┘
                           │
                           ▼
   ┌──────────────────────────────────────────────────────┐
   │               BLOCKCHAIN IMMUTABILITY                │
   ├──────────────────────────────────────────────────────┤
   │  • Data cannot be deleted or modified                │
   │  • Transparent and auditable                         │
   │  • Decentralized storage                             │
   │  • Timestamped on-chain                              │
   └──────────────────────────────────────────────────────┘
                           │
                           ▼
   ┌──────────────────────────────────────────────────────┐
   │              ACCESS CONTROL LAYER                    │
   ├──────────────────────────────────────────────────────┤
   │  • Only owner can authorize rangers                  │
   │  • Only rangers can verify reports                   │
   │  • Only owner can update critical functions          │
   │  • ReentrancyGuard on financial operations           │
   └──────────────────────────────────────────────────────┘


5. DEPLOYMENT ENVIRONMENTS
   ───────────────────────
   
   Development (Local Hardhat):
   ┌────────────────────────────────────────┐
   │ Network: http://127.0.0.1:8545        │
   │ ChainId: 1337                          │
   │ Contract: 0x5FbDB2315678afecb3...     │
   │ Gas Price: 0 (no cost)                 │
   │ Accounts: 20 pre-funded accounts       │
   └────────────────────────────────────────┘
   
   Staging (Sepolia Testnet):
   ┌────────────────────────────────────────┐
   │ Network: Infura/Alchemy                │
   │ ChainId: 11155111                      │
   │ Contract: TBD (deploy)                 │
   │ Gas Price: ~30 gwei                    │
   │ Faucet: https://sepoliafaucet.com     │
   └────────────────────────────────────────┘
   
   Production (Polygon Mainnet):
   ┌────────────────────────────────────────┐
   │ Network: Polygon RPC                   │
   │ ChainId: 137                           │
   │ Contract: TBD (deploy)                 │
   │ Gas Price: ~50 gwei (MATIC)            │
   │ Cost: ~$0.01-0.10 per transaction      │
   └────────────────────────────────────────┘


6. EVENT FLOW
   ──────────
   
   IncidentReported Event:
   ┌─────────────────────────────────────────────┐
   │ emit IncidentReported(                      │
   │     reportId,        // indexed             │
   │     reportHash,      // indexed             │
   │     incidentType,    // uint8               │
   │     severity,        // uint8               │
   │     isAnonymous,     // bool                │
   │     timestamp        // uint256             │
   │ )                                           │
   └─────────────────────────────────────────────┘
              │
              ▼
   Frontend listens → Update UI
   Backend indexes → Store in database (optional)
   Analytics → Track incident trends


TECHNOLOGY STACK SUMMARY:
═══════════════════════════

Frontend:    React 18 + Tailwind CSS + Axios
Backend:     Django 5 + DRF + Web3.py
Blockchain:  Ethereum/Polygon + Solidity 0.8.20
Development: Hardhat 2.22.0 + OpenZeppelin
Testing:     Mocha + Chai + Hardhat Test
Security:    OpenZeppelin + ReentrancyGuard
Storage:     On-chain (blockchain) + IPFS (evidence)

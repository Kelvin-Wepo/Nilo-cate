# 🚀 Quick Start Guide - Blockchain Anonymous Reporting

## Prerequisites
- Node.js 18+ installed
- Python 3.8+ with pip
- Django backend set up
- React frontend set up

## Step 1: Start Hardhat Local Blockchain (Terminal 1)

```bash
cd blockchain
npx hardhat node
```

Keep this running. You should see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

## Step 2: Deploy Smart Contract (Terminal 2)

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

Expected output:
```
✅ Contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## Step 3: Configure Django Backend

Add to `backend/.env` or environment variables:

```bash
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BLOCKCHAIN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
BLOCKCHAIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## Step 4: Start Django Server (Terminal 3)

```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

## Step 5: Test Blockchain Connection

```bash
curl http://localhost:8000/api/incidents/blockchain_stats/
```

Expected response:
```json
{
  "connected": true,
  "total_reports": 0,
  "contract_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
}
```

## Step 6: Submit Test Report

```bash
curl -X POST http://localhost:8000/api/incidents/report_anonymous_blockchain/ \
  -H "Content-Type: application/json" \
  -d '{
    "incident_type": "ILLEGAL_LOGGING",
    "severity": "HIGH",
    "latitude": -1.270000,
    "longitude": 36.820000,
    "location_description": "Karura Forest",
    "description": "Test anonymous report",
    "is_anonymous": true
  }'
```

Expected response:
```json
{
  "message": "Report submitted successfully to blockchain",
  "report_id": 1,
  "transaction_hash": "0x...",
  "report_hash": "0x...",
  "block_number": 1
}
```

## Step 7: Start React Frontend (Terminal 4)

Add route to `frontend/src/App.js`:

```jsx
import AnonymousReportPage from './pages/AnonymousReportPage';

// In your routes:
<Route path="/anonymous-report" element={<AnonymousReportPage />} />
```

Then start:
```bash
cd frontend
npm start
```

Navigate to: `http://localhost:3000/anonymous-report`

## Step 8: Test Frontend

1. Fill out the incident form
2. Click "Submit Anonymous Report to Blockchain"
3. Check transaction hash in success message
4. Verify report count increased

## Verify Everything Works

```bash
# Get report details
curl http://localhost:8000/api/incidents/get_blockchain_report/?report_id=1

# Check blockchain stats
curl http://localhost:8000/api/incidents/blockchain_stats/
```

## Troubleshooting

### "Blockchain not connected"
- Ensure Hardhat node is running (`npx hardhat node`)
- Check RPC URL in Django settings

### "Contract not found"
- Redeploy contract: `npx hardhat run scripts/deploy.js --network localhost`
- Update contract address in `.env`

### "Web3 not installed"
```bash
cd backend
source venv/bin/activate
pip install web3 eth-account
```

### Frontend can't connect
- Check Django server is running: `http://localhost:8000`
- Verify CORS settings in Django
- Check browser console for errors

## Success Indicators

✅ Hardhat node running with accounts  
✅ Smart contract deployed with address  
✅ Django `/blockchain_stats/` returns `connected: true`  
✅ Test report submission succeeds  
✅ Frontend shows blockchain status as "Connected"  
✅ Anonymous report submission works from UI  

## Next Steps

1. **Authorize Rangers**: Use Hardhat console to authorize ranger addresses
2. **Test Verification**: Rangers verify submitted reports
3. **Deploy to Testnet**: Deploy to Sepolia for public testing
4. **Add to Navigation**: Link anonymous reporting in main menu

## Production Deployment

For production:
1. Deploy to Polygon mainnet (lower gas costs)
2. Use secure private key management (AWS KMS, HashiCorp Vault)
3. Set up monitoring and alerting
4. Configure proper RPC endpoints (Infura, Alchemy)
5. Enable contract verification on Polygonscan

---

🎉 **You're ready to use anonymous blockchain reporting!**

For detailed documentation, see:
- `blockchain/README.md` - Full documentation
- `BLOCKCHAIN_IMPLEMENTATION_SUMMARY.md` - Implementation details

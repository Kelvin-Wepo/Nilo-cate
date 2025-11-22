#!/bin/bash

# Blockchain Anonymous Reporting - Integration Test Script
# This script tests the complete system end-to-end

echo "🧪 Starting Blockchain Integration Tests..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Check Hardhat node is running
echo -e "${YELLOW}Test 1: Checking Hardhat node...${NC}"
curl -s -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' > /dev/null 2>&1
test_result $? "Hardhat node is running"

# Test 2: Check Django server is running
echo -e "${YELLOW}Test 2: Checking Django server...${NC}"
curl -s http://localhost:8000/api/ > /dev/null 2>&1
test_result $? "Django server is running"

# Test 3: Check blockchain connection
echo -e "${YELLOW}Test 3: Testing blockchain connection...${NC}"
response=$(curl -s http://localhost:8000/api/incidents/blockchain_stats/)
if echo "$response" | grep -q '"connected":true'; then
    test_result 0 "Blockchain is connected"
    
    # Extract report count
    report_count=$(echo "$response" | grep -o '"total_reports":[0-9]*' | grep -o '[0-9]*')
    echo "   Current report count: $report_count"
else
    test_result 1 "Blockchain is connected"
fi

# Test 4: Submit anonymous report
echo -e "${YELLOW}Test 4: Submitting anonymous report...${NC}"
report_response=$(curl -s -X POST http://localhost:8000/api/incidents/report_anonymous_blockchain/ \
  -H "Content-Type: application/json" \
  -d '{
    "incident_type": "ILLEGAL_LOGGING",
    "severity": "HIGH",
    "latitude": -1.270000,
    "longitude": 36.820000,
    "location_description": "Karura Forest - Integration Test",
    "description": "Automated integration test report",
    "evidence": "test_evidence_hash",
    "is_anonymous": true
  }')

if echo "$report_response" | grep -q '"success":true\|"report_id"'; then
    test_result 0 "Anonymous report submitted successfully"
    
    # Extract report ID
    report_id=$(echo "$report_response" | grep -o '"report_id":[0-9]*' | grep -o '[0-9]*')
    tx_hash=$(echo "$report_response" | grep -o '"transaction_hash":"[^"]*"' | cut -d'"' -f4)
    
    echo "   Report ID: $report_id"
    echo "   Transaction: ${tx_hash:0:20}..."
    
    # Test 5: Retrieve report from blockchain
    echo -e "${YELLOW}Test 5: Retrieving report from blockchain...${NC}"
    sleep 2 # Wait for block confirmation
    
    retrieve_response=$(curl -s "http://localhost:8000/api/incidents/get_blockchain_report/?report_id=$report_id")
    
    if echo "$retrieve_response" | grep -q '"incident_type":"ILLEGAL_LOGGING"'; then
        test_result 0 "Report retrieved successfully from blockchain"
        
        # Check if anonymous
        if echo "$retrieve_response" | grep -q '"is_anonymous":true'; then
            echo "   ✓ Report is anonymous"
        fi
        
        # Check status
        status=$(echo "$retrieve_response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        echo "   Status: $status"
    else
        test_result 1 "Report retrieved successfully from blockchain"
    fi
    
    # Test 6: Check updated stats
    echo -e "${YELLOW}Test 6: Verifying report count increased...${NC}"
    new_stats=$(curl -s http://localhost:8000/api/incidents/blockchain_stats/)
    new_count=$(echo "$new_stats" | grep -o '"total_reports":[0-9]*' | grep -o '[0-9]*')
    
    if [ "$new_count" -gt "$report_count" ]; then
        test_result 0 "Report count increased (was $report_count, now $new_count)"
    else
        test_result 1 "Report count increased"
    fi
else
    test_result 1 "Anonymous report submitted successfully"
    echo "   Error response: $report_response"
fi

# Test 7: Test invalid coordinates
echo -e "${YELLOW}Test 7: Testing coordinate validation...${NC}"
invalid_response=$(curl -s -X POST http://localhost:8000/api/incidents/report_anonymous_blockchain/ \
  -H "Content-Type: application/json" \
  -d '{
    "incident_type": "WILDFIRE",
    "severity": "CRITICAL",
    "latitude": 95.0,
    "longitude": 200.0,
    "location_description": "Invalid location",
    "description": "This should fail",
    "is_anonymous": true
  }')

if echo "$invalid_response" | grep -q 'error'; then
    test_result 0 "Invalid coordinates rejected"
else
    test_result 1 "Invalid coordinates rejected"
fi

# Test 8: Test missing required fields
echo -e "${YELLOW}Test 8: Testing required field validation...${NC}"
missing_field_response=$(curl -s -X POST http://localhost:8000/api/incidents/report_anonymous_blockchain/ \
  -H "Content-Type: application/json" \
  -d '{
    "incident_type": "POLLUTION",
    "severity": "MEDIUM",
    "latitude": -1.5
  }')

if echo "$missing_field_response" | grep -q 'error\|required'; then
    test_result 0 "Missing required fields validation works"
else
    test_result 1 "Missing required fields validation works"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "               TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "✅ Blockchain anonymous reporting system is working correctly!"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the errors above.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Ensure Hardhat node is running: npx hardhat node"
    echo "2. Ensure contract is deployed: npx hardhat run scripts/deploy.js --network localhost"
    echo "3. Ensure Django server is running: python manage.py runserver"
    echo "4. Check environment variables in .env file"
    exit 1
fi

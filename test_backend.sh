#!/bin/bash

# Configuration
BASE_URL="https://uims.bigboyaks-account.workers.dev"
TEST_USER="test_$(date +%s)@example.com"
TEST_PASS="Password123!"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== UIMS Backend Integration Test ===${NC}"
echo "Testing URL: $BASE_URL"

# 1. Test Registration
echo -e "\n${BLUE}[1/5] Testing Registration...${NC}"
REG_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_USER\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"password\": \"$TEST_PASS\",
    \"role\": \"student\"
  }")

REG_STATUS=$(echo "$REG_RESPONSE" | tail -n1)
REG_BODY=$(echo "$REG_RESPONSE" | sed '$d')

if [ "$REG_STATUS" -eq 201 ] || [ "$REG_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✓ Registration Successful ($REG_STATUS)${NC}"
else
    echo -e "${RED}✗ Registration Failed ($REG_STATUS)${NC}"
    echo "Response: $REG_BODY"
fi

# 2. Test Login
echo -e "\n${BLUE}[2/5] Testing Login...${NC}"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_USER\",
    \"password\": \"$TEST_PASS\"
  }")

LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$LOGIN_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✓ Login Successful ($LOGIN_STATUS)${NC}"
    TOKEN=$(echo "$LOGIN_BODY" | grep -o '"accessToken":"[^"]*' | grep -o '[^"]*$')
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}✗ Token not found in response${NC}"
    else
        echo -e "${GREEN}✓ Token acquired${NC}"
    fi
else
    echo -e "${RED}✗ Login Failed ($LOGIN_STATUS)${NC}"
    echo "Response: $LOGIN_BODY"
    exit 1
fi

# 3. Test Student Stats
echo -e "\n${BLUE}[3/5] Testing Student Dashboard Data...${NC}"
STUDENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/academic/students/me/stats" \
  -H "Authorization: Bearer $TOKEN")

STUDENT_STATUS=$(echo "$STUDENT_RESPONSE" | tail -n1)
if [ "$STUDENT_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✓ Student Stats Endpoint Working${NC}"
else
    echo -e "${RED}✗ Student Stats Endpoint Failed ($STUDENT_STATUS)${NC}"
    echo "Response: $(echo "$STUDENT_RESPONSE" | sed '$d')"
fi

# 4. Test Admin Stats (Expect 403 if test user is student)
echo -e "\n${BLUE}[4/5] Testing RBAC (Admin Endpoint)...${NC}"
ADMIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/reporting/admin/stats" \
  -H "Authorization: Bearer $TOKEN")

ADMIN_STATUS=$(echo "$ADMIN_RESPONSE" | tail -n1)
if [ "$ADMIN_STATUS" -eq 403 ]; then
    echo -e "${GREEN}✓ RBAC Working (Access Denied as expected)${NC}"
elif [ "$ADMIN_STATUS" -eq 200 ]; then
    echo -e "${BLUE}ℹ Access Granted (Is user Admin?)${NC}"
else
    echo -e "${RED}✗ Admin Endpoint Error ($ADMIN_STATUS)${NC}"
fi

# 5. Test CORS Options
echo -e "\n${BLUE}[5/5] Testing CORS Preflight...${NC}"
CORS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$BASE_URL/api/v1/auth/login" \
  -H "Access-Control-Request-Method: POST" \
  -H "Origin: https://uims.abhinavkumarsingh.tech")

if [ "$CORS_STATUS" -eq 204 ] || [ "$CORS_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✓ CORS Preflight Working ($CORS_STATUS)${NC}"
else
    echo -e "${RED}✗ CORS Preflight Failed ($CORS_STATUS)${NC}"
fi

echo -e "\n${BLUE}=== Tests Completed ===${NC}"

#!/bin/bash

# Configuration
BASE_URL="http://127.0.0.1:8787"
ADMIN_USER="admin@gtu.edu"
STUDENT_USER="asingh3_be24@thapar.edu"
FACULTY_USER="sushain.sharma@gtu.edu"
STAFF_USER="staff@gtu.edu"
TEST_PASS="password123"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== UIMS Backend Comprehensive API Test ===${NC}"
echo "Testing URL: $BASE_URL"

# Helper for login
login_user() {
  local email=$1
  local pass=$2
  curl -s -X POST "$BASE_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$email\", \"password\": \"$pass\"}" | grep -o '"accessToken":"[^"]*' | grep -o '[^"]*$'
}

# 1. Test Admin Dashboard Endpoints
echo -e "\n${BLUE}[1/5] Testing Admin Module...${NC}"
ADMIN_TOKEN=$(login_user "$ADMIN_USER" "$TEST_PASS")
if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}✗ Admin Login Failed${NC}"
else
    echo -e "${GREEN}✓ Admin Logged In${NC}"
    
    # Admin Stats
    echo -n "Admin Stats: "
    curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/reporting/admin/stats" -H "Authorization: Bearer $ADMIN_TOKEN"
    echo ""
    
    # Enrollment Trends
    echo -n "Enrollment Trends: "
    curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/reporting/enrollment-trends" -H "Authorization: Bearer $ADMIN_TOKEN"
    echo ""

    # Generic CRUD (Users table)
    echo -n "DBMS Control (auth.users): "
    curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/admin/data/auth/users" -H "Authorization: Bearer $ADMIN_TOKEN"
    echo ""
fi

# 2. Test Student Dashboard Endpoints
echo -e "\n${BLUE}[2/5] Testing Student Module...${NC}"
STUDENT_TOKEN=$(login_user "$STUDENT_USER" "$TEST_PASS")
if [ -z "$STUDENT_TOKEN" ]; then
    echo -e "${RED}✗ Student Login Failed${NC}"
else
    echo -e "${GREEN}✓ Student Logged In${NC}"
    
    # Student Stats
    echo -n "Dashboard Stats: "
    curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/academic/students/me/stats" -H "Authorization: Bearer $STUDENT_TOKEN"
    echo ""
    
    # Schedule
    echo -n "Class Schedule: "
    curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/academic/students/me/schedule" -H "Authorization: Bearer $STUDENT_TOKEN"
    echo ""

    # Offerings for Enrollment
    echo -n "Course Offerings: "
    curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/academic/courses/offerings" -H "Authorization: Bearer $STUDENT_TOKEN"
    echo ""
fi

# 3. Test Faculty Dashboard Endpoints
echo -e "\n${BLUE}[3/5] Testing Faculty Module...${NC}"
FACULTY_TOKEN=$(login_user "$FACULTY_USER" "$TEST_PASS")
if [ -z "$FACULTY_TOKEN" ]; then
    echo -e "${RED}✗ Faculty Login Failed${NC}"
else
    echo -e "${GREEN}✓ Faculty Logged In${NC}"
    
    # Faculty Stats
    echo -n "Faculty Stats: "
    curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/academic/faculty/me/stats" -H "Authorization: Bearer $FACULTY_TOKEN"
    echo ""
    
    # Faculty Offerings
    echo -n "My Offerings: "
    curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/academic/faculty/me/offerings" -H "Authorization: Bearer $FACULTY_TOKEN"
    echo ""
fi

# 4. Test Staff Dashboard Endpoints
echo -e "\n${BLUE}[4/5] Testing Staff Module...${NC}"
STAFF_TOKEN=$(login_user "$STAFF_USER" "$TEST_PASS")
if [ -z "$STAFF_TOKEN" ]; then
    echo -e "${RED}✗ Staff Login Failed${NC}"
else
    echo -e "${GREEN}✓ Staff Logged In${NC}"
    
    # Staff Stats
    echo -n "Staff Stats: "
    curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/reporting/staff/stats" -H "Authorization: Bearer $STAFF_TOKEN"
    echo ""

    # Support Tickets CRUD
    echo -n "Tickets Management: "
    curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/admin/data/core/support_tickets" -H "Authorization: Bearer $STAFF_TOKEN"
    echo ""
fi

# 5. Test Profile Connection
echo -e "\n${BLUE}[5/5] Testing Profile Sync...${NC}"
PROFILE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/v1/auth/me" -H "Authorization: Bearer $STUDENT_TOKEN")
if [ "$PROFILE_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✓ Profile Connection Working ($PROFILE_STATUS)${NC}"
else
    echo -e "${RED}✗ Profile Connection Failed ($PROFILE_STATUS)${NC}"
fi

echo -e "\n${BLUE}=== Comprehensive Tests Completed ===${NC}"

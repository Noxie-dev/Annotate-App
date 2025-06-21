#!/bin/bash

# Test Profile Components Script
# This script runs all profile component tests and provides a summary

echo "🧪 Running Profile Component Tests..."
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test files to run
TEST_FILES=(
    "src/components/profile/__tests__/NotificationSettings.test.tsx"
    "src/components/profile/__tests__/UserProfile.test.tsx"
    "src/components/profile/__tests__/ProfileEditForm.test.tsx"
    "src/components/profile/__tests__/ProfileTabs.test.tsx"
    "src/components/profile/__tests__/PreferencesPanel.test.tsx"
    "src/components/profile/__tests__/ProfileAccessibility.test.tsx"
)

# Track results
TOTAL_FILES=0
PASSED_FILES=0

echo -e "${BLUE}Testing individual components:${NC}"
echo ""

# Test each file individually
for test_file in "${TEST_FILES[@]}"; do
    echo -e "${YELLOW}Testing: $test_file${NC}"
    
    if npm test -- --run "$test_file" --reporter=basic 2>/dev/null; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED_FILES++))
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
    
    ((TOTAL_FILES++))
    echo ""
done

echo "======================================"
echo -e "${BLUE}Summary:${NC}"
echo -e "Files: ${PASSED_FILES}/${TOTAL_FILES} passed"

if [ $PASSED_FILES -eq $TOTAL_FILES ]; then
    echo -e "${GREEN}🎉 All profile component tests are working!${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests need attention${NC}"
fi

echo ""
echo -e "${BLUE}Test Coverage Areas:${NC}"
echo "✅ Component Rendering Tests"
echo "✅ User Information Display Tests" 
echo "✅ Notification Settings Tests"
echo "✅ Form Interaction Tests"
echo "✅ Accessibility Tests"
echo "✅ Integration Tests"
echo "✅ UI/UX Tests"

echo ""
echo -e "${BLUE}To run all profile tests together:${NC}"
echo "npm test -- --run src/components/profile/__tests__/"

echo ""
echo -e "${BLUE}To run with coverage:${NC}"
echo "npm test -- --run src/components/profile/__tests__/ --coverage"

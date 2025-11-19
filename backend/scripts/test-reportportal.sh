#!/bin/bash

# ReportPortal Test Runner Script
# This script runs Jest tests and reports results to ReportPortal
# 
# Usage:
#   ./scripts/test-reportportal.sh                    # Default test run
#   ./scripts/test-reportportal.sh --watch            # Watch mode
#   ./scripts/test-reportportal.sh --coverage         # With coverage
#
# Prerequisites:
#   - .env file configured with RP_ENDPOINT, RP_TOKEN, RP_PROJECT

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo -e "${YELLOW}Create a .env file with the following variables:${NC}"
    echo "  RP_ENDPOINT=https://your-reportportal-instance.com"
    echo "  RP_TOKEN=your_api_token_here"
    echo "  RP_PROJECT=your_project_name"
    echo ""
    echo -e "${BLUE}See REPORTPORTAL_SETUP.md for more details${NC}"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Validate required environment variables
if [ -z "$RP_ENDPOINT" ] || [ -z "$RP_TOKEN" ] || [ -z "$RP_PROJECT" ]; then
    echo -e "${RED}❌ Error: Missing required ReportPortal environment variables${NC}"
    echo -e "${YELLOW}Required:${NC}"
    echo "  - RP_ENDPOINT"
    echo "  - RP_TOKEN"
    echo "  - RP_PROJECT"
    exit 1
fi

echo -e "${BLUE}🚀 Running Jest tests with ReportPortal...${NC}"
echo -e "${BLUE}Endpoint: ${NC}$RP_ENDPOINT"
echo -e "${BLUE}Project: ${NC}$RP_PROJECT"
echo -e "${BLUE}Environment: ${NC}${RP_ENV:-development}"
echo ""

# Run Jest with provided arguments
npm test "$@"

TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Tests completed successfully${NC}"
else
    echo -e "${RED}❌ Tests failed with exit code: $TEST_EXIT_CODE${NC}"
fi

exit $TEST_EXIT_CODE




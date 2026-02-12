#!/bin/bash

##
## Quick Test Runner for Android
##
## Runs tests once on all connected devices
##

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TEST_PACKAGE="com.gtunnel.test"
TEST_CLASS="com.gtunnel.test.TestSuiteRunner"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Android Quick Test Runner${NC}"
echo -e "${BLUE}================================${NC}"

# Get connected devices
devices=$(adb devices | grep -w "device" | awk '{print $1}')

if [ -z "$devices" ]; then
    echo -e "${RED}❌ No devices connected${NC}"
    echo "Please connect at least one Android device and enable USB debugging"
    exit 1
fi

echo -e "\n${GREEN}✅ Found connected devices:${NC}"
for device in $devices; do
    manufacturer=$(adb -s $device shell getprop ro.product.manufacturer | tr -d '\r')
    model=$(adb -s $device shell getprop ro.product.model | tr -d '\r')
    version=$(adb -s $device shell getprop ro.build.version.release | tr -d '\r')
    echo "  - $device: $manufacturer $model (Android $version)"
done

echo -e "\n${BLUE}Running tests on all devices...${NC}\n"

# Run tests on each device
for device in $devices; do
    echo -e "${BLUE}Testing device: $device${NC}"
    
    # Clear app data
    adb -s $device shell pm clear $TEST_PACKAGE 2>/dev/null || true
    
    # Run instrumentation tests
    adb -s $device shell am instrument -w \
        -e class $TEST_CLASS \
        $TEST_PACKAGE.test/androidx.test.runner.AndroidJUnitRunner
    
    echo ""
done

echo -e "${GREEN}✅ Tests completed on all devices${NC}"
echo -e "\nReports saved to device storage:"
echo "  - /sdcard/test_reports/"
echo "  - /sdcard/test_screenshots/"
echo ""
echo "To pull reports:"
echo "  adb pull /sdcard/test_reports/ reports/"
echo "  adb pull /sdcard/test_screenshots/ screenshots/"

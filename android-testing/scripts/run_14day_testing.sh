#!/bin/bash

##
## 14-Day Continuous Testing Script for Google Play Console Approval
## 
## This script runs automated tests continuously for 14 days across multiple devices
## with realistic user simulation patterns.
##

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
REPORTS_DIR="$PROJECT_ROOT/reports"
LOGS_DIR="$PROJECT_ROOT/logs"
DURATION_DAYS=14
TESTS_PER_DAY=4  # Run tests 4 times per day (every 6 hours)

# Test package and class
TEST_PACKAGE="com.gtunnel.test"
TEST_CLASS="com.gtunnel.test.TestSuiteRunner"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ✅ $1"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ❌ $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ⚠️  $1"
}

# Create directories
mkdir -p "$REPORTS_DIR"
mkdir -p "$LOGS_DIR"

# Get list of connected devices
get_connected_devices() {
    adb devices | grep -w "device" | awk '{print $1}'
}

# Get device info
get_device_info() {
    local device_id=$1
    local manufacturer=$(adb -s $device_id shell getprop ro.product.manufacturer | tr -d '\r')
    local model=$(adb -s $device_id shell getprop ro.product.model | tr -d '\r')
    local android_version=$(adb -s $device_id shell getprop ro.build.version.release | tr -d '\r')
    local api_level=$(adb -s $device_id shell getprop ro.build.version.sdk | tr -d '\r')
    
    echo "$manufacturer|$model|$android_version|$api_level"
}

# Run tests on a specific device
run_tests_on_device() {
    local device_id=$1
    local test_run=$2
    local day=$3
    
    log "Running tests on device: $device_id (Day $day, Run $test_run)"
    
    # Get device info
    local device_info=$(get_device_info $device_id)
    IFS='|' read -r manufacturer model android_version api_level <<< "$device_info"
    
    log "Device: $manufacturer $model"
    log "Android: $android_version (API $api_level)"
    
    # Clear app data before test
    log "Clearing app data..."
    adb -s $device_id shell pm clear $TEST_PACKAGE 2>/dev/null || true
    
    # Run the instrumentation tests
    log "Starting test execution..."
    local test_output_file="$LOGS_DIR/test_${device_id}_day${day}_run${test_run}_$(date +%Y%m%d_%H%M%S).log"
    
    adb -s $device_id shell am instrument -w \
        -e class $TEST_CLASS \
        -e debug false \
        $TEST_PACKAGE.test/androidx.test.runner.AndroidJUnitRunner \
        2>&1 | tee "$test_output_file"
    
    local test_result=$?
    
    if [ $test_result -eq 0 ]; then
        log_success "Tests completed successfully on $device_id"
    else
        log_error "Tests failed on $device_id with exit code $test_result"
    fi
    
    # Pull test reports and screenshots from device
    pull_test_artifacts $device_id $day $test_run
    
    return $test_result
}

# Pull test artifacts from device
pull_test_artifacts() {
    local device_id=$1
    local day=$2
    local test_run=$3
    
    local artifact_dir="$REPORTS_DIR/device_${device_id}/day_${day}/run_${test_run}"
    mkdir -p "$artifact_dir"
    
    log "Pulling test reports from device..."
    
    # Pull reports
    adb -s $device_id pull /sdcard/test_reports/ "$artifact_dir/reports/" 2>/dev/null || log_warning "No test reports found"
    
    # Pull screenshots
    adb -s $device_id pull /sdcard/test_screenshots/ "$artifact_dir/screenshots/" 2>/dev/null || log_warning "No screenshots found"
    
    log_success "Artifacts saved to: $artifact_dir"
}

# Generate consolidated report
generate_consolidated_report() {
    log "Generating consolidated report..."
    
    local report_file="$REPORTS_DIR/consolidated_report_$(date +%Y%m%d_%H%M%S).json"
    
    python3 "$SCRIPT_DIR/generate_report.py" "$REPORTS_DIR" "$report_file"
    
    if [ -f "$report_file" ]; then
        log_success "Consolidated report generated: $report_file"
    else
        log_error "Failed to generate consolidated report"
    fi
}

# Main testing loop
main() {
    log "=========================================="
    log "14-Day Continuous Testing Started"
    log "=========================================="
    log "Duration: $DURATION_DAYS days"
    log "Tests per day: $TESTS_PER_DAY"
    log "Total test runs: $((DURATION_DAYS * TESTS_PER_DAY))"
    log "=========================================="
    
    # Check for connected devices
    local devices=$(get_connected_devices)
    
    if [ -z "$devices" ]; then
        log_error "No devices connected. Please connect at least one device."
        exit 1
    fi
    
    log_success "Found connected devices:"
    for device in $devices; do
        local device_info=$(get_device_info $device)
        IFS='|' read -r manufacturer model android_version api_level <<< "$device_info"
        log "  - $device: $manufacturer $model (Android $android_version, API $api_level)"
    done
    
    # Calculate wait time between tests (in seconds)
    local wait_time=$((86400 / TESTS_PER_DAY))  # 86400 seconds in a day
    
    log "Wait time between test runs: $((wait_time / 3600)) hours"
    
    # Start testing loop
    local total_runs=$((DURATION_DAYS * TESTS_PER_DAY))
    local current_run=1
    
    while [ $current_run -le $total_runs ]; do
        local current_day=$(( (current_run - 1) / TESTS_PER_DAY + 1 ))
        local run_of_day=$(( (current_run - 1) % TESTS_PER_DAY + 1 ))
        
        log ""
        log "=========================================="
        log "Test Run: $current_run / $total_runs"
        log "Day: $current_day / $DURATION_DAYS"
        log "Run of day: $run_of_day / $TESTS_PER_DAY"
        log "=========================================="
        
        # Run tests on all connected devices
        for device in $devices; do
            run_tests_on_device "$device" "$run_of_day" "$current_day"
        done
        
        # Generate interim report
        if [ $((current_run % 4)) -eq 0 ]; then
            generate_consolidated_report
        fi
        
        current_run=$((current_run + 1))
        
        # Wait before next test run (unless it's the last run)
        if [ $current_run -le $total_runs ]; then
            log "Waiting $((wait_time / 3600)) hours until next test run..."
            sleep $wait_time
        fi
    done
    
    log ""
    log "=========================================="
    log "14-Day Testing Completed!"
    log "=========================================="
    
    # Generate final consolidated report
    generate_consolidated_report
    
    log_success "All tests completed. Reports available in: $REPORTS_DIR"
}

# Trap Ctrl+C to allow graceful shutdown
trap 'log_warning "Testing interrupted by user. Generating final report..."; generate_consolidated_report; exit 130' INT

# Run main function
main "$@"

# Panduan Android Automation Testing - Google Play Console
# Android Automation Testing Guide - Google Play Console

## 📱 Pengantar / Introduction

### Bahasa Indonesia

Tools testing Android ini dirancang untuk menjalankan pengujian otomatis selama 14 hari pada berbagai perangkat Android (smartphone dan tablet) dengan berbagai versi OS (Android 10-13). Hasil pengujian dapat langsung diunggah ke Google Play Console sebagai bukti testing.

### English

These Android testing tools are designed to run automated tests for 14 days on various Android devices (smartphones and tablets) with different OS versions (Android 10-13). Test results can be directly uploaded to Google Play Console as proof of testing.

---

## 🚀 Quick Start

### Prerequisites

1. **Android Studio** installed with SDK tools
2. **ADB (Android Debug Bridge)** configured
3. **Python 3.7+** for report generation
4. **Physical devices** or **emulators** running Android 10-13
5. **USB debugging** enabled on all devices

### Step 1: Setup Project

```bash
cd android-testing/app

# Build the test APK
./gradlew assembleDebug
./gradlew assembleDebugAndroidTest
```

### Step 2: Connect Devices

```bash
# Check connected devices
adb devices

# You should see:
# List of devices attached
# DEVICE_ID_1    device
# DEVICE_ID_2    device
```

### Step 3: Install App on Devices

```bash
# Install on all connected devices
adb -s DEVICE_ID install app-debug.apk
```

### Step 4: Run Tests

```bash
# Quick test (single run on all devices)
cd scripts
./run_tests.sh

# 14-day continuous testing
./run_14day_testing.sh
```

---

## 📋 Test Cases / Kasus Uji

### 1. App Installation Verification
- ✅ Memverifikasi aplikasi ter-install dengan benar
- ✅ Verifies app is properly installed
- ✅ Checks package name and version

### 2. App Launch
- ✅ Meluncurkan aplikasi
- ✅ Launches the application
- ✅ Waits for UI to stabilize

### 3. Login Flow
- ✅ Mengisi username dan password
- ✅ Fills in username and password
- ✅ Clicks login button
- ✅ Verifies login success

### 4. Menu Navigation
- ✅ Membuka menu navigasi
- ✅ Opens navigation menu
- ✅ Tests multiple menu items
- ✅ Verifies navigation works

### 5. Data Input Operations
- ✅ Input teks di text fields
- ✅ Inputs text in text fields
- ✅ Toggles checkboxes and radio buttons
- ✅ Selects from spinners/dropdowns

### 6. Logout
- ✅ Melakukan logout dari aplikasi
- ✅ Logs out from the application
- ✅ Confirms logout dialog
- ✅ Returns to login screen

---

## 🔧 Configuration / Konfigurasi

### Device Configuration

Edit `configs/devices.yml` to configure your test devices:

```yaml
devices:
  - id: "device1"
    name: "Samsung Galaxy S21"
    manufacturer: "Samsung"
    model: "SM-G991B"
    type: "smartphone"
    android_version: "13"
    api_level: 33
    enabled: true
```

### Test Configuration

Adjust test parameters in `configs/devices.yml`:

```yaml
test_config:
  runs_per_day: 4           # Tests 4x per day (every 6 hours)
  testing_duration: 14       # 14 days total
  screenshots:
    on_failure: true         # Capture on errors
    quality: 90
```

---

## 📊 Reports / Laporan

### Report Types

1. **JSON Reports** - Structured data for analysis
   - Location: `reports/*/report_*.json`
   - Format: Detailed test results with timestamps

2. **CSV Reports** - For Google Play Console
   - Location: `reports/*/report_*.csv`
   - Compatible with Google Play Console upload

3. **Consolidated Report** - Summary of all tests
   - Location: `reports/consolidated_report_*.json`
   - Includes device coverage and daily statistics

### Report Structure

```json
{
  "reportType": "Google Play Console Testing Report",
  "generatedAt": "2024-02-12T22:00:00",
  "summary": {
    "totalTests": 84,
    "passed": 80,
    "failed": 4,
    "successRate": 95.24
  },
  "deviceCoverage": {
    "Samsung Galaxy S21": {
      "totalTests": 42,
      "passed": 40,
      "successRate": 95.24
    }
  }
}
```

---

## 📸 Screenshots

Screenshots are automatically captured on test failures:

- **Location**: `reports/device_*/screenshots/`
- **Naming**: `{test_name}_{timestamp}.png`
- **Quality**: 90% PNG compression
- **Cleanup**: Old screenshots deleted after 7 days

---

## 🔄 14-Day Testing Process

### Daily Schedule

```
Day 1-14:
├── 00:00 - Test Run 1
├── 06:00 - Test Run 2
├── 12:00 - Test Run 3
└── 18:00 - Test Run 4
```

### What Happens

1. **Test Execution**
   - Runs on all connected devices
   - Clears app data before each run
   - Executes all test cases

2. **Report Generation**
   - Generates JSON/CSV reports
   - Saves screenshots on failures
   - Updates consolidated report

3. **Cleanup**
   - Removes old screenshots (>7 days)
   - Removes old reports (>30 days)

---

## 📤 Upload to Google Play Console

### Step 1: Generate Final Report

```bash
cd scripts
python3 generate_report.py ../reports ../reports/final_report.json
```

### Step 2: Prepare Files

Collect these files for submission:
- ✅ `final_report.csv` - Main test results
- ✅ `consolidated_report_*.json` - Detailed analysis
- ✅ Screenshots folder - Evidence of testing

### Step 3: Upload to Console

1. Go to **Google Play Console**
2. Select your app
3. Navigate to **Pre-launch report** or **Testing** section
4. Upload CSV file
5. Attach screenshots if requested

---

## 🛠️ Troubleshooting

### Device Not Detected

```bash
# Check ADB connection
adb devices

# Restart ADB server
adb kill-server
adb start-server

# Check USB debugging is enabled on device
```

### Tests Failing

```bash
# Check app logs
adb logcat | grep "gtunnel"

# Check test logs
cat logs/test_*.log

# View screenshots
open reports/device_*/screenshots/
```

### Permission Issues

```bash
# Grant storage permissions
adb shell pm grant com.gtunnel.test android.permission.WRITE_EXTERNAL_STORAGE
adb shell pm grant com.gtunnel.test android.permission.READ_EXTERNAL_STORAGE
```

---

## 📝 Customization

### Adapt to Your App

Edit `TestSuiteRunner.kt` to match your app:

```kotlin
// Change package name
private const val PACKAGE_NAME = "com.your.app"

// Update UI selectors
val loginButton = device.findObject(
    By.res(PACKAGE_NAME, "your_login_button_id")
)
```

### Add More Tests

Create new test methods:

```kotlin
@Test
fun test07_YourCustomTest() {
    val testName = "Your Custom Test"
    testLogger.startTest(testName)
    
    try {
        // Your test logic here
        testLogger.passTest(testName, "Test passed")
    } catch (e: Exception) {
        screenshotHelper.captureScreenshot("custom_test_failed")
        testLogger.failTest(testName, e.message ?: "Failed", e)
        throw e
    }
}
```

---

## ✅ Best Practices

1. **Device Diversity**
   - Test on 3-6 different devices
   - Mix of smartphones and tablets
   - Cover Android 10, 11, 12, 13

2. **Test Duration**
   - Run minimum 14 days
   - 4 tests per day recommended
   - Total: 56+ test runs per device

3. **Real User Simulation**
   - Use realistic data inputs
   - Add delays between actions
   - Test common user flows

4. **Screenshot Evidence**
   - Capture on all failures
   - Include device info in filename
   - Store for 30 days minimum

5. **Report Quality**
   - Include device specifications
   - Show success/failure rates
   - Provide timestamps for all tests

---

## 📚 Additional Resources

### Documentation
- `TestSuiteRunner.kt` - Main test suite
- `TestLogger.kt` - Logging implementation
- `ScreenshotHelper.kt` - Screenshot utilities
- `run_14day_testing.sh` - Continuous testing script
- `generate_report.py` - Report generator

### Android Testing Links
- [Espresso Documentation](https://developer.android.com/training/testing/espresso)
- [UIAutomator Documentation](https://developer.android.com/training/testing/other-components/ui-automator)
- [Google Play Console](https://play.google.com/console)

---

## 🤝 Support

Jika mengalami masalah / If you encounter issues:

1. Check logs in `logs/` directory
2. Review error screenshots in `reports/*/screenshots/`
3. Verify device configuration in `configs/devices.yml`
4. Ensure ADB connection is stable

---

## 📄 License

MIT License

---

**Version:** 1.0.0  
**Last Updated:** 2024-02-12  
**Compatibility:** Android 10-13 (API 29-33)

# Testing Tools for Google Developer Approval
# Alat Testing untuk Persetujuan Google Developer

## 📋 Overview / Ringkasan

This repository contains comprehensive testing tools for Google Developer approval, supporting both **web applications** and **Android applications**.

Repository ini berisi alat testing komprehensif untuk persetujuan Google Developer, mendukung **aplikasi web** dan **aplikasi Android**.

---

## 🌐 Web Application Testing

### Purpose / Tujuan
Validate web applications (like GTunnel) for Google Developer approval with automated health checks, API testing, and performance validation.

Memvalidasi aplikasi web (seperti GTunnel) untuk persetujuan Google Developer dengan health check otomatis, testing API, dan validasi performa.

### Quick Start

```bash
# Start the application
npm start

# Run all tests (in new terminal)
node tester-tools/scripts/run-all-tests.js
```

### Features
- ✅ Health & readiness endpoint validation
- ✅ API functionality testing (GET, POST, concurrent requests)
- ✅ Performance testing with rate limit handling
- ✅ Automated JSON report generation
- ✅ Bilingual documentation (English + Indonesian)

### Documentation
- 📖 [Web Testing README](tester-tools/README.md)
- 📖 [Testing Guide](tester-tools/docs/TESTING_GUIDE.md)
- 📖 [Quick Start](tester-tools/docs/QUICK_START.md)

---

## 📱 Android Application Testing

### Purpose / Tujuan
Automate Android app testing for 14 days across multiple devices (Android 10-13) to meet Google Play Console requirements.

Mengotomatisasi testing aplikasi Android selama 14 hari pada berbagai perangkat (Android 10-13) untuk memenuhi persyaratan Google Play Console.

### Quick Start

```bash
cd android-testing/app

# Build test APKs
./gradlew assembleDebug assembleDebugAndroidTest

# Run quick test
cd ../scripts
./run_tests.sh

# Run 14-day continuous testing
./run_14day_testing.sh
```

### Features
- ✅ Espresso & UIAutomator frameworks
- ✅ 6 comprehensive test cases (install, login, navigation, input, logout)
- ✅ Multi-device support (smartphones & tablets)
- ✅ Android 10-13 coverage (API 29-33)
- ✅ Automatic screenshot on failures
- ✅ Timestamped pass/fail logging
- ✅ 14-day continuous testing with realistic user simulation
- ✅ JSON/CSV reports for Google Play Console

### Test Cases / Kasus Uji

1. **App Installation** - Verify installation
2. **App Launch** - Launch and UI stability
3. **Login Flow** - Username, password, authentication
4. **Menu Navigation** - Navigate through app menus
5. **Data Input** - Text fields, checkboxes, dropdowns
6. **Logout** - Complete logout flow

### Documentation
- 📖 [Android Testing README](android-testing/README.md)
- 📖 [Device Configuration](android-testing/configs/devices.yml)

---

## 📂 Directory Structure

```
gtunnel/
├── tester-tools/                    # Web application testing
│   ├── scripts/
│   │   ├── health-check-validator.js
│   │   ├── api-tester.js
│   │   ├── performance-tester.js
│   │   └── run-all-tests.js
│   ├── configs/
│   │   ├── test-development.yml
│   │   ├── test-production.yml
│   │   ├── test-saucelabs.yml
│   │   └── test-no-rate-limit.yml
│   └── docs/
│       ├── TESTING_GUIDE.md
│       └── QUICK_START.md
│
└── android-testing/                 # Android application testing
    ├── app/
    │   ├── build.gradle
    │   └── src/androidTest/java/com/gtunnel/test/
    │       ├── TestSuiteRunner.kt
    │       ├── TestLogger.kt
    │       └── ScreenshotHelper.kt
    ├── scripts/
    │   ├── run_tests.sh
    │   ├── run_14day_testing.sh
    │   └── generate_report.py
    ├── configs/
    │   └── devices.yml
    └── reports/
        └── (generated reports)
```

---

## 🚀 Getting Started

### Prerequisites

**For Web Testing:**
- Node.js 18+
- Application running on localhost:8080

**For Android Testing:**
- Android Studio with SDK
- ADB (Android Debug Bridge)
- Python 3.7+
- Physical Android devices or emulators
- USB debugging enabled

### Installation

```bash
# Clone repository
git clone https://github.com/MrTeat/gtunnel.git
cd gtunnel

# Install dependencies
npm install
npm run build
```

---

## 📊 Reports / Laporan

### Web Testing Reports

**Location:** `test-report.json` (root directory)

**Format:**
```json
{
  "healthCheck": {"success": true, "duration": "0.04s"},
  "apiTest": {"success": true, "duration": "0.05s"},
  "performanceTest": {"success": true, "duration": "30.11s"},
  "overallStatus": "passed"
}
```

### Android Testing Reports

**Locations:**
- `android-testing/reports/device_*/report_*.json` - Individual reports
- `android-testing/reports/device_*/report_*.csv` - CSV for Google Play Console
- `android-testing/reports/consolidated_report_*.json` - Consolidated summary

**CSV Format (Google Play Console Compatible):**
```csv
Test Name,Status,Start Time,Duration,Device,Android Version,Message
App Installation,PASS,2024-02-12 10:00:00,1234,Samsung S21,13,Success
Login Flow,PASS,2024-02-12 10:00:05,2456,Samsung S21,13,Success
...
```

---

## 📸 Screenshots

**Web Testing:** N/A (Server application)

**Android Testing:**
- Location: `android-testing/reports/device_*/screenshots/`
- Captured automatically on test failures
- Named: `{test_name}_{timestamp}.png`
- Quality: 90% PNG

---

## ⏱️ Testing Duration

### Web Testing
- **Duration:** On-demand
- **Frequency:** As needed before releases
- **Estimated time:** 5-10 minutes per run

### Android Testing
- **Duration:** 14 days continuous
- **Frequency:** 4 tests per day (every 6 hours)
- **Total runs:** 56 per device
- **Total tests:** 336 test cases per device (6 tests × 56 runs)

---

## ✅ Google Developer Approval Checklist

### Web Application
- [ ] All health checks pass (100% success)
- [ ] API tests pass (≥95% success rate)
- [ ] Performance tests pass (latency <200ms)
- [ ] JSON report generated
- [ ] Application stable under load

### Android Application
- [ ] Tests run for minimum 14 days
- [ ] Tested on 3+ different devices
- [ ] Coverage of Android 10-13
- [ ] Mix of smartphones and tablets
- [ ] All test cases pass (≥95% success rate)
- [ ] Screenshots captured for failures
- [ ] CSV report generated for Google Play Console
- [ ] Realistic user simulation patterns

---

## 🛠️ Troubleshooting

### Web Testing Issues

**Server not responding:**
```bash
# Check if server is running
curl http://localhost:8080/health

# Restart server
npm start
```

**Rate limiting errors:**
```bash
# Use no-rate-limit configuration
gtunnel start --config tester-tools/configs/test-no-rate-limit.yml
```

### Android Testing Issues

**No devices found:**
```bash
# Check connected devices
adb devices

# Restart ADB
adb kill-server
adb start-server
```

**Tests failing:**
```bash
# Check logs
cat android-testing/logs/test_*.log

# View screenshots
open android-testing/reports/device_*/screenshots/
```

**Permission errors:**
```bash
# Grant storage permissions
adb shell pm grant com.gtunnel.test android.permission.WRITE_EXTERNAL_STORAGE
adb shell pm grant com.gtunnel.test android.permission.READ_EXTERNAL_STORAGE
```

---

## 📚 Documentation Links

### Web Testing
- [Main README](tester-tools/README.md)
- [Testing Guide (EN/ID)](tester-tools/docs/TESTING_GUIDE.md)
- [Quick Start](tester-tools/docs/QUICK_START.md)

### Android Testing
- [Main README (EN/ID)](android-testing/README.md)
- [Device Configuration](android-testing/configs/devices.yml)

### Framework Documentation
- [Espresso](https://developer.android.com/training/testing/espresso)
- [UIAutomator](https://developer.android.com/training/testing/other-components/ui-automator)
- [Google Play Console](https://play.google.com/console)

---

## 🤝 Support / Dukungan

Need help? / Butuh bantuan?

1. **Check documentation** in respective README files
2. **Review logs** in `logs/` directories
3. **Check screenshots** for visual evidence
4. **Open issue** on GitHub repository

---

## 📄 License

MIT License - See LICENSE file

---

## 🎯 Summary / Ringkasan

This testing toolkit provides everything needed for Google Developer approval:

**Web Applications:**
- Automated health, API, and performance testing
- JSON reports for validation
- Bilingual documentation

**Android Applications:**
- 14-day continuous automated testing
- Multi-device and multi-version coverage
- Screenshot evidence of testing
- CSV/JSON reports for Google Play Console submission

Toolkit testing ini menyediakan semua yang diperlukan untuk persetujuan Google Developer:

**Aplikasi Web:**
- Testing otomatis untuk health, API, dan performa
- Laporan JSON untuk validasi
- Dokumentasi bilingual

**Aplikasi Android:**
- Testing otomatis berkelanjutan 14 hari
- Cakupan multi-perangkat dan multi-versi
- Screenshot sebagai bukti testing
- Laporan CSV/JSON untuk submission Google Play Console

---

**Version:** 1.0.0  
**Last Updated:** 2024-02-12  
**Compatibility:** Node.js 18+, Android 10-13

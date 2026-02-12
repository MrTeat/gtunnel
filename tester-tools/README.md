# GTunnel Tester Tools

## 📦 Alat Testing untuk Persetujuan Google Developer
## 📦 Testing Tools for Google Developer Approval

Kumpulan tools testing komprehensif untuk memvalidasi aplikasi GTunnel sebelum pengajuan persetujuan Google Developer.

A comprehensive collection of testing tools to validate GTunnel application before Google Developer approval submission.

---

## 🚀 Quick Start

### 1. Start GTunnel Application

```bash
npm install
npm run build
npm start
```

### 2. Run All Tests

```bash
node tester-tools/scripts/run-all-tests.js
```

### 3. Review Results

Look for: `🎉 ALL TESTS PASSED!`

---

## 📂 Directory Structure

```
tester-tools/
├── scripts/              # Testing scripts
│   ├── health-check-validator.js    # Health endpoint validation
│   ├── api-tester.js                # API functionality testing
│   ├── performance-tester.js        # Performance and load testing
│   └── run-all-tests.js             # Main test runner
│
├── configs/              # Test configurations
│   ├── test-development.yml         # Development environment config
│   ├── test-production.yml          # Production simulation config
│   └── test-saucelabs.yml           # Sauce Labs integration config
│
└── docs/                 # Documentation
    ├── TESTING_GUIDE.md             # Comprehensive testing guide
    └── QUICK_START.md               # Quick start for testers
```

---

## 🔧 Available Tools

### 1. Health Check Validator
**File:** `scripts/health-check-validator.js`

Validates all health and monitoring endpoints:
- Server health (`/health`)
- Readiness check (`/ready`)
- Dashboard availability
- Metrics endpoint

**Usage:**
```bash
node tester-tools/scripts/health-check-validator.js
```

**Environment Variables:**
- `GTUNNEL_HOST` - Server hostname (default: localhost)
- `GTUNNEL_PORT` - Server port (default: 8080)
- `GTUNNEL_DASHBOARD_PORT` - Dashboard port (default: 8081)
- `GTUNNEL_METRICS_PORT` - Metrics port (default: 9090)

---

### 2. API Tester
**File:** `scripts/api-tester.js`

Comprehensive API testing including:
- GET and POST requests
- Error handling (404, 405 status codes)
- Concurrent request handling
- Response time validation
- Header testing

**Usage:**
```bash
node tester-tools/scripts/api-tester.js
```

**Environment Variables:**
- `GTUNNEL_HOST` - Server hostname
- `GTUNNEL_PORT` - Server port
- `GTUNNEL_API_KEY` - API key for authentication
- `GTUNNEL_TLS` - Enable TLS (true/false)

---

### 3. Performance Tester
**File:** `scripts/performance-tester.js`

Load and performance testing:
- Throughput measurement (RPS)
- Latency statistics (avg, p50, p95, p99)
- Concurrent connection handling
- Resource utilization

**Usage:**
```bash
# Default test
node tester-tools/scripts/performance-tester.js

# Custom configuration
TEST_DURATION=30 TEST_CONCURRENCY=10 TEST_RPS=100 \
  node tester-tools/scripts/performance-tester.js
```

**Environment Variables:**
- `TEST_DURATION` - Test duration in seconds (default: 30)
- `TEST_CONCURRENCY` - Number of concurrent users (default: 10)
- `TEST_RPS` - Target requests per second (default: 100)

---

### 4. Integration Test Runner
**File:** `scripts/run-all-tests.js`

Main test orchestrator that runs all tests and generates a comprehensive report.

**Usage:**
```bash
node tester-tools/scripts/run-all-tests.js
```

**Output:**
- Console output with real-time progress
- `test-report.json` - Detailed JSON report

---

## ⚙️ Configuration Files

### Development Configuration
**File:** `configs/test-development.yml`

Use for local development testing:
- Debug logging
- Lower resource limits
- No TLS
- No authentication

**Usage:**
```bash
gtunnel start --config tester-tools/configs/test-development.yml
```

### Production Configuration
**File:** `configs/test-production.yml`

Simulates production environment:
- Info logging
- Production resource limits
- TLS enabled
- API key authentication
- IP filtering

**Usage:**
```bash
gtunnel start --config tester-tools/configs/test-production.yml
```

### Sauce Labs Configuration
**File:** `configs/test-saucelabs.yml`

For Sauce Labs integration testing:
- Sauce Labs compatibility enabled
- Appropriate resource limits
- API key authentication

**Usage:**
```bash
gtunnel start --config tester-tools/configs/test-saucelabs.yml
```

---

## 📊 Understanding Test Results

### Pass Criteria

✅ **PASSED** - Ready for Google approval:
- All health checks: 100% success
- API tests: ≥95% success rate
- Performance: <200ms average latency
- No critical errors

⚠️ **WARNING** - Needs attention:
- API tests: 90-95% success rate
- Performance: 200-500ms average latency
- Minor errors present

❌ **FAILED** - Not ready:
- API tests: <90% success rate
- Performance: >500ms average latency
- Critical errors found

### Test Reports

After running tests, check:
1. **Console Output** - Real-time test progress and results
2. **test-report.json** - Detailed JSON report with all metrics

---

## 🎯 Testing Checklist for Google Approval

### Before Testing
- [ ] Application builds successfully
- [ ] Dependencies installed
- [ ] Configuration reviewed
- [ ] Ports available (8080, 8081, 9090)

### During Testing
- [ ] Health checks pass
- [ ] API tests pass
- [ ] Performance tests pass
- [ ] No error messages

### After Testing
- [ ] Save test-report.json
- [ ] Take screenshots of results
- [ ] Document any configuration
- [ ] Review all warnings

### Google Approval Requirements
- [ ] All functional tests pass
- [ ] Performance meets requirements
- [ ] Security features validated
- [ ] Documentation complete
- [ ] No critical vulnerabilities

---

## 🐛 Troubleshooting

### Common Issues

**1. Connection Refused**
```
Solution: Start GTunnel before running tests
npm start
```

**2. Port Already in Use**
```
Solution: Stop conflicting applications or change ports
lsof -i :8080  # Check what's using the port
```

**3. Tests Timeout**
```
Solution: Reduce test intensity
TEST_DURATION=10 TEST_CONCURRENCY=5 node tester-tools/scripts/performance-tester.js
```

**4. Permission Denied**
```
Solution: Make scripts executable
chmod +x tester-tools/scripts/*.js
```

---

## 📚 Documentation

- **[Testing Guide](docs/TESTING_GUIDE.md)** - Comprehensive guide (English + Indonesian)
- **[Quick Start](docs/QUICK_START.md)** - Quick start for testers
- **[Main README](../README.md)** - GTunnel main documentation

---

## 🔍 What Gets Tested?

### Functionality
- ✅ Health endpoints (/health, /ready)
- ✅ Dashboard accessibility
- ✅ Metrics endpoint
- ✅ API responses
- ✅ Error handling
- ✅ WebSocket connections

### Performance
- ✅ Response times
- ✅ Throughput (RPS)
- ✅ Concurrent connections
- ✅ Resource usage
- ✅ Latency percentiles

### Security
- ✅ TLS/HTTPS (if enabled)
- ✅ API key authentication
- ✅ Rate limiting
- ✅ Input validation
- ✅ Error messages (no sensitive info)

### Reliability
- ✅ Uptime during tests
- ✅ Memory stability
- ✅ Error recovery
- ✅ Graceful degradation

---

## 🎓 Best Practices

1. **Always test before approval submission**
2. **Run tests in production-like environment**
3. **Save test reports for documentation**
4. **Test with actual network latency**
5. **Review all warnings and errors**
6. **Document any custom configuration**
7. **Test with different load levels**
8. **Verify security features**

---

## 📝 Example Test Session

```bash
# 1. Start GTunnel
npm start

# 2. Run all tests (in another terminal)
node tester-tools/scripts/run-all-tests.js

# 3. Expected output:
# ✅ Health Check Validator completed successfully
# ✅ API Tester completed successfully  
# ✅ Performance Tester completed successfully
# 🎉 ALL TESTS PASSED! Application is ready for deployment.

# 4. Check report
cat test-report.json
```

---

## 🤝 Support

Need help? 

1. **Check Documentation**: Read the full testing guide
2. **Review Logs**: Check application logs for errors
3. **GitHub Issues**: Open an issue with test results
4. **Debug Mode**: Run with `LOG_LEVEL=debug npm start`

---

## 📄 License

MIT License - See main LICENSE file

---

## 🙏 Contributing

Improvements welcome! Please:
1. Test your changes
2. Update documentation
3. Follow existing code style
4. Submit pull request

---

**Version:** 1.0.0  
**Last Updated:** 2024-02-12  
**Maintainer:** GTunnel Team

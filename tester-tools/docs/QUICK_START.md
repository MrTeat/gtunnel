# Quick Start Guide for Testers

## Purpose

This guide helps testers quickly validate GTunnel application for Google Developer approval.

## Prerequisites

- Node.js 18 or higher installed
- GTunnel application built and ready to run
- Terminal/Command Prompt access

## Quick Test (5 minutes)

### Step 1: Start the Application

```bash
# Navigate to project directory
cd gtunnel

# Install dependencies (first time only)
npm install

# Build the project (first time only)
npm run build

# Start the application
npm start
```

Wait for the message: "✓ GTunnel started successfully!"

### Step 2: Run All Tests

Open a new terminal window and run:

```bash
node tester-tools/scripts/run-all-tests.js
```

This will:
1. ✅ Validate health endpoints (30 seconds)
2. ✅ Test API functionality (1 minute)
3. ✅ Run performance tests (10 seconds)

### Step 3: Review Results

Look for:
```
🎉 ALL TESTS PASSED! Application is ready for deployment.
```

If you see this message, the application meets all quality criteria for Google approval.

## Test Results Location

- **Console Output**: Shows real-time test progress
- **test-report.json**: Detailed JSON report saved in the project root

## What's Being Tested?

### 1. Health Check Validator
- Server health endpoint
- Readiness endpoint
- Dashboard availability
- Metrics endpoint

### 2. API Tester
- GET/POST requests
- Error handling
- Concurrent requests
- Response times
- Status codes

### 3. Performance Tester
- Throughput (requests per second)
- Latency (response times)
- Concurrent connection handling
- Resource usage

## Success Criteria

✅ **PASS**: All tests show green checkmarks
- Health endpoints: 100% success rate
- API tests: ≥95% success rate
- Performance: <200ms average latency

⚠️ **WARNING**: Some tests show yellow warnings
- Review specific failures
- May still be acceptable for approval

❌ **FAIL**: Tests show red X marks
- Not ready for approval
- Review and fix issues

## Individual Test Scripts

If you need to run tests separately:

```bash
# Health checks only
node tester-tools/scripts/health-check-validator.js

# API tests only
node tester-tools/scripts/api-tester.js

# Performance tests only
node tester-tools/scripts/performance-tester.js
```

## Custom Test Configuration

### Environment Variables

```bash
# Change test server
export GTUNNEL_HOST=localhost
export GTUNNEL_PORT=8080

# Adjust performance test intensity
export TEST_DURATION=30        # seconds
export TEST_CONCURRENCY=10     # concurrent users
export TEST_RPS=100           # requests per second
```

### Configuration Files

Use different configs for different scenarios:

```bash
# Development testing
gtunnel start --config tester-tools/configs/test-development.yml

# Production simulation
gtunnel start --config tester-tools/configs/test-production.yml

# Sauce Labs integration
gtunnel start --config tester-tools/configs/test-saucelabs.yml
```

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED
```
**Solution**: Make sure GTunnel is running before tests

### Port Already in Use
```
Error: listen EADDRINUSE
```
**Solution**: Stop other applications using ports 8080, 8081, or 9090

### Tests Timeout
```
Error: Request timeout
```
**Solution**: 
- Reduce test intensity
- Check server performance
- Verify network connectivity

### Permission Denied
```
Error: EACCES
```
**Solution** (Unix/Linux/Mac):
```bash
chmod +x tester-tools/scripts/*.js
```

## Next Steps After Testing

1. ✅ Save test-report.json for documentation
2. ✅ Take screenshots of successful test runs
3. ✅ Review any warnings or issues
4. ✅ Document any configuration changes
5. ✅ Proceed with Google Developer approval submission

## Support

For issues or questions:
- Check full documentation: `tester-tools/docs/TESTING_GUIDE.md`
- Review application logs
- Open issue on GitHub: https://github.com/MrTeat/gtunnel/issues

---

**Happy Testing! 🚀**

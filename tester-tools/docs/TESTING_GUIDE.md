# Panduan Testing untuk Persetujuan Google Developer
# Testing Guide for Google Developer Approval

## 📋 Daftar Isi / Table of Contents

1. [Pendahuluan / Introduction](#pendahuluan--introduction)
2. [Persiapan / Preparation](#persiapan--preparation)
3. [Menjalankan Test / Running Tests](#menjalankan-test--running-tests)
4. [Interpretasi Hasil / Interpreting Results](#interpretasi-hasil--interpreting-results)
5. [Troubleshooting](#troubleshooting)
6. [Checklist Persetujuan / Approval Checklist](#checklist-persetujuan--approval-checklist)

---

## Pendahuluan / Introduction

### Bahasa Indonesia

Dokumen ini menjelaskan cara menjalankan test untuk validasi aplikasi GTunnel sebelum mengajukan persetujuan ke Google Developer. Tools testing ini memastikan aplikasi memenuhi standar kualitas dan kinerja yang diperlukan.

### English

This document explains how to run tests to validate the GTunnel application before submitting for Google Developer approval. These testing tools ensure the application meets required quality and performance standards.

---

## Persiapan / Preparation

### 1. Instalasi Dependencies / Install Dependencies

```bash
# Install GTunnel
npm install

# Build the project
npm run build
```

### 2. Menjalankan Aplikasi / Start the Application

Sebelum menjalankan test, pastikan aplikasi GTunnel sudah berjalan:

Before running tests, ensure GTunnel is running:

```bash
# Option 1: Run with default configuration
npm start

# Option 2: Run with custom configuration
gtunnel start --config ./tester-tools/configs/test-development.yml

# Option 3: Run in development mode
npm run dev start
```

### 3. Verifikasi Aplikasi Berjalan / Verify Application is Running

Pastikan endpoint berikut dapat diakses / Ensure these endpoints are accessible:

- Server: http://localhost:8080
- Dashboard: http://localhost:8081
- Metrics: http://localhost:9090/metrics

---

## Menjalankan Test / Running Tests

### Test Cepat / Quick Test (Recommended)

Jalankan semua test secara otomatis / Run all tests automatically:

```bash
node tester-tools/scripts/run-all-tests.js
```

Test ini akan menjalankan:
1. Health Check Validation
2. API Testing
3. Performance Testing

### Test Individual / Individual Tests

#### 1. Health Check Validator

Validasi endpoint kesehatan aplikasi / Validate application health endpoints:

```bash
node tester-tools/scripts/health-check-validator.js
```

**Yang ditest / What's tested:**
- `/health` endpoint
- `/ready` endpoint
- Dashboard availability
- Metrics endpoint

#### 2. API Tester

Test semua API endpoint / Test all API endpoints:

```bash
node tester-tools/scripts/api-tester.js
```

**Yang ditest / What's tested:**
- GET requests
- POST requests
- Error handling (404, 405)
- Concurrent requests
- Response times

#### 3. Performance Tester

Test performa dan beban / Test performance and load:

```bash
# Default test (10 seconds, 5 concurrent users)
node tester-tools/scripts/performance-tester.js

# Custom configuration
TEST_DURATION=30 TEST_CONCURRENCY=10 TEST_RPS=100 node tester-tools/scripts/performance-tester.js
```

**Environment Variables:**
- `TEST_DURATION`: Test duration in seconds (default: 30)
- `TEST_CONCURRENCY`: Number of concurrent users (default: 10)
- `TEST_RPS`: Target requests per second (default: 100)

---

## Interpretasi Hasil / Interpreting Results

### Status Kelulusan / Pass Criteria

✅ **PASSED** - Aplikasi siap untuk persetujuan Google / Application ready for Google approval:
- Semua health checks berhasil / All health checks pass
- Success rate API ≥ 95%
- Average latency < 200ms
- Tidak ada critical errors / No critical errors

⚠️ **NEEDS ATTENTION** - Perlu perbaikan / Needs improvement:
- Success rate 90-95%
- Average latency 200-500ms
- Minor errors yang perlu diperbaiki / Minor errors need fixing

❌ **FAILED** - Tidak siap untuk persetujuan / Not ready for approval:
- Success rate < 90%
- Average latency > 500ms
- Critical errors ditemukan / Critical errors found

### Laporan Test / Test Reports

Setelah menjalankan `run-all-tests.js`, laporan detail akan disimpan di:

After running `run-all-tests.js`, detailed report is saved to:

```
test-report.json
```

File ini berisi:
- Status setiap test
- Durasi eksekusi
- Waktu mulai dan selesai
- Status keseluruhan

---

## Troubleshooting

### Masalah Umum / Common Issues

#### 1. "Connection refused" atau "ECONNREFUSED"

**Penyebab / Cause:** Aplikasi GTunnel tidak berjalan

**Solusi / Solution:**
```bash
# Start GTunnel first
npm start
# or
gtunnel start
```

#### 2. Test timeout atau gagal

**Penyebab / Cause:** Server overloaded atau konfigurasi tidak tepat

**Solusi / Solution:**
```bash
# Reduce test intensity
TEST_DURATION=10 TEST_CONCURRENCY=5 TEST_RPS=50 node tester-tools/scripts/performance-tester.js
```

#### 3. Dashboard tidak dapat diakses

**Penyebab / Cause:** Dashboard port sudah digunakan

**Solusi / Solution:**
```bash
# Check port usage
netstat -an | grep 8081

# Use different port
GTUNNEL_DASHBOARD_PORT=8082 npm start
```

#### 4. Permission denied pada script

**Solusi / Solution:**
```bash
# Make scripts executable (Unix/Linux/Mac)
chmod +x tester-tools/scripts/*.js
```

---

## Checklist Persetujuan / Approval Checklist

Sebelum mengajukan persetujuan Google Developer, pastikan semua item ini sudah dicek:

Before submitting for Google Developer approval, ensure all items are checked:

### ✅ Functionality Tests
- [ ] Semua health endpoints berfungsi / All health endpoints work
- [ ] API merespons dengan benar / API responds correctly
- [ ] Error handling berfungsi / Error handling works
- [ ] Dashboard dapat diakses / Dashboard is accessible
- [ ] Metrics tersedia / Metrics are available

### ✅ Performance Tests
- [ ] Success rate ≥ 95% / Success rate ≥ 95%
- [ ] Average latency < 200ms / Average latency < 200ms
- [ ] Dapat menangani concurrent requests / Handles concurrent requests
- [ ] Tidak ada memory leaks / No memory leaks
- [ ] CPU usage dalam batas wajar / CPU usage is reasonable

### ✅ Security Tests
- [ ] TLS/HTTPS berfungsi (jika diaktifkan) / TLS/HTTPS works (if enabled)
- [ ] API key authentication berfungsi / API key authentication works
- [ ] Rate limiting berfungsi / Rate limiting works
- [ ] Tidak ada credential yang di-hardcode / No hardcoded credentials
- [ ] Input validation berfungsi / Input validation works

### ✅ Documentation
- [ ] README lengkap / README is complete
- [ ] API documentation tersedia / API documentation available
- [ ] Configuration examples tersedia / Configuration examples available
- [ ] Troubleshooting guide tersedia / Troubleshooting guide available

### ✅ Code Quality
- [ ] Linting passes / Linting passes
- [ ] Unit tests pass / Unit tests pass
- [ ] No critical vulnerabilities / No critical vulnerabilities
- [ ] Code follows best practices / Code follows best practices

---

## Mendapatkan Bantuan / Getting Help

Jika Anda mengalami masalah:

If you encounter issues:

1. **Periksa log aplikasi / Check application logs:**
   ```bash
   # Application logs are in JSON format
   # Check console output or log files
   ```

2. **Buka issue di GitHub / Open GitHub issue:**
   - Repository: https://github.com/MrTeat/gtunnel
   - Sertakan output test dan error messages
   - Include test output and error messages

3. **Gunakan mode debug / Use debug mode:**
   ```bash
   # Run with debug logging
   LOG_LEVEL=debug npm start
   ```

---

## Kesimpulan / Conclusion

### Bahasa Indonesia

Dengan menjalankan semua test ini dan memastikan semuanya lulus, aplikasi GTunnel siap untuk diajukan persetujuan Google Developer. Test tools ini memvalidasi:

- Fungsionalitas dasar aplikasi
- Performa dan stabilitas
- Keamanan
- Kesiapan produksi

Simpan laporan test sebagai bukti untuk submission.

### English

By running all these tests and ensuring they pass, the GTunnel application is ready for Google Developer approval submission. These test tools validate:

- Basic application functionality
- Performance and stability
- Security
- Production readiness

Save the test reports as evidence for submission.

---

**Versi / Version:** 1.0.0  
**Terakhir Diperbarui / Last Updated:** 2024-02-12

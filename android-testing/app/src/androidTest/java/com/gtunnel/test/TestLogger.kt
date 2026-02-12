package com.gtunnel.test

import android.content.Context
import android.os.Environment
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import java.io.File
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.*

/**
 * Test Logger for comprehensive test result tracking
 * 
 * Logs test results with timestamps and generates reports in JSON/CSV format
 * compatible with Google Play Console requirements.
 */
class TestLogger(private val context: Context) {
    
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS", Locale.US)
    private val testResults = mutableListOf<TestResult>()
    private val logs = mutableListOf<String>()
    private var currentTestStartTime: Long = 0
    private var deviceInfo: DeviceInfo? = null
    
    companion object {
        private const val REPORT_DIR = "test_reports"
    }
    
    data class DeviceInfo(
        val manufacturer: String,
        val model: String,
        val androidVersion: String,
        val apiLevel: Int,
        val deviceType: String
    )
    
    data class TestResult(
        val testName: String,
        val status: String, // PASS, FAIL, SKIP
        val startTime: String,
        val endTime: String,
        val duration: Long,
        val message: String,
        val errorDetails: String?,
        val screenshots: List<String>,
        val deviceInfo: DeviceInfo?
    )
    
    data class TestReport(
        val reportId: String,
        val timestamp: String,
        val totalTests: Int,
        val passed: Int,
        val failed: Int,
        val skipped: Int,
        val successRate: Double,
        val device: DeviceInfo?,
        val results: List<TestResult>
    )
    
    fun logDeviceInfo(
        manufacturer: String,
        model: String,
        androidVersion: String,
        apiLevel: Int,
        deviceType: String
    ) {
        deviceInfo = DeviceInfo(manufacturer, model, androidVersion, apiLevel, deviceType)
        log("Device: $manufacturer $model")
        log("Android: $androidVersion (API $apiLevel)")
        log("Type: $deviceType")
    }
    
    fun startTest(testName: String) {
        currentTestStartTime = System.currentTimeMillis()
        log(">>> Starting test: $testName")
    }
    
    fun passTest(testName: String, message: String) {
        val endTime = System.currentTimeMillis()
        val duration = endTime - currentTestStartTime
        
        testResults.add(
            TestResult(
                testName = testName,
                status = "PASS",
                startTime = dateFormat.format(Date(currentTestStartTime)),
                endTime = dateFormat.format(Date(endTime)),
                duration = duration,
                message = message,
                errorDetails = null,
                screenshots = emptyList(),
                deviceInfo = deviceInfo
            )
        )
        
        log("✅ PASSED: $testName ($duration ms) - $message")
    }
    
    fun failTest(testName: String, message: String, error: Exception) {
        val endTime = System.currentTimeMillis()
        val duration = endTime - currentTestStartTime
        
        val stackTrace = error.stackTraceToString()
        
        testResults.add(
            TestResult(
                testName = testName,
                status = "FAIL",
                startTime = dateFormat.format(Date(currentTestStartTime)),
                endTime = dateFormat.format(Date(endTime)),
                duration = duration,
                message = message,
                errorDetails = stackTrace,
                screenshots = emptyList(),
                deviceInfo = deviceInfo
            )
        )
        
        log("❌ FAILED: $testName ($duration ms) - $message")
        log("Error: ${error.message}")
    }
    
    fun log(message: String) {
        val timestamp = dateFormat.format(Date())
        val logEntry = "[$timestamp] $message"
        logs.add(logEntry)
        println(logEntry)
    }
    
    fun generateReport() {
        val reportId = "report_${System.currentTimeMillis()}"
        val timestamp = dateFormat.format(Date())
        
        val passed = testResults.count { it.status == "PASS" }
        val failed = testResults.count { it.status == "FAIL" }
        val skipped = testResults.count { it.status == "SKIP" }
        val total = testResults.size
        val successRate = if (total > 0) (passed.toDouble() / total) * 100 else 0.0
        
        val report = TestReport(
            reportId = reportId,
            timestamp = timestamp,
            totalTests = total,
            passed = passed,
            failed = failed,
            skipped = skipped,
            successRate = successRate,
            device = deviceInfo,
            results = testResults
        )
        
        // Save JSON report
        saveJsonReport(report)
        
        // Save CSV report
        saveCsvReport(report)
        
        // Save text log
        saveTextLog()
        
        log("=".repeat(60))
        log("Test Report Generated: $reportId")
        log("Total Tests: $total | Passed: $passed | Failed: $failed | Success Rate: ${String.format("%.2f", successRate)}%")
        log("=".repeat(60))
    }
    
    private fun saveJsonReport(report: TestReport) {
        try {
            val reportsDir = getReportsDirectory()
            val jsonFile = File(reportsDir, "${report.reportId}.json")
            
            val gson = GsonBuilder().setPrettyPrinting().create()
            val json = gson.toJson(report)
            
            FileWriter(jsonFile).use { it.write(json) }
            
            log("JSON report saved: ${jsonFile.absolutePath}")
        } catch (e: Exception) {
            log("Error saving JSON report: ${e.message}")
        }
    }
    
    private fun saveCsvReport(report: TestReport) {
        try {
            val reportsDir = getReportsDirectory()
            val csvFile = File(reportsDir, "${report.reportId}.csv")
            
            FileWriter(csvFile).use { writer ->
                // Write header
                writer.append("Test Name,Status,Start Time,End Time,Duration (ms),Message,Device Manufacturer,Device Model,Android Version,Device Type\n")
                
                // Write data
                report.results.forEach { result ->
                    writer.append("\"${result.testName}\",")
                    writer.append("${result.status},")
                    writer.append("\"${result.startTime}\",")
                    writer.append("\"${result.endTime}\",")
                    writer.append("${result.duration},")
                    writer.append("\"${result.message}\",")
                    writer.append("\"${result.deviceInfo?.manufacturer ?: ""}\",")
                    writer.append("\"${result.deviceInfo?.model ?: ""}\",")
                    writer.append("\"${result.deviceInfo?.androidVersion ?: ""}\",")
                    writer.append("\"${result.deviceInfo?.deviceType ?: ""}\"")
                    writer.append("\n")
                }
            }
            
            log("CSV report saved: ${csvFile.absolutePath}")
        } catch (e: Exception) {
            log("Error saving CSV report: ${e.message}")
        }
    }
    
    private fun saveTextLog() {
        try {
            val reportsDir = getReportsDirectory()
            val logFile = File(reportsDir, "test_log_${System.currentTimeMillis()}.txt")
            
            FileWriter(logFile).use { writer ->
                logs.forEach { log ->
                    writer.append(log)
                    writer.append("\n")
                }
            }
            
            log("Text log saved: ${logFile.absolutePath}")
        } catch (e: Exception) {
            log("Error saving text log: ${e.message}")
        }
    }
    
    private fun getReportsDirectory(): File {
        val externalStorage = Environment.getExternalStorageDirectory()
        val reportsDir = File(externalStorage, REPORT_DIR)
        
        if (!reportsDir.exists()) {
            reportsDir.mkdirs()
        }
        
        return reportsDir
    }
}

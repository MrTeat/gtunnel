package com.gtunnel.test

import android.content.Context
import android.graphics.Bitmap
import android.os.Environment
import androidx.test.uiautomator.UiDevice
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

/**
 * Screenshot Helper for capturing screenshots on test failures
 * 
 * Captures and saves screenshots to external storage for analysis and reporting.
 */
class ScreenshotHelper(
    private val device: UiDevice,
    private val context: Context
) {
    
    companion object {
        private const val SCREENSHOT_DIR = "test_screenshots"
        private const val IMAGE_FORMAT = "PNG"
        private const val IMAGE_QUALITY = 90
    }
    
    private val dateFormat = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US)
    
    /**
     * Capture a screenshot with the given name
     * 
     * @param name Screenshot name (without extension)
     * @return File path of the saved screenshot, or null if failed
     */
    fun captureScreenshot(name: String): String? {
        return try {
            val timestamp = dateFormat.format(Date())
            val filename = "${name}_${timestamp}.png"
            
            val screenshotsDir = getScreenshotsDirectory()
            val screenshotFile = File(screenshotsDir, filename)
            
            // Capture screenshot using UiAutomator
            val success = device.takeScreenshot(screenshotFile)
            
            if (success) {
                println("Screenshot saved: ${screenshotFile.absolutePath}")
                screenshotFile.absolutePath
            } else {
                println("Failed to capture screenshot: $name")
                null
            }
        } catch (e: Exception) {
            println("Error capturing screenshot: ${e.message}")
            e.printStackTrace()
            null
        }
    }
    
    /**
     * Capture screenshot with custom bitmap
     * 
     * @param name Screenshot name
     * @param bitmap Bitmap to save
     * @return File path of the saved screenshot, or null if failed
     */
    fun captureScreenshot(name: String, bitmap: Bitmap): String? {
        return try {
            val timestamp = dateFormat.format(Date())
            val filename = "${name}_${timestamp}.png"
            
            val screenshotsDir = getScreenshotsDirectory()
            val screenshotFile = File(screenshotsDir, filename)
            
            FileOutputStream(screenshotFile).use { out ->
                bitmap.compress(Bitmap.CompressFormat.PNG, IMAGE_QUALITY, out)
                out.flush()
            }
            
            println("Screenshot saved: ${screenshotFile.absolutePath}")
            screenshotFile.absolutePath
        } catch (e: Exception) {
            println("Error saving screenshot: ${e.message}")
            e.printStackTrace()
            null
        }
    }
    
    /**
     * Get or create the screenshots directory
     * 
     * @return Screenshots directory File object
     */
    private fun getScreenshotsDirectory(): File {
        val externalStorage = Environment.getExternalStorageDirectory()
        val screenshotsDir = File(externalStorage, SCREENSHOT_DIR)
        
        if (!screenshotsDir.exists()) {
            screenshotsDir.mkdirs()
        }
        
        return screenshotsDir
    }
    
    /**
     * Clean old screenshots (older than specified days)
     * 
     * @param daysToKeep Number of days to keep screenshots
     */
    fun cleanOldScreenshots(daysToKeep: Int = 7) {
        try {
            val screenshotsDir = getScreenshotsDirectory()
            val cutoffTime = System.currentTimeMillis() - (daysToKeep * 24 * 60 * 60 * 1000L)
            
            screenshotsDir.listFiles()?.forEach { file ->
                if (file.isFile && file.lastModified() < cutoffTime) {
                    if (file.delete()) {
                        println("Deleted old screenshot: ${file.name}")
                    }
                }
            }
        } catch (e: Exception) {
            println("Error cleaning old screenshots: ${e.message}")
        }
    }
}

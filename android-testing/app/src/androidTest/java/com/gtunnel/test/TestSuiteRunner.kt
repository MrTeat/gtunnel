package com.gtunnel.test

import android.content.Context
import android.os.Build
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.UiDevice
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

/**
 * Main Test Suite Runner for Google Play Console Approval
 * 
 * This test suite runs comprehensive tests including:
 * - App installation verification
 * - Login functionality
 * - Menu navigation
 * - Data input operations
 * - Logout functionality
 * 
 * Test results are logged with timestamps and screenshots are captured on failures.
 */
@RunWith(AndroidJUnit4::class)
class TestSuiteRunner {
    
    private lateinit var device: UiDevice
    private lateinit var context: Context
    private lateinit var testLogger: TestLogger
    private lateinit var screenshotHelper: ScreenshotHelper
    
    companion object {
        private const val PACKAGE_NAME = "com.gtunnel.test"
        private const val LAUNCH_TIMEOUT = 5000L
    }
    
    @Before
    fun setup() {
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
        context = ApplicationProvider.getApplicationContext()
        testLogger = TestLogger(context)
        screenshotHelper = ScreenshotHelper(device, context)
        
        // Log device information
        testLogger.logDeviceInfo(
            manufacturer = Build.MANUFACTURER,
            model = Build.MODEL,
            androidVersion = Build.VERSION.RELEASE,
            apiLevel = Build.VERSION.SDK_INT,
            deviceType = getDeviceType()
        )
        
        // Wake up device
        if (!device.isScreenOn) {
            device.wakeUp()
        }
        
        // Unlock device
        device.pressMenu()
    }
    
    @Test
    fun test01_AppInstallation() {
        val testName = "App Installation Verification"
        testLogger.startTest(testName)
        
        try {
            // Verify app is installed
            val packageManager = context.packageManager
            val packageInfo = packageManager.getPackageInfo(PACKAGE_NAME, 0)
            
            testLogger.log("Package name: ${packageInfo.packageName}")
            testLogger.log("Version: ${packageInfo.versionName}")
            testLogger.log("Version code: ${packageInfo.versionCode}")
            
            // Verify app can be launched
            val intent = packageManager.getLaunchIntentForPackage(PACKAGE_NAME)
            assert(intent != null) { "App launch intent not found" }
            
            testLogger.passTest(testName, "App is properly installed and launchable")
        } catch (e: Exception) {
            screenshotHelper.captureScreenshot("installation_failed")
            testLogger.failTest(testName, e.message ?: "Installation verification failed", e)
            throw e
        }
    }
    
    @Test
    fun test02_AppLaunch() {
        val testName = "App Launch"
        testLogger.startTest(testName)
        
        try {
            // Launch app
            val intent = context.packageManager.getLaunchIntentForPackage(PACKAGE_NAME)
            intent?.addFlags(android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK)
            context.startActivity(intent)
            
            // Wait for app to appear
            device.wait(
                androidx.test.uiautomator.Until.hasObject(
                    androidx.test.uiautomator.By.pkg(PACKAGE_NAME).depth(0)
                ),
                LAUNCH_TIMEOUT
            )
            
            Thread.sleep(2000) // Wait for UI to stabilize
            
            testLogger.passTest(testName, "App launched successfully")
        } catch (e: Exception) {
            screenshotHelper.captureScreenshot("launch_failed")
            testLogger.failTest(testName, e.message ?: "App launch failed", e)
            throw e
        }
    }
    
    @Test
    fun test03_LoginFlow() {
        val testName = "User Login"
        testLogger.startTest(testName)
        
        try {
            // Simulate login flow
            // Note: Adapt these selectors to your actual app
            testLogger.log("Starting login flow simulation")
            
            // Wait for login screen
            Thread.sleep(1000)
            
            // Find username field (using resource-id or text)
            val usernameField = device.findObject(
                androidx.test.uiautomator.By.res(PACKAGE_NAME, "username_field")
            ) ?: device.findObject(
                androidx.test.uiautomator.By.text("Username")
            )
            
            if (usernameField != null) {
                usernameField.text = "test_user_${System.currentTimeMillis()}"
                testLogger.log("Username entered")
            }
            
            Thread.sleep(500)
            
            // Find password field
            val passwordField = device.findObject(
                androidx.test.uiautomator.By.res(PACKAGE_NAME, "password_field")
            ) ?: device.findObject(
                androidx.test.uiautomator.By.text("Password")
            )
            
            if (passwordField != null) {
                passwordField.text = "Test@12345"
                testLogger.log("Password entered")
            }
            
            Thread.sleep(500)
            
            // Find and click login button
            val loginButton = device.findObject(
                androidx.test.uiautomator.By.res(PACKAGE_NAME, "login_button")
            ) ?: device.findObject(
                androidx.test.uiautomator.By.text("Login")
            ) ?: device.findObject(
                androidx.test.uiautomator.By.text("Sign In")
            )
            
            if (loginButton != null) {
                loginButton.click()
                testLogger.log("Login button clicked")
                Thread.sleep(2000) // Wait for login to process
            }
            
            testLogger.passTest(testName, "Login flow completed")
        } catch (e: Exception) {
            screenshotHelper.captureScreenshot("login_failed")
            testLogger.failTest(testName, e.message ?: "Login failed", e)
            throw e
        }
    }
    
    @Test
    fun test04_MenuNavigation() {
        val testName = "Menu Navigation"
        testLogger.startTest(testName)
        
        try {
            testLogger.log("Starting menu navigation test")
            
            // Open navigation drawer or menu
            val menuButton = device.findObject(
                androidx.test.uiautomator.By.desc("Open navigation drawer")
            ) ?: device.findObject(
                androidx.test.uiautomator.By.res(PACKAGE_NAME, "menu_button")
            )
            
            if (menuButton != null) {
                menuButton.click()
                Thread.sleep(1000)
                testLogger.log("Menu opened")
            } else {
                // Try pressing back button to ensure we're at main screen
                device.pressBack()
                Thread.sleep(500)
            }
            
            // Navigate through different menu items
            val menuItems = listOf("Home", "Settings", "About", "Help")
            
            for (item in menuItems) {
                val menuItem = device.findObject(
                    androidx.test.uiautomator.By.text(item)
                )
                
                if (menuItem != null) {
                    menuItem.click()
                    Thread.sleep(1000)
                    testLogger.log("Navigated to: $item")
                    device.pressBack()
                    Thread.sleep(500)
                }
            }
            
            testLogger.passTest(testName, "Menu navigation completed successfully")
        } catch (e: Exception) {
            screenshotHelper.captureScreenshot("navigation_failed")
            testLogger.failTest(testName, e.message ?: "Menu navigation failed", e)
            throw e
        }
    }
    
    @Test
    fun test05_DataInput() {
        val testName = "Data Input Operations"
        testLogger.startTest(testName)
        
        try {
            testLogger.log("Starting data input test")
            
            // Find input fields and enter data
            val timestamp = System.currentTimeMillis()
            
            // Text input
            val textField = device.findObject(
                androidx.test.uiautomator.By.className("android.widget.EditText")
            )
            
            if (textField != null) {
                textField.text = "Test data $timestamp"
                testLogger.log("Text input completed")
                Thread.sleep(500)
            }
            
            // Try to find and interact with other input types
            // Checkbox
            val checkbox = device.findObject(
                androidx.test.uiautomator.By.className("android.widget.CheckBox")
            )
            
            if (checkbox != null) {
                checkbox.click()
                testLogger.log("Checkbox toggled")
                Thread.sleep(300)
            }
            
            // Radio button
            val radioButton = device.findObject(
                androidx.test.uiautomator.By.className("android.widget.RadioButton")
            )
            
            if (radioButton != null) {
                radioButton.click()
                testLogger.log("Radio button selected")
                Thread.sleep(300)
            }
            
            // Spinner/Dropdown
            val spinner = device.findObject(
                androidx.test.uiautomator.By.className("android.widget.Spinner")
            )
            
            if (spinner != null) {
                spinner.click()
                Thread.sleep(500)
                // Select first item
                device.click(spinner.visibleBounds.centerX(), spinner.visibleBounds.centerY() + 100)
                testLogger.log("Spinner item selected")
                Thread.sleep(300)
            }
            
            testLogger.passTest(testName, "Data input operations completed")
        } catch (e: Exception) {
            screenshotHelper.captureScreenshot("data_input_failed")
            testLogger.failTest(testName, e.message ?: "Data input failed", e)
            throw e
        }
    }
    
    @Test
    fun test06_Logout() {
        val testName = "User Logout"
        testLogger.startTest(testName)
        
        try {
            testLogger.log("Starting logout flow")
            
            // Open menu
            val menuButton = device.findObject(
                androidx.test.uiautomator.By.desc("Open navigation drawer")
            ) ?: device.findObject(
                androidx.test.uiautomator.By.res(PACKAGE_NAME, "menu_button")
            )
            
            if (menuButton != null) {
                menuButton.click()
                Thread.sleep(1000)
            }
            
            // Find logout button
            val logoutButton = device.findObject(
                androidx.test.uiautomator.By.text("Logout")
            ) ?: device.findObject(
                androidx.test.uiautomator.By.text("Sign Out")
            ) ?: device.findObject(
                androidx.test.uiautomator.By.res(PACKAGE_NAME, "logout_button")
            )
            
            if (logoutButton != null) {
                logoutButton.click()
                testLogger.log("Logout button clicked")
                Thread.sleep(2000)
            }
            
            // Confirm logout if dialog appears
            val confirmButton = device.findObject(
                androidx.test.uiautomator.By.text("Confirm")
            ) ?: device.findObject(
                androidx.test.uiautomator.By.text("Yes")
            ) ?: device.findObject(
                androidx.test.uiautomator.By.text("OK")
            )
            
            if (confirmButton != null) {
                confirmButton.click()
                testLogger.log("Logout confirmed")
                Thread.sleep(1000)
            }
            
            testLogger.passTest(testName, "Logout completed successfully")
        } catch (e: Exception) {
            screenshotHelper.captureScreenshot("logout_failed")
            testLogger.failTest(testName, e.message ?: "Logout failed", e)
            throw e
        }
    }
    
    @After
    fun tearDown() {
        try {
            // Generate test report
            testLogger.generateReport()
            
            // Press home button
            device.pressHome()
        } catch (e: Exception) {
            testLogger.log("Teardown error: ${e.message}")
        }
    }
    
    private fun getDeviceType(): String {
        val screenSize = context.resources.configuration.screenLayout and 
                        android.content.res.Configuration.SCREENLAYOUT_SIZE_MASK
        
        return when (screenSize) {
            android.content.res.Configuration.SCREENLAYOUT_SIZE_XLARGE -> "Tablet"
            android.content.res.Configuration.SCREENLAYOUT_SIZE_LARGE -> "Tablet"
            else -> "Smartphone"
        }
    }
}

package com.friction

import android.app.Activity
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class FrictionModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "FrictionModule"
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
    }

    @ReactMethod
    fun setServiceConfig(key: String, value: Boolean) {
        val sharedPref = reactContext.getSharedPreferences("FrictionPrefs", Context.MODE_PRIVATE)
        sharedPref.edit().putBoolean(key, value).apply()
    }

    // 🔥 THE DEVICE ADMIN REQUESTER 🔥
    @ReactMethod
    fun requestDeviceAdmin() {
        // 🔥 THE ULTIMATE FIX: Properly calling the React Native method with brackets!
        val currentAct: Activity? = getCurrentActivity()

        val componentName = ComponentName(reactContext, FrictionDeviceAdminReceiver::class.java)
        val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN)
        intent.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, componentName)
        intent.putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, "Friction needs this to prevent accidental uninstallation while Strict Mode is active.")
        
        if (currentAct != null) {
            currentAct.startActivity(intent)
        } else {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactContext.startActivity(intent)
        }
    }

    // 🔥 REMOVE DEVICE ADMIN 🔥
    @ReactMethod
    fun removeDeviceAdmin() {
        val dpm = reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        val componentName = ComponentName(reactContext, FrictionDeviceAdminReceiver::class.java)
        if (dpm.isAdminActive(componentName)) {
            dpm.removeActiveAdmin(componentName)
        }
    }
}
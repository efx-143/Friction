package com.friction

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.util.Log
import android.widget.Toast
import android.os.Handler
import android.os.Looper

class ScrollBlockerService : AccessibilityService() {

    private var lastBlockTime = 0L
    private val BLOCK_COOLDOWN = 1500L 
    private var lastPornBlockTime = 0L 

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        val packageName = event.packageName?.toString() ?: ""

        if (event.eventType == AccessibilityEvent.TYPE_VIEW_SCROLLED) return

        // THE FIX: Ignore Keyboard! 
        if (packageName.contains("inputmethod", ignoreCase = true) || 
            packageName.contains("keyboard", ignoreCase = true) ||
            packageName.contains("gboard", ignoreCase = true)) {
            return
        }

        val sharedPref = getSharedPreferences("FrictionPrefs", Context.MODE_PRIVATE)
        val rootNode = rootInActiveWindow ?: return
        
        // ==========================================
        // THE BODYGUARD (Self-Defense)
        // ==========================================
        val isStrictMode = sharedPref.getBoolean("isStrictMode", false)

        if (isStrictMode && (packageName.contains("settings", ignoreCase = true) || 
                             packageName.contains("installer", ignoreCase = true) || 
                             packageName.contains("launcher", ignoreCase = true))) {
            
            if (scanForText(rootNode, "prevent accidental uninstallation") || scanForText(rootNode, "Activate this device admin")) {
                // Bypass for our own activation screen
            } 
            else if (scanForText(rootNode, "Friction") && 
               (scanForText(rootNode, "Uninstall") || scanForText(rootNode, "Force stop") || scanForText(rootNode, "App info"))) {
                
                performGlobalAction(GLOBAL_ACTION_HOME)
                Handler(Looper.getMainLooper()).post {
                    Toast.makeText(applicationContext, "🛡️ FRICTION IS LOCKED!", Toast.LENGTH_LONG).show()
                }
                return
            }
        }

        // ==========================================
        // NSFW & INCOGNITO BLOCKER (Monk Mode)
        // ==========================================
        val isPornBlockerEnabled = sharedPref.getBoolean("pornBlock", false)
        
        // Agar app Friction khud nahi hai, tabhi scan karo
        if (isPornBlockerEnabled && packageName != "com.friction") {
            val currentTime = System.currentTimeMillis()
            // 2 seconds ka cooldown taaki phone hang ya loop mein na phase
            if (currentTime - lastPornBlockTime > 2000L) { 
                if (scanForBadContent(rootNode)) {
                    lastPornBlockTime = System.currentTimeMillis()
                    performGlobalAction(GLOBAL_ACTION_HOME)
                    Handler(Looper.getMainLooper()).post {
                        Toast.makeText(applicationContext, "🛑 FRICTION: Explicit Content Blocked!", Toast.LENGTH_SHORT).show()
                    }
                    return
                }
            }
        }

        if (packageName != "com.instagram.android" && packageName != "com.google.android.youtube") return

        val isAllYtEnabled = sharedPref.getBoolean("allYoutube", false)
        val isAllInstaEnabled = sharedPref.getBoolean("allInstagram", false)
        val isYtEnabled = sharedPref.getBoolean("youtube", false)
        val isInstaEnabled = sharedPref.getBoolean("instagram", false)

        // ==========================================
        // TOTAL APP BLOCK
        // ==========================================
        if (isAllInstaEnabled && packageName == "com.instagram.android") {
            performGlobalAction(GLOBAL_ACTION_HOME)
            Handler(Looper.getMainLooper()).post { Toast.makeText(applicationContext, "🛑 Friction: Instagram is blocked!", Toast.LENGTH_SHORT).show() }
            return
        }

        if (isAllYtEnabled && packageName == "com.google.android.youtube") {
            performGlobalAction(GLOBAL_ACTION_HOME)
            Handler(Looper.getMainLooper()).post { Toast.makeText(applicationContext, "🛑 Friction: YouTube is blocked!", Toast.LENGTH_SHORT).show() }
            return
        }

        val currentTime = System.currentTimeMillis()
        if (currentTime - lastBlockTime < BLOCK_COOLDOWN) return 

        // ==========================================
        // YOUTUBE SHORTS
        // ==========================================
        if (isYtEnabled && packageName == "com.google.android.youtube") {
            if (event.eventType == AccessibilityEvent.TYPE_VIEW_CLICKED) {
                val clickedDesc = event.source?.contentDescription?.toString()?.trim() ?: ""
                if (clickedDesc.equals("Shorts", ignoreCase = true)) {
                    lastBlockTime = System.currentTimeMillis()
                    if (!clickHomeTab(rootNode)) performGlobalAction(GLOBAL_ACTION_BACK)
                    return
                }
            }
            if (isActuallyInShorts(rootNode)) {
                lastBlockTime = System.currentTimeMillis()
                if (!clickHomeTab(rootNode)) performGlobalAction(GLOBAL_ACTION_BACK)
                return
            }
        }

        // ==========================================
        // INSTAGRAM REELS
        // ==========================================
        if (isInstaEnabled && packageName == "com.instagram.android") {
            if (event.eventType == AccessibilityEvent.TYPE_VIEW_CLICKED) {
                val clickedDesc = event.source?.contentDescription?.toString()?.trim() ?: ""
                if (clickedDesc.equals("Reels", ignoreCase = true)) {
                    lastBlockTime = System.currentTimeMillis()
                    if (!clickHomeTab(rootNode)) performGlobalAction(GLOBAL_ACTION_BACK)
                    return
                }
            }
            if (isActuallyInReels(rootNode)) {
                lastBlockTime = System.currentTimeMillis()
                if (!clickHomeTab(rootNode)) performGlobalAction(GLOBAL_ACTION_BACK)
                return
            }
        }
    }

    // THE NEW EXPLICIT CONTENT SCANNER 
    private fun scanForBadContent(node: AccessibilityNodeInfo): Boolean {
        val desc = node.contentDescription?.toString()?.lowercase() ?: ""
        val text = node.text?.toString()?.lowercase() ?: ""

        val combinedText = "$desc $text"

        // 1. Direct Substring Match (Menu bypass fix applied)
        val badSubstrings = listOf(
            "pornhub", "xvideos", "xnxx", "xhamster", "brazzers", "xxx video", "nude",
            "you've gone incognito", "inprivate browsing", "private browsing", 
            "desimms", "heavyr", "blowjob", "porn", "fuck", "fucking"
        )

        for (term in badSubstrings) {
            if (combinedText.contains(term)) return true
        }

        // 2. Exact Word Match
        val exactWords = listOf("ass", "mms")
        for (word in exactWords) {
            val regex = Regex("\\b$word\\b")
            if (regex.containsMatchIn(combinedText)) return true
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            if (scanForBadContent(child)) return true
        }
        return false
    }

    private fun isActuallyInShorts(node: AccessibilityNodeInfo): Boolean {
        var inShorts = false
        fun scan(currentNode: AccessibilityNodeInfo) {
            if (!currentNode.isVisibleToUser) return
            val desc = currentNode.contentDescription?.toString() ?: ""
            if (desc.contains("Like this short", ignoreCase = true) || desc.contains("Dislike this short", ignoreCase = true) || desc.contains("Remix this Short", ignoreCase = true)) {
                inShorts = true
            }
            for (i in 0 until currentNode.childCount) {
                val child = currentNode.getChild(i) ?: continue
                scan(child)
                if (inShorts) return 
            }
        }
        scan(node)
        return inShorts
    }

    private fun isActuallyInReels(node: AccessibilityNodeInfo): Boolean {
        var isReelsCameraVisible = false
        var isBottomNavVisible = false
        fun scan(currentNode: AccessibilityNodeInfo) {
            if (!currentNode.isVisibleToUser) return
            val desc = currentNode.contentDescription?.toString()?.trim() ?: ""
            if (desc.equals("Search and explore", ignoreCase = true) || desc.equals("Profile", ignoreCase = true)) isBottomNavVisible = true
            if (desc.equals("Create a reel", ignoreCase = true) || desc.equals("Reels camera", ignoreCase = true)) isReelsCameraVisible = true
            for (i in 0 until currentNode.childCount) {
                val child = currentNode.getChild(i) ?: continue
                scan(child)
            }
        }
        scan(node)
        return isBottomNavVisible && isReelsCameraVisible
    }

    private fun clickHomeTab(node: AccessibilityNodeInfo): Boolean {
        val homeNode = findVisibleNodeByDesc(node, "Home")
        var clickableNode = homeNode
        while (clickableNode != null && !clickableNode.isClickable) {
            clickableNode = clickableNode.parent
        }
        if (clickableNode != null && clickableNode.isClickable) {
            clickableNode.performAction(AccessibilityNodeInfo.ACTION_CLICK)
            return true
        }
        return false
    }

    private fun findVisibleNodeByDesc(node: AccessibilityNodeInfo, targetDesc: String): AccessibilityNodeInfo? {
        if (!node.isVisibleToUser) return null 
        val desc = node.contentDescription?.toString() ?: ""
        if (desc.equals(targetDesc, ignoreCase = true)) return node
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            val result = findVisibleNodeByDesc(child, targetDesc)
            if (result != null) return result
        }
        return null
    }

    private fun scanForText(node: AccessibilityNodeInfo, target: String): Boolean {
        val desc = node.contentDescription?.toString() ?: ""
        val text = node.text?.toString() ?: ""
        if (desc.contains(target, ignoreCase = true) || text.contains(target, ignoreCase = true)) return true
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            if (scanForText(child, target)) return true
        }
        return false
    }

    override fun onInterrupt() {}
}
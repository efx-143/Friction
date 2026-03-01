# ==============================================================================
# FRICTION - Custom ProGuard Rules
# ==============================================================================

# 1. Hermes Engine Fix (To prevent 'libhermestooling.so' not found crash)
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.runtime.hermes.** { *; }
-keepclassmembers class com.facebook.hermes.unicode.** { *; }

# 2. SoLoader Fix (Required for loading native libraries in Release builds)
-keep class com.facebook.soloader.** { *; }
-keepnames class com.facebook.soloader.** { *; }

# 3. React Native Core Rules
-keep class com.facebook.react.** { *; }
-keep public class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep public class * extends com.facebook.react.bridge.NativeModule { *; }

# 4. Async Storage Fix
-keep class org.asyncstorage.** { *; }

# 5. Lucide Icons (To prevent icon stripping)
-keep class com.horcrux.svg.** { *; }

# 6. General Optimization Rules
-dontwarn com.facebook.react.**
-dontwarn com.facebook.soloader.**
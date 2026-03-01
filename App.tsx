import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeModules,
  StatusBar,
  TextInput,
  Alert,
  Switch,
  ScrollView,
  ToastAndroid,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Settings, Shield, Play, Lock, Unlock, Instagram, 
  Github, Zap, ArrowLeft, ShieldAlert, Coffee, Ban, EyeOff, CheckCircle 
} from 'lucide-react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const { FrictionModule } = NativeModules;

// ==========================================
// 📱 THE MAIN APP LOGIC COMPONENT
// ==========================================
const FrictionApp = () => {
  const insets = useSafeAreaInsets();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(1);

  const [currentScreen, setCurrentScreen] = useState<'home' | 'settings'>('home');
  const [isStrictMode, setIsStrictMode] = useState(false);
  const [savedPin, setSavedPin] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [inputPin, setInputPin] = useState('');
  
  const [instaEnabled, setInstaEnabled] = useState(false);
  const [ytEnabled, setYtEnabled] = useState(false);
  const [allInstaEnabled, setAllInstaEnabled] = useState(false);
  const [allYtEnabled, setAllYtEnabled] = useState(false);
  const [pornBlocked, setPornBlocked] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const hasSeenTutorial = await AsyncStorage.getItem('hasSeenTutorial');
      if (hasSeenTutorial !== 'true') {
        setShowTutorial(true);
      }

      const strictModeStatus = await AsyncStorage.getItem('isStrictMode');
      const pin = await AsyncStorage.getItem('savedPin');
      
      const instaPref = await AsyncStorage.getItem('instaPref');
      const ytPref = await AsyncStorage.getItem('ytPref');
      const allInstaPref = await AsyncStorage.getItem('allInstaPref');
      const allYtPref = await AsyncStorage.getItem('allYtPref');
      const pornPref = await AsyncStorage.getItem('pornPref');
      
      if (strictModeStatus === 'true' && pin) {
        setIsStrictMode(true); 
        setSavedPin(pin); 
        setIsLocked(true); 
      }
      setInstaEnabled(instaPref === 'true');
      setYtEnabled(ytPref === 'true');
      setAllInstaEnabled(allInstaPref === 'true');
      setAllYtEnabled(allYtPref === 'true');
      setPornBlocked(pornPref === 'true');
    } catch (e) { 
      console.error('Failed to load settings.'); 
    } finally {
      setIsLoading(false);
    }
  };

  const finishTutorial = async () => {
    await AsyncStorage.setItem('hasSeenTutorial', 'true');
    setShowTutorial(false);
  };

  const unlockDashboard = () => {
    if (inputPin === savedPin) {
      setIsLocked(false); setInputPin('');
    } else { Alert.alert('Access Denied', 'Incorrect PIN. Get back to work.'); }
  };

  const toggleStrictMode = async () => {
    if (isStrictMode) {
      if (inputPin !== savedPin) { Alert.alert('Access Denied', 'Enter correct PIN to disable shield.'); return; }
      await AsyncStorage.setItem('isStrictMode', 'false');
      await AsyncStorage.removeItem('savedPin');
      setIsStrictMode(false); setSavedPin(''); setInputPin('');
      if (FrictionModule) {
        FrictionModule.setServiceConfig('isStrictMode', false);
        FrictionModule.removeDeviceAdmin();
      }
      ToastAndroid.show("Strict Mode Disabled", ToastAndroid.SHORT);
    } else {
      if (inputPin.length !== 4) { Alert.alert('Invalid PIN', 'Enter exactly 4 digits to lock.'); return; }
      await AsyncStorage.setItem('isStrictMode', 'true');
      await AsyncStorage.setItem('savedPin', inputPin);
      setIsStrictMode(true); setSavedPin(inputPin); setInputPin('');
      if (FrictionModule) {
        FrictionModule.setServiceConfig('isStrictMode', true);
        FrictionModule.requestDeviceAdmin();
      }
      ToastAndroid.show("Strict Mode Locked", ToastAndroid.SHORT);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => ToastAndroid.show("Couldn't open link", ToastAndroid.SHORT));
  };

  if (isLoading) return <View style={styles.container} />;

  // ==========================================
  // ONBOARDING TUTORIAL SCREEN
  // ==========================================
  if (showTutorial) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={true} />
        
        <View style={styles.tutorialContent}>
          {tutorialStep === 1 && (
            <>
              <Zap color="#FF3366" size={80} style={{ marginBottom: 30 }} />
              <Text style={styles.bigTitle}>Core Engine</Text>
              <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 15, paddingHorizontal: 20 }]}>
                Friction uses Android's Accessibility Service as an X-Ray vision to detect and block addictive content instantly.
              </Text>
              
              <View style={styles.tutorialBox}>
                <Text style={styles.tutorialBoxText}>1. Tap 'Enable Accessibility' below</Text>
                <Text style={styles.tutorialBoxText}>2. Find 'Friction' in the list</Text>
                <Text style={styles.tutorialBoxText}>3. Turn the switch ON</Text>
              </View>

              <TouchableOpacity style={[styles.actionButton, { width: '100%', marginTop: 40 }]} onPress={() => { if(FrictionModule) FrictionModule.openAccessibilitySettings(); }}>
                <Settings color="#000" size={18} style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonText}>ENABLE ACCESSIBILITY</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButtonOutline, { width: '100%', marginTop: 15 }]} onPress={() => setTutorialStep(2)}>
                <Text style={styles.actionButtonOutlineText}>I'VE ENABLED IT →</Text>
              </TouchableOpacity>
            </>
          )}

          {tutorialStep === 2 && (
            <>
              <ShieldAlert color="#FF3366" size={80} style={{ marginBottom: 30 }} />
              <Text style={styles.bigTitle}>Your Arsenal</Text>
              <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 15, paddingHorizontal: 20, marginBottom: 30 }]}>
                Here is what Friction can do for your productivity:
              </Text>
              
              <View style={styles.featureRow}>
                <Ban color="#FF3366" size={24} style={{ marginRight: 15 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle}>Target Blocks</Text>
                  <Text style={styles.listSubtitle}>Block complete apps or just Reels/Shorts.</Text>
                </View>
              </View>
              
              <View style={styles.featureRow}>
                <EyeOff color="#FF3366" size={24} style={{ marginRight: 15 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle}>Monk Mode</Text>
                  <Text style={styles.listSubtitle}>Instantly kills NSFW content and Incognito tabs.</Text>
                </View>
              </View>

              <View style={styles.featureRow}>
                <Lock color="#FF3366" size={24} style={{ marginRight: 15 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle}>Strict Mode</Text>
                  <Text style={styles.listSubtitle}>Locks the app to prevent you from cheating.</Text>
                </View>
              </View>

              <TouchableOpacity style={[styles.actionButton, { width: '100%', marginTop: 40 }]} onPress={finishTutorial}>
                <CheckCircle color="#000" size={18} style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonText}>ENTER FRICTION</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  // ==========================================
  // LOCK SCREEN (PIN ONLY)
  // ==========================================
  if (isLocked) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={true} />
        <View style={styles.lockContent}>
          <ShieldAlert color="#FF3366" size={70} style={{ marginBottom: 20 }} />
          <Text style={styles.bigTitle}>LOCKED</Text>
          <Text style={styles.subtitle}>Strict Mode is active.</Text>
          <TextInput
            style={styles.pinInputHero} keyboardType="numeric" secureTextEntry maxLength={4}
            value={inputPin} onChangeText={setInputPin}
            placeholder="ENTER 4-DIGIT PIN" placeholderTextColor="#444"
          />
          <TouchableOpacity style={styles.actionButton} onPress={unlockDashboard}>
            <Unlock color="#000" size={18} style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>UNLOCK SYSTEM</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* --- HOME SCREEN --- */}
      {currentScreen === 'home' && (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Friction</Text>
            <View style={styles.headerIcons}>
              {isStrictMode && <Shield color="#FF3366" size={20} style={{ marginRight: 15 }} />}
              <TouchableOpacity onPress={() => setCurrentScreen('settings')} style={styles.iconHitbox}>
                <Settings color="#fff" size={26} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollViewFlex} contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
            
            <Text style={[styles.sectionHeader, { color: '#FF3366' }]}>MONK MODE</Text>
            <View style={[styles.card, { borderColor: '#330011' }]}>
              <View style={styles.cardRow}>
                <View style={[styles.iconBox, {backgroundColor: '#FF3366'}]}><EyeOff color="#fff" size={20} /></View>
                <View style={styles.listTextContainer}>
                  <Text style={[styles.listTitle, { color: '#FF3366' }]}>Block NSFW & Incognito</Text>
                  <Text style={styles.listSubtitle}>Restricts adult content and private tabs</Text>
                </View>
                <Switch 
                  value={pornBlocked} 
                  onValueChange={(val) => {
                    if(isStrictMode) { Alert.alert("Blocked", "Disable Strict Mode in settings."); return; }
                    setPornBlocked(val); AsyncStorage.setItem('pornPref', val.toString()); FrictionModule.setServiceConfig('pornBlock', val);
                  }} 
                  trackColor={{ false: '#222', true: '#FF3366' }} thumbColor={'#fff'} 
                />
              </View>
            </View>

            <Text style={styles.sectionHeader}>INSTAGRAM CONTROLS</Text>
            <View style={styles.card}>
              <View style={[styles.cardRow, { borderBottomWidth: 1, borderBottomColor: '#151515' }]}>
                <View style={[styles.iconBox, {backgroundColor: '#FF3366'}]}><Ban color="#fff" size={20} /></View>
                <View style={styles.listTextContainer}>
                  <Text style={styles.listTitle}>Block Entire App</Text>
                  <Text style={styles.listSubtitle}>Completely restrict Instagram access</Text>
                </View>
                <Switch 
                  value={allInstaEnabled} 
                  onValueChange={(val) => {
                    if(isStrictMode) { Alert.alert("Blocked", "Disable Strict Mode in settings."); return; }
                    setAllInstaEnabled(val); AsyncStorage.setItem('allInstaPref', val.toString()); FrictionModule.setServiceConfig('allInstagram', val);
                  }} 
                  trackColor={{ false: '#222', true: '#FF3366' }} thumbColor={'#fff'} 
                />
              </View>
              <View style={styles.cardRow}>
                <View style={styles.iconBox}><Instagram color="#fff" size={20} /></View>
                <View style={styles.listTextContainer}>
                  <Text style={styles.listTitle}>Block Reels Only</Text>
                  <Text style={styles.listSubtitle}>Allow DMs and feed, block reels</Text>
                </View>
                <Switch 
                  value={instaEnabled} disabled={allInstaEnabled} 
                  onValueChange={(val) => {
                    if(isStrictMode) { Alert.alert("Blocked", "Disable Strict Mode in settings."); return; }
                    setInstaEnabled(val); AsyncStorage.setItem('instaPref', val.toString()); FrictionModule.setServiceConfig('instagram', val);
                  }} 
                  trackColor={{ false: '#222', true: '#FF3366' }} thumbColor={allInstaEnabled ? '#555' : '#fff'} 
                />
              </View>
            </View>

            <Text style={styles.sectionHeader}>YOUTUBE CONTROLS</Text>
            <View style={styles.card}>
              <View style={[styles.cardRow, { borderBottomWidth: 1, borderBottomColor: '#151515' }]}>
                <View style={[styles.iconBox, {backgroundColor: '#FF3366'}]}><Ban color="#fff" size={20} /></View>
                <View style={styles.listTextContainer}>
                  <Text style={styles.listTitle}>Block Entire App</Text>
                  <Text style={styles.listSubtitle}>Completely restrict YouTube access</Text>
                </View>
                <Switch 
                  value={allYtEnabled} 
                  onValueChange={(val) => {
                    if(isStrictMode) { Alert.alert("Blocked", "Disable Strict Mode in settings."); return; }
                    setAllYtEnabled(val); AsyncStorage.setItem('allYtPref', val.toString()); FrictionModule.setServiceConfig('allYoutube', val);
                  }} 
                  trackColor={{ false: '#222', true: '#FF3366' }} thumbColor={'#fff'} 
                />
              </View>
              <View style={styles.cardRow}>
                <View style={styles.iconBox}><Play color="#fff" size={20} /></View>
                <View style={styles.listTextContainer}>
                  <Text style={styles.listTitle}>Block Shorts Only</Text>
                  <Text style={styles.listSubtitle}>Allow regular videos, block shorts</Text>
                </View>
                <Switch 
                  value={ytEnabled} disabled={allYtEnabled} 
                  onValueChange={(val) => {
                    if(isStrictMode) { Alert.alert("Blocked", "Disable Strict Mode in settings."); return; }
                    setYtEnabled(val); AsyncStorage.setItem('ytPref', val.toString()); FrictionModule.setServiceConfig('youtube', val);
                  }} 
                  trackColor={{ false: '#222', true: '#FF3366' }} thumbColor={allYtEnabled ? '#555' : '#fff'} 
                />
              </View>
            </View>

          </ScrollView>
        </>
      )}

      {/* --- SETTINGS SCREEN --- */}
      {currentScreen === 'settings' && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')} style={[styles.iconHitbox, {flexDirection: 'row', alignItems: 'center'}]}>
              <ArrowLeft color="#fff" size={26} style={{ marginRight: 10 }} />
              <Text style={styles.headerTitle}>Settings</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollViewFlex} contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
            
            <TouchableOpacity style={styles.card} onPress={() => { if(FrictionModule) FrictionModule.openAccessibilitySettings(); }}>
              <View style={styles.cardRow}>
                <View style={styles.iconBox}><Zap color="#fff" size={22} /></View>
                <View style={styles.listTextContainer}>
                  <Text style={styles.listTitle}>Accessibility Service</Text>
                  <Text style={styles.listSubtitle}>Required core engine access</Text>
                </View>
                <Settings color="#444" size={18} />
              </View>
            </TouchableOpacity>

            <View style={styles.card}>
              {!isStrictMode ? (
                <View style={styles.innerCardPadding}>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                    <Lock color="#fff" size={22} style={{marginRight: 15}}/>
                    <View style={{flex: 1}}>
                      <Text style={styles.listTitle}>Enable Strict Mode</Text>
                      <Text style={styles.listSubtitle}>Lock app and prevent uninstallation.</Text>
                    </View>
                  </View>
                  <TextInput style={styles.inputSmall} keyboardType="numeric" secureTextEntry maxLength={4} value={inputPin} onChangeText={setInputPin} placeholder="SET 4-DIGIT PIN" placeholderTextColor="#444" />
                  <TouchableOpacity style={styles.actionButton} onPress={toggleStrictMode}>
                    <Text style={styles.actionButtonText}>ACTIVATE SHIELD</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.innerCardPadding}>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                    <ShieldAlert color="#00FF66" size={22} style={{marginRight: 15}}/>
                    <View style={{flex: 1}}>
                      <Text style={[styles.listTitle, { color: '#00FF66' }]}>Shield is Active</Text>
                      <Text style={styles.listSubtitle}>Enter your PIN below to disable the shield.</Text>
                    </View>
                  </View>
                  <TextInput style={styles.inputSmall} keyboardType="numeric" secureTextEntry maxLength={4} value={inputPin} onChangeText={setInputPin} placeholder="ENTER PIN TO DISABLE" placeholderTextColor="#444" />
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF3366' }]} onPress={toggleStrictMode}>
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>DISABLE SHIELD</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.card} onPress={() => openLink('https://buymeacoffee.com/pov.sanyam')}>
              <View style={styles.cardRow}>
                <View style={[styles.iconBox, {backgroundColor: '#FFDD00'}]}><Coffee color="#000" size={22} /></View>
                <View style={styles.listTextContainer}>
                  <Text style={styles.listTitle}>Buy me a coffee</Text>
                  <Text style={styles.listSubtitle}>Support the development</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.card}>
              <View style={styles.innerCardPadding}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <Shield color="#FF3366" size={36} style={{ marginRight: 15 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listTitle, {fontSize: 18}]}>Friction v1.0</Text>
                    <Text style={styles.listSubtitle}>Distraction Blocker & Focus Assistant</Text>
                  </View>
                </View>
                
                <Text style={styles.devTitle}>DEVELOPED BY</Text>
                <Text style={styles.devName}>SANYAM CHAVAN</Text>
                <Text style={styles.devCollege}>MMIT</Text>
                
                <View style={styles.socialRow}>
                  <TouchableOpacity style={styles.socialBtn} onPress={() => openLink('https://www.instagram.com/efx_.69/')}>
                    <Instagram color="#fff" size={16} style={{ marginRight: 8 }} />
                    <Text style={styles.socialText}>efx_.69</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialBtn} onPress={() => openLink('https://github.com/efx-143')}>
                    <Github color="#fff" size={16} style={{ marginRight: 8 }} />
                    <Text style={styles.socialText}>efx-143</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

          </ScrollView>
        </>
      )}
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <FrictionApp />
    </SafeAreaProvider>
  );
}

// --- STYLES (NEXT PLAYER THEME) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, marginBottom: 5 },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconHitbox: { padding: 5 },
  
  scrollViewFlex: { flex: 1 },
  scrollArea: { flexGrow: 1, paddingBottom: 40, paddingHorizontal: 16 },
  
  sectionHeader: { color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 1.5, marginLeft: 16, marginTop: 15, marginBottom: 8 },
  
  card: { backgroundColor: '#0C0C0C', borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#151515' },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  innerCardPadding: { padding: 20 },
  
  iconBox: { width: 44, height: 44, backgroundColor: '#1A1A1A', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  listTextContainer: { flex: 1, justifyContent: 'center' },
  listTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 2 },
  listSubtitle: { color: '#888', fontSize: 13 },

  inputSmall: { backgroundColor: '#000', color: '#fff', textAlign: 'center', borderRadius: 10, fontSize: 16, padding: 14, borderWidth: 1, borderColor: '#222' },
  actionButton: { backgroundColor: '#fff', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 15, flexDirection: 'row', justifyContent: 'center' },
  actionButtonText: { color: '#000', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  actionButtonOutline: { backgroundColor: 'transparent', padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  actionButtonOutlineText: { color: '#fff', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },

  lockContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  bigTitle: { color: '#fff', fontSize: 32, fontWeight: 'bold', letterSpacing: -1 },
  subtitle: { color: '#888', fontSize: 15, marginTop: 5 },
  pinInputHero: { backgroundColor: '#0C0C0C', color: '#fff', textAlign: 'center', borderRadius: 16, width: '100%', fontSize: 22, padding: 20, marginTop: 40, marginBottom: 20, borderWidth: 1, borderColor: '#151515' },

  devTitle: { color: '#666', fontSize: 11, letterSpacing: 2, marginBottom: 6 },
  devName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  devCollege: { color: '#888', fontSize: 13, marginTop: 2 },
  socialRow: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', width: '100%' },
  socialBtn: { flexDirection: 'row', backgroundColor: '#000', flex: 1, paddingVertical: 14, marginHorizontal: 5, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#222' },
  socialText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  tutorialContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  tutorialBox: { backgroundColor: '#111', padding: 20, borderRadius: 12, marginTop: 30, width: '100%', borderWidth: 1, borderColor: '#222' },
  tutorialBoxText: { color: '#fff', fontSize: 15, marginBottom: 10, fontWeight: '500' },
  featureRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 20, borderRadius: 12, marginBottom: 10, width: '100%', borderWidth: 1, borderColor: '#222' }
});
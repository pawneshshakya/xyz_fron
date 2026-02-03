import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity, StatusBar, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/api';

const { width } = Dimensions.get('window');

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  const COLORS = {
      primary: "#f47b25",
      bgDark: "#121212",
      glassBorder: "rgba(255, 255, 255, 0.1)",
      inputBg: "rgba(0, 0, 0, 0.3)"
  };

  const handleResetPassword = async () => {
    if (!email) {
        Alert.alert('Error', 'Please enter your email address');
        return;
    }
    // API Placeholder
    // try {
    //   await api.post('/auth/forgot-password', { email });
    //   Alert.alert('Success', 'If an account exists, a reset link has been sent.');
    // } catch (error) { ... }
    Alert.alert('Reset Link Sent', `If an account match exists for ${email}, you will receive an email shortly.`);
    setTimeout(() => {
        navigation.navigate('Login');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background Layer with Blur */}
      <View style={styles.absoluteFull}>
         <ImageBackground 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhbx38w-pTf5FjSknnDxymie1fKXFcVF9n1S6sbOysN2pwyfRmP-TE-CTx-APs_0EvQaXM3EupUHDxxSsOac5dkcVhBdXANWtEvNEWXTckfbxW3KjyI9ws4hhzCoG1TMoL8JeVfaxQclBk5ebqfQHIMQA5f5OLBF7dcvUbD-Op_Dt7Ix7VYvfUp197Q9r0LXMIbvlf37NhQT7UflMV7SXZ-ClFTooZfTM1crOBUUYHPRV0RQBcQzYg2CG9vKEThfZ30YRVljfG_i4' }}
            style={[styles.absoluteFull, styles.heroImage]}
            resizeMode="cover"
            blurRadius={8}
         >
             <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.5)']}
                style={styles.absoluteFull}
             />
             <View style={styles.vignette} />
         </ImageBackground>
      </View>

      {/* Helper wrapper for Safe Area content explicitly */}
      <View style={[styles.contentContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      
          {/* Top Indicators */}
          <View style={styles.topBar}>
              <View style={styles.regionIndicator}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.regionText}>REGION: NORTH AMERICA</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.versionText}>v2.105.4.92</Text>
                  <Text style={[styles.serverText, { color: COLORS.primary }]}>LIVE SERVER</Text>
              </View>
          </View>

          {/* Spacer */}
          <View style={{ flex: 1, justifyContent: 'center', width: '100%', maxWidth: 400, alignItems: 'center' }}>

              {/* Main Icon */}
              <View style={styles.logoSection}>
                  <MaterialIcons name="lock-reset" size={64} color={COLORS.primary} style={{ textShadowColor: 'rgba(244,123,37,0.6)', textShadowRadius: 15 }} />
                  <Text style={styles.titleText}>FORGOT PASSWORD?</Text>
              </View>

              {/* Glassmorphism Card */}
              <BlurView intensity={30} tint="dark" style={[styles.card, { borderColor: COLORS.glassBorder }]}>
                  <Text style={styles.descriptionText}>
                      Enter your email address to receive a password reset link.
                  </Text>
                  
                  <View style={styles.formGap}>
                      {/* Email Input */}
                      <View style={styles.inputGroup}>
                          <Text style={styles.label}>EMAIL ADDRESS</Text>
                          <View style={styles.inputWrapper}>
                              <MaterialIcons name="mail" size={20} color="rgba(255,255,255,0.3)" style={styles.inputIcon} />
                              <TextInput 
                                  placeholder="name@example.com"
                                  placeholderTextColor="rgba(255,255,255,0.2)"
                                  value={email}
                                  onChangeText={setEmail}
                                  style={styles.input}
                                  autoCapitalize="none"
                              />
                          </View>
                      </View>

                      {/* Send Button */}
                      <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.primary }]} onPress={handleResetPassword}>
                          <Text style={styles.buttonText}>SEND RESET LINK</Text>
                      </TouchableOpacity>

                      {/* Back Link */}
                      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ alignItems: 'center', paddingTop: 8 }}>
                          <Text style={styles.backLinkText}>BACK TO LOGIN</Text>
                      </TouchableOpacity>
                  </View>
              </BlurView>

          </View>
      </View>

      {/* Corners */}
      <View style={[styles.corner, { top: insets.top + 16, left: 16, borderTopWidth: 1, borderLeftWidth: 1 }]} />
      <View style={[styles.corner, { top: insets.top + 16, right: 16, borderTopWidth: 1, borderRightWidth: 1 }]} />
      <View style={[styles.corner, { bottom: insets.bottom + 16, left: 16, borderBottomWidth: 1, borderLeftWidth: 1 }]} />
      <View style={[styles.corner, { bottom: insets.bottom + 16, right: 16, borderBottomWidth: 1, borderRightWidth: 1 }]} />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  absoluteFull: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  heroImage: {
    transform: [{ scale: 1.1 }],
  },
  vignette: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
  },
  contentContainer: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 24,
  },
  topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
  },
  regionIndicator: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  pulseDot: {
      width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e',
  },
  regionText: {
      color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase',
  },
  versionText: {
      color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '500',
  },
  serverText: {
      fontSize: 8, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase',
  },
  logoSection: {
      alignItems: 'center',
      marginBottom: 32,
  },
  titleText: {
      color: 'white', fontSize: 24, fontWeight: 'bold', fontStyle: 'italic', letterSpacing: -1, marginTop: 16, textAlign: 'center'
  },
  card: {
      width: '100%',
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      padding: 32,
      backgroundColor: 'rgba(20, 20, 20, 0.75)',
  },
  descriptionText: {
      color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500', lineHeight: 18, letterSpacing: 0.5, textAlign: 'center', marginBottom: 24, paddingHorizontal: 8
  },
  formGap: {
      gap: 16,
  },
  inputGroup: {
      gap: 6,
  },
  label: {
      color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold', letterSpacing: 2, marginLeft: 4,
  },
  inputWrapper: {
      position: 'relative', justifyContent: 'center',
  },
  inputIcon: {
      position: 'absolute', left: 12, zIndex: 1,
  },
  input: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      height: 46,
      paddingLeft: 44,
      paddingRight: 16,
      color: 'white',
      fontSize: 14,
  },
  button: {
      width: '100%',
      height: 46,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#f47b25',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
      marginTop: 8,
  },
  buttonText: {
      color: 'white', fontWeight: 'bold', fontSize: 14, letterSpacing: 2,
  },
  backLinkText: {
      color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', marginTop: 8
  },
  corner: {
      position: 'absolute', width: 32, height: 32, borderColor: 'rgba(244,123,37,0.3)', pointerEvents: 'none'
  }
});

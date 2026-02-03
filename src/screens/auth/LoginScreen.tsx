import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AppleAuthentication from "expo-apple-authentication";
import { LoginManager, AccessToken } from "react-native-fbsdk-next";

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get("window");

export const LoginScreen = ({ navigation }: any) => {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
    iosClientId: "YOUR_IOS_CLIENT_ID",
    webClientId: "YOUR_WEB_CLIENT_ID",
  });

  const COLORS = {
    primary: "#f47b25",
    bgDark: "#121212",
    darkGrey: "#1e1e1e",
    glassBorder: "rgba(255, 255, 255, 0.1)",
    inputBg: "rgba(0, 0, 0, 0.3)",
  };

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      handleGoogleLogin(authentication?.accessToken);
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.success) {
        await signIn({
          ...response.data.data,
          token: response.data.data.token,
        });
      } else {
        Alert.alert("Login Failed", response.data.message);
      }
    } catch (error: any) {
      Alert.alert(
        "Login Error",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleGoogleLogin = async (token: string | undefined) => {
    if (!token) return;
    try {
      const response = await api.post("/auth/google", { token }); // Sends access token
      if (response.data.success) {
        await signIn(response.data.data);
      }
    } catch (error: any) {
      Alert.alert("Google Login Error", error.response?.data?.message || error.message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(["public_profile", "email"]);
      if (result.isCancelled) return;

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) throw new Error("Something went wrong obtaining access token");

      const response = await api.post("/auth/facebook", { token: data.accessToken });
      if (response.data.success) {
        await signIn(response.data.data);
      }
    } catch (error: any) {
      Alert.alert("Facebook Login Error", error.response?.data?.message || error.message);
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const response = await api.post("/auth/apple", {
        idToken: credential.identityToken,
        user: credential.fullName // Send name object (firstName, lastName)
          ? { name: credential.fullName, email: credential.email }
          : undefined,
      });

      if (response.data.success) {
        await signIn(response.data.data);
      }
    } catch (e: any) {
      if (e.code === "ERR_CANCELED") {
        // handle that the user canceled the sign-in flow
      } else {
        Alert.alert("Apple Login Error", e.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Background Layer with Blur */}
      <View style={styles.absoluteFull}>
        <ImageBackground
          source={{
            uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhbx38w-pTf5FjSknnDxymie1fKXFcVF9n1S6sbOysN2pwyfRmP-TE-CTx-APs_0EvQaXM3EupUHDxxSsOac5dkcVhBdXANWtEvNEWXTckfbxW3KjyI9ws4hhzCoG1TMoL8JeVfaxQclBk5ebqfQHIMQA5f5OLBF7dcvUbD-Op_Dt7Ix7VYvfUp197Q9r0LXMIbvlf37NhQT7UflMV7SXZ-ClFTooZfTM1crOBUUYHPRV0RQBcQzYg2CG9vKEThfZ30YRVljfG_i4",
          }}
          style={[styles.absoluteFull, styles.heroImage]}
          resizeMode="cover"
          blurRadius={8}
        >
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)"]}
            style={styles.absoluteFull}
          />
          <View style={styles.vignette} />
        </ImageBackground>
      </View>

      {/* Helper wrapper for Safe Area content explicitly */}
      <View
        style={[
          styles.contentContainer,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
        ]}
      >
        {/* Top Indicators */}
        <View style={styles.topBar}>
          <View style={styles.regionIndicator}>
            <View style={styles.pulseDot} />
            <Text style={styles.regionText}>REGION: NORTH AMERICA</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.versionText}>v2.105.4.92</Text>
            <Text style={[styles.serverText, { color: COLORS.primary }]}>
              LIVE SERVER
            </Text>
          </View>
        </View>

        {/* Spacer to push content center */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            width: "100%",
            maxWidth: 400,
            alignItems: "center",
          }}
        >
          {/* Main Logo */}
          <View style={styles.logoSection}>
            <MaterialIcons
              name="military-tech"
              size={64}
              color={COLORS.primary}
              style={{
                textShadowColor: "rgba(244,123,37,0.6)",
                textShadowRadius: 15,
              }}
            />
            <Text style={styles.titleText}>BATTLE ROYALE</Text>
            <Text style={[styles.subtitleText, { color: COLORS.primary }]}>
              MAX
            </Text>
          </View>

          {/* Glassmorphism Login Card */}
          <BlurView
            intensity={30}
            tint="dark"
            style={[styles.loginCard, { borderColor: COLORS.glassBorder }]}
          >
            <View style={styles.formGap}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="mail"
                    size={20}
                    color="rgba(255,255,255,0.3)"
                    style={styles.inputIcon}
                  />
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

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.label}>PASSWORD</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("ForgotPassword")}
                  >
                    <Text style={styles.forgotText}>Forgot?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="lock"
                    size={20}
                    color="rgba(255,255,255,0.3)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                  />
                </View>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={[
                  styles.signInButton,
                  { backgroundColor: COLORS.primary },
                ]}
                onPress={handleLogin}
              >
                <Text style={styles.signInText}>SIGN IN</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR SIGN IN WITH</Text>
                <View style={styles.divider} />
              </View>

              {/* Social Icons */}
              <View style={styles.socialRow}>
                {/* Google */}
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => promptAsync()}
                >
                  <FontAwesome5 name="google" size={18} color="white" />
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleFacebookLogin}
                >
                  <MaterialIcons name="facebook" size={20} color="white" />
                </TouchableOpacity>

                {/* Apple */}
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleAppleLogin}
                  >
                    <FontAwesome5 name="apple" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Create Account */}
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text
                    style={[
                      styles.createAccountText,
                      { color: COLORS.primary },
                    ]}
                  >
                    CREATE ACCOUNT
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </View>

      {/* Corners */}
      <View
        style={[
          styles.corner,
          { top: insets.top + 16, left: 16, borderTopWidth: 1, borderLeftWidth: 1 },
        ]}
      />
      <View
        style={[
          styles.corner,
          { top: insets.top + 16, right: 16, borderTopWidth: 1, borderRightWidth: 1 },
        ]}
      />
      <View
        style={[
          styles.corner,
          { bottom: insets.bottom + 16, left: 16, borderBottomWidth: 1, borderLeftWidth: 1 },
        ]}
      />
      <View
        style={[
          styles.corner,
          { bottom: insets.bottom + 16, right: 16, borderBottomWidth: 1, borderRightWidth: 1 },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  absoluteFull: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroImage: {
    transform: [{ scale: 1.1 }],
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)", // Simulated Vignette/Darken
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  regionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  regionText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  versionText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "500",
  },
  serverText: {
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  titleText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    fontStyle: "italic",
    letterSpacing: -1,
    marginTop: 8,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 6,
    marginTop: 4,
  },
  loginCard: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    padding: 24,
    backgroundColor: "rgba(20, 20, 20, 0.75)", // Fallback / Base color
  },
  formGap: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2,
    marginLeft: 4,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  input: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    height: 46,
    paddingLeft: 44,
    paddingRight: 16,
    color: "white",
    fontSize: 14,
  },
  forgotText: {
    color: "#f47b25",
    fontSize: 10,
    fontWeight: "500",
    opacity: 0.8,
  },
  signInButton: {
    width: "100%",
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f47b25",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  signInText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 2,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  footerRow: {
    flexDirection: "column",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: 16,
    marginTop: 0,
  },
  footerText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  createAccountText: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 2,
    marginTop: 4,
  },
  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: "rgba(244,123,37,0.3)",
    pointerEvents: "none",
  },
});

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { HomeScreen } from '../screens/main/HomeScreen';
import { WalletContainer } from '../screens/main/WalletContainer';
import { MatchDetailScreen } from '../screens/main/MatchDetailScreen';
import { EventsScreen } from '../screens/main/EventsScreen';
import { ScanScreen } from '../screens/main/ScanScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { CreateMatchScreen } from '../screens/main/CreateMatchScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { PersonalInformationScreen } from '../screens/main/PersonalInformationScreen';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { SecurityPrivacyScreen } from '../screens/main/SecurityPrivacyScreen';
import { AchievementsScreen } from '../screens/main/AchievementsScreen';
import { TermsOfServiceScreen } from '../screens/main/TermsOfServiceScreen';
import { PrivacyPolicyScreen } from '../screens/main/PrivacyPolicyScreen';
import { JoinRoomScreen } from '../screens/main/JoinRoomScreen';
import { MatchesListScreen } from '../screens/main/MatchesListScreen';
import { ElitePassScreen } from '../screens/main/ElitePassScreen';
import { AddCashScreen } from '../screens/main/AddCashScreen';
import { WithdrawScreen } from '../screens/main/WithdrawScreen';
import { SendGiftScreen } from '../screens/main/SendGiftScreen';
import { CreateWalletScreen } from '../screens/main/CreateWalletScreen';
import { ChangePasswordScreen } from '../screens/main/ChangePasswordScreen';
import { TwoFactorAuthScreen } from '../screens/main/TwoFactorAuthScreen';
import { LoginActivityScreen } from '../screens/main/LoginActivityScreen';
import { AccountVisibilityScreen } from '../screens/main/AccountVisibilityScreen';
import { PersonalizationScreen } from '../screens/main/PersonalizationScreen';
import { BlockedPlayersScreen } from '../screens/main/BlockedPlayersScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { JoinedMatchScreen } from '../screens/main/JoinedMatchScreen';
import { UploadScreenshotScreen } from '../screens/main/UploadScreenshotScreen';
import { MediatorDashboardScreen } from '../screens/main/MediatorDashboardScreen';
import { MyEventsScreen } from '../screens/main/MyEventsScreen';
import { UserProfileScreen } from '../screens/main/UserProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { CustomTabBar } from '../components/CustomTabBar';

const MainTabs = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarStyle: { position: 'absolute' }, // Required for transparency behind
                tabBarBackground: () => <View style={{ flex: 1 }} />, // Disable default bg
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Events" component={EventsScreen} />
            <Tab.Screen name="Scan" component={ScanScreen} />
            <Tab.Screen name="Wallet" component={WalletContainer} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export const AppNavigator = () => {
    const { authData, loading: authLoading } = useAuth();
    const [splashMinTime, setSplashMinTime] = useState(true);

    useEffect(() => {
        // Enforce Splash Screen for at least 3 seconds to show animations
        const timer = setTimeout(() => {
            setSplashMinTime(false);
        }, 3000); // 3 seconds matches the progress bar animation roughly
        return () => clearTimeout(timer);
    }, []);

    if (authLoading || splashMinTime) {
        return <SplashScreen />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerTransparent: true,
                    headerTintColor: 'white',
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerBackground: () => (
                        <BlurView tint="dark" intensity={100} style={StyleSheet.absoluteFill} />
                    ),
                }}
            >
                {authData ? (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
                        <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="CreateMatch" component={CreateMatchScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="SecurityPrivacy" component={SecurityPrivacyScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Achievements" component={AchievementsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="JoinRoomScreen" component={JoinRoomScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="MatchesList" component={MatchesListScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="MyEvents" component={MyEventsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ElitePass" component={ElitePassScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="AddCash" component={AddCashScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Withdraw" component={WithdrawScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="SendGift" component={SendGiftScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="CreateWallet" component={CreateWalletScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="TwoFactorAuth" component={TwoFactorAuthScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="LoginActivity" component={LoginActivityScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="AccountVisibility" component={AccountVisibilityScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Personalization" component={PersonalizationScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="BlockedPlayers" component={BlockedPlayersScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="JoinedMatch" component={JoinedMatchScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="UploadScreenshot" component={UploadScreenshotScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="MediatorDashboard" component={MediatorDashboardScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ headerShown: false }} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

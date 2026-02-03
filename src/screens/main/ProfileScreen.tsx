import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  StatusBar,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

export const ProfileScreen = ({ navigation }: any) => {
  const { authData, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const COLORS = {
    primary: "#f47b25",
    bgDark: "#0d0d0d",
    cardDark: "#1a1a1a",
    accentBlue: "#2563eb",
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Top Status Bar Blur */}
      <BlurView
        intensity={250}
        tint="dark"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          zIndex: 100,
        }}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAh5AJVtKymLINB1Rn9KLf0PTMYIkgB3Q5LIzoxYUINBFDPzQKls6ZwkJRVwtMGgSP-izheoxRyYg5y3VnHsRTCrzjABw8IpQlH49m6qQcQgNjaXyQ75nJRP5zicKoCr3_OTd7cXc8wtgyKTK5_WBGmfX56S4sVxbxTwlYRcated-55EhAJOC1lWr1Z3_zIVl8ejuZV5mXk3_pqyBGlU1nma9h1VH3TqElVc3gciyzvzZVe4V02RIOi7r8loAkIU2n5sFgMU7LZ-pI",
            }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={[
              "rgba(13,13,13,0)",
              "rgba(13,13,13,0.8)",
              "rgba(13,13,13,1)",
            ]}
            style={styles.heroGradient}
          />

          {/* Top Action Buttons */}
          <View style={[styles.topActions, { top: insets.top + 16 }]}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="share" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarBorder}>
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8SramNZdVi1A8A-J6l2KUxr-hdqaZXJsnAO0_xZjG3BDsC1UQPKiyudff4EEVYR78z4r-WcYTwSWIeDLuOSAVkg_K0mCdOGZZ4N8ot5c04pGmA50sirkGZoW5d3t1ZP536e3ro0c1U0Ooh7LO40NYk2-vUI7Bd2qNVCVykUhwMsQddSGeSwf0XbPrDsuynVt-jEciI8dOHpTgK4QX-aYM9avIdfBTRbYWYBI7CQcp0nwreHu-wZfJK2z5lGUp9DrkpXqlBDqnm4k",
                  }}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>LVL 48</Text>
              </View>
            </View>

            <Text style={styles.username}>
              {authData?.username || "APEX_STALKER"}
            </Text>

            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <MaterialIcons name="military-tech" size={14} color="#fbbf24" />
                <Text style={styles.badgeText}>Diamond Tier</Text>
              </View>
              <View style={styles.badge}>
                <MaterialIcons
                  name="emoji-events"
                  size={14}
                  color={COLORS.primary}
                />
                <Text style={styles.badgeText}>#124 Rank</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialIcons
              name="emoji-events"
              size={24}
              color={COLORS.primary}
            />
            <Text style={styles.statValue}>142</Text>
            <Text style={styles.statLabel}>TOTAL WINS</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="star" size={24} color={COLORS.accentBlue} />
            <Text style={styles.statValue}>389</Text>
            <Text style={styles.statLabel}>TOP 10</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="whatshot" size={24} color="#ef4444" />
            <Text style={styles.statValue}>2.4k</Text>
            <Text style={styles.statLabel}>TOTAL KILLS</Text>
          </View>
        </View>

        {/* Recent Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>REACHED ACHIEVEMENTS</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Achievements")}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}
          >
            <View style={styles.achievementCard}>
              <View
                style={[
                  styles.achievementIcon,
                  { backgroundColor: "rgba(244,123,37,0.1)" },
                ]}
              >
                <MaterialIcons
                  name="local-fire-department"
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.achievementText}>Killstreak Master</Text>
            </View>
            <View style={styles.achievementCard}>
              <View
                style={[
                  styles.achievementIcon,
                  { backgroundColor: "rgba(37,99,235,0.1)" },
                ]}
              >
                <MaterialIcons
                  name="security"
                  size={24}
                  color={COLORS.accentBlue}
                />
              </View>
              <Text style={styles.achievementText}>Survivor Pro</Text>
            </View>
            <View style={styles.achievementCard}>
              <View
                style={[
                  styles.achievementIcon,
                  { backgroundColor: "rgba(234,179,8,0.1)" },
                ]}
              >
                <MaterialIcons name="bolt" size={24} color="#eab308" />
              </View>
              <Text style={styles.achievementText}>First Blood</Text>
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ACCOUNT DETAILS</Text>
          </View>
          <View style={styles.settingsCard}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate("PersonalInformation")}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons name="person" size={20} color={COLORS.primary} />
                <Text style={styles.settingText}>Personal Information</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color="rgba(255,255,255,0.2)"
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate("Wallet")}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons
                  name="account-balance-wallet"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.settingText}>Wallet & Payments</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.walletAmount}>$124.50</Text>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color="rgba(255,255,255,0.2)"
                />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate("Notifications")}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons
                  name="notifications"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color="rgba(255,255,255,0.2)"
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate("SecurityPrivacy")}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons name="shield" size={20} color={COLORS.primary} />
                <Text style={styles.settingText}>Security & Privacy</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color="rgba(255,255,255,0.2)"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        statusBarTranslucent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowLogoutModal(false)}
          >
            <BlurView intensity={120} tint="dark" style={StyleSheet.absoluteFill} />
          </TouchableOpacity>
          
          <View style={styles.glassModal}>
            <View style={styles.modalIconContainer}>
              <MaterialIcons name="logout" size={32} color={COLORS.primary} />
            </View>
            
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.modalSubtitle}>
              Logging out will require you to enter your credentials again.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={() => {
                  setShowLogoutModal(false);
                  signOut();
                }}
              >
                <Text style={styles.confirmButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },
  heroContainer: {
    width: "100%",
    height: 380,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  topActions: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileSection: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarBorder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: "#f47b25",
    padding: 4,
    backgroundColor: "#0d0d0d",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
  },
  levelBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#f47b25",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#0d0d0d",
  },
  levelText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  username: {
    fontSize: 24,
    fontWeight: "900",
    fontStyle: "italic",
    color: "white",
    letterSpacing: -1,
    textTransform: "uppercase",
  },
  badgesRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.8)",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: -8,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "900",
    fontStyle: "italic",
    color: "white",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 4,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  seeAll: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#f47b25",
  },
  achievementsScroll: {
    gap: 12,
  },
  achievementCard: {
    width: 140,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  settingsCard: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  walletAmount: {
    fontSize: 12,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.4)",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    backgroundColor: "rgba(239,68,68,0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.1)",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ef4444",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  glassModal: {
    width: "100%",
    maxWidth: width - 48,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(244, 123, 37, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    fontStyle: "italic",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  confirmButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#f47b25",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#f47b25",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

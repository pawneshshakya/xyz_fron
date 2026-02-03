import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

export const ElitePassScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const benefits = [
    { title: "50% Boost", desc: "Extra winnings on every match", icon: "trending-up" },
    { title: "Zero Fees", desc: "No withdrawal commission", icon: "money-off" },
    { title: "Priority Support", desc: "24/7 dedicated game masters", icon: "support-agent" },
    { title: "Exclusive Badges", desc: "Elite tag on your profile", icon: "military-tech" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Decorative Glows */}
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

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

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="chevron-left" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Elite Pass</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ paddingHorizontal: 16, marginTop: 8, marginBottom: 24 }}>
          <LinearGradient
            colors={["#f47b25", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <MaterialIcons name="stars" size={64} color="white" style={{ opacity: 0.9 }} />
            <Text style={styles.heroTitle}>JOIN THE ELITE</Text>
            <Text style={styles.heroSubtitle}>Unlock exclusive benefits and dominate the leaderboard</Text>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>MEMBERSHIP BENEFITS</Text>

          <View style={styles.benefitsGrid}>
            {benefits.map((item, index) => (
              <View key={index} style={styles.benefitCard}>
                <View style={styles.iconBg}>
                  <MaterialIcons name={item.icon as any} size={24} color="#f47b25" />
                </View>
                <Text style={styles.benefitTitle}>{item.title}</Text>
                <Text style={styles.benefitDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>

          <View style={styles.pricingCard}>
            <View>
              <Text style={styles.priceLabel}>MONTHLY PLAN</Text>
              <Text style={styles.priceValue}>$9.99<Text style={{ fontSize: 14 }}>/mo</Text></Text>
            </View>
            <TouchableOpacity style={styles.subscribeBtn}>
              <Text style={styles.subscribeBtnText}>ACTIVATE NOW</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerNote}>Cancel anytime. Benefits apply immediately upon activation.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  scrollView: {
    flex: 1,
  },
  heroCard: {
    height: 200,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  heroTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: 2,
    textAlign: "center",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.5,
    marginTop: 12,
    marginBottom: 20,
    marginLeft: 4,
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  benefitCard: {
    width: (width - 52) / 2,
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(244,123,37,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  benefitTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  benefitDesc: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    lineHeight: 18,
  },
  pricingCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  priceLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  priceValue: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
  },
  subscribeBtn: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  subscribeBtnText: {
    color: "#0d0d0d",
    fontSize: 12,
    fontWeight: "900",
  },
  footerNote: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 16,
  },
  bgGlowTop: {
    position: "absolute",
    top: "-10%",
    right: "-20%",
    width: 300,
    height: 300,
    backgroundColor: "rgba(244,123,37,0.15)",
    borderRadius: 150,
    opacity: 0.5,
  },
  bgGlowBottom: {
    position: "absolute",
    bottom: "-10%",
    left: "-20%",
    width: 300,
    height: 300,
    backgroundColor: "rgba(37,99,235,0.1)",
    borderRadius: 150,
    opacity: 0.5,
  },
});

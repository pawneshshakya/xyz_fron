import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const NotificationsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({
    push: true,
    email: false,
    sms: false,
    tournaments: true,
    rewards: true,
    security: true,
  });

  const ToggleItem = ({ title, desc, value, onValueChange, icon }: any) => (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={icon} size={20} color="#f47b25" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemDesc}>{desc}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#333", true: "#f47b25" }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Decorative Glows */}
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="chevron-left" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        <Text style={styles.sectionTitle}>CHANNEL SETTINGS</Text>
        <View style={styles.card}>
          <ToggleItem 
            title="Push Notifications" 
            desc="System alerts and real-time updates"
            value={settings.push}
            onValueChange={(v: boolean) => setSettings({...settings, push: v})}
            icon="notifications"
          />
          <View style={styles.divider} />
          <ToggleItem 
            title="Email Notifications" 
            desc="Weekly digests and account activity"
            value={settings.email}
            onValueChange={(v: boolean) => setSettings({...settings, email: v})}
            icon="email"
          />
          <View style={styles.divider} />
          <ToggleItem 
            title="SMS Alerts" 
            desc="Critical security and payment alerts"
            value={settings.sms}
            onValueChange={(v: boolean) => setSettings({...settings, sms: v})}
            icon="sms"
          />
        </View>

        <Text style={styles.sectionTitle}>ACTIVITY TYPES</Text>
        <View style={styles.card}>
          <ToggleItem 
            title="Tournament Updates" 
            desc="Match starts, results, and invites"
            value={settings.tournaments}
            onValueChange={(v: boolean) => setSettings({...settings, tournaments: v})}
            icon="military-tech"
          />
          <View style={styles.divider} />
          <ToggleItem 
            title="Rewards & Promotions" 
            desc="Gifts, bonuses, and special offers"
            value={settings.rewards}
            onValueChange={(v: boolean) => setSettings({...settings, rewards: v})}
            icon="card-giftcard"
          />
          <View style={styles.divider} />
          <ToggleItem 
            title="Security Alerts" 
            desc="New logins and account changes"
            value={settings.security}
            onValueChange={(v: boolean) => setSettings({...settings, security: v})}
            icon="shield"
          />
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
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.5,
    marginTop: 32,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(244,123,37,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  itemDesc: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
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

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notification.service";

export const NotificationsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { authData } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Constants
  const COLORS = {
    primary: "#f47b25",
    bgDark: "#0d0d0d",
    cardDark: "#1a1a1a",
    textLight: "#ffffff",
    textDim: "rgba(255,255,255,0.6)",
  };

  useEffect(() => {
    let unsubscribe = () => { };

    const fetchNotifications = async () => {
      if (authData?._id) {
        unsubscribe = notificationService.subscribeToNotifications(
          authData._id,
          (data) => {
            setNotifications(data);
            setLoading(false);
          }
        );
      } else {
        setLoading(false);
      }
    };

    fetchNotifications();

    return () => unsubscribe();
  }, [authData]);

  const handleNotificationPress = async (item: any) => {
    if (!item.isRead && authData?._id) {
      // Only try to mark as read if it's not a global broadcast (or handle locally)
      // Since the service logic for 'ALL' is tricky without local store, 
      // we simply call it. If it fails or updates for everyone, that's the current trade-off.
      // However, we should pass userId if we change service signature.
      await notificationService.markAsRead(item.id, authData._id);
    }
    // Handle navigation if payload exists, e.g. navigate to MatchDetail
    if (item.data && item.data.matchId) {
      navigation.navigate("MatchDetail", { matchId: item.data.matchId });
    }
  };

  const handleMarkAllRead = async () => {
    if (authData?._id) {
      await notificationService.markAllAsRead(authData._id);
    }
  };

  const renderItem = ({ item }: any) => {
    const isRead = item.isRead;

    // Determine icon based on type
    let iconName: any = "notifications";
    let iconColor = COLORS.primary;

    if (item.type === "MATCH_JOIN") iconName = "sports-esports";
    if (item.type === "WALLET") {
      iconName = "account-balance-wallet";
      iconColor = "#22c55e"; // Green
    }
    if (item.type === "SYSTEM") iconName = "info";

    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          !isRead && styles.unreadItem
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
          <MaterialIcons name={iconName} size={24} color={iconColor} />
        </View>
        <View style={styles.contentContainer}>
          <Text style={[styles.title, !isRead && styles.unreadText]}>{item.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.time}>
            {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Just now'}
          </Text>
        </View>
        {!isRead && (
          <View style={styles.unreadDot} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markReadText}>Read All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="notifications-none" size={64} color={COLORS.textDim} />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          }
        />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  markReadText: {
    color: "#f47b25",
    fontSize: 12,
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  unreadItem: {
    borderColor: "rgba(244,123,37,0.3)",
    backgroundColor: "rgba(244,123,37,0.05)",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: "bold",
    color: "white",
  },
  body: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 4,
  },
  time: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f47b25",
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 16,
  }
});

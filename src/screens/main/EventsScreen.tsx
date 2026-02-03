import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Image,
  Switch,
  Alert,
} from "react-native";
import * as Location from 'expo-location';
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import api from "../../services/api";

const { width } = Dimensions.get("window");

export const EventsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("Ongoing");
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    gameType: 'All', // 'CS', 'BR'
    mode: 'All',     // '1v1', '4v4', etc.
    entryType: 'All' // 'Free', 'Paid'
  });
  const [activeFilters, setActiveFilters] = useState({
    gameType: 'All',
    mode: 'All',
    entryType: 'All'
  });
  const [isNearby, setIsNearby] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (isNearby && location) {
        params.latitude = location.latitude;
        params.longitude = location.longitude;
      }
      const response = await api.get('matches', { params });
      if (response.data.success) {
        setMatches(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [isNearby, location]);


  const toggleNearby = async (value: boolean) => {
    if (value) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to find nearby events.');
        return;
      }

      setIsLoading(true);
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });
      setIsNearby(true);
    } else {
      setIsNearby(false);
      setLocation(null);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchMatches();
  };

  const getFilteredMatches = () => {
    let results = matches;

    // Filter by Tab (Status)
    switch (activeTab) {
      case "Ongoing":
        results = results.filter(m => m.status === "ONGOING");
        break;
      case "Upcoming":
        results = results.filter(m => m.status === "OPEN");
        break;
      case "Results":
        results = results.filter(m => m.status === "COMPLETED" || m.status === "PENDING_MEDIATOR_REVIEW");
        break;
    }

    // Apply User Filters
    if (activeFilters.gameType !== 'All') {
      results = results.filter(m => m.game_type === activeFilters.gameType);
    }
    if (activeFilters.mode !== 'All') {
      results = results.filter(m => m.mode === activeFilters.mode);
    }
    if (activeFilters.entryType !== 'All') {
      if (activeFilters.entryType === 'Free') {
        results = results.filter(m => m.entry_fee === 0);
      } else {
        results = results.filter(m => m.entry_fee > 0);
      }
    }

    return results;
  };

  const applyFilters = () => {
    setActiveFilters(filters);
    setIsFilterVisible(false);
  };

  const resetFilters = () => {
    const defaultFilters = {
      gameType: 'All',
      mode: 'All',
      entryType: 'All'
    };
    setFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    setIsFilterVisible(false);
  };

  const filteredEvents = getFilteredMatches();

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
        <Text style={styles.headerTitle}>All Events</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{
            height: 40,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(255,255,255,0.05)',
            paddingHorizontal: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}>
            <Text style={{ color: isNearby ? '#f47b25' : 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }}>NEARBY</Text>
            <Switch
              value={isNearby}
              onValueChange={toggleNearby}
              trackColor={{ false: "#333", true: "rgba(244,123,37,0.3)" }}
              thumbColor={isNearby ? "#f47b25" : "#f4f3f4"}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, activeFilters.gameType !== 'All' || activeFilters.mode !== 'All' || activeFilters.entryType !== 'All' ? styles.filterBtnActive : null]}
            onPress={() => setIsFilterVisible(true)}
          >
            <MaterialIcons name="tune" size={20} color={activeFilters.gameType !== 'All' || activeFilters.mode !== 'All' || activeFilters.entryType !== 'All' ? "#f47b25" : "white"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        {["Ongoing", "Upcoming", "Results"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#f47b25" />
        }
      >
        {isLoading ? (
          <View style={{ marginTop: 100 }}>
            <ActivityIndicator size="large" color="#f47b25" />
          </View>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.matchRow}
              onPress={() => navigation.navigate('MatchDetail', { matchId: item._id })}
            >
              <Image
                source={{ uri: item.banner_url || 'https://via.placeholder.com/400x200' }}
                style={styles.matchThumb}
              />
              <View style={{ flex: 1 }}>
                <View style={styles.statusRowHeader}>
                  <View
                    style={[
                      styles.statusTag,
                      {
                        backgroundColor:
                          item.status === "OPEN"
                            ? "rgba(34,197,94,0.2)"
                            : item.status === "ONGOING"
                              ? "rgba(244,123,37,0.2)"
                              : "rgba(37,99,235,0.2)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: item.status === "OPEN"
                            ? "#22c55e"
                            : item.status === "ONGOING"
                              ? "#f47b25"
                              : "#2563eb"
                        },
                      ]}
                    >
                      {item.status || "OPEN"}
                    </Text>
                  </View>
                  <MaterialIcons name="verified" size={10} color="#3b82f6" />
                </View>
                <Text style={styles.matchRowTitle}>{item.title}</Text>
                <View style={styles.matchRowStats}>
                  <View>
                    <Text style={styles.rowStatLabel}>ENTRY</Text>
                    <Text style={[styles.rowStatValue, { color: "#f47b25" }]}>
                      ₹{item.entry_fee}
                    </Text>
                  </View>
                  <View style={styles.verticalDivider} />
                  <View>
                    <Text style={styles.rowStatLabel}>PRIZE</Text>
                    <Text style={styles.rowStatValue}>₹{item.prize_pool}</Text>
                  </View>
                  <View style={styles.rowRating}>
                    <MaterialIcons name="star" size={10} color="#fbbf24" />
                    <Text style={styles.rowRatingText}>4.8</Text>
                  </View>
                </View>
              </View>
              <View
                style={[
                  styles.joinButton,
                  {
                    backgroundColor:
                      item.status === "OPEN" ? "#f47b25" : "rgba(255,255,255,0.1)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.joinButtonText,
                    item.status !== "OPEN" && { opacity: 0.4 },
                  ]}
                >
                  {item.status === "OPEN" ? "JOIN" : item.status === "ONGOING" ? "LIVE" : "DONE"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-busy" size={48} color="rgba(255,255,255,0.1)" />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} events found.</Text>
          </View>
        )}

        {activeTab === "Results" && filteredEvents.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={48} color="rgba(255,255,255,0.1)" />
            <Text style={styles.emptyText}>No recent results available.</Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={isFilterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsFilterVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>FILTERS</Text>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.resetText}>Reset All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>GAME TYPE</Text>
              <View style={styles.filterOptions}>
                {['All', 'CS', 'BR'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.filterChip, filters.gameType === type && styles.activeChip]}
                    onPress={() => setFilters({ ...filters, gameType: type })}
                  >
                    <Text style={[styles.chipText, filters.gameType === type && styles.activeChipText]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>GAME MODE</Text>
              <View style={styles.filterOptions}>
                {['All', '1v1', '2v2', '4v4', 'Full Map'].map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.filterChip, filters.mode === mode && styles.activeChip]}
                    onPress={() => setFilters({ ...filters, mode: mode })}
                  >
                    <Text style={[styles.chipText, filters.mode === mode && styles.activeChipText]}>{mode}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>ENTRY TYPE</Text>
              <View style={styles.filterOptions}>
                {['All', 'Free', 'Paid'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.filterChip, filters.entryType === type && styles.activeChip]}
                    onPress={() => setFilters({ ...filters, entryType: type })}
                  >
                    <Text style={[styles.chipText, filters.entryType === type && styles.activeChipText]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
              <LinearGradient
                colors={["#f47b25", "#ff8c3a"]}
                style={styles.applyGradient}
              >
                <Text style={styles.applyBtnText}>APPLY FILTERS</Text>
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    fontStyle: "italic",
    color: "white",
    letterSpacing: -0.5,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  activeTab: {
    backgroundColor: "rgba(244,123,37,0.1)",
    borderWidth: 1,
    borderColor: "rgba(244,123,37,0.3)",
  },
  tabText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#f47b25",
  },
  scrollView: {
    flex: 1,
  },
  matchRow: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    marginBottom: 16,
  },
  matchThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#333",
  },
  statusRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 8,
    fontWeight: "bold",
  },
  matchRowTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },
  matchRowStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowStatLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 8,
    textTransform: "uppercase",
  },
  rowStatValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
  },
  verticalDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  rowRating: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  rowRatingText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinButtonText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    gap: 16,
  },
  emptyText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 14,
    fontWeight: "500",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: 1,
  },
  resetText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "bold",
  },
  filterSection: {
    marginBottom: 32,
  },
  filterLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  activeChip: {
    backgroundColor: "rgba(244,123,37,0.1)",
    borderColor: "rgba(244,123,37,0.4)",
  },
  chipText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "bold",
  },
  activeChipText: {
    color: "#f47b25",
  },
  applyBtn: {
    height: 54,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 16,
  },
  applyGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: 1,
  },
  filterBtnActive: {
    borderColor: "rgba(244,123,37,0.3)",
    backgroundColor: "rgba(244,123,37,0.1)",
  },
});

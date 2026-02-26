import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  StatusBar,
  Linking,
} from "react-native";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import { notificationService } from "../../services/notification.service";
import EventSource, { EventSourceListener } from "react-native-sse";


const { width } = Dimensions.get("window");

export const HomeScreen = ({ navigation }: any) => {
  const { signOut, authData } = useAuth();
  const insets = useSafeAreaInsets();
  const [matches, setMatches] = useState<any[]>([]);
  const [featuredMatches, setFeaturedMatches] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isMediator, setIsMediator] = useState(true);

  const [banners, setBanners] = useState<any[]>([]);

  const COLORS = {
    primary: "#f47b25",
    bgDark: "#0d0d0d",
    cardDark: "#1a1a1a",
    accentBlue: "#2563eb",
  };

  useEffect(() => {
    (async () => {
      // Check permissions silently
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setLocation(coords);
        setHasLocationPermission(true);
        fetchMatches(coords);
      } else {
        fetchMatches(null);
      }

      fetchFeaturedMatches();

      try {
        const medRes = await api.get("/matches/mediator/check");
        setIsMediator(medRes.data.isMediator);
      } catch (e) { }
    })();
  }, []);



  useEffect(() => {
    let eventSource: EventSource | null = null;

    const fetchBanners = async () => {
      try {
        const res = await api.get("/banners");
        setBanners(res.data.data || []);
      } catch (e) {
        setBanners([]);
      }
    };

    fetchBanners();

    try {
      // Construct SSE URL
      const baseURL = api.defaults.baseURL || 'http://192.168.1.4:5000/api';
      const sseURL = `${baseURL}/sse/events`;

      console.log("Connecting to SSE:", sseURL);

      // Initialize EventSource from react-native-sse
      eventSource = new EventSource(sseURL);

      const listener: EventSourceListener = (event) => {
        if (event.type === 'open') {
          console.log("SSE Open:", event);
        } else if (event.type === 'message') {
          // react-native-sse returns event.data as string
          // However, the listener event type is `EventSourceEvent`. 
          // We need to cast or just access data.
          // The event object structure: { type: 'message', data: '...' }
          if (event.data) {
            try {
              const data = JSON.parse(event.data);
              console.log("SSE Message:", data);
              if (data.type === 'BANNER_UPDATE') {
                fetchBanners();
              }
            } catch (e) {
              console.error("SSE Parse Error", e);
            }
          }
        } else if (event.type === 'error') {
          console.error("SSE Error:", event);
        }
      };

      eventSource.addEventListener("open", listener);
      eventSource.addEventListener("message", listener);
      eventSource.addEventListener("error", listener);

    } catch (e) {
      console.error("SSE Setup Failed", e);
    }

    return () => {
      if (eventSource) {
        eventSource.removeAllEventListeners();
        eventSource.close();
      }
    };
  }, []);

  const fetchMatches = async (
    locCoords?: { latitude: number; longitude: number } | null,
  ) => {
    try {
      const params: any = {};
      if (locCoords) {
        params.latitude = locCoords.latitude;
        params.longitude = locCoords.longitude;
      }
      const res = await api.get("/matches", { params });
      setMatches(res.data.data);
    } catch (err) { }
  };

  const fetchFeaturedMatches = async () => {
    try {
      const res = await api.get("/matches", { params: { featured: 'true' } });
      setFeaturedMatches(res.data.data || []);
    } catch (err) { }
  };

  const renderFeaturedEvent = ({
    title,
    entry,
    prize,
    rating,
    image,
    verified,
    full,
  }: any) => (
    <View style={styles.featuredCard}>
      <View style={styles.featuredImageContainer}>
        <Image
          source={{ uri: image }}
          style={[styles.featuredImage, full && { opacity: 0.6 }]}
        />
        <LinearGradient
          colors={["transparent", COLORS.cardDark]}
          style={styles.gradientOverlay}
        />
        {verified && (
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={10} color="white" />
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        )}
      </View>
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle}>{title}</Text>
        <View style={styles.featuredStats}>
          <View>
            <Text style={styles.statLabel}>ENTRY FEE</Text>
            <Text
              style={[
                styles.statValue,
                { color: entry === "Free" ? COLORS.primary : COLORS.primary },
              ]}
            >
              {entry}
            </Text>
          </View>
          <View>
            <Text style={styles.statLabel}>PRIZE POOL</Text>
            <Text style={styles.statValue}>{prize}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <MaterialIcons name="star" size={12} color="#fbbf24" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderMatchItem = ({ item }: any) => (
    <View style={styles.matchRow}>
      <Image
        source={{
          uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwQWNaaBgdOXGVmuHX-vDdsW0B_K4GoKl2GcFXoCxPWPrQZ_yNXFZOV5TpsZC00vfqBOwhnsWVfPwodPRTwwgaukeSR6KstNxSN-kB2RD5o5ZN4Dtx6LRX9NuHKTTC52i8O1H4FEh0YIB2T81bmY0Gty3tZzDUJ_8kNaBqKGtXSoHDqmcZ8rBcGZ4mAEb-uJpfHgfiwd-2a7KZ8XkgHuZp6x3V_wCKtwO3E9IZoW6fvj41ubixnkcdl0NX9KIaqM0_5TRfzNgtXEQ",
        }}
        style={styles.matchThumb}
      />
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginBottom: 2,
          }}
        >
          <View
            style={[
              styles.statusTag,
              {
                backgroundColor:
                  item.status === "OPEN"
                    ? "rgba(34,197,94,0.2)"
                    : "rgba(234,88,12,0.2)",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: item.status === "OPEN" ? "#22c55e" : "#ea580c" },
              ]}
            >
              {item.status || "OPEN"}
            </Text>
          </View>
          <MaterialIcons name="verified" size={10} color="#3b82f6" />
        </View>
        <Text style={styles.matchRowTitle}>Midnight Scrims</Text>
        <View style={styles.matchRowStats}>
          <View>
            <Text style={styles.rowStatLabel}>ENTRY</Text>
            <Text style={[styles.rowStatValue, { color: COLORS.primary }]}>
              ${item.entry_fee}
            </Text>
          </View>
          <View style={styles.verticalDivider} />
          <View>
            <Text style={styles.rowStatLabel}>PRIZE</Text>
            <Text style={styles.rowStatValue}>${item.prize_pool}</Text>
          </View>
          <View style={styles.rowRating}>
            <MaterialIcons name="star" size={10} color="#fbbf24" />
            <Text style={styles.rowRatingText}>4.2</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.joinButton,
          {
            backgroundColor:
              item.status === "OPEN" ? COLORS.primary : "rgba(255,255,255,0.1)",
          },
        ]}
        onPress={() =>
          item.status === "OPEN" &&
          navigation.navigate("MatchDetail", { matchId: item._id })
        }
        disabled={item.status !== "OPEN"}
      >
        <Text
          style={[
            styles.joinButtonText,
            item.status !== "OPEN" && { opacity: 0.4 },
          ]}
        >
          {item.status === "OPEN" ? "JOIN" : "FULL"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Background Gradients */}
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      {/* Top Status Bar Blur - Positioned absolutely via insets */}
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

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.headerTitle}>
            BATTLE<Text style={{ color: COLORS.primary }}>CORE</Text>
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Notifications")}
            >
              <MaterialIcons name="notifications" size={20} color="white" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* Promotional Banners Slider */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 16,
            marginBottom: 24,
          }}
        >
          {banners
            ?.filter((banner) => banner.is_active)
            .map((banner: any) => (
              <TouchableOpacity
                key={banner._id}
                style={styles.bannerCard}
                onPress={() => {
                  if (banner.link_url) {
                    Linking.openURL(banner.link_url);
                  }
                }}
              >
                <View style={styles.bannerImageContainer}>
                  <Image
                    source={{ uri: banner.image_url }}
                    style={styles.bannerImage}
                  />
                  <LinearGradient
                    colors={["transparent", COLORS.cardDark]}
                    style={styles.gradientOverlay}
                  />
                </View>

                <View style={styles.bannerContent}>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  <Text style={styles.bannerDescription}>
                    {banner.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Link</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickActionsScroll}
          contentContainerStyle={styles.quickActionsContent}
        >
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("CreateMatch")}
          >
            <View
              style={[
                styles.actionIconBg,
                { backgroundColor: "rgba(244,123,37,0.1)" },
              ]}
            >
              <MaterialIcons
                name="add-circle"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.actionText} numberOfLines={1}>
              CREATE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("MyEvents")}
          >
            <View
              style={[
                styles.actionIconBg,
                { backgroundColor: "rgba(168, 85, 247, 0.1)" },
              ]}
            >
              <MaterialIcons name="event-note" size={20} color="#a855f7" />
            </View>
            <Text style={styles.actionText} numberOfLines={1}>
              MY EVENTS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("JoinRoomScreen")}
          >
            <View
              style={[
                styles.actionIconBg,
                { backgroundColor: "rgba(234,179,8,0.1)" },
              ]}
            >
              <MaterialIcons name="login" size={24} color="#eab308" />
            </View>
            <Text style={styles.actionText} numberOfLines={1}>
              JOIN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("UploadScreenshot")}
          >
            <View
              style={[
                styles.actionIconBg,
                { backgroundColor: "rgba(37,99,235,0.1)" },
              ]}
            >
              <MaterialIcons
                name="cloud-upload"
                size={24}
                color={COLORS.accentBlue}
              />
            </View>
            <Text style={styles.actionText} numberOfLines={1}>
              UPLOAD SS
            </Text>
          </TouchableOpacity>

          {isMediator && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("MediatorDashboard")}
            >
              <View
                style={[
                  styles.actionIconBg,
                  { backgroundColor: "rgba(220, 38, 38, 0.1)" },
                ]}
              >
                <MaterialIcons name="gavel" size={24} color="#ef4444" />
              </View>
              <Text style={styles.actionText} numberOfLines={1}>
                MEDIATOR
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Featured Events */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FEATURED EVENTS</Text>
          <Text style={styles.viewAll}>VIEW ALL</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
        >
          {featuredMatches.length > 0 ? (
            featuredMatches.map((item) => (
              <TouchableOpacity
                key={item._id}
                onPress={() => navigation.navigate("MatchDetail", { matchId: item._id })}
              >
                {renderFeaturedEvent({
                  title: item.title,
                  entry: item.entry_fee > 0 ? `$${item.entry_fee.toFixed(2)}` : "Free",
                  prize: `$${item.prize_pool.toLocaleString()}`,
                  rating: "5.0",
                  image: item.banner_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAwQWNaaBgdOXGVmuHX-vDdsW0B_K4GoKl2GcFXoCxPWPrQZ_yNXFZOV5TpsZC00vfqBOwhnsWVfPwodPRTwwgaukeSR6KstNxSN-kB2RD5o5ZN4Dtx6LRX9NuHKTTC52i8O1H4FEh0YIB2T81bmY0Gty3tZzDUJ_8kNaBqKGtXSoHDqmcZ8rBcGZ4mAEb-uJpfHgfiwd-2a7KZ8XkgHuZp6x3V_wCKtwO3E9IZoW6fvj41ubixnkcdl0NX9KIaqM0_5TRfzNgtXEQ", // Fallback
                  verified: true,
                  full: item.participants && item.participants.length >= item.max_players,
                })}
              </TouchableOpacity>
            ))
          ) : (
            // Fallback to placeholders if no featured events
            <>
              {renderFeaturedEvent({
                title: "Grandmaster Invitational",
                entry: "$5.00",
                prize: "$1,500",
                rating: "4.8",
                image:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuAh5AJVtKymLINB1Rn9KLf0PTMYIkgB3Q5LIzoxYUINBFDPzQKls6ZwkJRVwtMGgSP-izheoxRyYg5y3VnHsRTCrzjABw8IpQlH49m6qQcQgNjaXyQ75nJRP5zicKoCr3_OTd7cXc8wtgyKTK5_WBGmfX56S4sVxbxTwlYRcated-55EhAJOC1lWr1Z3_zIVl8ejuZV5mXk3_pqyBGlU1nma9h1VH3TqElVc3gciyzvzZVe4V02RIOi7r8loAkIU2n5sFgMU7LZ-pI",
                verified: true,
              })}
              {renderFeaturedEvent({
                title: "Cyber Duel 2v2",
                entry: "Free",
                prize: "$250",
                rating: "4.5",
                image:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuBiokFGsQTFjhZMf5x3736lpl3xNrKeiD-wkMz-A4EV5OoWqNtN9B7NuDbcRpFwFpDdf6cH9oycMLYLP0Db4B6jKuV9cip1gpIdn6zf_BKvK6NYuEssC5H4HzTKOIqkHh7zm2CoFsBIMUP_bSvag0vjhYbmdkj3AutApneXxZkHaGy58MnCWAqkiU065SCXDVMwAcvZsxjyiZ3yEjoBfLZWribYZ_7VNHi2x2c7kiqG0OdYXYxbo-8WMDEPCLWBafFRLFreTo6qZRM",
                verified: true,
                full: true,
              })}
            </>
          )}
        </ScrollView>

        {/* Sponsored Banner */}
        <View style={{ paddingHorizontal: 16, marginVertical: 24 }}>
          <LinearGradient
            colors={["rgba(30,58,138,0.4)", "rgba(49,46,129,0.4)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sponsoredCard}
          >
            <View>
              <View style={styles.sponsoredTag}>
                <Text style={styles.sponsoredText}>SPONSORED</Text>
              </View>
              <Text style={styles.sponsoredTitle}>UPGRADE TO ELITE PASS</Text>
              <Text style={styles.sponsoredSub}>
                Get 50% extra winnings on every match
              </Text>
            </View>
            <TouchableOpacity
              style={styles.learnMoreBtn}
              onPress={() => navigation.navigate("ElitePass")}
            >
              <Text style={styles.learnMoreText}>LEARN MORE</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Matches List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {hasLocationPermission ? "MATCHES NEAR YOU" : "UPCOMING MATCHES"}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("MatchesList")}>
            <Text style={styles.viewAll}>VIEW MORE</Text>
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: 16, gap: 16 }}>
          {/* If no API data, show placeholders, else map matches */}
          {matches.length > 0 ? (
            matches.slice(0, 5).map((m) => (
              <TouchableOpacity
                key={m._id}
                onPress={() =>
                  navigation.navigate("MatchDetail", { matchId: m._id })
                }
              >
                {renderMatchItem({ item: m })}
              </TouchableOpacity>
            ))
          ) : (
            <>
              {/* Placeholder 1 */}
              <View style={styles.matchRow}>
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwQWNaaBgdOXGVmuHX-vDdsW0B_K4GoKl2GcFXoCxPWPrQZ_yNXFZOV5TpsZC00vfqBOwhnsWVfPwodPRTwwgaukeSR6KstNxSN-kB2RD5o5ZN4Dtx6LRX9NuHKTTC52i8O1H4FEh0YIB2T81bmY0Gty3tZzDUJ_8kNaBqKGtXSoHDqmcZ8rBcGZ4mAEb-uJpfHgfiwd-2a7KZ8XkgHuZp6x3V_wCKtwO3E9IZoW6fvj41ubixnkcdl0NX9KIaqM0_5TRfzNgtXEQ",
                  }}
                  style={styles.matchThumb}
                />
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginBottom: 2,
                    }}
                  >
                    <View
                      style={[
                        styles.statusTag,
                        { backgroundColor: "rgba(34,197,94,0.2)" },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: "#22c55e" }]}>
                        OPEN
                      </Text>
                    </View>
                    <MaterialIcons name="verified" size={10} color="#3b82f6" />
                  </View>
                  <Text style={styles.matchRowTitle}>Midnight Scrims</Text>
                  <View style={styles.matchRowStats}>
                    <View>
                      <Text style={styles.rowStatLabel}>ENTRY</Text>
                      <Text
                        style={[styles.rowStatValue, { color: COLORS.primary }]}
                      >
                        $2.00
                      </Text>
                    </View>
                    <View style={styles.verticalDivider} />
                    <View>
                      <Text style={styles.rowStatLabel}>PRIZE</Text>
                      <Text style={styles.rowStatValue}>$100</Text>
                    </View>
                    <View style={styles.rowRating}>
                      <MaterialIcons name="star" size={10} color="#fbbf24" />
                      <Text style={styles.rowRatingText}>4.2</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.joinButton,
                    { backgroundColor: COLORS.primary },
                  ]}
                >
                  <Text style={styles.joinButtonText}>JOIN</Text>
                </TouchableOpacity>
              </View>

              {/* Placeholder 2 */}
              <View style={styles.matchRow}>
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8SramNZdVi1A8A-J6l2KUxr-hdqaZXJsnAO0_xZjG3BDsC1UQPKiyudff4EEVYR78z4r-WcYTwSWIeDLuOSAVkg_K0mCdOGZZ4N8ot5c04pGmA50sirkGZoW5d3t1ZP536e3ro0c1U0Ooh7LO40NYk2-vUI7Bd2qNVCVykUhwMsQddSGeSwf0XbPrDsuynVt-jEciI8dOHpTgK4QX-aYM9avIdfBTRbYWYBI7CQcp0nwreHu-wZfJK2z5lGUp9DrkpXqlBDqnm4k",
                  }}
                  style={styles.matchThumb}
                />
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginBottom: 2,
                    }}
                  >
                    <View
                      style={[
                        styles.statusTag,
                        { backgroundColor: "rgba(234,88,12,0.2)" },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: "#ea580c" }]}>
                        ONGOING
                      </Text>
                    </View>
                    <MaterialIcons name="verified" size={10} color="#3b82f6" />
                  </View>
                  <Text style={styles.matchRowTitle}>Elite Slayer Pro</Text>
                  <View style={styles.matchRowStats}>
                    <View>
                      <Text style={styles.rowStatLabel}>ENTRY</Text>
                      <Text
                        style={[styles.rowStatValue, { color: COLORS.primary }]}
                      >
                        $10.00
                      </Text>
                    </View>
                    <View style={styles.verticalDivider} />
                    <View>
                      <Text style={styles.rowStatLabel}>PRIZE</Text>
                      <Text style={styles.rowStatValue}>$500</Text>
                    </View>
                    <View style={styles.rowRating}>
                      <MaterialIcons name="star" size={10} color="#fbbf24" />
                      <Text style={styles.rowRatingText}>4.9</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.joinButton,
                    { backgroundColor: "rgba(255,255,255,0.1)" },
                  ]}
                >
                  <Text style={[styles.joinButtonText, { opacity: 0.4 }]}>
                    FULL
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Ad Banner */}


        {/* Stats Footer */}
        <View style={styles.statsFooter}>
          <View>
            <Text style={styles.footerBigNum}>1,284</Text>
            <Text style={[styles.footerLabel, { color: COLORS.primary }]}>
              MATCHES TODAY
            </Text>
          </View>
          <View style={styles.footerDivider} />
          <View>
            <Text style={styles.footerBigNum}>$14.5K</Text>
            <Text style={[styles.footerLabel, { color: COLORS.primary }]}>
              WINNINGS PAID
            </Text>
          </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -1,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  walletButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  walletText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
  quickActionsScroll: {
    marginBottom: 24,
  },
  quickActionsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    width: 120,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  actionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  viewAll: {
    color: "#f47b25",
    fontSize: 10,
    fontWeight: "bold",
  },
  featuredCard: {
    width: width - 48,
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginRight: 0,
  },
  featuredImageContainer: {
    height: 140,
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  verifiedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#2563eb",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  featuredContent: {
    padding: 16,
    marginTop: -32,
    position: "relative",
    zIndex: 10,
  },
  featuredTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  featuredStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 9,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  statValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  ratingBadge: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "bold",
  },
  sponsoredCard: {
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
  },
  sponsoredTag: {
    backgroundColor: "rgba(255,255,255,0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  sponsoredText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
  },
  sponsoredTitle: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 2,
  },
  sponsoredSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
  },
  learnMoreBtn: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  learnMoreText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
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
  },
  matchThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#333",
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
  statsFooter: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: "rgba(244,123,37,0.05)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(244,123,37,0.1)",
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  footerBigNum: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
    fontStyle: "italic",
    textAlign: "center",
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
  },
  footerDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  // Banner Slider Styles
  bannerCard: {
    width: width - 48,
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginRight: 0,
  },
  bannerImageContainer: {
    height: 140,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerContent: {
    padding: 16,
    marginTop: -32,
    position: "relative",
    zIndex: 10,
  },
  bannerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bannerDescription: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
});

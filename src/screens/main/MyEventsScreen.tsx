import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Image
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from '@react-navigation/native';
import api from "../../services/api";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export const MyEventsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);



    const fetchMatches = async () => {
        try {
            const res = await api.get('/matches/created');
            setMatches(res.data.data || res.data);
        } catch (err) {
            console.error("Failed to fetch matches", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchMatches();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchMatches();
    };

    const handleDelete = (id: string, title: string) => {
        Alert.alert("Delete Event", `Are you sure you want to delete "${title}"?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await api.delete(`/matches/${id}`);
                        fetchMatches(); // Refresh list
                    } catch (error: any) {
                        Alert.alert("Error", error.response?.data?.message || "Failed to delete");
                    }
                }
            }
        ]);
    };

    const handlePublish = (id: string, title: string) => {
        Alert.alert("Publish Event", `Make "${title}" live for everyone to join?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Publish", onPress: async () => {
                    try {
                        await api.put(`/matches/${id}`, { isPublished: true });
                        Alert.alert("Success", "Event is now live!");
                        fetchMatches();
                    } catch (error: any) {
                        Alert.alert("Error", error.response?.data?.message || "Failed to publish");
                    }
                }
            }
        ]);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return '#22c55e';
            case 'ONGOING': return '#f47b25';
            case 'COMPLETED': return '#3b82f6';
            default: return '#9ca3af';
        }
    };



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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="chevron-left" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Events</Text>
                </View>

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate("CreateMatch")}
                >
                    <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#f47b25" />
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f47b25" />}
                >
                    {matches.length > 0 ? matches.map((item, index) => {
                        const isDraft = !item.isPublished;
                        const participantsCount = item.participants?.length || 0;
                        const maxPlayers = item.max_players || 100;
                        const percent = Math.min(100, Math.round((participantsCount / maxPlayers) * 100));
                        const progressColor = percent >= 100 ? '#22c55e' : '#f47b25';
                        const mapImage = item.map_image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAwQWNaaBgdOXGVmuHX-vDdsW0B_K4GoKl2GcFXoCxPWPrQZ_yNXFZOV5TpsZC00vfqBOwhnsWVfPwodPRTwwgaukeSR6KstNxSN-kB2RD5o5ZN4Dtx6LRX9NuHKTTC52i8O1H4FEh0YIB2T81bmY0Gty3tZzDUJ_8kNaBqKGtXSoHDqmcZ8rBcGZ4mAEb-uJpfHgfiwd-2a7KZ8XkgHuZp6x3V_wCKtwO3E9IZoW6fvj41ubixnkcdl0NX9KIaqM0_5TRfzNgtXEQ";

                        return (
                            <View key={item._id || index} style={styles.cardContainer}>
                                {/* Row 1: Thumbnail & Info */}
                                <View style={styles.cardMainRow}>
                                    {/* Thumbnail */}
                                    <View style={styles.thumbnailContainer}>
                                        <Image
                                            source={{ uri: mapImage }}
                                            style={styles.thumbnailImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.statusBadgeAbsolute}>
                                            {isDraft ? (
                                                <View style={[styles.badgeContainer, { backgroundColor: 'rgba(107, 114, 128, 0.9)' }]}>
                                                    <Text style={styles.badgeText}>DRAFT</Text>
                                                </View>
                                            ) : (
                                                <View style={[styles.badgeContainer, { backgroundColor: 'rgba(34, 197, 94, 0.9)', flexDirection: 'row', gap: 4 }]}>
                                                    <View style={styles.livePulse} />
                                                    <Text style={styles.badgeText}>LIVE</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Info */}
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                                        <Text style={styles.cardMeta}>{item.game_type || "Battle Royale"} • {item.mode || "Solo"}</Text>
                                        <View style={styles.priceRow}>
                                            <Text style={styles.entryFee}>₹{item.entry_fee}</Text>
                                            <Text style={styles.separator}>|</Text>
                                            <Text style={styles.prizePool}>Prize: ₹{item.prize_pool}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Row 2: Progress */}
                                <View style={styles.progressSection}>
                                    <View style={styles.progressLabels}>
                                        <Text style={styles.progressText}>Joined: {participantsCount}/{maxPlayers}</Text>
                                        <Text style={[styles.progressPercent, { color: progressColor }]}>{percent}%</Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${percent}%`, backgroundColor: progressColor }]} />
                                    </View>
                                </View>

                                {/* Row 3: Action Grid */}
                                <View style={styles.actionGrid}>
                                    <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate("CreateMatch", { initialData: item })}>
                                        <Text style={styles.gridBtnText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate("MatchDetail", { matchId: item._id })}>
                                        <Text style={styles.gridBtnText}>View</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.gridBtn, styles.gridBtnDelete]} onPress={() => handleDelete(item._id, item.title)}>
                                        <Text style={styles.gridBtnTextDelete}>Delete</Text>
                                    </TouchableOpacity>

                                    {isDraft ? (
                                        <TouchableOpacity style={[styles.gridBtn, styles.gridBtnPrimary]} onPress={() => handlePublish(item._id, item.title)}>
                                            <Text style={styles.gridBtnTextPrimary}>Publish</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity style={[styles.gridBtn, styles.gridBtnDisabled]} disabled>
                                            <Text style={styles.gridBtnTextDisabled}>Live</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    }) : (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Text style={{ color: 'rgba(255,255,255,0.5)' }}>You haven't created any events yet.</Text>
                            <TouchableOpacity onPress={() => navigation.navigate("CreateMatch")} style={{ marginTop: 20 }}>
                                <Text style={{ color: '#f47b25', fontWeight: 'bold' }}>Create First Event</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
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
        paddingHorizontal: 24,
        paddingBottom: 12,
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
    createButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f47b25",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#f47b25",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
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
    cardContainer: {
        backgroundColor: "#1a1a1a",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    cardMainRow: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 16,
    },
    thumbnailContainer: {
        position: 'relative',
        width: 96,
        height: 96,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    statusBadgeAbsolute: {
        position: 'absolute',
        top: 4,
        left: 4,
    },
    badgeContainer: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    livePulse: {
        width: 6,
        height: 6,
        backgroundColor: 'white',
        borderRadius: 3,
    },
    cardInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    cardTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        lineHeight: 22,
    },
    cardMeta: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    entryFee: {
        color: '#f47b25',
        fontWeight: 'bold',
        fontSize: 14,
    },
    separator: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 12,
    },
    prizePool: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    progressSection: {
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: 'bold',
    },
    progressPercent: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    progressBarBg: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    actionGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    gridBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    gridBtnText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    gridBtnDelete: {
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    gridBtnTextDelete: {
        color: '#ef4444',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    gridBtnPrimary: {
        backgroundColor: '#f47b25',
        borderColor: '#f47b25',
        shadowColor: '#f47b25',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    gridBtnTextPrimary: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    gridBtnDisabled: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'transparent',
    },
    gridBtnTextDisabled: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
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

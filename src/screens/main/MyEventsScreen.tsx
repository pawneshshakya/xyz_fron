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
    Alert
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
    const [filter, setFilter] = useState("All");
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const categories = ["All", "Battle Royale", "Deathmatch", "Search & Destroy"];

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

    const filteredMatches = matches.filter(m => {
        if (filter === 'All') return true;
        return m.game_type === filter || m.mode === filter;
    });

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

            <View style={styles.filterBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.filterChip, filter === cat && styles.activeChip]}
                            onPress={() => setFilter(cat)}
                        >
                            <Text style={[styles.chipText, filter === cat && styles.activeChipText]}>{cat.toUpperCase()}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
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
                    {filteredMatches.length > 0 ? filteredMatches.map((item, index) => {
                        const isDraft = item.isPublished === false;
                        // Can delete/edit only if Draft or Open with no participants? (Backend logic handles strictness, UI just calls)
                        // We'll show buttons if draft or creator.
                        return (
                            <View
                                key={item._id || index}
                                style={styles.matchCard}
                            >
                                <TouchableOpacity onPress={() => navigation.navigate("MatchDetail", { matchId: item._id })}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.typeBadge}>
                                            <Text style={styles.typeText}>{item.game_type || "CUSTOM"}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 6 }}>
                                            {isDraft && (
                                                <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                                    <Text style={[styles.statusText, { color: '#ffffff' }]}>DRAFT</Text>
                                                </View>
                                            )}
                                            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                                                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <Text style={styles.matchTitle}>{item.title}</Text>

                                    <View style={styles.cardStats}>
                                        <View style={styles.stat}>
                                            <Text style={styles.statLabel}>ENTRY</Text>
                                            <Text style={styles.statValue}>{item.entry_fee > 0 ? `$${item.entry_fee}` : 'FREE'}</Text>
                                        </View>
                                        <View style={styles.stat}>
                                            <Text style={styles.statLabel}>PRIZE</Text>
                                            <Text style={[styles.statValue, { color: '#f47b25' }]}>${item.prize_pool}</Text>
                                        </View>
                                        <View style={styles.stat}>
                                            <Text style={styles.statLabel}>PLAYERS</Text>
                                            <Text style={styles.statValue}>{item.participants?.length || 0}/{item.max_players}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                {/* Action Buttons */}
                                <View style={styles.actionRow}>
                                    {isDraft ? (
                                        <>
                                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id, item.title)}>
                                                <MaterialIcons name="delete" size={20} color="#ef4444" />
                                                <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Delete</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("CreateMatch", { initialData: item })}>
                                                <MaterialIcons name="edit" size={20} color="white" />
                                                <Text style={styles.actionBtnText}>Edit</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.publishBtn} onPress={() => handlePublish(item._id, item.title)}>
                                                <Text style={styles.publishBtnText}>PUBLISH</Text>
                                                <MaterialIcons name="rocket-launch" size={16} color="white" />
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                                            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Event is Live</Text>
                                            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("CreateMatch", { initialData: item })}>
                                                <MaterialIcons name="edit" size={20} color="white" />
                                                <Text style={styles.actionBtnText}>View/Edit</Text>
                                            </TouchableOpacity>
                                        </View>
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
    filterBar: {
        paddingVertical: 16,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.05)",
        marginRight: 8,
        borderWidth: 1,
        borderColor: "transparent",
    },
    activeChip: {
        backgroundColor: "rgba(244,123,37,0.1)",
        borderColor: "#f47b25",
    },
    chipText: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 1,
    },
    activeChipText: {
        color: "#f47b25",
    },
    scrollView: {
        flex: 1,
    },
    matchCard: {
        backgroundColor: "#1a1a1a",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    typeBadge: {
        backgroundColor: "rgba(255,255,255,0.05)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeText: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 10,
        fontWeight: "bold",
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 8,
        fontWeight: 'bold'
    },
    matchTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "900",
        fontStyle: "italic",
        marginBottom: 20,
    },
    cardStats: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.05)",
        paddingTop: 16,
        marginBottom: 16,
    },
    stat: {
        alignItems: "flex-start",
    },
    statLabel: {
        color: "rgba(255,255,255,0.3)",
        fontSize: 8,
        fontWeight: "bold",
        letterSpacing: 1,
        marginBottom: 4,
    },
    statValue: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    actionBtnText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    publishBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#f47b25',
        padding: 10,
        borderRadius: 8,
    },
    publishBtnText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
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

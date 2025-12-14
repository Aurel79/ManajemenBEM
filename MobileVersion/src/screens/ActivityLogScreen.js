import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

const ActivityLogScreen = ({ navigation }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async (pageNum = 1, refresh = false) => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else if (pageNum === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await authService.getActivityLogs(pageNum);

            if (response.success) {
                if (pageNum === 1) {
                    setLogs(response.data);
                } else {
                    setLogs(prev => [...prev, ...response.data]);
                }
                setHasMore(response.meta.current_page < response.meta.last_page);
                setPage(pageNum);
            }
        } catch (error) {
            console.log('Error loading activity logs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const onRefresh = useCallback(() => {
        loadLogs(1, true);
    }, []);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            loadLogs(page + 1);
        }
    };

    const getActivityIcon = (activityType) => {
        switch (activityType?.toLowerCase()) {
            case 'create':
            case 'created':
                return { name: 'add-circle', color: '#10B981' };
            case 'update':
            case 'updated':
                return { name: 'create', color: '#F59E0B' };
            case 'delete':
            case 'deleted':
                return { name: 'trash', color: '#EF4444' };
            case 'login':
                return { name: 'log-in', color: '#3B82F6' };
            case 'logout':
                return { name: 'log-out', color: '#6B7280' };
            default:
                return { name: 'ellipse', color: '#9A0020' };
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays < 7) return `${diffDays} hari lalu`;

        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderLogItem = ({ item }) => {
        const iconInfo = getActivityIcon(item.activity_type);

        return (
            <View style={styles.logItem}>
                <View style={[styles.iconContainer, { backgroundColor: iconInfo.color + '20' }]}>
                    <Ionicons name={iconInfo.name} size={20} color={iconInfo.color} />
                </View>
                <View style={styles.logContent}>
                    <Text style={styles.logDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                    <View style={styles.logMeta}>
                        <Text style={styles.logUser}>
                            {item.user?.name || 'System'}
                        </Text>
                        <Text style={styles.logDot}>•</Text>
                        <Text style={styles.logTime}>
                            {formatDate(item.created_at)}
                        </Text>
                    </View>
                    {item.activity_type && (
                        <View style={[styles.typeBadge, { backgroundColor: iconInfo.color + '20' }]}>
                            <Text style={[styles.typeBadgeText, { color: iconInfo.color }]}>
                                {item.activity_type}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#9A0020" />
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Belum ada activity log</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#9A0020" />

            {/* Header */}
            <LinearGradient
                colors={['#9A0020', '#7A0018']}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Activity Log</Text>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                >
                    <Ionicons name="refresh" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </LinearGradient>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#9A0020" />
                    <Text style={styles.loadingText}>Memuat activity log...</Text>
                </View>
            ) : (
                <FlatList
                    data={logs}
                    renderItem={renderLogItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#9A0020']}
                            tintColor="#9A0020"
                        />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    refreshButton: {
        padding: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    listContent: {
        padding: 15,
        paddingBottom: 30,
    },
    logItem: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logContent: {
        flex: 1,
    },
    logDescription: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 6,
        lineHeight: 20,
    },
    logMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    logUser: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    logDot: {
        fontSize: 12,
        color: '#CCC',
        marginHorizontal: 6,
    },
    logTime: {
        fontSize: 12,
        color: '#999',
    },
    typeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#999',
    },
});

export default ActivityLogScreen;

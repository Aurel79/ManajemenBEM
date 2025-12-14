import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    Image,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

const { width } = Dimensions.get('window');

const LaporanScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        total_proposal: 0,
        total_program_kerja: 0,
        total_kementerian: 0,
        total_anggota: 0,
        proposal_pending: 0,
        proposal_approved: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (refresh = false) => {
        try {
            if (refresh) setRefreshing(true);
            else setLoading(true);

            const response = await authService.getDashboardStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.log('Error loading stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <View style={styles.statCardHeader}>
                <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <Text style={styles.statValue}>{value}</Text>
            </View>
            <Text style={styles.statTitle}>{title}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
    );

    const SummarySection = ({ title, icon, children }) => (
        <View style={styles.summarySection}>
            <View style={styles.sectionHeader}>
                <Ionicons name={icon} size={20} color="#9A0020" />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {children}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9A0020" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#9A0020" />

            {/* Header */}
            <LinearGradient colors={['#9A0020', '#7A0018']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerLogos}>
                        <Image
                            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Logo_Telkom_University.png/1200px-Logo_Telkom_University.png' }}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>
                <Text style={styles.headerTitle}>Laporan</Text>
                <Text style={styles.headerSubtitle}>Ringkasan Data Organisasi</Text>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadData(true)}
                        colors={['#9A0020']}
                    />
                }
            >
                {/* Main Stats Cards */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Proposal"
                        value={stats.total_proposal || 0}
                        icon="document-text"
                        color="#9A0020"
                    />
                    <StatCard
                        title="Program Kerja"
                        value={stats.total_program_kerja || 0}
                        icon="calendar"
                        color="#F59E0B"
                    />
                    <StatCard
                        title="Kementerian"
                        value={stats.total_kementerian || 0}
                        icon="business"
                        color="#10B981"
                    />
                    <StatCard
                        title="Total Anggota"
                        value={stats.total_anggota || 0}
                        icon="people"
                        color="#3B82F6"
                    />
                </View>

                {/* Proposal Summary */}
                <SummarySection title="Ringkasan Proposal" icon="document-text-outline">
                    <View style={styles.summaryContent}>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
                                <Text style={styles.summaryLabel}>Pending Review</Text>
                            </View>
                            <Text style={styles.summaryValue}>{stats.proposal_pending || 0}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                                <Text style={styles.summaryLabel}>Disetujui</Text>
                            </View>
                            <Text style={styles.summaryValue}>{stats.proposal_approved || 0}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <View style={[styles.statusDot, { backgroundColor: '#9A0020' }]} />
                                <Text style={styles.summaryLabel}>Total Keseluruhan</Text>
                            </View>
                            <Text style={[styles.summaryValue, { fontWeight: 'bold' }]}>{stats.total_proposal || 0}</Text>
                        </View>
                    </View>
                </SummarySection>

                {/* Quick Stats */}
                <SummarySection title="Statistik Organisasi" icon="analytics-outline">
                    <View style={styles.quickStats}>
                        <View style={styles.quickStatItem}>
                            <LinearGradient
                                colors={['#9A0020', '#7A0018']}
                                style={styles.quickStatGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="business" size={28} color="#FFFFFF" />
                                <Text style={styles.quickStatNumber}>{stats.total_kementerian || 0}</Text>
                                <Text style={styles.quickStatLabel}>Kementerian Aktif</Text>
                            </LinearGradient>
                        </View>
                        <View style={styles.quickStatItem}>
                            <LinearGradient
                                colors={['#3B82F6', '#2563EB']}
                                style={styles.quickStatGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="people" size={28} color="#FFFFFF" />
                                <Text style={styles.quickStatNumber}>{stats.total_anggota || 0}</Text>
                                <Text style={styles.quickStatLabel}>Anggota Terdaftar</Text>
                            </LinearGradient>
                        </View>
                    </View>
                </SummarySection>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F8F8' },
    header: { paddingTop: 50, paddingBottom: 25, paddingHorizontal: 20 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
    headerLogos: { flexDirection: 'row', alignItems: 'center' },
    logoImage: { width: 40, height: 40 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
    headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    content: { flex: 1, padding: 15 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
    statCard: {
        width: (width - 45) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    statIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    statValue: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    statTitle: { fontSize: 14, color: '#666', fontWeight: '500' },
    statSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },
    summarySection: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 15, marginBottom: 15 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    summaryContent: {},
    summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
    summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    summaryLabel: { fontSize: 14, color: '#666' },
    summaryValue: { fontSize: 18, color: '#333' },
    divider: { height: 1, backgroundColor: '#F0F0F0' },
    quickStats: { flexDirection: 'row', gap: 10 },
    quickStatItem: { flex: 1 },
    quickStatGradient: { padding: 20, borderRadius: 12, alignItems: 'center' },
    quickStatNumber: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginTop: 10 },
    quickStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
});

export default LaporanScreen;

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
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const NotificationScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', type: 'info' });
    const [submitting, setSubmitting] = useState(false);

    const userRole = user?.roles?.[0] || '';
    const canCreate = ['Super Admin', 'Presiden BEM', 'Wakil Presiden BEM', 'Sekretaris', 'Bendahara'].includes(userRole);

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async (refresh = false) => {
        try {
            if (refresh) setRefreshing(true);
            else setLoading(true);

            const response = await authService.getAnnouncements();
            if (response.success) {
                setAnnouncements(response.data);
            }
        } catch (error) {
            console.log('Error loading announcements:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            Alert.alert('Error', 'Judul dan konten harus diisi');
            return;
        }

        setSubmitting(true);
        try {
            const response = await authService.createAnnouncement(formData);
            if (response.success) {
                Alert.alert('Sukses', 'Pengumuman berhasil dibuat');
                setModalVisible(false);
                setFormData({ title: '', content: '', type: 'info' });
                loadAnnouncements();
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Gagal membuat pengumuman');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Hapus Pengumuman',
            'Yakin ingin menghapus pengumuman ini?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await authService.deleteAnnouncement(id);
                            loadAnnouncements();
                        } catch (error) {
                            Alert.alert('Error', 'Gagal menghapus pengumuman');
                        }
                    }
                }
            ]
        );
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'important': return '#DC2626';
            case 'warning': return '#F59E0B';
            case 'event': return '#10B981';
            default: return '#3B82F6';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'important': return 'alert-circle';
            case 'warning': return 'warning';
            case 'event': return 'calendar';
            default: return 'information-circle';
        }
    };

    const renderAnnouncementItem = (item) => (
        <View key={item.id} style={styles.announcementCard}>
            <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(item.type) }]} />
            <View style={styles.announcementContent}>
                <View style={styles.announcementHeader}>
                    <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                        <Ionicons name={getTypeIcon(item.type)} size={14} color={getTypeColor(item.type)} />
                        <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Text>
                    </View>
                    {['Super Admin', 'Presiden BEM'].includes(userRole) && (
                        <TouchableOpacity onPress={() => handleDelete(item.id)}>
                            <Ionicons name="trash-outline" size={18} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.announcementTitle}>{item.title}</Text>
                <Text style={styles.announcementBody} numberOfLines={3}>{item.content}</Text>
                <View style={styles.announcementFooter}>
                    <Text style={styles.authorText}>Oleh: {item.author}</Text>
                    <Text style={styles.dateText}>
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                </View>
            </View>
        </View>
    );

    const types = [
        { value: 'info', label: 'Info', color: '#3B82F6' },
        { value: 'warning', label: 'Peringatan', color: '#F59E0B' },
        { value: 'important', label: 'Penting', color: '#DC2626' },
        { value: 'event', label: 'Event', color: '#10B981' },
    ];

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
                    <Text style={styles.headerTitle}>Pengumuman</Text>
                    {canCreate && (
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Ionicons name="add-circle" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}
                    {!canCreate && <View style={{ width: 28 }} />}
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => loadAnnouncements(true)} colors={['#9A0020']} />
                }
            >
                {announcements.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="megaphone-outline" size={60} color="#CCC" />
                        <Text style={styles.emptyText}>Belum ada pengumuman</Text>
                    </View>
                ) : (
                    announcements.map(renderAnnouncementItem)
                )}
                <View style={{ height: 30 }} />
            </ScrollView>

            {/* Create Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Buat Pengumuman</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Judul</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            placeholder="Judul pengumuman"
                        />

                        <Text style={styles.inputLabel}>Tipe</Text>
                        <View style={styles.typeSelector}>
                            {types.map((t) => (
                                <TouchableOpacity
                                    key={t.value}
                                    style={[styles.typeButton, formData.type === t.value && { backgroundColor: t.color + '20', borderColor: t.color }]}
                                    onPress={() => setFormData({ ...formData, type: t.value })}
                                >
                                    <Text style={[styles.typeButtonText, formData.type === t.value && { color: t.color }]}>{t.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Konten</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.content}
                            onChangeText={(text) => setFormData({ ...formData, content: text })}
                            placeholder="Isi pengumuman..."
                            multiline
                            numberOfLines={5}
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleCreate}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Buat Pengumuman</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    content: { flex: 1, padding: 15 },
    announcementCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 2 },
    typeIndicator: { width: 5 },
    announcementContent: { flex: 1, padding: 15 },
    announcementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    typeText: { fontSize: 12, fontWeight: '600' },
    announcementTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6 },
    announcementBody: { fontSize: 14, color: '#666', lineHeight: 20 },
    announcementFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    authorText: { fontSize: 12, color: '#999' },
    dateText: { fontSize: 12, color: '#999' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, color: '#999', marginTop: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 15, backgroundColor: '#FAFAFA' },
    textArea: { height: 100, textAlignVertical: 'top' },
    typeSelector: { flexDirection: 'row', gap: 8, marginBottom: 15 },
    typeButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
    typeButtonText: { fontSize: 12, color: '#666' },
    submitButton: { backgroundColor: '#9A0020', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    submitButtonDisabled: { opacity: 0.7 },
    submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default NotificationScreen;

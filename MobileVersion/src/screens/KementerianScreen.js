import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    Modal,
    ScrollView,
    TextInput,
    Alert,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

const KementerianScreen = ({ navigation }) => {
    const [ministries, setMinistries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({ nama: '', deskripsi: '' });
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        loadMinistries();
    }, []);

    const loadMinistries = async (refresh = false) => {
        try {
            if (refresh) setRefreshing(true);
            else setLoading(true);

            const response = await authService.getMinistries();
            if (response.success) setMinistries(response.data);
        } catch (error) {
            console.log('Error loading ministries:', error);
            Alert.alert('Error', 'Gagal memuat data kementerian');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const openCreateModal = () => {
        setEditMode(false);
        setSelectedItem(null);
        setFormData({ nama: '', deskripsi: '' });
        setModalVisible(true);
    };

    const openEditModal = (item) => {
        setEditMode(true);
        setSelectedItem(item);
        setFormData({ nama: item.nama, deskripsi: item.deskripsi || '' });
        setModalVisible(true);
    };

    const openDetailModal = async (item) => {
        setDetailLoading(true);
        setDetailModalVisible(true);
        try {
            const response = await authService.getMinistryDetail(item.id);
            if (response.success) {
                setDetailData(response.data);
            }
        } catch (error) {
            Alert.alert('Error', 'Gagal memuat detail kementerian');
            setDetailModalVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.nama.trim()) {
            Alert.alert('Error', 'Nama kementerian wajib diisi');
            return;
        }

        setFormLoading(true);
        try {
            let response;
            if (editMode) {
                response = await authService.updateMinistry(selectedItem.id, formData);
            } else {
                response = await authService.createMinistry(formData);
            }

            if (response.success) {
                Alert.alert('Sukses', response.message || 'Data berhasil disimpan');
                setModalVisible(false);
                loadMinistries(true);
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Terjadi kesalahan');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = (item) => {
        Alert.alert(
            'Hapus Kementerian',
            `Yakin ingin menghapus "${item.nama}"?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await authService.deleteMinistry(item.id);
                            if (response.success) {
                                Alert.alert('Sukses', response.message);
                                loadMinistries(true);
                            }
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.message || 'Gagal menghapus kementerian');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.itemCard} onPress={() => openDetailModal(item)}>
            <View style={styles.itemHeader}>
                <View style={styles.itemIconContainer}>
                    <Ionicons name="business" size={24} color="#9A0020" />
                </View>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.nama}</Text>
                    <Text style={styles.itemSubtitle}>{item.users_count || 0} Anggota</Text>
                </View>
                <View style={styles.itemActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
                        <Ionicons name="pencil" size={18} color="#F59E0B" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}>
                        <Ionicons name="trash" size={18} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
            {item.deskripsi && (
                <Text style={styles.itemDescription} numberOfLines={2}>{item.deskripsi}</Text>
            )}
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Belum ada kementerian</Text>
        </View>
    );

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
                <Text style={styles.headerTitle}>Manajemen Kementerian</Text>
            </LinearGradient>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Daftar Kementerian</Text>
                    <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Tambah</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#9A0020" />
                    </View>
                ) : (
                    <FlatList
                        data={ministries}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadMinistries(true)} colors={['#9A0020']} />}
                        ListEmptyComponent={renderEmpty}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Form Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editMode ? 'Edit Kementerian' : 'Tambah Kementerian'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Nama Kementerian *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.nama}
                                    onChangeText={(text) => setFormData({ ...formData, nama: text })}
                                    placeholder="Masukkan nama kementerian"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Deskripsi</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={formData.deskripsi}
                                    onChangeText={(text) => setFormData({ ...formData, deskripsi: text })}
                                    placeholder="Masukkan deskripsi"
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={formLoading}>
                                {formLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Simpan</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Detail Modal */}
            <Modal visible={detailModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Detail Kementerian</Text>
                            <TouchableOpacity onPress={() => { setDetailModalVisible(false); setDetailData(null); }}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {detailLoading ? (
                            <View style={styles.detailLoading}>
                                <ActivityIndicator size="large" color="#9A0020" />
                            </View>
                        ) : detailData ? (
                            <ScrollView style={styles.modalBody}>
                                <View style={styles.detailSection}>
                                    <Text style={styles.detailLabel}>Nama</Text>
                                    <Text style={styles.detailValue}>{detailData.nama}</Text>
                                </View>
                                <View style={styles.detailSection}>
                                    <Text style={styles.detailLabel}>Deskripsi</Text>
                                    <Text style={styles.detailValue}>{detailData.deskripsi || '-'}</Text>
                                </View>
                                <View style={styles.detailSection}>
                                    <Text style={styles.detailLabel}>Jumlah Anggota</Text>
                                    <Text style={styles.detailValue}>{detailData.users_count || 0} orang</Text>
                                </View>
                                {detailData.users && detailData.users.length > 0 && (
                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>Daftar Anggota</Text>
                                        {detailData.users.map((user) => (
                                            <View key={user.id} style={styles.memberItem}>
                                                <Ionicons name="person" size={16} color="#666" />
                                                <Text style={styles.memberName}>{user.name}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </ScrollView>
                        ) : null}

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.submitButton} onPress={() => { setDetailModalVisible(false); setDetailData(null); }}>
                                <Text style={styles.submitButtonText}>Tutup</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
    headerLogos: { flexDirection: 'row', alignItems: 'center' },
    logoImage: { width: 40, height: 40 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
    content: { flex: 1, paddingHorizontal: 15, paddingTop: 15 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#9A0020', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4 },
    addButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingBottom: 30 },
    itemCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#F0F0F0' },
    itemHeader: { flexDirection: 'row', alignItems: 'center' },
    itemIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#9A002010', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    itemInfo: { flex: 1 },
    itemTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
    itemSubtitle: { fontSize: 13, color: '#666', marginTop: 2 },
    itemDescription: { fontSize: 13, color: '#888', marginTop: 10, lineHeight: 18 },
    itemActions: { flexDirection: 'row', gap: 8 },
    actionButton: { padding: 8 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
    emptyText: { marginTop: 15, fontSize: 16, color: '#999' },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    modalBody: { padding: 20 },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 },
    input: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#333' },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    modalFooter: { flexDirection: 'row', padding: 20, gap: 10 },
    cancelButton: { flex: 1, backgroundColor: '#F5F5F5', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
    cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#666' },
    submitButton: { flex: 1, backgroundColor: '#9A0020', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
    submitButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    // Detail
    detailLoading: { padding: 40, alignItems: 'center' },
    detailSection: { marginBottom: 20 },
    detailLabel: { fontSize: 13, color: '#666', marginBottom: 4 },
    detailValue: { fontSize: 16, color: '#333' },
    memberItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    memberName: { fontSize: 14, color: '#333' },
});

export default KementerianScreen;

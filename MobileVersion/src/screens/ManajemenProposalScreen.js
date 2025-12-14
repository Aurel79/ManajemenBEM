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
    Modal,
    ScrollView,
    TextInput,
    Alert,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const ManajemenProposalScreen = ({ navigation }) => {
    const { user } = useAuth();
    const userRole = user?.roles?.[0] || '';
    const canReview = userRole !== 'Anggota';

    const [activeTab, setActiveTab] = useState('proposal');

    // Proposal State
    const [proposals, setProposals] = useState([]);
    const [loadingProposals, setLoadingProposals] = useState(true);
    const [refreshingProposals, setRefreshingProposals] = useState(false);

    // Program Kerja State
    const [programKerja, setProgramKerja] = useState([]);
    const [loadingProker, setLoadingProker] = useState(true);
    const [refreshingProker, setRefreshingProker] = useState(false);

    // Common
    const [ministries, setMinistries] = useState([]);
    const [proposalStatuses, setProposalStatuses] = useState([]);
    const [search, setSearch] = useState('');

    // Form Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const [showMinistryPicker, setShowMinistryPicker] = useState(false);
    const [showStatusPicker, setShowStatusPicker] = useState(false);
    const [showProposalStatusPicker, setShowProposalStatusPicker] = useState(false);
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
    const [reviewNote, setReviewNote] = useState(''); // State for review notes

    const prokerStatuses = ['Belum Mulai', 'Sedang Berjalan', 'Selesai', 'Ditunda'];

    useEffect(() => {
        loadMinistries();
        loadProposals();
        loadProgramKerja();
        loadProposalStatuses();
    }, []);

    const loadMinistries = async () => {
        try {
            const response = await authService.getMinistries();
            if (response.success) setMinistries(response.data);
        } catch (error) {
            console.log('Error loading ministries:', error);
        }
    };

    const loadProposalStatuses = async () => {
        try {
            const response = await authService.getProposalStatuses();
            if (response.success) setProposalStatuses(response.data);
        } catch (error) {
            console.log('Error loading statuses:', error);
        }
    };

    const loadProposals = async (refresh = false) => {
        try {
            if (refresh) setRefreshingProposals(true);
            else setLoadingProposals(true);

            const response = await authService.getProposals(1, search);
            if (response.success) setProposals(response.data);
        } catch (error) {
            console.log('Error loading proposals:', error);
        } finally {
            setLoadingProposals(false);
            setRefreshingProposals(false);
        }
    };

    const loadProgramKerja = async (refresh = false) => {
        try {
            if (refresh) setRefreshingProker(true);
            else setLoadingProker(true);

            const response = await authService.getProgramKerja(1, search);
            if (response.success) setProgramKerja(response.data);
        } catch (error) {
            console.log('Error loading program kerja:', error);
        } finally {
            setLoadingProker(false);
            setRefreshingProker(false);
        }
    };

    const handleSearch = () => {
        if (activeTab === 'proposal') loadProposals();
        else loadProgramKerja();
    };

    // CRUD Functions
    const openCreateModal = () => {
        setEditMode(false);
        setSelectedItem(null);
        if (activeTab === 'proposal') {
            setFormData({ judul: '', deskripsi: '', ministry_id: null, keterangan: '' });
        } else {
            setFormData({ nama_program: '', deskripsi: '', ministry_id: null, status: 'Belum Mulai', tanggal_mulai: '', tanggal_selesai: '', anggaran: '' });
        }
        setModalVisible(true);
    };

    const openEditModal = (item) => {
        setEditMode(true);
        setSelectedItem(item);
        if (activeTab === 'proposal') {
            setFormData({
                judul: item.judul,
                deskripsi: item.deskripsi || '',
                ministry_id: item.ministry_id,
                keterangan: item.keterangan || '',
            });
        } else {
            setFormData({
                nama_program: item.nama_program,
                deskripsi: item.deskripsi || '',
                ministry_id: item.ministry_id,
                status: item.status || 'Belum Mulai',
                tanggal_mulai: item.tanggal_mulai || '',
                tanggal_selesai: item.tanggal_selesai || '',
                anggaran: item.anggaran?.toString() || '',
            });
        }
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        try {
            let response;
            if (activeTab === 'proposal') {
                if (!formData.judul || !formData.ministry_id) {
                    Alert.alert('Error', 'Judul dan Kementerian wajib diisi');
                    setFormLoading(false);
                    return;
                }
                if (editMode) {
                    response = await authService.updateProposal(selectedItem.id, formData);
                } else {
                    response = await authService.createProposal(formData);
                }
            } else {
                if (!formData.nama_program || !formData.ministry_id) {
                    Alert.alert('Error', 'Nama Program dan Kementerian wajib diisi');
                    setFormLoading(false);
                    return;
                }
                const data = { ...formData, anggaran: formData.anggaran ? parseFloat(formData.anggaran) : null };
                if (editMode) {
                    response = await authService.updateProgramKerja(selectedItem.id, data);
                } else {
                    response = await authService.createProgramKerja(data);
                }
            }

            if (response.success) {
                Alert.alert('Sukses', response.message || 'Data berhasil disimpan');
                setModalVisible(false);
                if (activeTab === 'proposal') loadProposals(true);
                else loadProgramKerja(true);
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Terjadi kesalahan');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = (item) => {
        const title = activeTab === 'proposal' ? item.judul : item.nama_program;
        Alert.alert(
            'Hapus Data',
            `Yakin ingin menghapus "${title}"?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = activeTab === 'proposal'
                                ? await authService.deleteProposal(item.id)
                                : await authService.deleteProgramKerja(item.id);
                            if (response.success) {
                                Alert.alert('Sukses', 'Data berhasil dihapus');
                                if (activeTab === 'proposal') loadProposals(true);
                                else loadProgramKerja(true);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Gagal menghapus data');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Belum Mulai': return '#6B7280';
            case 'Sedang Berjalan': return '#F59E0B';
            case 'Selesai': return '#10B981';
            case 'Ditunda': return '#EF4444';
            default: return '#9A0020';
        }
    };

    const getProposalStatusColor = (status) => {
        if (!status) return '#6B7280';
        if (status.includes('pending') || status.includes('Review')) return '#F59E0B';
        if (status === 'approved' || status === 'Disetujui') return '#10B981';
        if (status === 'rejected' || status === 'Ditolak') return '#EF4444';
        if (status === 'revisi' || status === 'Revisi') return '#3B82F6';
        return '#9A0020';
    };

    const handleStatusChange = async (proposalId, statusId) => {
        setStatusUpdateLoading(true);
        try {
            // Pass reviewNote to authService
            const response = await authService.updateProposalStatus(proposalId, statusId, reviewNote);
            if (response.success) {
                Alert.alert('Sukses', 'Status berhasil diubah');
                loadProposals(true);
            }
        } catch (error) {
            Alert.alert('Error', 'Gagal mengubah status');
        } finally {
            setStatusUpdateLoading(false);
            setShowProposalStatusPicker(false);
            setSelectedItem(null);
            setReviewNote(''); // Reset review note
        }
    };

    // Render Proposal Item
    const renderProposalItem = ({ item }) => {
        const statusLabel = proposalStatuses.find(s => s.id === item.status_id)?.label || item.status || 'Pending';
        return (
            <View style={styles.itemCard}>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                    <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{item.judul}</Text>
                        <TouchableOpacity onPress={() => handleDelete(item)}>
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.itemMinistry}>{item.ministry || 'Tidak ada kementerian'}</Text>
                    <Text style={styles.itemUser}>Pengaju: {item.user || '-'}</Text>

                    {/* Display Notes/Revisions */}
                    {item.keterangan && (
                        <View style={styles.noteContainer}>
                            <Ionicons name="information-circle-outline" size={16} color="#F59E0B" />
                            <Text style={styles.noteText}>Catatan: {item.keterangan}</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <View style={styles.itemFooter}>
                    <Text style={styles.itemDate}>{item.tanggal_pengajuan || '-'}</Text>
                    <TouchableOpacity
                        style={[
                            styles.statusBadge,
                            { backgroundColor: getProposalStatusColor(statusLabel) + '20' },
                            // Disable for Anggota
                            !canReview && { opacity: 0.8 }
                        ]}
                        disabled={!canReview}
                        onPress={() => {
                            setSelectedItem(item);
                            setReviewNote(item.keterangan || ''); // Pre-fill with existing note
                            setShowProposalStatusPicker(true);
                        }}
                    >
                        <View style={styles.statusRow}>
                            <Text style={[styles.statusText, { color: getProposalStatusColor(statusLabel) }]}>{statusLabel}</Text>
                            {canReview && <Ionicons name="chevron-down" size={12} color={getProposalStatusColor(statusLabel)} />}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Render Program Kerja Item
    const renderProkerItem = ({ item }) => (
        <TouchableOpacity style={styles.itemCard} onPress={() => openEditModal(item)}>
            <View style={styles.itemHeader}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.nama_program}</Text>
                <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
            </View>
            <Text style={styles.itemMinistry}>{item.ministry || 'Tidak ada kementerian'}</Text>
            <View style={styles.itemMeta}>
                <Text style={styles.itemUser}>{item.user}</Text>
            </View>
            <View style={styles.itemFooter}>
                <Text style={styles.itemDate}>{item.tanggal_mulai || '-'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Belum ada data</Text>
        </View>
    );

    // Form Modal
    const renderFormModal = () => (
        <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {editMode ? 'Edit' : 'Tambah'} {activeTab === 'proposal' ? 'Proposal' : 'Program Kerja'}
                        </Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        {activeTab === 'proposal' ? (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Judul Proposal *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.judul}
                                        onChangeText={(text) => setFormData({ ...formData, judul: text })}
                                        placeholder="Masukkan judul"
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
                                        numberOfLines={3}
                                    />
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Nama Program *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.nama_program}
                                        onChangeText={(text) => setFormData({ ...formData, nama_program: text })}
                                        placeholder="Masukkan nama program"
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
                                        numberOfLines={3}
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Status</Text>
                                    <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStatusPicker(true)}>
                                        <Text style={styles.pickerButtonText}>{formData.status || 'Pilih Status'}</Text>
                                        <Ionicons name="chevron-down" size={20} color="#666" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Anggaran (Rp)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.anggaran}
                                        onChangeText={(text) => setFormData({ ...formData, anggaran: text })}
                                        placeholder="0"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Kementerian *</Text>
                            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowMinistryPicker(true)}>
                                <Text style={styles.pickerButtonText}>
                                    {ministries.find(m => m.id === formData.ministry_id)?.nama || 'Pilih Kementerian'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
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

            {/* Ministry Picker */}
            <Modal visible={showMinistryPicker} transparent animationType="fade">
                <TouchableOpacity style={styles.pickerOverlay} onPress={() => setShowMinistryPicker(false)}>
                    <View style={styles.pickerModal}>
                        <Text style={styles.pickerTitle}>Pilih Kementerian</Text>
                        <ScrollView>
                            {ministries.map((m) => (
                                <TouchableOpacity
                                    key={m.id}
                                    style={styles.pickerItem}
                                    onPress={() => {
                                        setFormData({ ...formData, ministry_id: m.id });
                                        setShowMinistryPicker(false);
                                    }}
                                >
                                    <Text style={styles.pickerItemText}>{m.nama}</Text>
                                    {formData.ministry_id === m.id && <Ionicons name="checkmark" size={20} color="#9A0020" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Status Picker */}
            <Modal visible={showStatusPicker} transparent animationType="fade">
                <TouchableOpacity style={styles.pickerOverlay} onPress={() => setShowStatusPicker(false)}>
                    <View style={styles.pickerModal}>
                        <Text style={styles.pickerTitle}>Pilih Status</Text>
                        {prokerStatuses.map((s) => (
                            <TouchableOpacity
                                key={s}
                                style={styles.pickerItem}
                                onPress={() => {
                                    setFormData({ ...formData, status: s });
                                    setShowStatusPicker(false);
                                }}
                            >
                                <Text style={styles.pickerItemText}>{s}</Text>
                                {formData.status === s && <Ionicons name="checkmark" size={20} color="#9A0020" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </Modal>
    );

    // Proposal Status Picker Modal
    const renderProposalStatusPicker = () => (
        <Modal visible={showProposalStatusPicker} transparent animationType="fade">
            <TouchableOpacity
                style={styles.pickerOverlay}
                activeOpacity={1}
                onPress={() => {
                    setShowProposalStatusPicker(false);
                    setSelectedItem(null);
                }}
            >
                <View style={styles.pickerModal}>
                    <Text style={styles.pickerTitle}>Ubah Status Proposal</Text>

                    {/* Notes Input */}
                    <View style={{ paddingHorizontal: 15, paddingBottom: 15 }}>
                        <Text style={[styles.inputLabel, { marginTop: 10 }]}>Catatan Revisi / Keterangan</Text>
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="Tambahkan catatan untuk pengaju..."
                            value={reviewNote}
                            onChangeText={setReviewNote}
                            multiline
                        />
                    </View>

                    <Text style={[styles.inputLabel, { paddingHorizontal: 15, marginBottom: 5 }]}>Pilih Status Baru:</Text>
                    {statusUpdateLoading ? (
                        <ActivityIndicator size="large" color="#9A0020" style={{ padding: 20 }} />
                    ) : (
                        <ScrollView>
                            {proposalStatuses.map((s) => (
                                <TouchableOpacity
                                    key={s.id}
                                    style={styles.pickerItem}
                                    onPress={() => {
                                        if (selectedItem) {
                                            handleStatusChange(selectedItem.id, s.id);
                                        }
                                    }}
                                >
                                    <View style={styles.statusPickerRow}>
                                        <View style={[styles.statusDot, { backgroundColor: getProposalStatusColor(s.label) }]} />
                                        <Text style={styles.pickerItemText}>{s.label}</Text>
                                    </View>
                                    {selectedItem?.status_id === s.id && <Ionicons name="checkmark" size={20} color="#9A0020" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
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
                <Text style={styles.headerTitle}>Manajemen Proposal</Text>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'proposal' && styles.tabButtonActive]}
                        onPress={() => setActiveTab('proposal')}
                    >
                        <Text style={[styles.tabText, activeTab === 'proposal' && styles.tabTextActive]}>Proposal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'proker' && styles.tabButtonActive]}
                        onPress={() => setActiveTab('proker')}
                    >
                        <Text style={[styles.tabText, activeTab === 'proker' && styles.tabTextActive]}>Program Kerja</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Content */}
            <View style={styles.content}>
                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{activeTab === 'proposal' ? 'Proposal' : 'Program Kerja'}</Text>
                    <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
                        <Text style={styles.addButtonText}>+ Add New {activeTab === 'proposal' ? 'Proposal' : 'Proker'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInput}>
                        <Ionicons name="search" size={18} color="#999" />
                        <TextInput
                            style={styles.searchTextInput}
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search..."
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                    </View>
                </View>

                {/* List */}
                {activeTab === 'proposal' ? (
                    loadingProposals ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#9A0020" />
                        </View>
                    ) : (
                        <FlatList
                            data={proposals}
                            renderItem={renderProposalItem}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContent}
                            refreshControl={<RefreshControl refreshing={refreshingProposals} onRefresh={() => loadProposals(true)} colors={['#9A0020']} />}
                            ListEmptyComponent={renderEmpty}
                            showsVerticalScrollIndicator={false}
                        />
                    )
                ) : (
                    loadingProker ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#9A0020" />
                        </View>
                    ) : (
                        <FlatList
                            data={programKerja}
                            renderItem={renderProkerItem}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContent}
                            refreshControl={<RefreshControl refreshing={refreshingProker} onRefresh={() => loadProgramKerja(true)} colors={['#9A0020']} />}
                            ListEmptyComponent={renderEmpty}
                            showsVerticalScrollIndicator={false}
                        />
                    )
                )}
            </View>

            {renderFormModal()}
            {renderProposalStatusPicker()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    header: { paddingTop: 50, paddingBottom: 0, paddingHorizontal: 20 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
    headerLogos: { flexDirection: 'row', alignItems: 'center' },
    logoImage: { width: 40, height: 40 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15 },
    tabContainer: { flexDirection: 'row', gap: 10 },
    tabButton: { flex: 1, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderTopLeftRadius: 12, borderTopRightRadius: 12, alignItems: 'center' },
    tabButtonActive: { backgroundColor: '#F8F8F8' },
    tabText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
    tabTextActive: { color: '#9A0020' },
    content: { flex: 1, paddingHorizontal: 15, paddingTop: 15 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    addButton: { backgroundColor: '#9A0020', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    addButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 12 },
    searchContainer: { marginBottom: 15 },
    searchInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: '#E5E5E5', gap: 8 },
    searchTextInput: { flex: 1, fontSize: 14, color: '#333' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingBottom: 30 },
    itemCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#F0F0F0' },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    itemTitle: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1, marginRight: 10 },
    itemMinistry: { fontSize: 13, color: '#666', marginBottom: 4 },
    itemMeta: { marginBottom: 8 },
    itemUser: { fontSize: 12, color: '#999' },
    itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemDate: { fontSize: 12, color: '#9A0020' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 11, fontWeight: '600' },
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
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    pickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12 },
    pickerButtonText: { fontSize: 16, color: '#333' },
    modalFooter: { flexDirection: 'row', padding: 20, gap: 10 },
    cancelButton: { flex: 1, backgroundColor: '#F5F5F5', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
    cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#666' },
    submitButton: { flex: 1, backgroundColor: '#9A0020', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
    submitButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    // Picker
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    pickerModal: { backgroundColor: '#FFFFFF', borderRadius: 15, maxHeight: 600 },
    pickerTitle: { fontSize: 18, fontWeight: 'bold', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    noteContainer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, marginTop: 8, gap: 6 },
    noteText: { fontSize: 13, color: '#B45309', flex: 1, lineHeight: 18 },
    pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    pickerItemText: { fontSize: 16, color: '#333' },
    // Status
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statusPickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
});

export default ManajemenProposalScreen;

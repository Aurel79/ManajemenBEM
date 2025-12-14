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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

const UserAccountScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [search, setSearch] = useState('');

    // Form Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form Fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Anggota',
        ministry_id: null,
    });

    // Dropdown Data
    const [roles, setRoles] = useState([]);
    const [ministries, setMinistries] = useState([]);
    const [showRolePicker, setShowRolePicker] = useState(false);
    const [showMinistryPicker, setShowMinistryPicker] = useState(false);

    useEffect(() => {
        loadUsers();
        loadDropdownData();
    }, []);

    const loadDropdownData = async () => {
        try {
            const [rolesRes, ministriesRes] = await Promise.all([
                authService.getRoles(),
                authService.getMinistries(),
            ]);
            if (rolesRes.success) setRoles(rolesRes.data);
            if (ministriesRes.success) setMinistries(ministriesRes.data);
        } catch (error) {
            console.log('Error loading dropdown data:', error);
        }
    };

    const loadUsers = async (pageNum = 1, refresh = false, searchQuery = '') => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else if (pageNum === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await authService.getUsers(pageNum, searchQuery);

            if (response.success) {
                if (pageNum === 1) {
                    setUsers(response.data);
                } else {
                    setUsers(prev => [...prev, ...response.data]);
                }
                setHasMore(response.meta.current_page < response.meta.last_page);
                setPage(pageNum);
            }
        } catch (error) {
            console.log('Error loading users:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const onRefresh = useCallback(() => {
        loadUsers(1, true, search);
    }, [search]);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            loadUsers(page + 1, false, search);
        }
    };

    const handleSearch = () => {
        loadUsers(1, false, search);
    };

    const openCreateModal = () => {
        setEditMode(false);
        setSelectedUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'Anggota',
            ministry_id: null,
        });
        setModalVisible(true);
    };

    const openEditModal = (user) => {
        setEditMode(true);
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles?.[0] || 'Anggota',
            ministry_id: user.ministry_id,
        });
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email) {
            Alert.alert('Error', 'Nama dan email harus diisi');
            return;
        }
        if (!editMode && !formData.password) {
            Alert.alert('Error', 'Password harus diisi untuk user baru');
            return;
        }

        setFormLoading(true);
        try {
            let response;
            if (editMode) {
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                response = await authService.updateUser(selectedUser.id, updateData);
            } else {
                response = await authService.createUser(formData);
            }

            if (response.success) {
                Alert.alert('Sukses', response.message || 'Data berhasil disimpan');
                setModalVisible(false);
                loadUsers(1, true);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Terjadi kesalahan';
            Alert.alert('Error', errorMsg);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = (user) => {
        Alert.alert(
            'Hapus User',
            `Yakin ingin menghapus ${user.name}?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await authService.deleteUser(user.id);
                            if (response.success) {
                                Alert.alert('Sukses', 'User berhasil dihapus');
                                loadUsers(1, true);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Gagal menghapus user');
                        }
                    },
                },
            ]
        );
    };

    const getRoleColor = (roleName) => {
        switch (roleName) {
            case 'Super Admin': return '#9A0020';
            case 'Presiden BEM': return '#7C3AED';
            case 'Menteri': return '#F59E0B';
            case 'Anggota': return '#6B7280';
            default: return '#3B82F6';
        }
    };

    const renderUserItem = ({ item }) => (
        <TouchableOpacity
            style={styles.userItem}
            onPress={() => openEditModal(item)}
        >
            <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>
                    {item.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
            </View>
            <View style={styles.userContent}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={styles.userMeta}>
                    {item.roles?.[0] && (
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.roles[0]) + '20' }]}>
                            <Text style={[styles.roleBadgeText, { color: getRoleColor(item.roles[0]) }]}>
                                {item.roles[0]}
                            </Text>
                        </View>
                    )}
                    {item.ministry && (
                        <Text style={styles.ministryText}>{item.ministry}</Text>
                    )}
                </View>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
            >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

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
            <Ionicons name="people-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Belum ada user</Text>
        </View>
    );

    const renderFormModal = () => (
        <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {editMode ? 'Edit User' : 'Tambah User'}
                        </Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        {/* Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Nama</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Masukkan nama"
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                placeholder="Masukkan email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Password {editMode && '(kosongkan jika tidak ingin mengubah)'}
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                placeholder="Masukkan password"
                                secureTextEntry
                            />
                        </View>

                        {/* Role Picker */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Role</Text>
                            <TouchableOpacity
                                style={styles.pickerButton}
                                onPress={() => setShowRolePicker(true)}
                            >
                                <Text style={styles.pickerButtonText}>{formData.role}</Text>
                                <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Ministry Picker */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Kementerian (opsional)</Text>
                            <TouchableOpacity
                                style={styles.pickerButton}
                                onPress={() => setShowMinistryPicker(true)}
                            >
                                <Text style={styles.pickerButtonText}>
                                    {ministries.find(m => m.id === formData.ministry_id)?.nama || 'Pilih Kementerian'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={formLoading}
                        >
                            {formLoading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Simpan</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Role Picker Modal */}
            <Modal visible={showRolePicker} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.pickerOverlay}
                    onPress={() => setShowRolePicker(false)}
                >
                    <View style={styles.pickerModal}>
                        <Text style={styles.pickerTitle}>Pilih Role</Text>
                        <ScrollView>
                            {roles.map((role) => (
                                <TouchableOpacity
                                    key={role.id}
                                    style={styles.pickerItem}
                                    onPress={() => {
                                        setFormData({ ...formData, role: role.name });
                                        setShowRolePicker(false);
                                    }}
                                >
                                    <Text style={styles.pickerItemText}>{role.name}</Text>
                                    {formData.role === role.name && (
                                        <Ionicons name="checkmark" size={20} color="#9A0020" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Ministry Picker Modal */}
            <Modal visible={showMinistryPicker} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.pickerOverlay}
                    onPress={() => setShowMinistryPicker(false)}
                >
                    <View style={styles.pickerModal}>
                        <Text style={styles.pickerTitle}>Pilih Kementerian</Text>
                        <ScrollView>
                            <TouchableOpacity
                                style={styles.pickerItem}
                                onPress={() => {
                                    setFormData({ ...formData, ministry_id: null });
                                    setShowMinistryPicker(false);
                                }}
                            >
                                <Text style={styles.pickerItemText}>Tidak ada</Text>
                                {formData.ministry_id === null && (
                                    <Ionicons name="checkmark" size={20} color="#9A0020" />
                                )}
                            </TouchableOpacity>
                            {ministries.map((ministry) => (
                                <TouchableOpacity
                                    key={ministry.id}
                                    style={styles.pickerItem}
                                    onPress={() => {
                                        setFormData({ ...formData, ministry_id: ministry.id });
                                        setShowMinistryPicker(false);
                                    }}
                                >
                                    <Text style={styles.pickerItemText}>{ministry.nama}</Text>
                                    {formData.ministry_id === ministry.id && (
                                        <Ionicons name="checkmark" size={20} color="#9A0020" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#9A0020" />

            {/* Header */}
            <LinearGradient colors={['#9A0020', '#7A0018']} style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>User Account</Text>
                <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </LinearGradient>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInput}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                        style={styles.searchTextInput}
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Cari user..."
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                </View>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#9A0020" />
                    <Text style={styles.loadingText}>Memuat users...</Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9A0020']} />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {renderFormModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    addButton: { padding: 5 },
    searchContainer: { padding: 15, backgroundColor: '#FFFFFF' },
    searchInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 44,
        gap: 10,
    },
    searchTextInput: { flex: 1, fontSize: 16, color: '#333' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 14, color: '#666' },
    listContent: { padding: 15, paddingBottom: 30 },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
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
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#9A0020',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    userContent: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 2 },
    userEmail: { fontSize: 13, color: '#666', marginBottom: 6 },
    userMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
    roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    roleBadgeText: { fontSize: 11, fontWeight: '600' },
    ministryText: { fontSize: 11, color: '#666' },
    deleteButton: { padding: 8 },
    footerLoader: { paddingVertical: 20, alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyText: { marginTop: 15, fontSize: 16, color: '#999' },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '90%' },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    modalBody: { padding: 20 },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    pickerButtonText: { fontSize: 16, color: '#333' },
    modalFooter: { flexDirection: 'row', padding: 20, gap: 10 },
    cancelButton: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#666' },
    submitButton: {
        flex: 1,
        backgroundColor: '#9A0020',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    // Picker Modal
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    pickerModal: { backgroundColor: '#FFFFFF', borderRadius: 15, maxHeight: 400 },
    pickerTitle: { fontSize: 18, fontWeight: 'bold', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    pickerItemText: { fontSize: 16, color: '#333' },
});

export default UserAccountScreen;

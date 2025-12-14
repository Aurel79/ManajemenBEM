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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

const RolesScreen = ({ navigation }) => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Detail Modal
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [roleDetail, setRoleDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Form Modal
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', permissions: [] });

    // Permissions
    const [allPermissions, setAllPermissions] = useState([]);
    const [showPermissionPicker, setShowPermissionPicker] = useState(false);

    useEffect(() => {
        loadRoles();
        loadPermissions();
    }, []);

    const loadRoles = async (refresh = false) => {
        try {
            if (refresh) setRefreshing(true);
            else setLoading(true);

            const response = await authService.getRoles();
            if (response.success) setRoles(response.data);
        } catch (error) {
            console.log('Error loading roles:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadPermissions = async () => {
        try {
            const response = await authService.getPermissions();
            if (response.success) setAllPermissions(response.data);
        } catch (error) {
            console.log('Error loading permissions:', error);
        }
    };

    const loadRoleDetail = async (roleId) => {
        try {
            setLoadingDetail(true);
            const response = await authService.getRoleDetail(roleId);
            if (response.success) setRoleDetail(response.data);
        } catch (error) {
            console.log('Error loading role detail:', error);
        } finally {
            setLoadingDetail(false);
        }
    };

    const openDetailModal = (role) => {
        setSelectedRole(role);
        setDetailModalVisible(true);
        loadRoleDetail(role.id);
    };

    const openCreateModal = () => {
        setEditMode(false);
        setFormData({ name: '', permissions: [] });
        setFormModalVisible(true);
    };

    const openEditModal = (role) => {
        setEditMode(true);
        setSelectedRole(role);
        setFormData({
            name: role.name,
            permissions: roleDetail?.permissions || [],
        });
        setDetailModalVisible(false);
        setFormModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Nama role harus diisi');
            return;
        }

        setFormLoading(true);
        try {
            let response;
            if (editMode) {
                response = await authService.updateRole(selectedRole.id, formData);
            } else {
                response = await authService.createRole(formData);
            }

            if (response.success) {
                Alert.alert('Sukses', response.message || 'Role berhasil disimpan');
                setFormModalVisible(false);
                loadRoles(true);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Terjadi kesalahan';
            Alert.alert('Error', errorMsg);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = (role) => {
        if (role.name === 'Super Admin') {
            Alert.alert('Error', 'Tidak dapat menghapus role Super Admin');
            return;
        }

        Alert.alert(
            'Hapus Role',
            `Yakin ingin menghapus role "${role.name}"?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await authService.deleteRole(role.id);
                            if (response.success) {
                                Alert.alert('Sukses', 'Role berhasil dihapus');
                                setDetailModalVisible(false);
                                loadRoles(true);
                            }
                        } catch (error) {
                            const errorMsg = error.response?.data?.message || 'Gagal menghapus role';
                            Alert.alert('Error', errorMsg);
                        }
                    },
                },
            ]
        );
    };

    const togglePermission = (perm) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    const getRoleColor = (roleName) => {
        switch (roleName) {
            case 'Super Admin': return '#9A0020';
            case 'Presiden BEM': return '#7C3AED';
            case 'Wakil Presiden BEM': return '#8B5CF6';
            case 'Sekretaris': return '#3B82F6';
            case 'Bendahara': return '#10B981';
            case 'Menteri': return '#F59E0B';
            case 'Anggota': return '#6B7280';
            default: return '#9A0020';
        }
    };

    const getRoleIcon = (roleName) => {
        switch (roleName) {
            case 'Super Admin': return 'shield-checkmark';
            case 'Presiden BEM': return 'ribbon';
            case 'Wakil Presiden BEM': return 'ribbon-outline';
            case 'Sekretaris': return 'document-text';
            case 'Bendahara': return 'cash';
            case 'Menteri': return 'briefcase';
            case 'Anggota': return 'person';
            default: return 'person-circle';
        }
    };

    const renderRoleItem = ({ item }) => {
        const color = getRoleColor(item.name);
        const icon = getRoleIcon(item.name);

        return (
            <TouchableOpacity style={styles.roleItem} onPress={() => openDetailModal(item)}>
                <View style={[styles.roleIconContainer, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View style={styles.roleContent}>
                    <Text style={styles.roleName}>{item.name}</Text>
                    <View style={styles.roleStats}>
                        <View style={styles.statBadge}>
                            <Ionicons name="people" size={12} color="#666" />
                            <Text style={styles.statText}>{item.users_count} users</Text>
                        </View>
                        <View style={styles.statBadge}>
                            <Ionicons name="key" size={12} color="#666" />
                            <Text style={styles.statText}>{item.permissions_count} permissions</Text>
                        </View>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="shield-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Belum ada roles</Text>
        </View>
    );

    // Detail Modal
    const renderDetailModal = () => (
        <Modal visible={detailModalVisible} animationType="slide" transparent onRequestClose={() => setDetailModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHeaderLeft}>
                            {selectedRole && (
                                <View style={[styles.modalIcon, { backgroundColor: getRoleColor(selectedRole.name) + '20' }]}>
                                    <Ionicons name={getRoleIcon(selectedRole.name)} size={28} color={getRoleColor(selectedRole.name)} />
                                </View>
                            )}
                            <Text style={styles.modalTitle}>{selectedRole?.name}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {loadingDetail ? (
                        <View style={styles.modalLoading}>
                            <ActivityIndicator size="large" color="#9A0020" />
                        </View>
                    ) : roleDetail ? (
                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Users ({roleDetail.users_count})</Text>
                                {roleDetail.users?.map((user) => (
                                    <View key={user.id} style={styles.userItem}>
                                        <Ionicons name="person-circle" size={32} color="#9A0020" />
                                        <View style={styles.userInfo}>
                                            <Text style={styles.userName}>{user.name}</Text>
                                            <Text style={styles.userEmail}>{user.email}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Permissions ({roleDetail.permissions?.length || 0})</Text>
                                <View style={styles.permissionsList}>
                                    {roleDetail.permissions?.map((perm, index) => (
                                        <View key={index} style={styles.permissionBadge}>
                                            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                            <Text style={styles.permissionText}>{perm}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                    ) : null}

                    {/* Action Buttons */}
                    {selectedRole?.name !== 'Super Admin' && (
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(selectedRole)}>
                                <Ionicons name="create" size={20} color="#FFFFFF" />
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(selectedRole)}>
                                <Ionicons name="trash" size={20} color="#FFFFFF" />
                                <Text style={styles.deleteButtonText}>Hapus</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );

    // Form Modal
    const renderFormModal = () => (
        <Modal visible={formModalVisible} animationType="slide" transparent onRequestClose={() => setFormModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{editMode ? 'Edit Role' : 'Tambah Role'}</Text>
                        <TouchableOpacity onPress={() => setFormModalVisible(false)}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Nama Role</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Masukkan nama role"
                                editable={!(editMode && selectedRole?.name === 'Super Admin')}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Permissions ({formData.permissions.length} dipilih)</Text>
                            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowPermissionPicker(true)}>
                                <Text style={styles.pickerButtonText}>Pilih Permissions</Text>
                                <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>

                            {formData.permissions.length > 0 && (
                                <View style={styles.selectedPermissions}>
                                    {formData.permissions.slice(0, 5).map((perm, i) => (
                                        <View key={i} style={styles.selectedPermBadge}>
                                            <Text style={styles.selectedPermText}>{perm}</Text>
                                        </View>
                                    ))}
                                    {formData.permissions.length > 5 && (
                                        <Text style={styles.moreText}>+{formData.permissions.length - 5} lainnya</Text>
                                    )}
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setFormModalVisible(false)}>
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

            {/* Permission Picker */}
            <Modal visible={showPermissionPicker} transparent animationType="fade">
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerModal}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>Pilih Permissions</Text>
                            <TouchableOpacity onPress={() => setShowPermissionPicker(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.pickerList}>
                            {allPermissions.map((perm, index) => (
                                <TouchableOpacity key={index} style={styles.pickerItem} onPress={() => togglePermission(perm)}>
                                    <Text style={styles.pickerItemText}>{perm}</Text>
                                    <Ionicons
                                        name={formData.permissions.includes(perm) ? 'checkbox' : 'square-outline'}
                                        size={22}
                                        color={formData.permissions.includes(perm) ? '#9A0020' : '#CCC'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.pickerDone} onPress={() => setShowPermissionPicker(false)}>
                            <Text style={styles.pickerDoneText}>Selesai ({formData.permissions.length} dipilih)</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#9A0020" />

            <LinearGradient colors={['#9A0020', '#7A0018']} style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Roles</Text>
                <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </LinearGradient>

            <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryNumber}>{roles.length}</Text>
                    <Text style={styles.summaryLabel}>Total Roles</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryNumber}>{roles.reduce((acc, r) => acc + r.users_count, 0)}</Text>
                    <Text style={styles.summaryLabel}>Total Users</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#9A0020" />
                    <Text style={styles.loadingText}>Memuat roles...</Text>
                </View>
            ) : (
                <FlatList
                    data={roles}
                    renderItem={renderRoleItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadRoles(true)} colors={['#9A0020']} />}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {renderDetailModal()}
            {renderFormModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20 },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    addButton: { padding: 5 },
    summaryContainer: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 15, gap: 10 },
    summaryCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 15, alignItems: 'center', elevation: 2 },
    summaryNumber: { fontSize: 28, fontWeight: 'bold', color: '#9A0020' },
    summaryLabel: { fontSize: 12, color: '#666', marginTop: 4 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 14, color: '#666' },
    listContent: { padding: 15, paddingBottom: 30 },
    roleItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 15, marginBottom: 10, elevation: 2 },
    roleIconContainer: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    roleContent: { flex: 1 },
    roleName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 6 },
    roleStats: { flexDirection: 'row', gap: 10 },
    statBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
    statText: { fontSize: 11, color: '#666' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyText: { marginTop: 15, fontSize: 16, color: '#999' },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    modalHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
    modalIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    modalLoading: { padding: 50, alignItems: 'center' },
    modalBody: { padding: 20 },
    modalActions: { flexDirection: 'row', padding: 15, gap: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    editButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', paddingVertical: 12, borderRadius: 10, gap: 6 },
    editButtonText: { color: '#FFFFFF', fontWeight: '600' },
    deleteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', paddingVertical: 12, borderRadius: 10, gap: 6 },
    deleteButtonText: { color: '#FFFFFF', fontWeight: '600' },
    detailSection: { marginBottom: 25 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 10, textTransform: 'uppercase' },
    userItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8', padding: 10, borderRadius: 10, marginBottom: 8 },
    userInfo: { marginLeft: 10 },
    userName: { fontSize: 14, fontWeight: '500', color: '#333' },
    userEmail: { fontSize: 12, color: '#666' },
    permissionsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    permissionBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 4 },
    permissionText: { fontSize: 12, color: '#166534' },
    // Form
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 },
    input: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#333' },
    pickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12 },
    pickerButtonText: { fontSize: 16, color: '#666' },
    selectedPermissions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
    selectedPermBadge: { backgroundColor: '#9A002020', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    selectedPermText: { fontSize: 11, color: '#9A0020' },
    moreText: { fontSize: 12, color: '#666', alignSelf: 'center' },
    modalFooter: { flexDirection: 'row', padding: 20, gap: 10 },
    cancelButton: { flex: 1, backgroundColor: '#F5F5F5', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
    cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#666' },
    submitButton: { flex: 1, backgroundColor: '#9A0020', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
    submitButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    // Picker
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    pickerModal: { backgroundColor: '#FFFFFF', borderRadius: 15, maxHeight: '80%' },
    pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    pickerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    pickerList: { maxHeight: 400 },
    pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    pickerItemText: { fontSize: 14, color: '#333', flex: 1 },
    pickerDone: { backgroundColor: '#9A0020', margin: 15, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    pickerDoneText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
});

export default RolesScreen;

import React, { useEffect, useState, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
    StatusBar,
    Modal,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

const SuperAdminDashboard = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        total_kementerian: 0,
        total_anggota: 0,
        total_proposal: 0,
        total_program_kerja: 0,
        proposal_pending: 0,
        proposal_approved: 0
    });
    const [unreadCount, setUnreadCount] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            loadStats();
            loadUnreadCount();
        }, [])
    );

    const loadUnreadCount = async () => {
        try {
            const response = await authService.getAnnouncementUnreadCount();
            if (response.success) {
                setUnreadCount(response.count);
            }
        } catch (error) {
            console.log('Error loading unread count:', error);
        }
    };
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Semua');
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState(null);
    const drawerAnimation = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await authService.getDashboardStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.log('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const openDrawer = () => {
        setDrawerVisible(true);
        Animated.timing(drawerAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeDrawer = () => {
        Animated.timing(drawerAnimation, {
            toValue: -DRAWER_WIDTH,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setDrawerVisible(false);
        });
    };

    const handleLogout = async () => {
        closeDrawer();
        Alert.alert('Logout', 'Yakin ingin logout?', [
            { text: 'Batal', style: 'cancel' },
            {
                text: 'Logout',
                onPress: async () => {
                    await logout();
                    navigation.replace('Login');
                },
            },
        ]);
    };

    const toggleMenu = (menuName) => {
        setExpandedMenu(expandedMenu === menuName ? null : menuName);
    };

    // Get user's primary role
    const userRole = user?.roles?.[0] || '';

    // Role-based menu configuration - synced with web dashboard
    // Backend roles: Super Admin, Presiden BEM, Wakil Presiden BEM, Sekretaris, Bendahara, Menteri, Anggota
    const getRoleMenus = () => {
        const allMenus = {
            pengguna: {
                title: 'Manajemen Pengguna',
                icon: 'people',
                items: [
                    { id: 1, title: 'Roles', icon: 'shield-checkmark', screen: 'Roles', roles: ['Super Admin'] },
                    { id: 2, title: 'User Account', icon: 'person-circle', screen: 'UserManagement', roles: ['Super Admin'] },
                    { id: 3, title: 'Kementerian', icon: 'business', screen: 'MinistryManagement', roles: ['Super Admin'] },
                    { id: 4, title: 'Anggota BEM', icon: 'people', screen: 'UserManagement', roles: ['Presiden BEM', 'Wakil Presiden BEM'] },
                    { id: 5, title: 'Anggota Kementerian', icon: 'people', screen: 'UserManagement', roles: ['Menteri'] },
                ]
            },
            proposal: {
                title: 'Manajemen Proposal',
                icon: 'document-text',
                items: [
                    // Super Admin & Presiden/Wakil - Review Proposal
                    { id: 1, title: 'Review Proposal', icon: 'document-text', screen: 'ProposalManagement', roles: ['Super Admin', 'Presiden BEM', 'Wakil Presiden BEM'] },
                    // Menteri/Anggota - Proposal Saya
                    { id: 2, title: 'Proposal Saya', icon: 'document-text', screen: 'ProposalManagement', roles: ['Menteri', 'Anggota'] },
                    // Program Kerja - all except Sekretaris, Bendahara
                    { id: 3, title: 'Program Kerja', icon: 'calendar', screen: 'ProgramKerjaManagement', roles: ['Super Admin', 'Presiden BEM', 'Wakil Presiden BEM', 'Menteri', 'Anggota'] },
                ]
            },
            sistem: {
                title: 'Manajemen Sistem',
                icon: 'settings',
                items: [
                    { id: 1, title: 'Roles', icon: 'shield-checkmark', screen: 'Roles', roles: ['Super Admin'] },
                    { id: 2, title: 'Activity Log', icon: 'time', screen: 'ActivityLog', roles: ['Super Admin'] },
                    { id: 3, title: 'Laporan', icon: 'bar-chart', screen: 'Reports', roles: ['Super Admin', 'Presiden BEM', 'Bendahara'] },
                ]
            }
        };

        // Filter items based on user role
        Object.keys(allMenus).forEach(key => {
            allMenus[key].items = allMenus[key].items.filter(item =>
                item.roles.includes(userRole)
            );
        });

        return allMenus;
    };

    const roleMenus = getRoleMenus();

    // Check if user can see a menu section
    const canSeeMenu = (menuKey) => {
        return roleMenus[menuKey]?.items?.length > 0;
    };

    const menuItemsPengguna = roleMenus.pengguna?.items || [];
    const menuItemsProposal = roleMenus.proposal?.items || [];
    const menuItemsSistem = roleMenus.sistem?.items || [];

    // Get available tabs based on role - only show tabs user has access to
    const tabs = ['Semua'];
    if (canSeeMenu('pengguna')) tabs.push('Manajemen Pengguna');
    tabs.push('Manajemen Proposal');

    const formatNumber = (num) => {
        return num < 10 ? `0${num}` : `${num}`;
    };

    const navigateFromDrawer = (screen) => {
        closeDrawer();
        navigation.navigate(screen);
    };

    // Sidebar Drawer Component
    const renderDrawer = () => (
        <Modal
            visible={drawerVisible}
            transparent
            animationType="none"
            onRequestClose={closeDrawer}
        >
            <View style={styles.drawerOverlay}>
                <TouchableWithoutFeedback onPress={closeDrawer}>
                    <View style={styles.drawerBackdrop} />
                </TouchableWithoutFeedback>

                <Animated.View
                    style={[
                        styles.drawer,
                        { transform: [{ translateX: drawerAnimation }] }
                    ]}
                >
                    <LinearGradient
                        colors={['#9A0020', '#7A0018']}
                        style={styles.drawerContent}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                    >
                        {/* Drawer Header */}
                        <View style={styles.drawerHeader}>
                            <View style={styles.drawerLogoContainer}>
                                <View style={styles.drawerLogoCircle}>
                                    <Ionicons name="search" size={18} color="#9A0020" />
                                </View>
                                <Text style={styles.drawerTitle}>Dashboard</Text>
                            </View>
                            <TouchableOpacity onPress={closeDrawer}>
                                <Ionicons name="menu" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Drawer Menu Items */}
                        <ScrollView style={styles.drawerMenu} showsVerticalScrollIndicator={false}>
                            {/* Dashboard */}
                            <TouchableOpacity
                                style={styles.drawerMenuItem}
                                onPress={() => navigateFromDrawer('SuperAdminDashboard')}
                            >
                                <View style={styles.drawerMenuItemActive}>
                                    <View style={styles.menuIconBox}>
                                        <Ionicons name="search" size={16} color="#FFFFFF" />
                                    </View>
                                    <Text style={styles.drawerMenuTextActive}>Dashboard</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.drawerDivider} />

                            {/* Manajemen Pengguna - Only if user has access */}
                            {canSeeMenu('pengguna') && (
                                <>
                                    <TouchableOpacity
                                        style={styles.drawerMenuItem}
                                        onPress={() => toggleMenu('pengguna')}
                                    >
                                        <View style={styles.drawerMenuItemRow}>
                                            <View style={styles.drawerMenuItemLeft}>
                                                <View style={styles.menuIconBoxOutline}>
                                                    <Ionicons name="person-outline" size={16} color="#FFFFFF" />
                                                </View>
                                                <Text style={styles.drawerMenuText}>Manajemen Pengguna</Text>
                                            </View>
                                            <Ionicons
                                                name={expandedMenu === 'pengguna' ? 'chevron-down' : 'chevron-forward'}
                                                size={16}
                                                color="#FFFFFF"
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    {expandedMenu === 'pengguna' && (
                                        <View style={styles.subMenu}>
                                            {menuItemsPengguna.map((item) => (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={styles.subMenuItem}
                                                    onPress={() => navigateFromDrawer(item.screen)}
                                                >
                                                    <Ionicons name={item.icon} size={16} color="rgba(255,255,255,0.8)" style={styles.subMenuIcon} />
                                                    <Text style={styles.subMenuText}>{item.title}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                    <View style={styles.drawerDivider} />
                                </>
                            )}

                            {/* Manajemen Proposal - Only if user has access */}
                            {canSeeMenu('proposal') && (
                                <>
                                    <TouchableOpacity
                                        style={styles.drawerMenuItem}
                                        onPress={() => toggleMenu('proposal')}
                                    >
                                        <View style={styles.drawerMenuItemRow}>
                                            <View style={styles.drawerMenuItemLeft}>
                                                <View style={styles.menuIconBoxOutline}>
                                                    <Ionicons name="document-text-outline" size={16} color="#FFFFFF" />
                                                </View>
                                                <Text style={styles.drawerMenuText}>Manajemen Proposal</Text>
                                            </View>
                                            <Ionicons
                                                name={expandedMenu === 'proposal' ? 'chevron-down' : 'chevron-forward'}
                                                size={16}
                                                color="#FFFFFF"
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    {expandedMenu === 'proposal' && (
                                        <View style={styles.subMenu}>
                                            {menuItemsProposal.map((item) => (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={styles.subMenuItem}
                                                    onPress={() => navigateFromDrawer(item.screen)}
                                                >
                                                    <Ionicons name={item.icon} size={16} color="rgba(255,255,255,0.8)" style={styles.subMenuIcon} />
                                                    <Text style={styles.subMenuText}>{item.title}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                    <View style={styles.drawerDivider} />
                                </>
                            )}

                            {/* Manajemen Sistem - Only if user has access */}
                            {canSeeMenu('sistem') && (
                                <>
                                    <TouchableOpacity
                                        style={styles.drawerMenuItem}
                                        onPress={() => toggleMenu('sistem')}
                                    >
                                        <View style={styles.drawerMenuItemRow}>
                                            <View style={styles.drawerMenuItemLeft}>
                                                <View style={styles.menuIconBoxOutline}>
                                                    <Ionicons name="grid-outline" size={16} color="#FFFFFF" />
                                                </View>
                                                <Text style={styles.drawerMenuText}>Manajemen Sistem</Text>
                                            </View>
                                            <Ionicons
                                                name={expandedMenu === 'sistem' ? 'chevron-down' : 'chevron-forward'}
                                                size={16}
                                                color="#FFFFFF"
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    {expandedMenu === 'sistem' && (
                                        <View style={styles.subMenu}>
                                            {menuItemsSistem.map((item) => (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={styles.subMenuItem}
                                                    onPress={() => navigateFromDrawer(item.screen)}
                                                >
                                                    <Ionicons name={item.icon} size={16} color="rgba(255,255,255,0.8)" style={styles.subMenuIcon} />
                                                    <Text style={styles.subMenuText}>{item.title}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </>
                            )}
                        </ScrollView>

                        {/* User Profile at Bottom */}
                        <View style={styles.drawerFooter}>
                            <View style={styles.drawerUserProfile}>
                                <Image
                                    source={{ uri: 'https://ui-avatars.com/api/?name=' + (user?.name || 'User') + '&background=FFFFFF&color=9A0020&size=80' }}
                                    style={styles.drawerAvatar}
                                />
                                <View style={styles.drawerUserInfo}>
                                    <Text style={styles.drawerUserName}>{user?.name || 'User'}</Text>
                                    <Text style={styles.drawerUserRole}>{user?.roles?.[0] || 'Super Admin'}</Text>
                                </View>
                                <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
                            </View>

                            {/* Logout Button */}
                            <TouchableOpacity
                                style={styles.drawerLogoutButton}
                                onPress={handleLogout}
                            >
                                <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                                <Text style={styles.drawerLogoutText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Sidebar Drawer */}
            {renderDrawer()}

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={openDrawer}>
                    <Ionicons name="menu" size={28} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerLogos}>
                    <Image
                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Logo_Telkom_University.png/1200px-Logo_Telkom_University.png' }}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.headerRightIcons}>
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <Ionicons name="notifications" size={24} color="#9A0020" />
                        {unreadCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https://ui-avatars.com/api/?name=' + (user?.name || 'User') + '&background=9A0020&color=fff' }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Greeting */}
                <View style={styles.greetingContainer}>
                    <Text style={styles.greetingText}>Hello {user?.name?.split(' ')[0] || 'User'}</Text>
                    <Text style={styles.subGreeting}>{userRole || 'Dashboard'} - Have a nice day.</Text>
                </View>

                {/* Stats Cards - 2x2 Grid */}
                <View style={styles.statsGrid}>
                    {/* Row 1 */}
                    <View style={styles.statsRow}>
                        {/* Total Proposal Card */}
                        <LinearGradient
                            colors={['#9A0020', '#6B0015']}
                            style={styles.statCardGrid}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.statTitle}>Total</Text>
                            <Text style={styles.statTitle}>Proposal</Text>
                            {loading ? (
                                <ActivityIndicator size="large" color="#FFFFFF" style={styles.statNumber} />
                            ) : (
                                <Text style={styles.statNumber}>{formatNumber(stats.total_proposal)}</Text>
                            )}
                            <Text style={styles.statSubtitle}>Jumlah proposal diajukan</Text>
                        </LinearGradient>

                        {/* Total Program Kerja Card */}
                        <LinearGradient
                            colors={['#9A0020', '#6B0015']}
                            style={styles.statCardGrid}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.statTitle}>Program</Text>
                            <Text style={styles.statTitle}>Kerja</Text>
                            {loading ? (
                                <ActivityIndicator size="large" color="#FFFFFF" style={styles.statNumber} />
                            ) : (
                                <Text style={styles.statNumber}>{formatNumber(stats.total_program_kerja)}</Text>
                            )}
                            <Text style={styles.statSubtitle}>Jumlah program aktif</Text>
                        </LinearGradient>
                    </View>

                    {/* Row 2 - Hidden for Anggota */}
                    {userRole !== 'Anggota' && (
                        <View style={styles.statsRow}>
                            {/* Total Kementerian Card */}
                            <LinearGradient
                                colors={['#9A0020', '#6B0015']}
                                style={styles.statCardGrid}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.statTitle}>Total</Text>
                                <Text style={styles.statTitle}>Kementerian</Text>
                                {loading ? (
                                    <ActivityIndicator size="large" color="#FFFFFF" style={styles.statNumber} />
                                ) : (
                                    <Text style={styles.statNumber}>{formatNumber(stats.total_kementerian)}</Text>
                                )}
                                <Text style={styles.statSubtitle}>Jumlah kementerian aktif</Text>
                            </LinearGradient>

                            {/* Total Anggota Card */}
                            <LinearGradient
                                colors={['#9A0020', '#6B0015']}
                                style={styles.statCardGrid}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.statTitle}>Total</Text>
                                <Text style={styles.statTitle}>Anggota</Text>
                                {loading ? (
                                    <ActivityIndicator size="large" color="#FFFFFF" style={styles.statNumber} />
                                ) : (
                                    <Text style={styles.statNumber}>{formatNumber(stats.total_anggota)}</Text>
                                )}
                                <Text style={styles.statSubtitle}>Jumlah anggota terdaftar</Text>
                            </LinearGradient>
                        </View>
                    )}
                </View>

                {/* Tab Navigation */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabContainer}
                    contentContainerStyle={styles.tabContent}
                >
                    {tabs.map((tab, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            {tab === 'Semua' && (
                                <Ionicons
                                    name="home"
                                    size={16}
                                    color={activeTab === tab ? '#FFFFFF' : '#666'}
                                    style={styles.tabIcon}
                                />
                            )}
                            {tab === 'Manajemen Pengguna' && (
                                <Ionicons
                                    name="people"
                                    size={16}
                                    color={activeTab === tab ? '#FFFFFF' : '#666'}
                                    style={styles.tabIcon}
                                />
                            )}
                            {tab === 'Manajemen Proposal' && (
                                <Ionicons
                                    name="business"
                                    size={16}
                                    color={activeTab === tab ? '#FFFFFF' : '#666'}
                                    style={styles.tabIcon}
                                />
                            )}
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Menu Sections */}
                {(activeTab === 'Semua' || activeTab === 'Manajemen Pengguna') && (
                    <View style={styles.menuSection}>
                        <Text style={styles.menuSectionTitle}>Manajemen Pengguna</Text>
                        {menuItemsPengguna.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={() => navigation.navigate(item.screen)}
                            >
                                <View style={styles.menuItemLeft}>
                                    <View style={styles.menuIconContainer}>
                                        <Ionicons name={item.icon} size={20} color="#9A0020" />
                                    </View>
                                    <Text style={styles.menuItemText}>{item.title}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#CCC" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {(activeTab === 'Semua' || activeTab === 'Manajemen Proposal') && (
                    <View style={styles.menuSection}>
                        <Text style={styles.menuSectionTitle}>Manajemen Proposal</Text>
                        {menuItemsProposal.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={() => navigation.navigate(item.screen)}
                            >
                                <View style={styles.menuItemLeft}>
                                    <View style={styles.menuIconContainer}>
                                        <Ionicons name={item.icon} size={20} color="#9A0020" />
                                    </View>
                                    <Text style={styles.menuItemText}>{item.title}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#CCC" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Extra space for bottom nav */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.bottomNavItem} onPress={() => { }}>
                    <View style={styles.bottomNavItemActive}>
                        <Ionicons name="home" size={24} color="#9A0020" />
                    </View>
                </TouchableOpacity>
                {canSeeMenu('pengguna') && (
                    <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('UserManagement')}>
                        <Ionicons name="people-outline" size={24} color="#999" />
                    </TouchableOpacity>
                )}
                {canSeeMenu('proposal') && (
                    <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('ProposalManagement')}>
                        <Ionicons name="document-text-outline" size={24} color="#999" />
                    </TouchableOpacity>
                )}
                {canSeeMenu('sistem') && (
                    <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate('Roles')}>
                        <Ionicons name="settings-outline" size={24} color="#999" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    // Drawer Styles
    drawerOverlay: {
        flex: 1,
        flexDirection: 'row',
    },
    drawerBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    drawer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: DRAWER_WIDTH,
    },
    drawerContent: {
        flex: 1,
        paddingTop: 50,
    },
    drawerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    drawerLogoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    drawerLogoCircle: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    drawerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    drawerMenu: {
        flex: 1,
        paddingHorizontal: 15,
        marginTop: 10,
    },
    drawerMenuItem: {
        marginBottom: 5,
    },
    drawerMenuItemActive: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
    },
    drawerMenuItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    drawerMenuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    drawerMenuText: {
        fontSize: 15,
        color: '#FFFFFF',
        marginLeft: 12,
        fontWeight: '500',
    },
    drawerMenuTextActive: {
        fontSize: 15,
        color: '#FFFFFF',
        marginLeft: 12,
        fontWeight: '600',
    },
    subMenu: {
        paddingLeft: 45,
        paddingBottom: 5,
    },
    subMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    subMenuText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    drawerFooter: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    drawerUserProfile: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    drawerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    drawerUserInfo: {
        flex: 1,
        marginLeft: 12,
    },
    drawerUserName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    drawerUserRole: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
    },
    drawerLogoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
    },
    drawerLogoutText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginLeft: 10,
        fontWeight: '500',
    },
    menuIconBox: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuIconBoxOutline: {
        width: 28,
        height: 28,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    drawerDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginVertical: 10,
        marginHorizontal: 15,
    },
    subMenuIcon: {
        marginRight: 10,
    },
    // Header Styles
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: '#FFFFFF',
    },
    headerLogos: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoImage: {
        width: 100,
        height: 40,
    },
    avatarContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: '#E0E0E0', // Fallback color
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    headerRightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8, // Use margin instead of gap for better compatibility
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#DC2626',
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    greetingContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: '#FFFFFF',
    },
    greetingText: {
        fontSize: 24, // Slightly smaller for better fit
        fontWeight: 'bold',
        color: '#333',
    },
    subGreeting: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
        gap: 10,
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#9A0020',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchInputContainer: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    searchInput: {
        fontSize: 16,
        color: '#333',
    },
    micButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsContainer: {
        marginTop: 10,
    },
    statsContent: {
        paddingHorizontal: 20,
        gap: 15,
    },
    statCard: {
        width: 180,
        height: 160,
        borderRadius: 20,
        padding: 20,
        marginRight: 15,
    },
    statsGrid: {
        paddingHorizontal: 15,
        marginTop: 15,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        // gap: 10, // Removed gap to rely on justifyContent
    },
    statCardGrid: {
        flex: 1, // Take available space
        minHeight: 140, // Use minHeight instead of fixed height
        borderRadius: 15,
        padding: 15,
        marginHorizontal: 5, // Add margin for spacing
    },
    statTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        opacity: 0.9,
    },
    statNumber: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 10,
    },
    statSubtitle: {
        fontSize: 12,
        color: '#FFFFFF',
        opacity: 0.7,
        marginTop: 'auto',
    },
    tabContainer: {
        marginTop: 20,
    },
    tabContent: {
        paddingHorizontal: 20,
        gap: 10,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginRight: 10,
    },
    activeTab: {
        backgroundColor: '#333',
        borderColor: '#333',
    },
    tabIcon: {
        marginRight: 6,
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    menuSection: {
        marginTop: 25,
        paddingHorizontal: 20,
    },
    menuSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFF0F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuItemText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    bottomNavItem: {
        alignItems: 'center',
    },
    bottomNavItemActive: {
        backgroundColor: '#FFF0F3',
        padding: 10,
        borderRadius: 15,
    },
});

export default SuperAdminDashboard;

import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Switch,
    ActivityIndicator,
    Animated,
    LayoutAnimation,
    Platform,
    UIManager,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Kích hoạt LayoutAnimation cho Android
if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

// Lấy API URL từ app.json
const API_URL = Constants.expoConfig.extra.apiUrl;

// Bảng màu mới
const COLORS = {
    primary: "#3498db", // Xanh dương
    secondary: "#2ecc71", // Xanh lá
    background: "#1A1A1A", // Nền tối
    cardBg: "#262626", // Nền card
    text: "#FFFFFF", // Text trắng
    textSecondary: "#BBBBBB", // Text phụ
    border: "#3A3A3A", // Viền
    switchTrack: "#555555", // Switch track
    switchThumb: "#FFFFFF", // Switch thumb
};

const AccountScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [notificationSettings, setNotificationSettings] = useState({});
    const [token, setToken] = useState("");
    const [userInfo, setUserInfo] = useState(null);
    // State để quản lý các section đang mở
    const [expandedSections, setExpandedSections] = useState({
        match: false,
        news: false,
        interaction: false,
        general: false,
    });

    useEffect(() => {
        const getToken = async () => {
            const userToken = await AsyncStorage.getItem("token");
            setToken(userToken);
            if (userToken) {
                fetchUserInfo(userToken);
                fetchNotificationSettings(userToken);
            }
        };
        getToken();

        // Thêm listener để tải lại dữ liệu khi màn hình được focus lại
        const unsubscribe = navigation.addListener("focus", () => {
            getToken();
        });

        // Cleanup function
        return unsubscribe;
    }, [navigation]);

    const fetchUserInfo = async (userToken) => {
        try {
            const response = await axios.get(`${API_URL}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });
            setUserInfo(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
            Alert.alert(
                "Lỗi",
                "Không thể tải thông tin người dùng. Vui lòng thử lại sau."
            );
        }
    };

    const fetchNotificationSettings = async (userToken) => {
        try {
            // Trước khi tải từ server, hiển thị cache nếu có
            const cachedSettings = await AsyncStorage.getItem(
                "notificationSettings"
            );
            if (cachedSettings) {
                setNotificationSettings(JSON.parse(cachedSettings));
                setLoading(false);
            }

            const response = await axios.get(
                `${API_URL}/notifications/settings`,
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            );

            // Chuyển đổi các giá trị từ 0/1 sang boolean
            const convertedSettings = {};
            Object.keys(response.data).forEach((key) => {
                // Bỏ qua các trường không phải boolean
                if (
                    key === "id" ||
                    key === "user_id" ||
                    key === "created_at" ||
                    key === "quiet_hours_start" ||
                    key === "quiet_hours_end"
                ) {
                    convertedSettings[key] = response.data[key];
                } else {
                    // Chuyển đổi các trường boolean từ số/chuỗi thành true/false
                    convertedSettings[key] = !!response.data[key];
                }
            });

            // Lưu vào state và cache
            setNotificationSettings(convertedSettings);
            await AsyncStorage.setItem(
                "notificationSettings",
                JSON.stringify(convertedSettings)
            );
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy cài đặt thông báo:", error);

            // Thử đọc từ cache nếu có lỗi
            try {
                const cachedSettings = await AsyncStorage.getItem(
                    "notificationSettings"
                );
                if (cachedSettings) {
                    setNotificationSettings(JSON.parse(cachedSettings));
                }
            } catch (cacheError) {
                console.error("Không thể đọc cache:", cacheError);
            }

            setLoading(false);
            Alert.alert(
                "Lỗi",
                "Không thể tải cài đặt thông báo. Vui lòng thử lại sau."
            );
        }
    };

    const updateSetting = async (field, value) => {
        try {
            const updatedSettings = { ...notificationSettings, [field]: value };
            setNotificationSettings(updatedSettings);

            // Lưu vào AsyncStorage để cache
            await AsyncStorage.setItem(
                "notificationSettings",
                JSON.stringify(updatedSettings)
            );

            await axios.put(
                `${API_URL}/notifications/settings`,
                { [field]: value },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Lỗi khi cập nhật cài đặt:", error);
            Alert.alert(
                "Lỗi",
                "Không thể cập nhật cài đặt. Vui lòng thử lại sau."
            );
            // Revert back on failure
            setNotificationSettings({ ...notificationSettings });
        }
    };

    const toggleSection = (section) => {
        // Kích hoạt animation layout
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section],
        });
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        Alert.alert("Đã đăng xuất!");
        navigation.replace("Login");
    };

    const SettingItem = ({ title, field, value, icon }) => (
        <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
                <Ionicons
                    name={icon}
                    size={22}
                    color={value ? COLORS.primary : COLORS.textSecondary}
                    style={styles.settingIcon}
                />
                <Text
                    style={[
                        styles.settingText,
                        value && styles.settingTextActive,
                    ]}
                >
                    {title}
                </Text>
            </View>
            <Switch
                trackColor={{ false: COLORS.switchTrack, true: COLORS.primary }}
                thumbColor={COLORS.switchThumb}
                ios_backgroundColor={COLORS.switchTrack}
                onValueChange={(newValue) => updateSetting(field, newValue)}
                value={value}
            />
        </View>
    );

    const SettingSection = ({ title, icon, children, sectionKey }) => {
        const isExpanded = expandedSections[sectionKey];
        return (
            <View style={styles.settingSection}>
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => toggleSection(sectionKey)}
                    activeOpacity={0.7}
                >
                    <View style={styles.sectionHeaderLeft}>
                        <Ionicons
                            name={icon}
                            size={20}
                            color={COLORS.primary}
                        />
                        <Text style={styles.settingsHeader}>{title}</Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={COLORS.textSecondary}
                    />
                </TouchableOpacity>
                {isExpanded && (
                    <View style={styles.sectionContent}>{children}</View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header title="Tài khoản" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
                    <View style={styles.userInfoSection}>
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons
                                name="person"
                                size={40}
                                color={COLORS.primary}
                            />
                        </View>
                        <Text style={styles.userName}>
                            {userInfo?.name || "Đang tải..."}
                        </Text>
                        <Text style={styles.userEmail}>
                            {userInfo?.email || "Đang tải..."}
                        </Text>
                    </View>
                </View>

                {userInfo?.role === "admin" && (
                    <TouchableOpacity
                        style={styles.manageButton}
                        onPress={() => navigation.navigate("Manage")}
                    >
                        <Ionicons
                            name="settings-outline"
                            size={18}
                            color="#fff"
                            style={{ marginRight: 6 }}
                        />
                        <Text style={styles.manageButtonText}>Quản lý</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.section}>
                    <View style={styles.sectionTitleContainer}>
                        <Ionicons
                            name="notifications"
                            size={24}
                            color={COLORS.primary}
                        />
                        <Text style={styles.sectionTitle}>
                            Cài đặt thông báo
                        </Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator
                            size="large"
                            color={COLORS.primary}
                            style={styles.loader}
                        />
                    ) : (
                        <View style={styles.settingsContainer}>
                            <SettingSection
                                title="Thông báo trận đấu"
                                icon="football-outline"
                                sectionKey="match"
                            >
                                <SettingItem
                                    title="Trận đấu bắt đầu"
                                    field="match_start"
                                    value={notificationSettings.match_start}
                                    icon="flag-outline"
                                />
                                <SettingItem
                                    title="Trận đấu kết thúc"
                                    field="match_end"
                                    value={notificationSettings.match_end}
                                    icon="flag"
                                />
                                <SettingItem
                                    title="Ghi bàn"
                                    field="goals"
                                    value={notificationSettings.goals}
                                    icon="football"
                                />
                                <SettingItem
                                    title="Thẻ đỏ"
                                    field="red_cards"
                                    value={notificationSettings.red_cards}
                                    icon="card"
                                />
                                <SettingItem
                                    title="Phạt đền"
                                    field="penalties"
                                    value={notificationSettings.penalties}
                                    icon="resize"
                                />
                                <SettingItem
                                    title="Đội hình ra sân"
                                    field="lineups"
                                    value={notificationSettings.lineups}
                                    icon="people-outline"
                                />
                                <SettingItem
                                    title="Nhắc lịch trận đấu"
                                    field="fixture_reminders"
                                    value={
                                        notificationSettings.fixture_reminders
                                    }
                                    icon="calendar-outline"
                                />
                            </SettingSection>

                            <SettingSection
                                title="Thông báo tin tức"
                                icon="newspaper-outline"
                                sectionKey="news"
                            >
                                <SettingItem
                                    title="Tin tức đội bóng"
                                    field="team_news"
                                    value={notificationSettings.team_news}
                                    icon="megaphone-outline"
                                />
                                <SettingItem
                                    title="Chấn thương cầu thủ"
                                    field="player_injuries"
                                    value={notificationSettings.player_injuries}
                                    icon="medkit-outline"
                                />
                                <SettingItem
                                    title="Tin chuyển nhượng"
                                    field="transfer_news"
                                    value={notificationSettings.transfer_news}
                                    icon="swap-horizontal-outline"
                                />
                                <SettingItem
                                    title="Cập nhật giải đấu"
                                    field="competition_updates"
                                    value={
                                        notificationSettings.competition_updates
                                    }
                                    icon="trophy-outline"
                                />
                                <SettingItem
                                    title="Thống kê cầu thủ"
                                    field="player_stats"
                                    value={notificationSettings.player_stats}
                                    icon="stats-chart-outline"
                                />
                            </SettingSection>

                            <SettingSection
                                title="Thông báo tương tác"
                                icon="chatbubbles-outline"
                                sectionKey="interaction"
                            >
                                <SettingItem
                                    title="Trả lời bình luận"
                                    field="comment_replies"
                                    value={notificationSettings.comment_replies}
                                    icon="chatbubble-outline"
                                />
                                <SettingItem
                                    title="Thích bình luận"
                                    field="comment_likes"
                                    value={notificationSettings.comment_likes}
                                    icon="heart-outline"
                                />
                                <SettingItem
                                    title="Được đề cập (@)"
                                    field="mentions"
                                    value={notificationSettings.mentions}
                                    icon="at-outline"
                                />
                            </SettingSection>

                            <SettingSection
                                title="Cài đặt chung"
                                icon="settings-outline"
                                sectionKey="general"
                            >
                                <SettingItem
                                    title="Bật thông báo đẩy"
                                    field="push_enabled"
                                    value={notificationSettings.push_enabled}
                                    icon="phone-portrait-outline"
                                />
                                <SettingItem
                                    title="Bật thông báo email"
                                    field="email_enabled"
                                    value={notificationSettings.email_enabled}
                                    icon="mail-outline"
                                />
                            </SettingSection>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={20}
                        color="white"
                        style={styles.logoutIcon}
                    />
                    <Text style={styles.buttonText}>Đăng xuất</Text>
                </TouchableOpacity>
            </ScrollView>
            <Footer />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    scrollViewContent: {
        paddingBottom: 80,
    },
    section: {
        marginBottom: 12,
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    sectionTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        color: COLORS.text,
        fontWeight: "bold",
        marginLeft: 8,
    },
    userInfoSection: {
        alignItems: "center",
        paddingVertical: 16,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.cardBg,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: COLORS.primary,
        marginBottom: 12,
    },
    userName: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.text,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    settingsContainer: {
        marginTop: 8,
    },
    settingSection: {
        marginBottom: 12,
        backgroundColor: COLORS.background,
        borderRadius: 8,
        overflow: "hidden",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.cardBg,
        padding: 12,
        borderRadius: 8,
    },
    sectionHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    settingsHeader: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: "600",
        marginLeft: 8,
    },
    sectionContent: {
        paddingVertical: 8,
        paddingHorizontal: 4,
        backgroundColor: COLORS.cardBg,
        marginTop: 1,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    settingItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.border,
    },
    settingInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    settingIcon: {
        marginRight: 12,
    },
    settingText: {
        fontSize: 15,
        color: COLORS.textSecondary,
        flex: 1,
    },
    settingTextActive: {
        color: COLORS.text,
        fontWeight: "500",
    },
    logoutButton: {
        backgroundColor: "#e74c3c",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginVertical: 8,
        flexDirection: "row",
        justifyContent: "center",
    },
    logoutIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: COLORS.text,
        fontWeight: "bold",
        fontSize: 16,
    },
    loader: {
        padding: 20,
    },
    manageButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 10,
        // marginTop: 12,
        marginBottom: 12,
        width: "100%",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
    },
    manageButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        letterSpacing: 0.5,
    },
});

export default AccountScreen;

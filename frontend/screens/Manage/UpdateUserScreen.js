import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    Alert,
    ActivityIndicator,
    Modal,
    ScrollView,
} from "react-native";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const UpdateUserScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        role: "user",
        can_comment: true,
    });
    const [roleFilter, setRoleFilter] = useState("all");
    const [commentFilter, setCommentFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchQuery, users, roleFilter, commentFilter]);

    const filterUsers = () => {
        let filtered = [...users];
        console.log("Filtering users:", {
            total: users.length,
            searchQuery,
            roleFilter,
            commentFilter,
            sampleUser: users[0], // Log a sample user to check data structure
        });

        // Filter by search query
        if (searchQuery.trim() !== "") {
            filtered = filtered.filter(
                (user) =>
                    user.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by role
        if (roleFilter !== "all") {
            filtered = filtered.filter((user) => user.role === roleFilter);
        }

        // Filter by comment permission
        if (commentFilter !== "all") {
            const canComment = commentFilter === "can";
            filtered = filtered.filter((user) => {
                const userCanComment = Boolean(user.can_comment);
                console.log(`User ${user.id} can_comment:`, userCanComment);
                return userCanComment === canComment;
            });
            console.log("Filtered by comment permission:", {
                canComment,
                filteredCount: filtered.length,
                users: filtered.map((u) => ({
                    id: u.id,
                    can_comment: u.can_comment,
                    name: u.name,
                })),
            });
        }

        console.log("Final filtered count:", filtered.length);
        setFilteredUsers(filtered);
    };

    const fetchUsers = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
                navigation.navigate("Login");
                return;
            }

            console.log("Fetching users from:", `${API_URL}/auth/users`);
            const response = await axios.get(`${API_URL}/auth/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Convert can_comment to boolean if it's not already
            const processedUsers = response.data.map((user) => ({
                ...user,
                can_comment: Boolean(user.can_comment),
            }));

            console.log("Processed users data:", processedUsers);
            setUsers(processedUsers);
            setFilteredUsers(processedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            if (error.response) {
                console.error("Error response:", error.response.data);
                Alert.alert(
                    "Lỗi",
                    error.response.data.error ||
                        "Không thể tải danh sách người dùng"
                );
            } else {
                Alert.alert("Lỗi", "Không thể kết nối đến server");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role,
            can_comment: user.can_comment,
        });
        setModalVisible(true);
    };

    const handleUpdate = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
                navigation.navigate("Login");
                return;
            }

            console.log("Updating user:", selectedUser.id);
            console.log("Update data:", editForm);

            await axios.put(
                `${API_URL}/auth/users/${selectedUser.id}`,
                editForm,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            Alert.alert("Thành công", "Cập nhật thông tin thành công");
            setModalVisible(false);
            fetchUsers();
        } catch (error) {
            console.error("Error updating user:", error);
            if (error.response) {
                console.error("Error response:", error.response.data);
                Alert.alert(
                    "Lỗi",
                    error.response.data.error || "Không thể cập nhật thông tin"
                );
            } else {
                Alert.alert("Lỗi", "Không thể kết nối đến server");
            }
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            console.log("Delete confirmed for user:", userToDelete);
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
                navigation.navigate("Login");
                return;
            }

            console.log("Attempting to delete user:", userToDelete);
            console.log("Using token:", token);
            console.log("API URL:", `${API_URL}/auth/users/${userToDelete}`);

            const response = await axios.delete(
                `${API_URL}/auth/users/${userToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Delete response:", response.data);

            // Check for success message in response
            if (response.data && response.data.message === "Xóa thành công") {
                // Remove user from local state
                setUsers((prevUsers) =>
                    prevUsers.filter((user) => user.id !== userToDelete)
                );
                setFilteredUsers((prevUsers) =>
                    prevUsers.filter((user) => user.id !== userToDelete)
                );

                Alert.alert("Thành công", "Xóa người dùng thành công");
            } else {
                console.error("Delete failed - response:", response.data);
                throw new Error(
                    response.data.error || "Xóa người dùng không thành công"
                );
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            if (error.response) {
                console.error("Error response:", error.response.data);
                console.error("Error status:", error.response.status);
                Alert.alert(
                    "Lỗi",
                    error.response.data.error || "Không thể xóa người dùng"
                );
            } else {
                console.error("Network error:", error.message);
                Alert.alert("Lỗi", "Không thể kết nối đến server");
            }
        } finally {
            setDeleteModalVisible(false);
            setUserToDelete(null);
        }
    };

    const renderUserItem = ({ item }) => (
        <View style={styles.userItem}>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={styles.userMeta}>
                    <Text
                        style={[
                            styles.userRole,
                            item.role === "admin" && styles.adminRole,
                        ]}
                    >
                        {item.role === "admin" ? "Admin" : "User"}
                    </Text>
                    <Text
                        style={[
                            styles.userComment,
                            !item.can_comment && styles.disabledComment,
                        ]}
                    >
                        {item.can_comment
                            ? "Có thể comment"
                            : "Không thể comment"}
                    </Text>
                </View>
            </View>
            <View style={styles.userActions}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(item)}
                >
                    <Ionicons name="pencil" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                        console.log("Delete button pressed for user:", item.id);
                        setUserToDelete(item.id);
                        setDeleteModalVisible(true);
                    }}
                >
                    <Ionicons name="trash" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("Manage")}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý người dùng</Text>
            </View>

            <View style={styles.searchFilterContainer}>
                <View style={styles.searchContainer}>
                    <Ionicons
                        name="search"
                        size={20}
                        color="#666"
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Text style={styles.filterButtonText}>Bộ lọc</Text>
                    <Ionicons name="filter" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {showFilters && (
                <View style={styles.filtersContainer}>
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>Vai trò:</Text>
                        <View style={styles.filterOptions}>
                            {["all", "admin", "user"].map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.filterOption,
                                        roleFilter === role &&
                                            styles.filterOptionActive,
                                    ]}
                                    onPress={() => setRoleFilter(role)}
                                >
                                    <Text
                                        style={[
                                            styles.filterOptionText,
                                            roleFilter === role &&
                                                styles.filterOptionTextActive,
                                        ]}
                                    >
                                        {role === "all"
                                            ? "Tất cả"
                                            : role === "admin"
                                            ? "Admin"
                                            : "User"}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>Quyền comment:</Text>
                        <View style={styles.filterOptions}>
                            {["all", "can", "cannot"].map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.filterOption,
                                        commentFilter === status &&
                                            styles.filterOptionActive,
                                    ]}
                                    onPress={() => {
                                        console.log(
                                            "Setting comment filter to:",
                                            status
                                        );
                                        setCommentFilter(status);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.filterOptionText,
                                            commentFilter === status &&
                                                styles.filterOptionTextActive,
                                        ]}
                                    >
                                        {status === "all"
                                            ? "Tất cả"
                                            : status === "can"
                                            ? "Có thể"
                                            : "Không thể"}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            {loading ? (
                <ActivityIndicator
                    size="large"
                    color="#fff"
                    style={styles.loader}
                />
            ) : (
                <FlatList
                    data={filteredUsers}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={() => (
                        <Text style={styles.noUsersText}>
                            Không tìm thấy người dùng nào
                        </Text>
                    )}
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Chỉnh sửa thông tin
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Tên"
                            placeholderTextColor="#666"
                            value={editForm.name}
                            onChangeText={(text) =>
                                setEditForm({ ...editForm, name: text })
                            }
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#666"
                            value={editForm.email}
                            onChangeText={(text) =>
                                setEditForm({ ...editForm, email: text })
                            }
                        />
                        <View style={styles.roleContainer}>
                            <Text style={styles.label}>Vai trò:</Text>
                            <TouchableOpacity
                                style={[
                                    styles.roleButton,
                                    editForm.role === "admin" &&
                                        styles.activeRole,
                                ]}
                                onPress={() =>
                                    setEditForm({ ...editForm, role: "admin" })
                                }
                            >
                                <Text style={styles.roleButtonText}>Admin</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.roleButton,
                                    editForm.role === "user" &&
                                        styles.activeRole,
                                ]}
                                onPress={() =>
                                    setEditForm({ ...editForm, role: "user" })
                                }
                            >
                                <Text style={styles.roleButtonText}>User</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.commentButton,
                                editForm.can_comment && styles.activeComment,
                            ]}
                            onPress={() =>
                                setEditForm({
                                    ...editForm,
                                    can_comment: !editForm.can_comment,
                                })
                            }
                        >
                            <Text style={styles.commentButtonText}>
                                {editForm.can_comment
                                    ? "Có thể comment"
                                    : "Không thể comment"}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleUpdate}
                            >
                                <Text style={styles.buttonText}>Lưu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={deleteModalVisible}
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Xác nhận xóa</Text>
                        <Text style={styles.modalText}>
                            Bạn có chắc chắn muốn xóa người dùng này?
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.cancelButton,
                                ]}
                                onPress={() => {
                                    setDeleteModalVisible(false);
                                    setUserToDelete(null);
                                }}
                            >
                                <Text style={styles.buttonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.deleteButton,
                                ]}
                                onPress={handleDeleteConfirm}
                            >
                                <Text style={styles.buttonText}>Xóa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Footer />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        maxWidth: "100vw",
        display: "flex",
        flexDirection: "column",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 20,
        paddingBottom: 18,
        paddingHorizontal: 18,
        backgroundColor: "#232323",
        borderBottomWidth: 1,
        borderBottomColor: "#333",
        position: "sticky",
        top: 0,
        zIndex: 10,
        width: "100%",
    },
    headerTitle: {
        fontSize: 20,
        color: "#fff",
        fontWeight: "bold",
        marginLeft: 12,
    },
    searchFilterContainer: {
        padding: 16,
        backgroundColor: "#232323",
        flexDirection: "row",
        gap: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2c2c2c",
        borderRadius: 6,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: "#fff",
        paddingVertical: 12,
        fontSize: 16,
    },
    filterButton: {
        backgroundColor: "#2c2c2c",
        padding: 12,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    filterButtonText: {
        color: "#fff",
        fontSize: 14,
    },
    filtersContainer: {
        backgroundColor: "#232323",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    filterGroup: {
        marginBottom: 12,
    },
    filterLabel: {
        color: "#fff",
        fontSize: 14,
        marginBottom: 8,
    },
    filterOptions: {
        flexDirection: "row",
        gap: 8,
    },
    filterOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        backgroundColor: "#2c2c2c",
        borderWidth: 1,
        borderColor: "#555",
    },
    filterOptionActive: {
        backgroundColor: "#3498db",
        borderColor: "#3498db",
    },
    filterOptionText: {
        color: "#fff",
        fontSize: 14,
    },
    filterOptionTextActive: {
        fontWeight: "bold",
    },
    listContainer: {
        padding: 16,
        paddingBottom: 80, // Add padding to prevent content from being hidden behind footer
    },
    userItem: {
        backgroundColor: "#232323",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    userEmail: {
        color: "#999",
        fontSize: 14,
        marginBottom: 8,
    },
    userMeta: {
        flexDirection: "row",
        alignItems: "center",
    },
    userRole: {
        color: "#666",
        fontSize: 12,
        marginRight: 8,
    },
    adminRole: {
        color: "#4CAF50",
    },
    userComment: {
        color: "#666",
        fontSize: 12,
    },
    disabledComment: {
        color: "#FF5252",
    },
    userActions: {
        flexDirection: "row",
    },
    editButton: {
        backgroundColor: "#2196F3",
        padding: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    deleteButton: {
        backgroundColor: "#FF5252",
        padding: 8,
        borderRadius: 4,
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#232323",
        borderRadius: 8,
        padding: 20,
        width: "90%",
        maxWidth: 400,
    },
    modalTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#2c2c2c",
        borderRadius: 4,
        padding: 12,
        marginBottom: 16,
        color: "#fff",
    },
    roleContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    label: {
        color: "#fff",
        marginRight: 12,
    },
    roleButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        backgroundColor: "#333",
        marginRight: 8,
    },
    activeRole: {
        backgroundColor: "#2196F3",
    },
    roleButtonText: {
        color: "#fff",
    },
    commentButton: {
        padding: 12,
        borderRadius: 4,
        backgroundColor: "#333",
        marginBottom: 20,
    },
    activeComment: {
        backgroundColor: "#4CAF50",
    },
    commentButtonText: {
        color: "#fff",
        textAlign: "center",
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    cancelButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 4,
        backgroundColor: "#666",
        marginRight: 12,
    },
    saveButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 4,
        backgroundColor: "#2196F3",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    noUsersText: {
        color: "#666",
        fontSize: 16,
        textAlign: "center",
        marginTop: 20,
        fontStyle: "italic",
    },
    modalText: {
        color: "#fff",
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
    },
    modalButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 4,
        marginHorizontal: 8,
    },
});

export default UpdateUserScreen;

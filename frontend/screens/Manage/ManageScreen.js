import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Ionicons } from "@expo/vector-icons";

const ManageScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("Account")}>
                    <Image
                        source={require("../../assets/arrow-left.png")}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Giao diện quản lý</Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button}>
                    <Ionicons
                        name="people-outline"
                        size={22}
                        color="#fff"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={styles.buttonText}>Quản lý người dùng</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}  onPress={() => navigation.navigate("AddMatch")} >
                    <Ionicons
                        name="add-circle-outline"
                        size={22}
                        color="#fff"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={styles.buttonText}>Thêm trận đấu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("UpdateMatch")}>
                    <Ionicons
                        name="create-outline"
                        size={22}
                        color="#fff"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={styles.buttonText}>Cập nhật kết quả</Text>
                </TouchableOpacity>
            </View>
            <Footer />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1A1A1A",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 32,
        paddingBottom: 18,
        paddingHorizontal: 18,
        backgroundColor: "#232323",
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    icon: {
        width: 28,
        height: 28,
        marginRight: 12,
        tintColor: "#fff",
    },
    headerTitle: {
        fontSize: 20,
        color: "#fff",
        fontWeight: "bold",
        flex: 1,
        textAlign: "left",
    },
    buttonContainer: {
        marginTop: 40,
        paddingHorizontal: 24,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#3498db",
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderRadius: 10,
        marginBottom: 18,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default ManageScreen;

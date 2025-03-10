import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AccountScreen = ({ navigation }) => {
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    Alert.alert("Đã đăng xuất!");
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Header title="Tài khoản" />
      
      <View style={styles.content}>
        <Text style={styles.text}>Thông tin tài khoản</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Đăng xuất</Text>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#E53935",
    padding: 12,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AccountScreen;

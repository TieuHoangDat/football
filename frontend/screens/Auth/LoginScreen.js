import React, { useState } from "react";
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Lưu token và email vào AsyncStorage
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("email", email);

        setLoading(false);
        navigation.navigate("Home");
      } else {
        setLoading(false);
        Alert.alert("Lỗi", data.error || "Đăng nhập thất bại");
      }
    } catch (error) {
      setLoading(false);
      console.error("Lỗi:", error);
      Alert.alert("Lỗi", "Không thể kết nối đến máy chủ");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        placeholderTextColor="#ccc"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Nền đen
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#333", // Nền input xám
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#1DB954", // Màu xanh lá giống Spotify
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerText: {
    color: "#1DB954",
    marginTop: 15,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;

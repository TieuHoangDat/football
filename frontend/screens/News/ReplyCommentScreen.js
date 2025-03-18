import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const ReplyCommentScreen = ({ route }) => {
  const navigation = useNavigation();
  const { parentComment } = route.params || {};
  const [reply, setReply] = useState("");

  const handleReply = async () => {
    const email = await AsyncStorage.getItem("email");

    if (!reply.trim()) {
      alert("Vui lòng nhập nội dung phản hồi!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          news_id: parentComment.news_id,
          email: email,
          parent_id: parentComment.id, // Phản hồi dựa vào ID của comment cha
          content: reply,
        }),
      });

      if (response.ok) {
        navigation.goBack();
      } else {
        alert("Gửi phản hồi thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi phản hồi:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../../assets/arrow-left.png")} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phản hồi bình luận</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.container2}>
        {/* Nội dung bình luận gốc */}
        <View style={styles.parentComment}>
          <Text style={styles.userName}>{parentComment.user_name}</Text>
          <Text style={styles.commentText}>{parentComment.content}</Text>
        </View>

        {/* Ô nhập phản hồi */}
        <TextInput
          style={styles.input}
          placeholder="Nhập phản hồi của bạn..."
          placeholderTextColor="#ccc"
          value={reply}
          onChangeText={setReply}
          multiline
        />

        {/* Nút gửi phản hồi */}
        <TouchableOpacity style={styles.button} onPress={handleReply}>
          <Text style={styles.buttonText}>Gửi phản hồi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  container2: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  parentComment: {
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 8,
    marginBottom: 15,
    padding: 20,

  },
  userName: {
    fontWeight: "bold",
    color: "#fff",
  },
  commentText: {
    color: "#ddd",
    fontSize: 16,
    marginTop: 5,
  },
  input: {
    backgroundColor: "#444",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ReplyCommentScreen;

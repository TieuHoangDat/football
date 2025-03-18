import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const AddCommentScreen = ({ route }) => {
  const navigation = useNavigation();
  const { id, title, content, image, create_at, refresh } = route.params || {};
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSubmit = async () => {
    const email = await AsyncStorage.getItem("email");

    if (!comment.trim()) {
      alert("Vui lòng nhập nội dung bình luận!");
      return;
    }

    console.log("Gửi request với dữ liệu:", {
      news_id: id,
      email: email,
      parent_id: null,
      content: comment,
    });

    try {
      const response = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          news_id: id,
          email: email,
          parent_id: null,
          content: comment,
        }),
      });

      if (response.ok) {
        // alert("Bình luận đã được gửi!");
        refresh();
        navigation.goBack();
      } else {
        alert("Gửi bình luận thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header với nút quay lại */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../../assets/arrow-left.png")} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm bình luận</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Hiển thị bài viết */}
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <View style={styles.newsContainer}>
          <Image source={{ uri: `${API_URL}/uploads/news/${image}` }} style={styles.image} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time}>Ngày đăng: {new Date(create_at).toLocaleDateString()}</Text>
        </View>
      )}

      {/* Ô nhập bình luận */}
      <Text style={styles.commentTitle}>Nhập bình luận</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập bình luận của bạn..."
        placeholderTextColor="#ccc"
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Gửi bình luận</Text>
      </TouchableOpacity>
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
    justifyContent: "space-between",
    backgroundColor: "#000",
    paddingVertical: 15,
    paddingHorizontal: 20,
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
  newsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  time: {
    fontSize: 14,
    color: "#bbb",
    marginBottom: 10,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    padding: 10,
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddCommentScreen;

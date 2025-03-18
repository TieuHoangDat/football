import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
// import { useCallback } from "react";
import CommentItem from "../../components/CommentItem";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const CommentsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { id, title, content, image, create_at } = route.params || {};
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchComments = useCallback(() => {
    setLoading(true);
    fetch(`${API_URL}/comments/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy bình luận:", error);
        setLoading(false);
      });
  }, [id]);
  
  useFocusEffect(
    useCallback(() => {
      fetchComments();
    }, [fetchComments])
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../../assets/arrow-left.png")} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bình luận</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Hiển thị bài viết */}
      <View style={styles.newsContainer}>
        <Image source={{ uri: `${API_URL}/uploads/news/${image}` }} style={styles.image} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.time}>Ngày đăng: {new Date(create_at).toLocaleDateString()}</Text>
      </View>

      {/* Khu vực bình luận */}
      <Text style={styles.commentTitle}>Bình luận</Text>
      <TouchableOpacity
        style={styles.addCommentButton}
        onPress={() =>
          navigation.navigate("AddCommentScreen", { id, title, content, image, create_at, refresh: fetchComments })
        }
      >
        <Text style={styles.addCommentText}>Viết bình luận ...</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <CommentItem comment={item} />}
          contentContainerStyle={styles.commentList}
        />
      )}
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
  commentList: {
    paddingHorizontal: 10,
  },
  addCommentButton: {
    backgroundColor: "#1a1a1a", // Màu nền xanh lá (hoặc chọn màu khác)
    padding: 12,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1, // Thêm viền
    borderColor: "#BBB8B8", // Màu viền đậm hơn
    shadowColor: "#000", // Đổ bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Hiệu ứng nổi trên Android
  },
  
  addCommentText: {
    color: "#BBB8B8",
    fontSize: 16,
  },
});

export default CommentsScreen;

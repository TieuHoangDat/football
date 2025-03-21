import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker"; // Thêm Picker
import CommentItem from "../../components/CommentItem";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const CommentsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { id, title, content, image, create_at, comment_count } = route.params || {};
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("created_at"); // Mặc định sắp xếp theo thời gian

  const fetchComments = useCallback(() => {
    setLoading(true);
    fetch(`${API_URL}/comments/${id}?sortBy=${sortBy}`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy bình luận:", error);
        setLoading(false);
      });
  }, [id, sortBy]);

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

      {/* Khu vực chọn sắp xếp */}

      <View style={styles.sortContainer}>
        <Text style={styles.commentTitle}>{comment_count} bình luận</Text>
        <Text style={styles.sortText}>Sắp xếp theo</Text>

        <Picker
          selectedValue={sortBy}
          onValueChange={(value) => setSortBy(value)}
          style={styles.picker}
          dropdownIconColor="#fff"
          mode="dropdown"
        >
          <Picker.Item label="Mới nhất" value="created_at" />
          <Picker.Item label="Lượt thích" value="like_count" />
        </Picker>
      </View>


      {/* Nút thêm bình luận */}
      <TouchableOpacity
        style={styles.addCommentButton}
        onPress={() =>
          navigation.navigate("AddCommentScreen", { id, title, content, image, create_at, refresh: fetchComments })
        }
      >
        <Text style={styles.addCommentText}>Viết bình luận ...</Text>
      </TouchableOpacity>

      {/* Danh sách bình luận */}
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
  sortContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  sortText: {
    color: "#fff",
    fontSize: 16,
  },
  picker: {
    height: 40,
    width: 100,
    color: "#fff",
    backgroundColor: "#333",
    borderRadius: 5,
  },
  commentList: {
    paddingHorizontal: 10,
  },
  addCommentButton: {
    backgroundColor: "#1a1a1a",
    padding: 12,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBB8B8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addCommentText: {
    color: "#BBB8B8",
    fontSize: 16,
  },
});

export default CommentsScreen;

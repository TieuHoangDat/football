import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const commentDate = new Date(timestamp);

  // Chuyển từ UTC sang GMT+7
  const commentDateLocal = new Date(commentDate.getTime() + 7 * 60 * 60 * 1000);

  const diffInSeconds = Math.floor((now - commentDateLocal) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} giây trước`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ngày trước`;
};

const CommentItem = ({ comment, highlight = false, isFlattened = false }) => {
  const navigation = useNavigation();
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [userAction, setUserAction] = useState(null); // 'like', 'dislike' hoặc null

  // Lấy dữ liệu like/dislike ban đầu
  const fetchLikeData = async () => {
    const email = await AsyncStorage.getItem("email");
    if (!email) return;

    try {
      const response = await fetch(`${API_URL}/comments/likes/${comment.id}/${email}`);
      const data = await response.json();
      if (response.ok) {
        setLikeCount(data.like_count);
        setDislikeCount(data.dislike_count);
        setUserAction(data.user_action); // Trạng thái của user
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu like/dislike:", error);
    }
  };

  useEffect(() => {
    fetchLikeData();
  }, []);

  // Xử lý bấm Like/Dislike
  const handleToggleLike = async (action) => {
    const email = await AsyncStorage.getItem("email");
    if (!email) return;

    try {
      const response = await fetch(`${API_URL}/comments/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, comment_id: comment.id, action }),
      });

      const data = await response.json();
      if (response.ok) {
        await fetchLikeData(); // Cập nhật lại số lượt like/dislike
      }
    } catch (error) {
      console.error(`Lỗi khi thực hiện ${action}:`, error);
    }
  };

  return (
    <View style={[
      styles.commentContainer, 
      { marginLeft: comment.level * 20 }, // Thụt lề theo cấp độ comment
      highlight && styles.highlightedComment // Thêm style highlight nếu được chỉ định
    ]}>
      {/* Hàng ngang: Avatar + Tên + Thời gian */}
      <View style={styles.headerRow}>
        <Image source={require("../assets/user/user.png")} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{comment.user_name}</Text>
          <Text style={styles.commentTime}>{formatTimeAgo(comment.created_at)}</Text>
        </View>
      </View>
  
      {/* Nội dung bình luận */}
      <Text style={styles.commentText}>{comment.content}</Text>
  
      {/* Hàng ngang: Phản hồi - Like - Dislike */}
      <View style={styles.actionRow}>
        {/* Nút phản hồi */}
        <TouchableOpacity 
          onPress={() => navigation.navigate("ReplyCommentScreen", { parentComment: comment })}
          style={styles.replyButton}
        >
          <Text style={styles.replyButtonText}>Phản hồi</Text>
        </TouchableOpacity>

        {/* Nút like */}
        <View style={styles.likeContainer}>
          <Text style={styles.likeText}>{likeCount}</Text>
          <TouchableOpacity onPress={() => handleToggleLike("like")} style={styles.actionButton}>
            <Image 
              source={
                userAction === "like" 
                  ? require("../assets/like/like-full.png") 
                  : require("../assets/like/like.png")
              } 
              style={styles.icon} 
            />
          </TouchableOpacity>
        </View>

        {/* Nút dislike */}
        <View style={styles.likeContainer}>
          <Text style={styles.likeText}>{dislikeCount}</Text>
          <TouchableOpacity onPress={() => handleToggleLike("dislike")} style={styles.actionButton}>
            <Image 
              source={
                userAction === "dislike" 
                  ? require("../assets/like/dislike-full.png") 
                  : require("../assets/like/dislike.png")
              } 
              style={styles.icon} 
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.line}></View>

      {/* Hiển thị các phản hồi lồng nhau - chỉ hiển thị khi KHÔNG dùng cấu trúc phẳng */}
      {!isFlattened && comment.replies && comment.replies.length > 0 && (
        <FlatList
          data={comment.replies}
          keyExtractor={(reply) => reply.id.toString()}
          renderItem={({ item }) => <CommentItem comment={item} />}
          style={styles.replyContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    padding: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: "bold",
    color: "#fff",
  },
  commentTime: {
    fontSize: 12,
    color: "#bbb",
    marginTop: 5,
  },
  commentText: {
    color: "#ddd",
    fontSize: 16,
    marginTop: 5,
  },
  replyContainer: {
    marginLeft: 20,
  },
  replyButton: {
    marginTop: 5,
    paddingVertical: 5,
  },
  replyButtonText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  likeText: {
    color: "#7a7a7a",
    fontSize: 14,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 200,
    marginTop: 10,
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  actionButton: {
    padding: 5,
  },
  icon: {
    width: 20,
    height: 20,
  },
  highlightedComment: {
    backgroundColor: 'rgba(52, 152, 219, 0.15)', // Màu highlight nhẹ
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
});

export default CommentItem;

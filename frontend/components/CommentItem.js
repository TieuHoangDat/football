import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const CommentItem = ({ comment }) => {
  return (
    <View style={styles.commentContainer}>
      <Text style={styles.userName}>{comment.user_name}</Text>
      <Text style={styles.commentText}>{comment.content}</Text>
      <Text style={styles.commentTime}>{new Date(comment.created_at).toLocaleString()}</Text>

      {/* Hiển thị các phản hồi lồng nhau */}
      {comment.replies && comment.replies.length > 0 && (
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
    borderBottomWidth: 1,
    borderBottomColor: "#444",
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
  commentTime: {
    fontSize: 12,
    color: "#bbb",
    marginTop: 5,
  },
  replyContainer: {
    marginLeft: 20, // Dịch vào để thể hiện cấp độ phản hồi
  },
});

export default CommentItem;

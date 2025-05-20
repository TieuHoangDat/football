import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker"; // Thêm Picker
import CommentItem from "../../components/CommentItem";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const CommentsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { id, title, content, image, create_at, comment_count, commentId, fromNotification } = route.params || {};
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("created_at"); // Mặc định sắp xếp theo thời gian
  const [flattenedComments, setFlattenedComments] = useState([]);
  const flatListRef = useRef(null);
  const [newsInfo, setNewsInfo] = useState({
    title: title || "",
    image: image || "",
    create_at: create_at || new Date().toISOString(),
    comment_count: comment_count || 0
  });

  // Tải thông tin bài viết nếu chỉ có id được truyền vào (khi điều hướng từ thông báo)
  const fetchNewsInfo = useCallback(() => {
    if (id && fromNotification) {
      console.log("Fetching news data for ID:", id);
      fetch(`${API_URL}/news/${id}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("News data fetched:", data);
          if (data) {
            // Đảm bảo sử dụng đúng tên trường dữ liệu từ API
            setNewsInfo({
              title: data.title || title || "",
              image: data.image_url || data.image || "",
              create_at: data.created_at || data.create_at || new Date().toISOString(),
              comment_count: data.comment_count || 0
            });
            console.log("Updated newsInfo:", {
              title: data.title || title || "",
              image: data.image_url || data.image || "",
              create_at: data.created_at || data.create_at,
              comment_count: data.comment_count
            });
          }
        })
        .catch((error) => {
          console.error("Lỗi khi tải thông tin bài viết:", error);
        });
    }
  }, [id, fromNotification, title]);

  // Hàm format thời gian
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Ngày không xác định';
      }
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Lỗi format ngày:", error, dateString);
      return 'Ngày không xác định';
    }
  };

  useEffect(() => {
    fetchNewsInfo();
  }, [fetchNewsInfo]);

  // Hàm làm phẳng cây comment thành danh sách 1 chiều để dễ tìm kiếm
  const flattenComments = useCallback((commentsTree) => {
    let result = [];
    
    const flatten = (comments, level = 0) => {
      comments.forEach(comment => {
        result.push({...comment, level});
        if (comment.replies && comment.replies.length > 0) {
          flatten(comment.replies, level + 1);
        }
      });
    };
    
    flatten(commentsTree);
    return result;
  }, []);

  const fetchComments = useCallback(() => {
    setLoading(true);
    fetch(`${API_URL}/comments/${id}?sortBy=${sortBy}`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data);
        // Làm phẳng danh sách comment để dễ tìm kiếm
        const flattened = flattenComments(data);
        setFlattenedComments(flattened);
        setLoading(false);
        
        // Cuộn đến comment nếu có commentId và đến từ thông báo
        if (commentId && fromNotification && flatListRef.current) {
          console.log("Chuẩn bị cuộn đến comment:", commentId);
          console.log("Số lượng comment đã làm phẳng:", flattened.length);
          
          // Tăng thời gian chờ để đảm bảo FlatList đã render xong
          setTimeout(() => {
            scrollToComment(commentId, flattened);
          }, 1000); // Tăng thời gian chờ từ 500ms lên 1000ms
        }
      })
      .catch((error) => {
        console.error("Lỗi khi lấy bình luận:", error);
        setLoading(false);
      });
  }, [id, sortBy, commentId, fromNotification, flattenComments]);

  // Hàm cuộn đến comment cụ thể
  const scrollToComment = (targetCommentId, flattened) => {
    console.log("Đang tìm comment với ID:", targetCommentId);
    const targetId = parseInt(targetCommentId);
    const index = flattened.findIndex(comment => comment.id === targetId);
    
    console.log("Vị trí của comment trong mảng:", index);
    
    if (index !== -1 && flatListRef.current) {
      console.log("Đang cuộn đến vị trí:", index);
      try {
        flatListRef.current.scrollToIndex({ 
          index, 
          animated: true,
          viewPosition: 0.3 // Điều chỉnh vị trí hiển thị (0 là đầu, 0.5 là giữa, 1 là cuối)
        });
      } catch (error) {
        console.error("Lỗi khi cuộn:", error);
        
        // Phương pháp thay thế nếu scrollToIndex gặp lỗi
        flatListRef.current.scrollToOffset({
          offset: index * 100, // Ước lượng chiều cao trung bình của mỗi item
          animated: true
        });
      }
    } else {
      console.log("Không tìm thấy comment hoặc flatListRef chưa sẵn sàng");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchComments();
    }, [fetchComments])
  );

  const highlightComment = (item) => {
    return item.id === parseInt(commentId) && fromNotification;
  };

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
        <Image 
          source={{ uri: newsInfo.image ? 
            (newsInfo.image.includes('http') ? 
              newsInfo.image : 
              `${API_URL}/uploads/news/${newsInfo.image}`) 
            : null 
          }} 
          style={styles.image}
          onError={(e) => console.log("Lỗi tải ảnh:", e.nativeEvent.error)}
        />
        <Text style={styles.title}>{newsInfo.title || title}</Text>
        <Text style={styles.time}>
          Ngày đăng: {formatDate(newsInfo.create_at)}
        </Text>
      </View>

      {/* Khu vực chọn sắp xếp */}

      <View style={styles.sortContainer}>
        <Text style={styles.commentTitle}>{newsInfo.comment_count || comment_count || flattenedComments.length} bình luận</Text>
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
          navigation.navigate("AddCommentScreen", { 
            id, 
            title: newsInfo.title || title, 
            content, 
            image: newsInfo.image || image, 
            create_at: newsInfo.create_at || create_at, 
            refresh: fetchComments 
          })
        }
      >
        <Text style={styles.addCommentText}>Viết bình luận ...</Text>
      </TouchableOpacity>

      {/* Danh sách bình luận */}
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <FlatList
          ref={flatListRef}
          data={flattenedComments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CommentItem 
              comment={item} 
              highlight={highlightComment(item)}
              isFlattened={true}
            />
          )}
          contentContainerStyle={styles.commentList}
          onLayout={() => {
            // Thử cuộn đến comment khi FlatList đã render xong layout
            if (commentId && fromNotification) {
              console.log("FlatList đã render xong layout, thử cuộn lại");
              setTimeout(() => {
                scrollToComment(commentId, flattenedComments);
              }, 300);
            }
          }}
          onScrollToIndexFailed={(info) => {
            console.warn('Không thể cuộn đến comment:', info);
            // Fallback đến vị trí gần nhất
            setTimeout(() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToOffset({
                  offset: info.averageItemLength * info.index,
                  animated: true,
                });
              }
            }, 100);
          }}
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

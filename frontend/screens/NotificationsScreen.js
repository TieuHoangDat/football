import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from "expo-constants";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigation } from '@react-navigation/native';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  parseNavigationData
} from '../services/NotificationService';

// Lấy API URL từ app.json
const API_URL = Constants.expoConfig.extra.apiUrl;

// Bảng màu
const COLORS = {
  primary: "#3498db",    // Xanh dương
  background: "#1A1A1A", // Nền tối
  cardBg: "#262626",     // Nền card
  text: "#FFFFFF",       // Text trắng
  textSecondary: "#BBB", // Text phụ
  border: "#333",        // Viền
};

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    fetchNotifications();
    
    // Đăng ký lắng nghe sự kiện focus từ navigation để cập nhật thông báo
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNotifications(1, false);
    });

    return unsubscribe;
  }, [navigation]);

  const fetchNotifications = async (pageNumber = 1, shouldRefresh = false) => {
    try {
      if (shouldRefresh) {
        setRefreshing(true);
      } else if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const currentPage = shouldRefresh ? 1 : pageNumber;
      const response = await axios.get(`${API_URL}/notifications?page=${currentPage}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Đếm số thông báo chưa đọc
      const countUnreadResponse = await axios.get(`${API_URL}/notifications?is_read=false`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setTotalUnread(countUnreadResponse.data.pagination.total);
      
      const { data, pagination } = response.data;
      
      if (currentPage === 1) {
        setNotifications(data);
      } else {
        setNotifications(prevNotifications => [...prevNotifications, ...data]);
      }
      
      setHasMore(pagination.currentPage < pagination.totalPages);
      setPage(pagination.currentPage);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Lỗi', 'Không thể tải thông báo. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Cập nhật UI
      setNotifications(
        notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      
      // Cập nhật số lượng thông báo chưa đọc
      setTotalUnread(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Cập nhật UI
      setNotifications(
        notifications.map(notification => ({ ...notification, is_read: true }))
      );
      
      // Đặt lại số lượng thông báo chưa đọc
      setTotalUnread(0);
      
      Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
      Alert.alert('Lỗi', 'Không thể đánh dấu tất cả thông báo. Vui lòng thử lại sau.');
    }
  };

  const handleNotificationPress = async (notification) => {
    try {
      // Đánh dấu thông báo đã đọc
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);
        
        // Cập nhật trạng thái của thông báo trong state
        setNotifications(prevNotifications =>
          prevNotifications.map(item =>
            item.id === notification.id ? { ...item, is_read: true } : item
          )
        );
      }
      
      // Xử lý điều hướng dựa trên navigation_data của thông báo
      const navigationData = parseNavigationData(notification);
      
      if (navigationData) {
        const { screen, params } = navigationData;
        if (screen != undefined) {
          navigation.navigate(screen, params);
        }
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MATCH_START':
      case 'MATCH_END':
      case 'MATCH_REMINDER':
        return 'football-outline';
      case 'GOAL':
        return 'football';
      case 'RED_CARD':
      case 'PENALTY':
        return 'card-outline';
      case 'TEAM_NEWS':
      case 'PLAYER_INJURY':
      case 'TRANSFER_NEWS':
        return 'newspaper-outline';
      case 'COMMENT_REPLY':
      case 'COMMENT_LIKE':
      case 'MENTION':
        return 'chatbubble-outline';
      default:
        return 'notifications-outline';
    }
  };

  const renderNotificationItem = ({ item }) => {
    const createdAt = new Date(item.created_at);
    const formattedDate = `${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`;
    
    return (
      <TouchableOpacity
        style={[styles.notificationItem, item.is_read ? styles.readItem : styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationIcon}>
          <Ionicons
            name={getNotificationIcon(item.notification_type)}
            size={24}
            color={item.is_read ? "#999" : "#3498db"}
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, !item.is_read && styles.boldText]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationDate}>{formattedDate}</Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const handleRefresh = () => {
    fetchNotifications(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchNotifications(page + 1, false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Thông báo" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo của bạn</Text>
        <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
          <Text style={styles.markAllText}>Đánh dấu tất cả đã đọc</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#999" />
          <Text style={styles.emptyText}>Không có thông báo nào</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#3498db']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#3498db" />
              </View>
            ) : null
          )}
        />
      )}
      
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    color: '#3498db',
    fontSize: 14,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
    position: 'relative',
  },
  readItem: {
    backgroundColor: '#121212',
  },
  unreadItem: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#666',
  },
  boldText: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3498db',
    position: 'absolute',
    top: 16,
    right: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginTop: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default NotificationsScreen; 
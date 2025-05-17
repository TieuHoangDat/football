import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from "expo-constants";
import Header from '../components/Header';
import Footer from '../components/Footer';

// Lấy API URL từ app.json
const API_URL = Constants.expoConfig.extra.apiUrl;

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    fetchNotifications();
    
    // Cập nhật thông báo khi màn hình được focus
    const unsubscribe = navigation.addListener('focus', () => {
      setPage(1);
      fetchNotifications(true);
    });

    return unsubscribe;
  }, [navigation]);

  const fetchNotifications = async (refresh = false) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const currentPage = refresh ? 1 : page;
      if (refresh) {
        setRefreshing(true);
        setNotifications([]);
      }

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
      
      if (refresh) {
        setNotifications(response.data.data);
        setPage(2);
      } else {
        setNotifications([...notifications, ...response.data.data]);
        setPage(currentPage + 1);
      }
      
      setHasMore(currentPage < response.data.pagination.totalPages);
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
      Alert.alert('Lỗi', 'Không thể tải thông báo. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      const token = await AsyncStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/notifications/read/all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
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

  const handleNotificationPress = (notification) => {
    // Đánh dấu là đã đọc khi nhấn vào
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Chuyển hướng dựa trên loại thông báo
    switch (notification.related_entity_type) {
      case 'MATCH':
        navigation.navigate('MatchStats', { matchId: notification.related_entity_id });
        break;
      case 'TEAM':
        navigation.navigate('TeamDetails', { teamId: notification.related_entity_id });
        break;
      case 'PLAYER':
        navigation.navigate('PlayerDetails', { playerId: notification.related_entity_id });
        break;
      case 'COMMENT':
        // Điều hướng đến màn hình bình luận cụ thể
        navigation.navigate('Comments', { 
          newsId: notification.related_entity_id,
          scrollToComment: true
        });
        break;
      default:
        // Nếu không có điều hướng cụ thể
        break;
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

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        !item.is_read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name={getNotificationIcon(item.notification_type)} 
          size={24} 
          color={!item.is_read ? "#E53935" : "#777"} 
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Thông báo" />
      
      <View style={styles.content}>
        {totalUnread > 0 && (
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Đánh dấu tất cả là đã đọc</Text>
          </TouchableOpacity>
        )}
        
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#E53935" />
        ) : notifications.length > 0 ? (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id.toString()}
            onRefresh={() => fetchNotifications(true)}
            refreshing={refreshing}
            onEndReached={() => {
              if (hasMore && !loading) {
                fetchNotifications();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              hasMore && (
                <ActivityIndicator 
                  style={styles.loadingMore} 
                  size="small" 
                  color="#E53935" 
                />
              )
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>Không có thông báo nào</Text>
          </View>
        )}
      </View>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  markAllButton: {
    backgroundColor: '#262626',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  markAllText: {
    color: '#E53935',
    fontWeight: 'bold',
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#262626',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 0,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: '#E53935',
    backgroundColor: '#2D2D2D',
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  notificationMessage: {
    color: '#BBB',
    fontSize: 14,
    marginBottom: 6,
  },
  notificationTime: {
    color: '#888',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  loadingMore: {
    paddingVertical: 10,
  },
});

export default NotificationsScreen; 
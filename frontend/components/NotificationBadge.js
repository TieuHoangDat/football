import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getUnreadCount } from '../services/NotificationService';

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigation = useNavigation();

  // Lấy số lượng thông báo chưa đọc khi component được mount
  useEffect(() => {
    fetchUnreadCount();
    
    // Thiết lập interval để cập nhật số lượng thông báo chưa đọc
    const interval = setInterval(fetchUnreadCount, 60000); // 1 phút
    
    // Xóa interval khi component unmount
    return () => clearInterval(interval);
  }, []);

  // Đăng ký lắng nghe sự kiện focus từ navigation để cập nhật thông báo
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUnreadCount();
    });
    
    return unsubscribe;
  }, [navigation]);

  // Hàm lấy số lượng thông báo chưa đọc
  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Chuyển đến màn hình thông báo khi nhấn vào biểu tượng
  const handlePress = () => {
    navigation.navigate('Notifications');
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Ionicons name="notifications-outline" size={24} color="white" />
      
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 10,
  },
  badge: {
    position: 'absolute',
    right: 2,
    top: 2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationBadge; 
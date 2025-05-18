import { getNotifications, getNewNotificationsSince } from './NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Platform } from 'react-native';

// Create a simple event emitter for notifications
export const NotificationEvents = {
  listeners: {},
  
  addListener: function(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners[eventName] = this.listeners[eventName].filter(
        listener => listener !== callback
      );
    };
  },
  
  emit: function(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => callback(data));
    }
  }
};

// Khóa để lưu thời gian kiểm tra thông báo gần nhất
const LAST_CHECK_KEY = 'last_notification_check_time';
// Khóa để lưu ID thông báo mới nhất đã xem
const LAST_SEEN_NOTIFICATION_ID = 'last_seen_notification_id';

/**
 * Kiểm tra và hiển thị thông báo mới
 */
export const checkForNewNotifications = async () => {
  try {
    // Lấy thời gian kiểm tra cuối cùng
    const lastCheckTimeStr = await AsyncStorage.getItem(LAST_CHECK_KEY);
    const currentTime = new Date().getTime();
    
    // Nếu chưa từng kiểm tra, chỉ cập nhật thời gian và thoát
    if (!lastCheckTimeStr) {
      await AsyncStorage.setItem(LAST_CHECK_KEY, currentTime.toString());
      return { hasNewNotifications: false, notifications: [] };
    }
    
    const lastCheckTime = parseInt(lastCheckTimeStr);
    
    // Lấy thông báo mới từ thời gian kiểm tra cuối cùng
    const response = await getNewNotificationsSince(lastCheckTime, 5);
    const newNotifications = response.data || [];
    
    // Cập nhật thời gian kiểm tra cuối cùng
    await AsyncStorage.setItem(LAST_CHECK_KEY, currentTime.toString());
    
    return { 
      hasNewNotifications: newNotifications.length > 0, 
      notifications: newNotifications 
    };
  } catch (error) {
    console.error('Error checking for new notifications:', error);
    return { hasNewNotifications: false, notifications: [], error };
  }
};

/**
 * Hiển thị toast cho thông báo mới
 */
export const showNotificationToast = (notification) => {
  const { title, message } = notification;
  
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    visibilityTime: 4000,
    autoHide: true,
    topOffset: Platform.OS === 'ios' ? 50 : 30,
    onPress: () => {
      // Có thể thêm logic điều hướng đến màn hình thông báo tại đây
    }
  });
};

/**
 * Bắt đầu giám sát thông báo mới
 */
let notificationCheckInterval = null;

export const startNotificationMonitoring = (checkIntervalMs = 10000) => {
  if (notificationCheckInterval) {
    clearInterval(notificationCheckInterval);
  }
  
  // Kiểm tra ngay lần đầu khi khởi động
  checkAndNotify();
  
  // Thiết lập interval để kiểm tra định kỳ
  notificationCheckInterval = setInterval(() => {
    checkAndNotify();
  }, checkIntervalMs);
  
  return () => {
    if (notificationCheckInterval) {
      clearInterval(notificationCheckInterval);
      notificationCheckInterval = null;
    }
  };
};

/**
 * Dừng giám sát thông báo
 */
export const stopNotificationMonitoring = () => {
  if (notificationCheckInterval) {
    clearInterval(notificationCheckInterval);
    notificationCheckInterval = null;
  }
};

/**
 * Kiểm tra và hiển thị thông báo nếu có mới
 */
const checkAndNotify = async () => {
  try {
    const { hasNewNotifications, notifications } = await checkForNewNotifications();
    
    if (hasNewNotifications && notifications.length > 0) {
      // Hiển thị toast cho thông báo mới nhất
      showNotificationToast(notifications[0]);
      
      // Emit event to update notification count
      NotificationEvents.emit('newNotificationsReceived', { count: notifications.length });
      
      // Nếu có nhiều thông báo, hiển thị một thông báo tổng hợp
      if (notifications.length > 1) {
        setTimeout(() => {
          Toast.show({
            type: 'info',
            text1: 'Thông báo mới',
            text2: `Bạn có ${notifications.length} thông báo mới`,
            visibilityTime: 3000,
          });
        }, 4500); // Hiện sau thông báo đầu tiên một chút
      }
    }
  } catch (error) {
    console.error('Error in checkAndNotify:', error);
  }
}; 
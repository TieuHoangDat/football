import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationEvents } from './NotificationMonitor';

const API_URL = Constants.expoConfig.extra.apiUrl;

/**
 * Lấy danh sách thông báo từ server
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng thông báo mỗi trang
 * @param {boolean} isRead - Lọc theo trạng thái đã đọc (undefined để lấy tất cả)
 * @returns {Promise} - Promise chứa danh sách thông báo và thông tin phân trang
 */
export const getNotifications = async (page = 1, limit = 10, isRead = undefined) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    let url = `${API_URL}/notifications?page=${page}&limit=${limit}`;
    if (isRead !== undefined) {
      url += `&is_read=${isRead}`;
    }
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Đánh dấu thông báo đã đọc
 * @param {number} notificationId - ID của thông báo
 * @returns {Promise} - Promise trả về kết quả
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Đánh dấu tất cả thông báo đã đọc
 * @returns {Promise} - Promise trả về kết quả
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    const response = await fetch(`${API_URL}/notifications/read/all`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Đếm số lượng thông báo chưa đọc
 * @returns {Promise<number>} - Promise trả về số lượng thông báo chưa đọc
 */
export const getUnreadCount = async () => {
  try {
    const data = await getNotifications(1, 1, false);
    return data.pagination.total || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

/**
 * Phân tích dữ liệu điều hướng từ thông báo
 * @param {Object} notification - Đối tượng thông báo
 * @returns {Object|null} - Đối tượng chứa thông tin điều hướng hoặc null nếu không có
 */
export const parseNavigationData = (notification) => {
  if (!notification.navigation_data) return null;
  
  try {
    // Nếu navigation_data là chuỗi JSON, parse nó
    return typeof notification.navigation_data === 'string' 
      ? JSON.parse(notification.navigation_data)
      : notification.navigation_data;
  } catch (error) {
    console.error('Error parsing navigation data:', error);
    return null;
  }
};

/**
 * Cập nhật thông báo khi nhận được push notification
 * @param {Object} notification - Thông báo push từ Expo
 * @returns {Promise<number>} - Số lượng thông báo chưa đọc mới
 */
export const refreshNotificationsOnPush = async (notification) => {
  try {
    console.log('Refreshing notifications after push received:', notification);
    
    // Đợi một chút để đảm bảo thông báo đã được lưu vào database
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Cập nhật và trả về số lượng thông báo chưa đọc
    const unreadCount = await getUnreadCount();
    
    // Lưu số lượng thông báo chưa đọc vào AsyncStorage để có thể truy cập từ nhiều nơi
    await AsyncStorage.setItem('unreadNotificationCount', String(unreadCount));
    
    try {
      // Phát sự kiện ĐỒNG THỜI qua cả hai EventEmitter
      console.log('Emitting notification count changed event through NotificationEvents:', unreadCount);
      
      // Sử dụng NotificationEvents trực tiếp
      NotificationEvents.emit('newNotificationsReceived', { count: unreadCount });
      
      // Vẫn giữ global.notificationEventEmitter cho các component cũ nếu có
      if (global.notificationEventEmitter) {
        global.notificationEventEmitter.emit('onNotificationCountChanged', unreadCount);
      }
    } catch (error) {
      console.error('Error emitting notification event:', error);
    }
    
    return unreadCount;
  } catch (error) {
    console.error('Error refreshing notifications:', error);
    return 0;
  }
};

/**
 * Thiết lập event emitter toàn cục cho thông báo
 * @param {Object} eventEmitter - Event emitter instance
 */
export const setupNotificationEventEmitter = (eventEmitter) => {
  if (eventEmitter) {
    console.log('Setting up global notification event emitter');
    global.notificationEventEmitter = eventEmitter;
  } else {
    console.error('Attempted to setup notification event emitter with null value');
  }
}; 
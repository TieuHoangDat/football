import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

const API_URL = Constants.expoConfig.extra.apiUrl;

// Kiểm tra xem có đang chạy trên web không
const isWeb = Platform.OS === 'web';

// Chỉ cấu hình notification handler nếu không phải web
if (!isWeb) {
  // Cấu hình cách hiển thị thông báo khi app đang chạy
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      console.log('Notification handler called - will show alert');
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    },
  });
}

/**
 * Kiểm tra trạng thái quyền thông báo
 * @returns {Promise<Object>} - Promise trả về trạng thái quyền
 */
export const checkNotificationPermissions = async () => {
  if (isWeb) {
    console.log('Web không hỗ trợ push notifications');
    return { status: 'not-supported' };
  }
  
  const { status } = await Notifications.getPermissionsAsync();
  console.log('Permission status:', status);
  return { status };
};

/**
 * Đăng ký thiết bị để nhận thông báo đẩy
 * @returns {Promise<string>} - Promise trả về token thiết bị hoặc null nếu thất bại
 */
export const registerForPushNotificationsAsync = async () => {
  // Không đăng ký nếu đang chạy trên web
  if (isWeb) {
    console.log('Push notifications không được hỗ trợ trên Web');
    return null;
  }

  let token;
  
  if (Platform.OS === 'android') {
    // Cần thiết lập thông báo trên Android
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: true,
        enableVibrate: true,
        showBadge: true,
      });
      
      // Tạo channel riêng cho thông báo quan trọng với âm thanh tối đa
      await Notifications.setNotificationChannelAsync('important', {
        name: 'Important Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: true,
        enableVibrate: true,
        showBadge: true,
      });
      
      console.log('Notification channels created successfully');
    } catch (error) {
      console.error('Error creating notification channel:', error);
    }
  }

  if (Device.isDevice) {
    // Kiểm tra quyền thông báo
    console.log('Checking notification permissions...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('Current permission status:', existingStatus);
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      console.log('Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('New permission status:', finalStatus);
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    // Lấy token từ Expo
    try {
      console.log('Getting Expo push token with projectId:', Constants.expoConfig?.extra?.eas?.projectId);
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      token = pushTokenData.data;
      
      console.log('Push Notification Token:', token);
      
      // Lưu token vào AsyncStorage để sử dụng sau này
      await AsyncStorage.setItem('pushToken', token);
      
      // KHÔNG gửi token lên server ngay lập tức
      // Có thể sử dụng token này trực tiếp với Expo Push API
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
};

/**
 * Test gửi thông báo cục bộ (ngay trên thiết bị)
 */
export const sendLocalNotification = async () => {
  try {
    if (isWeb) {
      console.log('Web không hỗ trợ push notifications');
      return;
    }
    
    console.log('Scheduling local notification...');
    
    // Cách 1: Lên lịch thông báo với trigger
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Thông báo test (Scheduled)",
        body: "Đây là thông báo test gửi từ thiết bị với lịch.",
        data: { screen: "Home" },
        sound: 'default',
        priority: 'high',
        vibrate: [0, 250, 250, 250],
        badge: 1,
      },
      trigger: { seconds: 2 },
    });
    console.log('Local notification scheduled with ID:', notificationId);
    
    // Cách 2: Thông báo tức thời có âm thanh và rung với channel "important"
    setTimeout(async () => {
      const immediateId = await Notifications.presentNotificationAsync({
        title: "Thông báo test (Immediate)",
        body: "Đây là thông báo test hiển thị ngay lập tức VỚI ÂM THANH.",
        data: { screen: "Home" },
        sound: 'default',
        priority: 'max',
        android: {
          channelId: 'important',
          sound: true,
          vibrate: true,
          priority: 'max',
          sticky: false,
        },
        ios: {
          sound: true, 
        },
      });
      console.log('Immediate notification presented with ID:', immediateId);
      
      // Cách 3: Hiển thị Alert thủ công
      Alert.alert(
        "Thông báo test (Alert)",
        "Đây là thông báo test hiển thị qua Alert.",
        [{ text: "OK", onPress: () => console.log("Alert OK pressed") }]
      );
    }, 4000);
    
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
};

/**
 * Gửi token thiết bị lên server (chỉ gọi khi cần)
 * @param {string} token - Token thiết bị
 * @returns {Promise} - Promise kết quả
 */
export const sendPushTokenToServer = async (token) => {
  try {
    const userToken = await AsyncStorage.getItem('token');
    
    if (!userToken) {
      throw new Error('User not authenticated');
    }
    
    const response = await fetch(`${API_URL}/users/push-token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ push_token: token }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send push token to server');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending push token to server:', error);
    throw error;
  }
};

/**
 * Đăng ký lắng nghe thông báo đẩy
 * @param {Function} onNotification - Callback khi nhận được thông báo
 * @returns {Object} - Subscription object để hủy đăng ký sau này
 */
export const subscribeToPushNotifications = (onNotification) => {
  // Không đăng ký lắng nghe nếu đang chạy trên web
  if (isWeb) {
    return null;
  }
  
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
    if (onNotification) {
      onNotification(notification);
    }
  });
  console.log('subscription', subscription);
  return subscription;
};

/**
 * Đăng ký lắng nghe sự kiện khi người dùng tương tác với thông báo
 * @param {Function} onNotificationResponse - Callback khi người dùng tương tác với thông báo
 * @returns {Object} - Subscription object để hủy đăng ký sau này
 */
export const subscribeToNotificationResponse = (onNotificationResponse) => {
  // Không đăng ký lắng nghe nếu đang chạy trên web
  if (isWeb) {
    return null;
  }
  
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification response:', response);
    if (onNotificationResponse) {
      onNotificationResponse(response);
    }
  });
  
  return subscription;
};

/**
 * Hủy đăng ký lắng nghe thông báo
 * @param {Object} subscription - Subscription object cần hủy
 */
export const unsubscribeFromNotifications = (subscription) => {
  // Kiểm tra subscription trước khi hủy, để tránh lỗi trên web
  if (!isWeb && subscription) {
    Notifications.removeNotificationSubscription(subscription);
  }
};

/**
 * Đăng ký lắng nghe thông báo khi ứng dụng đang chạy và hiển thị Alert
 */
export const setupForegroundNotificationHandler = () => {
  if (isWeb) return null;
  
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Foreground notification received:', notification);
    
    // Hiển thị Alert khi nhận được thông báo trong foreground
    const title = notification.request.content.title;
    const body = notification.request.content.body;
    
    // Sử dụng Alert để hiển thị thông báo trong ứng dụng
    Alert.alert(
      title || 'Thông báo mới',
      body || 'Bạn có một thông báo mới',
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
  });
  
  return subscription;
}; 
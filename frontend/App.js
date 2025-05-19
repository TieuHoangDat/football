import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, Platform, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, subscribeToNotificationResponse, checkNotificationPermissions, sendLocalNotification, setupForegroundNotificationHandler } from "./services/PushNotificationService";
import LoginScreen from "./screens/Auth/LoginScreen";
import RegisterScreen from "./screens/Auth/RegisterScreen";
import HomeScreen from "./screens/News/HomeScreen";
import MatchesScreen from "./screens/Matches/MatchesScreen";
import StatsScreen from "./screens/Stats/StatsScreen";
import MatchStatsScreen from "./screens/Stats/MatchStatsScreen";
import AccountScreen from "./screens/AccountScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import NewsDetailScreen from "./screens/News/NewsDetailScreen";
import CommentsScreen from "./screens/News/CommentsScreen";
import AddCommentScreen from "./screens/News/AddCommentScreen";
import ReplyCommentScreen from "./screens/News/ReplyCommentScreen";
import SearchScreen from "./screens/SearchScreen";
import TeamDetailsScreen from "./screens/Teams/TeamDetailsScreen";
import PlayeretailsScreen from "./screens/Teams/PlayerDetailsScreen";
import { enableScreens } from 'react-native-screens';
enableScreens();
const Stack = createNativeStackNavigator();

// CẤU HÌNH PUSH NOTIFICATION TỪ EXPO API
/*
Khi gửi thông báo từ Expo Push API, hãy sử dụng định dạng sau để có âm thanh:

fetch("https://exp.host/--/api/v2/push/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    to: "ExponentPushToken[...]",
    title: "Thông báo mới",
    body: "Nội dung thông báo",
    sound: "default",
    badge: 1,
    priority: "high",
    channelId: "important", // Nếu bạn đang gửi cho Android
    data: { screen: "Home" }
  })
});

*/

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("Login");
  const navigationRef = useRef();
  const notificationResponseSubscription = useRef();
  const notificationListener = useRef();
  const foregroundNotificationSubscription = useRef();
  
  // Kiểm tra xem có đang chạy trên web không
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("token");
      setInitialRoute(token ? "Home" : "Login");
      setLoading(false);
    };
    
    checkLoginStatus();
  }, []);

  useEffect(() => {
    // Bỏ qua việc đăng ký push notifications trên web
    if (!isWeb) {
      const setupNotifications = async () => {
        console.log("===== NOTIFICATION SETUP =====");
        
        // Kiểm tra quyền thông báo
        const permStatus = await checkNotificationPermissions();
        console.log("Permission check result:", permStatus);
        
        // Đăng ký nhận push notifications
        const token = await registerForPushNotificationsAsync();
        console.log("Registration complete, token:", token);
        
        // Kiểm tra xem token đã được lưu vào AsyncStorage chưa
        const savedToken = await AsyncStorage.getItem('pushToken');
        console.log("Saved token in AsyncStorage:", savedToken);
        
        // Test gửi thông báo local để kiểm tra
        if (permStatus.status === 'granted') {
          console.log("Permissions granted");
          
          // Test thông báo khi khởi động (chỉ bật cho dev mode để debug)
          if (__DEV__) {
            console.log("DEV mode: Sending test notification after 5 seconds...");
            setTimeout(() => {
              sendLocalNotification();
            }, 5000);
          }
        }
        
        console.log("===== END NOTIFICATION SETUP =====");
      };
      
      setupNotifications();

      // Đăng ký lắng nghe thông báo khi ứng dụng đang chạy và hiển thị Alert
      foregroundNotificationSubscription.current = setupForegroundNotificationHandler();
      console.log("Foreground notification handler set up");

      // Xử lý khi nhận được thông báo
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Original notification listener - received while app is running:', notification);
      });

      // Xử lý khi người dùng tương tác với thông báo
      notificationResponseSubscription.current = subscribeToNotificationResponse(
        response => {
          console.log('User interacted with notification:', response);
          const { notification } = response;
          const navigationData = notification.request.content.data;
          
          console.log('Navigation data from notification:', navigationData);
          
          // Xử lý điều hướng dựa trên dữ liệu từ thông báo
          if (navigationData && navigationData.screen) {
            if (navigationRef.current) {
              navigationRef.current.navigate(navigationData.screen, navigationData.params);
            }
          }
        }
      );

      // Dọn dẹp khi component unmount
      return () => {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (notificationResponseSubscription.current) {
          Notifications.removeNotificationSubscription(notificationResponseSubscription.current);
        }
        if (foregroundNotificationSubscription.current) {
          Notifications.removeNotificationSubscription(foregroundNotificationSubscription.current);
        }
      };
    }
  }, [isWeb]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        initialRouteName={initialRoute} 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal'
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Matches" component={MatchesScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="MatchStats" component={MatchStatsScreen} />
        <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
        <Stack.Screen name="Comments" component={CommentsScreen} />
        <Stack.Screen name="AddCommentScreen" component={AddCommentScreen} />
        <Stack.Screen name="ReplyCommentScreen" component={ReplyCommentScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="TeamDetails" component={TeamDetailsScreen} />
        <Stack.Screen name="PlayerDetails" component={PlayeretailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

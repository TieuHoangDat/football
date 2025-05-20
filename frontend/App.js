import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, Platform, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';
import { EventEmitter } from 'fbemitter';
import { registerForPushNotificationsAsync, subscribeToNotificationResponse, checkNotificationPermissions, setupForegroundNotificationHandler, sendPushTokenToServer } from "./services/PushNotificationService";
import { refreshNotificationsOnPush, setupNotificationEventEmitter } from "./services/NotificationService";
import { NotificationEvents } from "./services/NotificationMonitor";
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
import ManageScreen from "./screens/Manage/ManageScreen";
import AddMatchScreen from "./screens/Manage/AddMatchScreen";
import UpdateMatchScreen from "./screens/Manage/UpdateMatchScreen";
import UpdateUserScreen from "./screens/Manage/UpdateUserScreen";
import { enableScreens } from 'react-native-screens';
enableScreens();
const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("Login");
  const navigationRef = useRef();
  const notificationResponseSubscription = useRef();
  const notificationListener = useRef();
  const foregroundNotificationSubscription = useRef();
  const emitterRef = useRef(null);

  // Kiểm tra xem có đang chạy trên web không
  const isWeb = Platform.OS === 'web';

  // Thiết lập EventEmitter cho thông báo
  useEffect(() => {
    // Khởi tạo event emitter cho thông báo sử dụng fbemitter
    if (!emitterRef.current) {
      emitterRef.current = new EventEmitter();
      setupNotificationEventEmitter(emitterRef.current);
      console.log('EventEmitter initialized with fbemitter');
    }
  }, []);

  // Kiểm tra xác thực và chuẩn bị app
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("token");
      setInitialRoute(token ? "Home" : "Login");
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  // Thiết lập push notifications
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

        // Gửi token lên server khi đã đăng nhập
        const authToken = await AsyncStorage.getItem('token');
        if (authToken && token) {
          try {
            console.log("Sending push token to server...");
            await sendPushTokenToServer(token);
            console.log("Token registered with server successfully");
          } catch (error) {
            console.error("Failed to register token with server:", error);
          }
        }

        // Test thông báo khi khởi động (chỉ bật cho dev mode để debug)
        if (permStatus.status === 'granted') {
          console.log("Permissions granted");
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

        // Cập nhật số lượng thông báo chưa đọc
        refreshNotificationsOnPush(notification);
      });

      // Xử lý khi người dùng tương tác với thông báo
      notificationResponseSubscription.current = subscribeToNotificationResponse(
        response => {
          console.log('User interacted with notification:', response);
          const { notification } = response;
          const navigationData = notification.request.content.data;

          console.log('Navigation data from notification:', navigationData);

          // Cập nhật số lượng thông báo chưa đọc
          refreshNotificationsOnPush(notification);

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
        <Stack.Screen name="Manage" component={ManageScreen} />
        <Stack.Screen name="AddMatch" component={AddMatchScreen} />
        <Stack.Screen name="UpdateMatch" component={UpdateMatchScreen} />
        <Stack.Screen name="UpdateUser" component={UpdateUserScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
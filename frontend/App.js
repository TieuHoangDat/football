import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "./screens/Auth/LoginScreen";
import RegisterScreen from "./screens/Auth/RegisterScreen";
import HomeScreen from "./screens/News/HomeScreen";
import MatchesScreen from "./screens/Matches/MatchesScreen";
import StatsScreen from "./screens/Stats/StatsScreen";
import AccountScreen from "./screens/AccountScreen";
import NewsDetailScreen from "./screens/News/NewsDetailScreen";
import CommentsScreen from "./screens/News/CommentsScreen";
import AddCommentScreen from "./screens/News/AddCommentScreen";
import ReplyCommentScreen from "./screens/News/ReplyCommentScreen";
import SearchScreen from "./screens/SearchScreen";
import TeamDetailsScreen from "./screens/Teams/TeamDetailsScreen"; // Màn hình giới thiệu
import PlayeretailsScreen from "./screens/Teams/PlayerDetailsScreen"; // Màn hình giới thiệu


const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("Login");

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("token");
      setInitialRoute(token ? "Home" : "Login");
      setLoading(false);
    };
    checkLoginStatus();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Matches" component={MatchesScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
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

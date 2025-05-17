import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

// Lấy API URL từ app.json
const API_URL = Constants.expoConfig.extra.apiUrl;

const Footer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadNotifications();
    
    // Cập nhật số lượng thông báo chưa đọc khi tab được focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUnreadNotifications();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchUnreadNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_URL}/notifications?is_read=false`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setUnreadCount(response.data.pagination.total);
    } catch (error) {
      console.error("Lỗi khi lấy số thông báo chưa đọc:", error);
    }
  };

  const isActive = (screenName) => {
    return route.name === screenName;
  };

  const menuItems = [
    { name: "Home", label: "Trang chủ", icon: require("../assets/home.png") },
    { name: "Matches", label: "Trận đấu", icon: require("../assets/matches.png") },
    { name: "Stats", label: "Thống kê", icon: require("../assets/stats.png") },
    { name: "Account", label: "Tài khoản", icon: require("../assets/account.png") },
  ];

  return (
    <View style={styles.footer}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={[styles.button, (isActive(item.name) || route.name === item.name) && styles.activeButton]}
          onPress={() => navigation.navigate(item.name)}
        >
          <Image 
            source={item.icon} 
            style={[
              styles.icon, 
              (isActive(item.name) || route.name === item.name) && styles.activeIcon
            ]} 
          />
          <Text style={[
            styles.text, 
            (isActive(item.name) || route.name === item.name) && styles.activeText
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => navigation.navigate("Notifications")}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={isActive("Notifications") ? "notifications" : "notifications-outline"}
            size={24}
            color={isActive("Notifications") ? "#E53935" : "#fff"}
          />
          {unreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.footerText,
            isActive("Notifications") && styles.activeFooterText,
          ]}
        >
          Thông báo
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#111",
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    bottom: 0,
    zIndex: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  button: {
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: "#2A2A2A",
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: "#777",
    marginBottom: 4,
  },
  activeIcon: {
    tintColor: "#fff",
  },
  text: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  activeText: {
    color: "#fff",
    fontWeight: "500",
  },
  footerItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  activeFooterText: {
    color: "#E53935",
  },
  iconContainer: {
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Footer;

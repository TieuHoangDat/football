import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

// Lấy API URL từ app.json
const API_URL = Constants.expoConfig.extra.apiUrl;

// Bảng màu
const COLORS = {
  primary: "#EEEEEE",    
  background: "#111",    
  text: "#EEEEEE",       
  textSecondary: "#777", 
};

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
    { 
      name: "Notifications", 
      label: "Thông báo", 
      iconType: "ionicon",
      iconName: (active) => active ? "notifications" : "notifications-outline",
      badge: unreadCount > 0 ? unreadCount : null
    },
    { name: "Account", label: "Tài khoản", icon: require("../assets/account.png") },
  ];

  return (
    <View style={styles.footer}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={[styles.button, isActive(item.name) && styles.activeButton]}
          onPress={() => navigation.navigate(item.name)}
        >
          {item.iconType === "ionicon" ? (
            <View style={styles.iconContainer}>
              <Ionicons
                name={item.iconName(isActive(item.name))}
                size={24}
                color={isActive(item.name) ? COLORS.primary : COLORS.textSecondary}
              />
              {item.badge && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Image 
              source={item.icon} 
              style={[
                styles.icon, 
                isActive(item.name) && styles.activeIcon
              ]} 
            />
          )}
          <Text style={[
            styles.text, 
            isActive(item.name) && styles.activeText
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
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
    paddingHorizontal: 5,
  },
  button: {
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 20,
    flex: 1,
    maxWidth: 75,
  },
  activeButton: {
    backgroundColor: "#2A2A2A",
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: "#777",
    marginBottom: 4,
  },
  activeIcon: {
    tintColor: "#fff",
  },
  text: {
    fontSize: 9.5,
    color: "#777",
    marginTop: 2,
    textAlign: "center",
  },
  activeText: {
    color: "#fff",
    fontWeight: "500",
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#3498db',
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

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const Footer = () => {
  const navigation = useNavigation();
  const route = useRoute();

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
          style={[styles.button, route.name === item.name && styles.activeButton]}
          onPress={() => navigation.navigate(item.name)}
        >
          <Image source={item.icon} style={styles.icon} />
          <Text style={styles.text}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#000",
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  button: {
    alignItems: "center",
    paddingVertical: 5,
  },
  activeButton: {
    backgroundColor: "#222", // Màu nền nhạt hơn khi đang chọn
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  icon: {
    width: 24,
    height: 24,
  },
  text: {
    fontSize: 12,
    color: "#fff",
    marginTop: 5,
  },
});

export default Footer;

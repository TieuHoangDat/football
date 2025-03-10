import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const Header = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>Bóng đá</Text>
      <Image source={require("../assets/search-normal.png")} style={styles.icon} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#000", // Nền đen
    padding: 15,
    flexDirection: "row", // Hiển thị ngang
    alignItems: "center", // Canh giữa theo chiều dọc
    justifyContent: "space-between", // Chia hai bên
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff", // Chữ trắng
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: "#fff", // Đổi màu icon thành trắng (nếu là PNG hoặc SVG không màu)
  },
});

export default Header;

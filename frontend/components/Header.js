import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Header = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>Bóng đá</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Search")}>
        <Image source={require("../assets/search-normal.png")} style={styles.icon} />
      </TouchableOpacity>
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

import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const Header = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Bóng đá</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Search")}>
          <Image source={require("../assets/search-normal.png")} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#000",
  },
  header: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EEEEEE", 
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: "#EEEEEE",
  },
});

export default Header;

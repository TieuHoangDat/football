import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const Header = ({ title, showBackButton = false, hideSearch = false }) => {
  const navigation = useNavigation();

  // Use the provided title or default to "Bóng đá"
  const headerTitle = title || "Bóng đá";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <Text style={styles.headerText}>{headerTitle}</Text>

        <View style={styles.rightSection}>
          {!hideSearch && (
            <TouchableOpacity onPress={() => navigation.navigate("Search")}>
              <Image source={require("../assets/search-normal.png")} style={styles.icon} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#181818",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: "#EEEEEE",
  },
  backButton: {
    padding: 5,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  placeholder: {
    width: 34, // Match the width of back button for symmetry
  },
});

export default Header;

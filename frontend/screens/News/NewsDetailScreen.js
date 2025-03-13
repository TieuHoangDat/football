import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Footer from "../components/Footer";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const NewsDetailScreen = ({ route }) => {
  const { id, title, content, image, create_at } = route.params;
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Image source={require("../assets/arrow-left.png")} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết tin tức</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Comments", { id, title, content, image, create_at })}>
          <Image source={require("../assets/message.png")} style={styles.icon} />
        </TouchableOpacity>

      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: `${API_URL}/uploads/news/${image}` }} style={styles.image} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.time}>Ngày đăng: {new Date(create_at).toLocaleDateString()}</Text>
        <Text style={styles.body}>
          {content}
        </Text>
      </ScrollView>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    padding: 20,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  time: {
    fontSize: 14,
    color: "#bbb",
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
    color: "#ddd",
    lineHeight: 24,
  },
});

export default NewsDetailScreen;

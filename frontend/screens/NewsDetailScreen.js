import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import Header from "../components/Header";
import Footer from "../components/Footer";


const NewsDetailScreen = ({ route }) => {
  const { title, image, create_at } = route.params;

  return (
    <View style={styles.container}>
      <Header title="Chi tiết tin tức" />
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: `http://localhost:5001/uploads/news/${image}` }} style={styles.image} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.time}>Ngày đăng: {new Date(create_at).toLocaleDateString()}</Text>
        <Text style={styles.body}>
          Đây là nội dung chi tiết của bài báo. Nội dung có thể được tải từ API nếu cần thiết.
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

import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const NewsItem = ({ news }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("NewsDetail", {
      id: news.id,
      title: news.title,
      content: news.content,
      image: news.image,
      create_at: news.create_at,
      comment_count: news.comment_count,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Image source={{ uri: `${API_URL}/uploads/news/${news.image}` }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{news.title}</Text>
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.description}>
          {news.content}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", padding: 10, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "#444" },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  description: { fontSize: 14, color: "#ccc" },
});

export default NewsItem;

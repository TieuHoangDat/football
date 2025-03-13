import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import NewsItem from "../../components/NewsItem";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.replace("Login");
      } else {
        setUser({ email: "example@email.com" }); // Giả định lấy user từ token
      }
    };

    const fetchNews = async () => {
      try {
        const response = await fetch(`${API_URL}/news`);
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error("Lỗi khi lấy tin tức:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
    fetchNews();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Trang chủ" />
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Tin tức bóng đá mới nhất</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <FlatList
            data={news}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <NewsItem id={item.id} content={item.content} title={item.title} create_at={item.create_at} image={item.image} isFirst={index === 0} />
            )}
          />

        )}
      </View>
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
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
});

export default HomeScreen;

import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const TeamItem = ({ team }) => {
  const navigation = useNavigation();
  const [isFollowing, setIsFollowing] = useState(false);
  const [email, setEmail] = useState("");

  // Lấy email từ AsyncStorage
  useEffect(() => {
    const fetchEmail = async () => {
      const storedEmail = await AsyncStorage.getItem("email");
      if (storedEmail) {
        setEmail(storedEmail);
        checkFollowingStatus(storedEmail);
      }
    };
    fetchEmail();
  }, []);

  // Kiểm tra trạng thái theo dõi
  const checkFollowingStatus = async (userEmail) => {
    try {
      const response = await fetch(`${API_URL}/teams/follow/${team.id}/${userEmail}`);
      const data = await response.json();
      setIsFollowing(data.is_following);
    } catch (error) {
      console.error("Lỗi khi kiểm tra theo dõi:", error);
    }
  };

  // Toggle trạng thái theo dõi
  const toggleFollow = async () => {
    try {
      const response = await fetch(`${API_URL}/teams/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, team_id: team.id }),
      });

      const data = await response.json();
      if (data.message) {
        setIsFollowing(data.is_following);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật theo dõi:", error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("TeamDetails", { team })}
    >
      <Image
        source={{ uri: `${API_URL}/uploads/teams/${team.image_url}` }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{team.name}</Text>
        <Text style={styles.itemSub}>{team.country}</Text>
      </View>

      {/* Nút yêu thích */}
      <TouchableOpacity onPress={toggleFollow} style={styles.heartContainer}>
        <Image
          source={
            isFollowing
              ? require("../assets/like/heart-full.png")
              : require("../assets/like/heart.png")
          }
          style={styles.heartIcon}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    justifyContent: "space-between", // Đẩy icon qua phải
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  itemSub: {
    color: "#bbb",
  },
  heartContainer: {
    padding: 10,
  },
  heartIcon: {
    width: 24,
    height: 24,
  },
});

export default TeamItem;

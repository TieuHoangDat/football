import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const PlayerItem = ({ player }) => {
  const navigation = useNavigation();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const email = await AsyncStorage.getItem("email");
        if (!email) return;

        const response = await fetch(`${API_URL}/players/follow/${player.id}/${email}`);
        const data = await response.json();
        if (response.ok) {
          setIsFollowing(data.is_following);
          setFollowCount(data.follow_count);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái theo dõi:", error);
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [player.id]);

  const handleFollowToggle = async () => {
    try {
      const email = await AsyncStorage.getItem("email");
      if (!email) return;

      const response = await fetch(`${API_URL}/players/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, player_id: player.id }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsFollowing(data.is_following);
        setFollowCount(prev => (data.is_following ? prev + 1 : prev - 1));
      }
    } catch (error) {
      console.error("Lỗi khi theo dõi/hủy theo dõi:", error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("PlayerDetails", { player })}
    >
      <Image source={{ uri: `${API_URL}/uploads/players/${player.image_url}` }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{`${player.first_name} ${player.last_name}`}</Text>
        <Text style={styles.itemSub}>{player.position}</Text>
        <Text style={styles.followCount}>{followCount} người theo dõi</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#fff" style={styles.heartIcon} />
      ) : (
        <TouchableOpacity onPress={handleFollowToggle}>
          <Image
            source={isFollowing ? require("../assets/like/heart-full.png") : require("../assets/like/heart.png")}
            style={styles.heartIcon}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: "#444" },
  itemImage: { width: 50, height: 50, borderRadius: 25 },
  itemInfo: { flex: 1, marginLeft: 10 },
  itemName: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  itemSub: { color: "#bbb" },
  followCount: { color: "#bbb", fontSize: 12 },
  heartIcon: { width: 24, height: 24, marginRight: 10 },
});

export default PlayerItem;

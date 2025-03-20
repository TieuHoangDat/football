import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const PlayerInfo = ({ player, teams }) => {
  const [followCount, setFollowCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const email = await AsyncStorage.getItem("email");
        if (!email) return;

        const response = await fetch(`${API_URL}/players/follow/${player.id}/${email}`);
        const data = await response.json();
        
        if (response.ok) {
          setFollowCount(data.follow_count);
          setIsFollowing(data.is_following);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu theo dõi:", error);
      }
    };

    fetchFollowData();
  }, [player.id]);

  const toggleFollow = async () => {
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
      console.error("Lỗi khi cập nhật trạng thái theo dõi:", error);
    }
  };

  return (
    <View style={styles.playerCard}>
      <View style={styles.playerInfo}>
        <Text style={styles.firstName}>{player.first_name}</Text>
        <Text style={styles.lastName}>{player.last_name}</Text>

        <View style={styles.teamInfo}>
          <Image 
            source={{ uri: `${API_URL}/uploads/teams/${teams.length > 0 ? teams[0].image_url : player.team_logo}` }} 
            style={styles.teamLogo} 
          />
          <Text style={styles.teamName}>
            {teams.length > 0 ? teams[0].name : player.team_name}
          </Text>
        </View>

        <View style={styles.followerContainer}>
          <TouchableOpacity onPress={toggleFollow}>
            <Image 
              source={isFollowing ? require("../assets/like/heart-full.png") : require("../assets/like/heart.png")}
              style={styles.heartIcon} 
            />
          </TouchableOpacity>
          <View style={styles.column1}>
            <Text style={styles.label}>{followCount.toLocaleString()}</Text>
            <Text style={styles.label}>Người theo dõi</Text>
          </View>
        </View>
      </View>

      <Image source={{ uri: `${API_URL}/uploads/players/${player.image_url}` }} style={styles.playerImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  playerCard: { flexDirection: "row", alignItems: "center", padding: 20, backgroundColor: "#1A1A1A" },
  playerInfo: { flex: 1 },
  playerImage: { width: 120, height: 120, borderRadius: 60, marginLeft: "auto" },
  firstName: { fontSize: 28, color: "#fff" },
  lastName: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  teamInfo: { flexDirection: "row", alignItems: "center", padding: 8, borderRadius: 8, marginVertical: 20 },
  teamLogo: { width: 40, height: 40, marginRight: 6 },
  teamName: { fontSize: 16, color: "#fff" },
  followerContainer: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  heartIcon: { width: 20, height: 20, tintColor: "#fff", marginRight: 5 },
  column1: { marginLeft: 10 },
  label: { color: "#bbb", fontSize: 20 },
});

export default PlayerInfo;

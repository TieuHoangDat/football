import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const NewsItem = ({ id, title, image, create_at, isFirst }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.navigate("NewsDetail", { id, title, image, create_at })}>
      <View style={[styles.container, isFirst && styles.firstContainer]}>
        {isFirst ? (
          <>
            <Image source={{ uri: `http://localhost:5001/uploads/news/${image}` }} style={styles.firstImage} />
            <Text style={styles.firstTitle}>{title}</Text>
            <View style={styles.row}>
              <Text style={styles.time}>{new Date(create_at).toLocaleDateString()}</Text>
              <Image source={require("../assets/message.png")} style={styles.icon} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.row}>
              <Text style={styles.title}>{title}</Text>
              <Image source={{ uri: `http://localhost:5001/uploads/news/${image}` }} style={styles.image} />
            </View>
            <View style={styles.row}>
              <Text style={styles.time}>{new Date(create_at).toLocaleDateString()}</Text>
              <Image source={require("../assets/message.png")} style={styles.icon} />
            </View>
          </>
        )}

        <View style={styles.divider} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  firstContainer: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 10,
  },
  firstTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  image: {
    width: 80,
    height: 60,
    borderRadius: 10,
  },
  firstImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  time: {
    fontSize: 12,
    color: "#ccc",
  },
  icon: {
    width: 20,
    height: 20,
  },
});

export default NewsItem;

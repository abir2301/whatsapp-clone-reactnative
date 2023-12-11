//import liraries
import React, { Component, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GlobalContext from "../context/Context";
import { useNavigation } from "@react-navigation/native";
const ContactFloatingIcons = () => {
  const navigation = useNavigation();
  const {
    theme: { colors },
  } = useContext(GlobalContext);
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("contacts");
      }}
      style={[styles.container, { backgroundColor: colors.secondary }]}
    >
      <MaterialCommunityIcons
        name="android-messages"
        size={30}
        color={"white"}
        style={{ transform: [{ scaleX: -1 }] }}
      />
    </TouchableOpacity>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
});

//make this component available to the app
export default ContactFloatingIcons;

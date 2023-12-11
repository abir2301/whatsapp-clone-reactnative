//import liraries
import React, { Component } from "react";
import { View, Text, StyleSheet, Image } from "react-native";

// create a component
const Avatar = ({ size, user }) => {
  return (
    <Image
      style={{ width: size, height: size, borderRadius: size }}
      source={
        user.photoURL
          ? { uri: user.photoURL }
          : require("../../assets/icon-square.png")
      }
    />
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2c3e50",
  },
});

//make this component available to the app
export default Avatar;

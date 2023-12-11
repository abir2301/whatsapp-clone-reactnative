//import liraries
import React, { Component, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { pickImage } from "../utils/utils";

// create a component
const Photo = () => {
  const navigation = useNavigation();
  const [cancelled, setCancelled] = useState(false);
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const result = await pickImage();
      navigation.navigate("contacts", { image: result.assets[0] });
      if (result.canceled) {
        setCancelled(true);
        setTimeout(() => navigation.navigate("chats"), 100);
      }
    });
    return () => unsubscribe();
  }, [navigation, cancelled]);
  return <View />;
};

//make this component available to the app
export default Photo;

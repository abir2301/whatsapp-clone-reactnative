//import liraries
import React, { Component, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import Avatar from "./Avatar";
import Globalcontext from "../context/Context";
import { useRoute } from "@react-navigation/native";

// create a component
const ChatHeader = () => {
  const route = useRoute();
  const {
    theme: { colors },
  } = useContext(GlobalContext);
  return (
    <View style={{ flexDirection: "row" }}>
      <View>
        <Avatar size={40} user={route.params.user} />
      </View>
      <View
        style={{
          marginLeft: 15,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: colors.white, fontSize: 18 }}>
          {route.params.user.contactName || route.params.user.displayName}
        </Text>
      </View>
    </View>
  );
};

//make this component available to the app
export default ChatHeader;

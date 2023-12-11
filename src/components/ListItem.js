//import liraries
import { useNavigation } from "@react-navigation/native";
import React, { Component, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import GlobalContext from "../context/Context";
import { Col, Row, Grid } from "react-native-easy-grid";
import Avatar from "./Avatar";
// create a component
const ListItem = ({ type, style, description, image, time, room, user }) => {
  const navigation = useNavigation();
  const {
    theme: { colors },
  } = useContext(GlobalContext);
  return (
    <TouchableOpacity
      style={{ height: 80, ...style }}
      onPress={() => navigation.navigate("chat", { user, room, image })}
    >
      <Grid style={{ maxHeight: 80 }}>
        <Col
          style={{
            maxWidth: 80,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Avatar user={user} size={type == "contacts" ? 40 : 65} />
        </Col>
        <Col style={{ marginLeft: 10 }}>
          <Row style={{ alignItems: "center" }}>
            <Col>
              <Text
                style={{ fontWeight: "bold", color: colors.text, fontSize: 16 }}
              >
                {user.contactName || user.displayName}
              </Text>
            </Col>

            {time && (
              <Col style={{ alignItems: "flex-end" }}>
                <Text style={{ color: colors.secondaryText, fontSize: 11 }}>
                  {new Date(time.seconds * 1000).toLocaleDateString()}
                </Text>
              </Col>
            )}
          </Row>
          {description && (
            <Row style={{ marginTop: -5 }}>
              <Text style={{ color: colors.secondaryText, fontSize: 13 }}>
                {description}
              </Text>
            </Row>
          )}
        </Col>
      </Grid>
    </TouchableOpacity>
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
export default ListItem;

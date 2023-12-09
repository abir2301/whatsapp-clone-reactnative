//import liraries
import React, { Component, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";
import Context from "../context/Context";
import { signIn, signUp } from "../../firebase";
// create a component
const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("SignUp");
  const handlePress = async () => {
    if (mode === "SignUp") {
      await signUp(email, password);
    }
    if (mode === "SignIn") {
      await signIn(email, password);
    }
  };
  const {
    theme: { colors },
  } = useContext(Context);
  return (
    <View
      style={{
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <Text
        style={{ color: colors.foreground, fontSize: 24, marginBottom: 20 }}
      >
        Welcome to whatsapp
      </Text>
      <Image
        source={require("../../assets/welcome-img.png")}
        resizeMode="cover"
        style={{ width: 180, height: 180 }}
      ></Image>
      <View style={{ marginTop: 50 }}>
        <TextInput
          placeholder="email"
          value={email}
          onChangeText={setEmail}
          style={{
            borderBottomColor: colors.primary,
            borderBottomWidth: 2,
            width: 200,
          }}
        ></TextInput>
        <TextInput
          placeholder="password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          style={{
            borderBottomColor: colors.primary,
            borderBottomWidth: 2,
            width: 200,
          }}
        ></TextInput>

        <View style={{ marginHorizontal: 5, marginVertical: 20 }}>
          <Button
            onPress={handlePress}
            title={mode == "SignUp" ? "Sign up" : "login"}
            disabled={!password || !email}
            color={colors.secondary}
          ></Button>
        </View>
        <TouchableOpacity
          style={{ marginTop: 15 }}
          onPress={() =>
            mode == "SignUp" ? setMode("SignIn") : setMode("SignUp")
          }
        >
          <Text style={{ color: colors.secondaryText }}>
            {mode == "SignUp"
              ? "Already have an account? Sign In"
              : "Don't have an account ? sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

//make this component available to the app
export default SignIn;

import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, LogBox } from "react-native";
import { useAssets } from "expo-asset";
import React, { useState, useEffect, useContext } from "react";
import { auth } from "./firebase";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Context from "./src/context/Context";
LogBox.ignoreLogs([
  "Setting a timer",
  "AsyncStorage has been extracted from react-native core and will be removed in a future release.",
]);
const Stack = createStackNavigator();
import { onAuthStateChanged } from "firebase/auth";
import SignIn from "./src/screens/SignIn";
import ContextWrapper from "./src/context/ContextWrapper";
import Profile from "./src/screens/Profile";
import Home from "./src/screens/Home";
export default Main = () => {
  // load assets
  const [assets] = useAssets(
    require("./assets/icon-square.png"),
    require("./assets/chatbg.png"),
    require("./assets/user-icon.png"),
    require("./assets/welcome-img.png")
  );
  if (!assets) {
    return <Text>Loading ..</Text>;
  }
  return (
    <ContextWrapper>
      <App></App>
    </ContextWrapper>
  );
};

function App() {
  const {
    theme: { colors },
  } = useContext(Context);
  const [currUser, setCurrUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (user) {
        setCurrUser(user);
      }
    });
    return () => unsubscribe();
  }, []);
  if (loading) {
    return <Text>loading</Text>;
  }
  return (
    <NavigationContainer>
      {!currUser ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" component={SignIn}></Stack.Screen>
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.foreground,
              shadowOpacity: 0,
              elevation: 0,
            },
            headerTintColor: colors.white,
          }}
        >
          {!currUser.displayName && (
            <Stack.Screen
              name="profile"
              component={Profile}
              options={{ headerShown: false }}
            />
          )}
          <Stack.Screen
            name="home"
            component={Home}
            options={{ title: "WhatsApp " }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

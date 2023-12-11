//import liraries
import React, { Component, useContext, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { auth, db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import ContactFloatingIcons from "../components/contactsFloadtingIcon";
import GlobalContext from "../context/Context";
import ListItem from "../components/ListItem";
import Contacts from "./Contacts";
import useContacts from "../hooks/useHooks";
// create a component
const Chats = () => {
  const { currentUser } = auth;
  const { rooms, setRooms, setUnfilteredRooms } = useContext(GlobalContext);
  const contacts = useContacts();
  const chatsQuery = query(
    collection(db, "rooms"),
    where("participantsArray", "array-contains", currentUser.email)
  );
  useEffect(() => {
    const unsubscribe = onSnapshot(chatsQuery, (querySnapshot) => {
      const parsedChats = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        userB: doc
          .data()
          .participants.find((p) => p.email !== currentUser.email),
      }));
      setUnfilteredRooms(parsedChats);
      setRooms(parsedChats.filter((doc) => doc.lastMessage));
    });
    return () => unsubscribe();
  }, []);
  const getUserB = (user, contacts) => {
    const userContact = contacts.find((c) => c.email === user.email);
    if (userContact && userContact.contactName) {
      return { ...user, contactName: userContact.contactName };
    }
    return user;
  };
  return (
    <View style={styles.container}>
      {rooms.map((room) => (
        <ListItem
          type={"chat"}
          description={room.lastMessage.text}
          key={room.id}
          room={room}
          time={room.lastMessage.createdAt}
          user={getUserB(room.userB, contacts)}
        />
      ))}
      <ContactFloatingIcons />
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    paddingRight: 10,
  },
});

//make this component available to the app
export default Chats;

//import liraries
import React, { Component, useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import useContacts from "../hooks/useHooks";
import { useRoute } from "@react-navigation/native";
import { collection, onSnapshot, query, where } from "@firebase/firestore";
import ListItem from "../components/ListItem";
import GlobalContext from "../context/Context";
import { db } from "../../firebase";

// create a component
const Contacts = () => {
  const contacts = useContacts();
  const route = useRoute();
  const image = route.params && route.params.image;
  console.log(route);
  return (
    <FlatList
      data={contacts}
      style={{ flex: 1, padding: 10 }}
      keyExtractor={(_, i) => i}
      renderItem={({ item }) => <ContactPreview contact={item} image={image} />}
    />
  );
};

function ContactPreview({ contact, image }) {
  const { rooms } = useContext(GlobalContext);
  const [user, setUser] = useState(contact);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("email", "==", contact.email)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.docs.length) {
        const userDoc = snapshot.docs[0].data();
        setUser((prevUser) => ({ ...prevUser, userDoc }));
      }
    });
    return () => unsubscribe();
  }, []);
  return (
    <ListItem
      style={{ marginTop: 7 }}
      type="contacts"
      user={user}
      image={image}
      room={rooms.find((room) =>
        room.participantsArray.includes(contact.email)
      )}
    />
  );
}

//make this component available to the app
export default Contacts;

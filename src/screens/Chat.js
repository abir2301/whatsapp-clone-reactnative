//import liraries
import React, {
  Component,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";
import GlobalContext from "../context/Context";
import { auth, db } from "../../firebase";
import { useRoute } from "@react-navigation/native";
import "react-native-get-random-values";
import { nanoid } from "nanoid";
import {
  Actions,
  Bubble,
  GiftedChat,
  InputToolbar,
} from "react-native-gifted-chat";
import ImageView from "react-native-image-viewing";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "@firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { pickImage, uploadImage } from "../utils/utils";
const randomId = nanoid();
const Chat = () => {
  const {
    theme: { colors },
  } = useContext(GlobalContext);
  const { currentUser } = auth;
  const [roomHash, setRoomHash] = useState("");
  const [messages, setMessages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageView, setSeletedImageView] = useState("");
  const route = useRoute();
  const room = route.params.room;
  const selectedImage = route.params.image;
  const userB = route.params.user;

  const senderUser = currentUser.photoURL
    ? {
        name: currentUser.displayName,
        _id: currentUser.uid,
        avatar: currentUser.photoURL,
      }
    : { name: currentUser.displayName, _id: currentUser.uid };

  const roomId = room ? room.id : randomId;
  const roomRef = doc(db, "rooms", roomId);
  const roomMessagesRef = collection(db, "rooms", roomId, "messages");
  useEffect(() => {
    (async () => {
      if (!room) {
        const currUserData = {
          displayName: currentUser.displayName,
          email: currentUser.email,
        };
        if (currentUser.photoURL) {
          currUserData.photoURL = currentUser.photoURL;
        }
        const userBData = {
          displayName: userB.contactName || userB.displayName || "",
          email: userB.email,
        };
        if (userB.photoURL) {
          userBData.photoURL = userB.photoURL;
        }
        const roomData = {
          participants: [currUserData, userBData],
          participantsArray: [currentUser.email, userB.email],
        };
        try {
          await setDoc(roomRef, roomData);
        } catch (error) {
          console.log(error);
        }
      }
      const emailHash = `${currentUser.email}:${userB.email}`;
      setRoomHash(emailHash);
      if (selectedImage && selectedImage.uri) {
        console.log("selected ");
        await sendImage(selectedImage.uri, emailHash);
      }
    })();
  }, []);
  useEffect(() => {
    const unsubscribe = onSnapshot(roomMessagesRef, (querySnapshot) => {
      const messagesFirestore = querySnapshot
        .docChanges()
        .filter(({ type }) => type === "added")
        .map(({ doc }) => {
          const message = doc.data();
          return { ...message, createdAt: message.createdAt.toDate() };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      appendMessages(messagesFirestore);
    });
    return () => unsubscribe();
  }, []);

  const appendMessages = useCallback(
    (messages) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );
      console.log("messages ");
      console.log(messages);
    },
    [messages]
  );
  const onSend = async (messages = []) => {
    const writes = messages.map((m) => addDoc(roomMessagesRef, m));
    const lastMessage = messages[messages.length - 1];
    writes.push(updateDoc(roomRef, { lastMessage }));
    await Promise.all(writes);
  };
  async function sendImage(uri, roomPath) {
    const { url, fileName } = await uploadImage(
      uri,
      `images/rooms/${roomPath || roomHash}`
    );
    const message = {
      _id: fileName,
      text: "",
      createdAt: new Date(),
      user: senderUser,
      image: url,
    };
    const lastMessage = { ...message, text: "Image" };
    await Promise.all([
      addDoc(roomMessagesRef, message),
      updateDoc(roomRef, { lastMessage }),
    ]);
  }
  async function handlePhotoPicker() {
    const result = await pickImage();
    if (!result.canceled) {
      await sendImage(result.assets[0].uri);
    }
  }

  return (
    <ImageBackground
      style={styles.container}
      source={require("../../assets/chatbg.png")}
    >
      <GiftedChat
        messages={messages}
        user={senderUser}
        renderAvatar={null}
        onSend={onSend}
        renderActions={(props) => (
          <Actions
            {...props}
            containerStyle={{
              position: "absolute",
              right: 50,
              bottom: 5,
              zIndex: 9999,
            }}
            onPressActionButton={handlePhotoPicker}
            icon={() => (
              <Ionicons name="camera" size={30} color={colors.iconGray} />
            )}
          />
        )}
        timeTextStyle={{ right: { color: colors.iconGray } }}
        renderSend={(props) => {
          const { text, messageIdGenerator, user, onSend } = props;
          return (
            <TouchableOpacity
              style={{
                height: 40,
                width: 40,
                borderRadius: 40,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 5,
              }}
              onPress={() => {
                if (text && onSend) {
                  onSend(
                    {
                      text: text.trim(),
                      user,
                      _id: messageIdGenerator,
                    },
                    true
                  );
                }
              }}
            >
              <Ionicons name="send" size={20} color={colors.white} />
            </TouchableOpacity>
          );
        }}
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            containerStyle={{
              marginLeft: 10,
              marginRight: 10,
              marginBottom: 2,
              borderRadius: 20,
              paddingTop: 5,
            }}
          />
        )}
        renderBubble={(props) => (
          <Bubble
            {...props}
            textStyle={{ right: { color: colors.text } }}
            wrapperStyle={{
              left: {
                backgroundColor: colors.white,
              },
              right: {
                backgroundColor: colors.tertiary,
              },
            }}
          />
        )}
        renderMessageImage={(props) => {
          return (
            <View style={{ borderRadius: 15, padding: 2 }}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(true);
                  setSeletedImageView(props.currentMessage.image);
                }}
              >
                <Image
                  resizeMode="contain"
                  style={{
                    width: 200,
                    height: 200,
                    padding: 6,
                    borderRadius: 15,
                    resizeMode: "cover",
                  }}
                  source={{ uri: props.currentMessage.image }}
                />
                {selectedImageView ? (
                  <ImageView
                    imageIndex={0}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                    images={[{ uri: selectedImageView }]}
                  />
                ) : null}
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </ImageBackground>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    resizeMode: "cover",
    flex: 1,
  },
});

//make this component available to the app
export default Chat;

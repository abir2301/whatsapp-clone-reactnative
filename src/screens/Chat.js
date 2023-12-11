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
  TextInput,
  FlatList,
  Modal,
} from "react-native";
import GlobalContext from "../context/Context";
import { auth, db } from "../../firebase";
import { useRoute } from "@react-navigation/native";
import "react-native-get-random-values";
import { nanoid } from "nanoid";
import * as DocumentPicker from "expo-document-picker";

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
import { pickImage, uploadImage, uploadFile } from "../utils/utils";
import * as Linking from "expo-linking";

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
  const [inputText, setInputText] = useState("");

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
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      console.log("messagesFirestore");
      console.log(messagesFirestore);
      appendMessages(messagesFirestore);
    });
    return () => unsubscribe();
  }, []);

  const appendMessages = useCallback(
    (messages) => {
      setMessages((previousMessages) => [...messages, ...previousMessages]);
    },
    [messages]
  );
  const onSend = async (messages = []) => {
    // console.log("on send ");

    if (inputText.trim() === "") return;

    const newMessage = {
      _id: nanoid(),
      text: inputText.trim(),
      createdAt: new Date(),
      user: {
        _id: currentUser.uid,
        name: currentUser.displayName,
        avatar: currentUser.photoURL,
      },
    };

    await addDoc(roomMessagesRef, newMessage);
    const lastMessage = newMessage;
    await updateDoc(roomRef, { lastMessage });
    setInputText("");
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

  const handleImagePress = (image) => {
    setSeletedImageView(image);
    setModalVisible(true);
  };
  const handleFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
      });
      console.log(result);
      if (!result.canceled) {
        const { url, fileName } = await uploadFile(
          result.assets[0].uri,
          `files/rooms/${roomId}`,
          result.assets[0].mimeType
        );
        console.log("uppload");
        console.log(url);
        const newFileMessage = {
          _id: fileName,
          createdAt: new Date(),
          user: {
            _id: currentUser.uid,
            name: currentUser.displayName,
            avatar: currentUser.photoURL,
          },
          file: {
            uri: url,
            name: result.assets[0].name,
            type: result.assets[0].mimeType,
          },
        };
        const lastMessage = { ...newFileMessage, text: "File" };
        // await addDoc(roomMessagesRef, newFileMessage);
        // await updateDoc(roomRef, { lastMessage });
        await Promise.all([
          addDoc(roomMessagesRef, newFileMessage),
          updateDoc(roomRef, { lastMessage }),
        ]);
      }
    } catch (error) {
      console.error("Error picking file:", error);
    }
  };
  const handleFilePress = (file) => {
    const { uri, name, type } = file;

    if (Linking.canOpenURL(uri)) {
      Linking.openURL(uri);
    } else {
      console.error(`Cannot handle file type: ${type}`);
    }
  };

  return (
    <ImageBackground
      style={styles.container}
      source={require("../../assets/chatbg.png")}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={
              item.user.name === senderUser.name
                ? styles.sender
                : styles.receiver
            }
          >
            <Text>{item.text}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
            {item.image && (
              <TouchableOpacity onPress={() => handleImagePress(item.image)}>
                <Image
                  style={styles.messageImage}
                  source={{ uri: item.image }}
                />
              </TouchableOpacity>
            )}
            {item.file && (
              <TouchableOpacity onPress={() => handleFilePress(item.file)}>
                <Text style={styles.fileText}>{item.file.name}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handlePhotoPicker}
        >
          <Ionicons name="camera" size={30} color={colors.iconGray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fileButton} onPress={handleFilePicker}>
          <Ionicons name="attach" size={30} color={colors.iconGray} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={(text) => setInputText(text)}
        />
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
          onPress={onSend}
        >
          <Ionicons name="send" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
      {selectedImageView && (
        <Modal visible={modalVisible} transparent={true}>
          <View style={styles.modalContainer}>
            <Image
              style={styles.modalImage}
              source={{ uri: selectedImageView }}
            />
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      {/* <GiftedChat
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
      /> */}
    </ImageBackground>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    resizeMode: "cover",
    flex: 1,
  },
  sender: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C5",
    padding: 8,
    margin: 8,
    borderRadius: 8,
    maxWidth: "80%",
  },
  receiver: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5E5",
    padding: 8,
    margin: 8,
    borderRadius: 8,
    maxWidth: "80%",
  },
  timestamp: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },

  sendButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalImage: {
    width: 400,
    height: 400,
    borderRadius: 10,
  },
  closeModalButton: {
    marginTop: 16,
    padding: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
  },
  closeModalText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  cameraButton: {
    margin: 2,
  },
});

//make this component available to the app
export default Chat;

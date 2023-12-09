//import liraries
import React, { Component, useContext } from 'react';
import { View, Text, StyleSheet , Image, TextInput, Button } from 'react-native';
import Context from '../context/Context';

// create a component
const SignIn = () => {
    const {theme :{colors},}=useContext(Context)
    return (
        <View style={{
            backgroundColor: colors.white,
            justifyContent: "center",
            alignItems:"center",
            flex:1
        }}>
            <Text style={{ color: colors.foreground, fontSize: 24, marginBottom: 20 }}>Welcome to whatsapp</Text>
            <Image source={require('../../assets/welcome-img.png')} resizeMode="cover" style={{ width: 180, height: 180 }}></Image>
            <View style={{ marginTop: 50 }}>
                <TextInput placeholder='email' style={{ borderBottomColor: colors.primary, borderBottomWidth: 2, width: 200 }}></TextInput>
                <TextInput placeholder='password'  secureTextEntry={true} style={{borderBottomColor:colors.primary, borderBottomWidth:2, width:200}}></TextInput>

           
            <View style={{marginHorizontal:5 , marginVertical:20}}>
                <Button  title="Sign up"color={colors.secondary}></Button>
                </View>
                 </View>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      
    },
});

//make this component available to the app
export default SignIn;

import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import icons from '@/constants/icons';
import { Link } from 'expo-router';
import Constants from "expo-constants";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useNavigation } from 'expo-router';
import Toast, { BaseToast } from 'react-native-toast-message';
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();
const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [isUser, setIsUser] = useState(true);
  const navigation = useNavigation();
  const ANDROID_CLIENT_ID = Constants.expoConfig?.extra?.ANDROID_CLIENT_ID || '';
  const WEB_CLIENT_ID = Constants.expoConfig?.extra?.WEB_CLIENT_ID || '';
  const IOS_CLIENT_ID = Constants.expoConfig?.extra?.IOS_CLIENT_ID || '';

  const config = {
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
  };
  const [request, response, promptAsync] = Google.useAuthRequest(config);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response]);

  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: "green" }}
        text1Style={{
          fontSize: 16,
          fontWeight: "bold",
        }}
        text2Style={{
          fontSize: 14,
        }}
      />
    ),
    error: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: "red" }}
        text1Style={{
          fontSize: 16,
          fontWeight: "bold",
        }}
        text2Style={{
          fontSize: 14,
        }}
      />
    ),
  };

  const signInWithGoogle = async () => {
    try {
      // Attempt to retrieve user information from AsyncStorage
      const userJSON = await AsyncStorage.getItem("user");

      if (userJSON) {
        // If user information is found in AsyncStorage, parse it and set it in the state
        setUserInfo(JSON.parse(userJSON));
      } else if (response?.type === "success") {
        // If no user information is found and the response type is "success" (assuming response is defined),
        // call getUserInfo with the access token from the response
        getUserInfo(response.authentication.accessToken);
      }
    } catch (error) {
      console.error("Error retrieving user data from AsyncStorage:", error);
    }
  };
  useEffect(() => {
    signInWithGoogle();
  }, [response]);

  const handleGoogleSignIn = async (idToken) => {
    try {
      const response = await fetch('https://investorlands.com/api/googleRegister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: idToken,
          user_type: isUser ? 'user' : 'dealer',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Toast.show({ type: 'success', text1: 'Success', text2: 'You are registered successfully!' });
        navigation.navigate('Home');
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: result.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Google Registration Error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'An unexpected error occurred' });
    }
  };

  const handleRegister = async () => {
    if (email && password && username && mobile) {
      const formData = new FormData();
      formData.append('usertype', isUser ? 'user' : 'dealer');
      formData.append('fullname', username);
      formData.append('contactno', mobile);
      formData.append('email', email);
      formData.append('password', password);

      try {
        const response = await fetch('https://carzchoice.com/api/register_customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const result = await response.json();

        if (response.ok && result.success) {
          Toast.show({ type: 'success', text1: 'Success', text2: 'User registered successfully!' });
          setUsername('');
          setMobile('');
          setEmail('');
          setPassword('');

          setTimeout(() => {
            navigation.navigate('signin');
          }, 2000);
        } else {
          Toast.show({ type: 'error', text1: 'Error', text2: result.message || 'Registration failed' });
        }
      } catch (error) {
        console.error('Registration Error:', error);
        Toast.show({ type: 'error', text1: 'Error', text2: 'An unexpected error occurred' });
      }
    } else {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill in all required fields' });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <Image source={images.applogo} className="w-full h-36" resizeMode="contain" />
        <View className='pt-5'>
          <Text className='font-rubik-bold text-center'>Join Us and Explore New Opportunities</Text>
        </View>

        <View className="flex-row justify-around mt-3">
          <TouchableOpacity onPress={() => setIsUser(true)}>
            <View className={`px-10 py-2 font-rubik-bold rounded-2xl ${isUser ? 'bg-primary-300' : 'bg-white border'}`}>
              <Text className={`${isUser ? 'text-white' : 'text-black'} font-rubik-bold`} >User</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsUser(false)}>
            <View className={`px-10 py-2 rounded-2xl ${!isUser ? 'bg-primary-300' : 'bg-white border'}`}>
              <Text className={`${!isUser ? 'text-white' : 'text-black'} font-rubik-bold`}>Dealer</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="px-10">
          <Text className="text-lg font-regular text-gray-700 text-center mt-3">
            Register As {isUser ? 'User' : 'Dealer'}
          </Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="Enter Full Name" onChangeText={setUsername} />

          <View className="flex flex-row">
            <Text style={styles.label}>Mobile No.</Text>
            <Text className="text-danger text-sm align-middle ms-2">(Must be unique)</Text>
          </View>
          <TextInput style={styles.input} placeholder="Enter contact number" onChangeText={setMobile} />

          <View className="flex flex-row">
            <Text style={styles.label}>Email</Text>
            <Text className="text-danger text-sm ms-2 align-middle">(Must be unique)</Text>
          </View>

          <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />



          <TouchableOpacity
            onPress={handleRegister}
            className="bg-primary-300 rounded-2xl py-2 mt-5 items-center"
          >
            <Text className="text-lg font-rubik text-white">
              {isUser ? 'Register as User' : 'Register as Dealer'}
            </Text>
          </TouchableOpacity>

          {/* <Text style={styles.orText}>Or continue with</Text>

          <TouchableOpacity onPress={() => promptAsync()} style={styles.googleButton}>
            <View style={styles.googleContent}>
              <Image source={icons.google} style={styles.googleIcon} resizeMode="contain" />
              <Text style={styles.googleText}>Register with Google</Text>
            </View>
          </TouchableOpacity> */}
          <TouchableOpacity>

            <Link href="/signin" style={{ margin: 20, alignItems: 'center' }}>
              <Text
                style={styles.msg}
              >
                Already have an account? <Text style={styles.highlight}>Login now!</Text>
              </Text>
            </Link>
          </TouchableOpacity>
        </View>
        <Toast config={toastConfig} position="bottom" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginVertical: 5,
    fontWeight: 700
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 5,
    fontFamily: 'Rubik-Regular',
  },
  msg: {
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
    color: '#00000',
    textAlign: 'center',
  },
  highlight: { color: '#0061ff', fontWeight: 700 },
  orText: { fontSize: 14, fontFamily: 'Rubik-Regular', color: '#555', textAlign: 'center', marginTop: 30 },
  googleButton: { backgroundColor: 'lightgrey', borderRadius: 50, paddingVertical: 15, marginTop: 20, alignItems: 'center', width: '100%' },
  googleContent: { flexDirection: 'row', alignItems: 'center' },
  googleIcon: { width: 20, height: 20 },
  googleText: { fontSize: 18, fontFamily: 'Rubik-Medium', color: '#333', marginLeft: 10 },
});

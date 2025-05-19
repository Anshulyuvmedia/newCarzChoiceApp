import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import images from '@/constants/images';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import Toast, { BaseToast } from 'react-native-toast-message';

WebBrowser.maybeCompleteAuthSession();

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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
  const ANDROID_CLIENT_ID = Constants.expoConfig.extra.ANDROID_CLIENT_ID;
  const WEB_CLIENT_ID = Constants.expoConfig.extra.WEB_CLIENT_ID;
  const IOS_CLIENT_ID = Constants.expoConfig.extra.IOS_CLIENT_ID;

  const config = {
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
  };

  const [request, response, promptAsync] = Google.useAuthRequest(config);

  const emaillogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please enter both email and password.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://carzchoice.com/api/loginuser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      // console.log("API Response:", data); // Debugging

      if (response.ok && data.success) {
        if (!data.data) {
          Toast.show({ type: 'error', text1: 'Login Failed', text2: 'Invalid response from server' });
          return;
        }

        // If a token is provided, store it
        if (data.token) {
          await AsyncStorage.setItem('userToken', data.token);
        }
        if (data?.success && data?.data) {
          await AsyncStorage.setItem('userData', JSON.stringify(data.data));
          // console.log("User data stored successfully!", JSON.stringify(data.data));

        } else {
          console.error("Unexpected API response format:", data);
        }

        Toast.show({ type: 'success', text1: 'Login Successful', text2: `Welcome ${data.data.fullname}` });
        router.push('/'); // Redirect to dashboard
      } else {
        Toast.show({ type: 'error', text1: 'Login Failed', text2: data.message || 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login Error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        getUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={images.applogo} style={styles.logo} resizeMode="contain" />

        <View style={styles.formContainer}>
          <Text style={styles.title}>Let's Get You Closer To <Text style={styles.highlight}>Your Dream Car</Text></Text>
          <Text style={styles.subtitle}>Login to your account</Text>

          <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

          <TouchableOpacity onPress={emaillogin} style={styles.loginButton} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.loginButtonText}>Login</Text>}
          </TouchableOpacity>

          <Link href="/signup" style={styles.registerLink}>
            <Text style={styles.registerText}>Don't have an account? <Text style={styles.highlight}>Register now</Text></Text>
          </Link>
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999 }}>
        <Toast config={toastConfig} position="top" />
      </View>
    </View>
  );
};

export default Signin;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  scrollContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: '100%', height: '15%' },
  formContainer: { paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  title: { fontSize: 24, textAlign: 'center', fontFamily: 'Rubik-Bold', color: '#333', marginTop: 10 },
  highlight: { color: '#0061ff' },
  subtitle: { fontSize: 18, fontFamily: 'Rubik-Regular', color: '#555', textAlign: 'center', marginVertical: 15 },
  input: { height: 45, borderColor: '#ccc', borderWidth: 2, borderRadius: 50, paddingHorizontal: 10, marginBottom: 10, width: '100%' },
  loginButton: { backgroundColor: '#0061ff', borderRadius: 25, paddingVertical: 7, alignItems: 'center', marginTop: 10, width: '100%' },
  loginButtonText: { fontSize: 18, fontFamily: 'Rubik-Medium', color: 'white' },
  registerLink: { marginTop: 20, alignItems: 'center' },
  registerText: { fontSize: 16, fontFamily: 'Rubik-Regular', color: '#000', textAlign: 'center' },
});

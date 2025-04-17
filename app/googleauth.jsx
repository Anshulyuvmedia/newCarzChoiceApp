import { Button, Text, View, } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import Constants from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuth() {
  const [userInfo, setUserInfo] = useState(null);
  const ANDROID_CLIENT_ID = Constants.expoConfig.extra.ANDROID_CLIENT_ID;
  const WEB_CLIENT_ID = Constants.expoConfig.extra.WEB_CLIENT_ID;
  const IOS_CLIENT_ID = Constants.expoConfig.extra.IOS_CLIENT_ID;
  const config = {
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
  };
  const [request, response, promptAsync] = Google.useAuthRequest(config);

  const getUserInfo = async (token) => {
    //absent tokens
    if (!token) return;
    //present token
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const user = await response.json();
      //store user information  in Asyncstorage
      await AsyncStorage.setItem("user", JSON.stringify(user));
      setUserInfo(user);
    } catch (error) {
      console.error(
        "Failed to fetch user data:",
        response.status,
        response.statusText
      );
    }
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
      // Handle any errors that occur during AsyncStorage retrieval or other operations
      console.error("Error retrieving user data from AsyncStorage:", error);
    }
  };

  //add it to a useEffect with response as a dependency 
  useEffect(() => {
    signInWithGoogle();
  }, [response]);

  //log the userInfo to see user details
  // console.log(JSON.stringify(userInfo))
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="font-bold">Edit app/index.tsx to edit this screen.</Text>
      <Button title="sign in with google" onPress={() => { promptAsync() }} />
    </View>
  );
}

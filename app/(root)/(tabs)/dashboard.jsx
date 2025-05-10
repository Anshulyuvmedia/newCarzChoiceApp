import { View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import images from '@/constants/images';
import icons from '@/constants/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { settings } from '@/constants/data';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast, { BaseToast } from 'react-native-toast-message';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [image, setImage] = useState(images.avatar);
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

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;

      if (!parsedUserData || typeof parsedUserData !== 'object' || !parsedUserData.id) {
        await AsyncStorage.removeItem('userData');
        router.push('/signin');
        return;
      }

      // Fetch user data from API
      const response = await axios.get(`https://carzchoice.com/api/userprofile/${parsedUserData.id}`);

      if (response.data && Array.isArray(response.data.userData) && response.data.userData.length > 0) {
        const apiUserData = response.data.userData[0];
        setUserData(apiUserData);

        // Set Profile Image, ensuring fallback to default avatar
        setImage(
          apiUserData.dp
            ? apiUserData.dp.startsWith('http')
              ? apiUserData.dp
              : `https://carzchoice.com/assets/backend-assets/images/${apiUserData.dp}`
            : images.avatar
        );
      } else {
        console.error('Unexpected API response format:', response.data);
        setImage(images.avatar);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setImage(images.avatar);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);


  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'You have been logged out successfully.',
        position: 'bottom',  // Optional: top, bottom, or center
        visibilityTime: 4000, // Duration in ms
        autoHide: true,
      });

      setTimeout(() => {
        router.push('/signin'); // Ensure redirection happens after showing the toast
      }, 1000);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32 px-7">
        {loading ? (
          <ActivityIndicator size="large" color="#a62325" style={{ marginTop: 400 }} />
        ) : (
          <View>
            <Toast config={toastConfig} position="top" />
            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-xl font-rubik-bold upper">My Account</Text>

              <TouchableOpacity onPress={() => router.back()} className="flex-row bg-gray-300 rounded-full w-11 h-11 items-center justify-center">
                <Image source={icons.backArrow} className="w-5 h-5" />
              </TouchableOpacity>
            </View>
            <View className="flex flex-row items-center justify-start shadow bg-white rounded-2xl px-3">
              <Image
                source={typeof image === 'string' ? { uri: image } : image}
                className="size-12 rounded-full"
              />
              <View className="flex flex-col items-start ml-2 justify-center">
                {userData && (
                  <View className="bg-white p-4 rounded-lg shadow-sm">
                    <Text className="text-2xl font-rubik-bold text-primary-300 capitalize">
                      {userData?.fullname || 'User'}
                    </Text>

                    <Text className="text-black text-base mb-2">
                      Email: <Text className="font-medium">{userData.email || 'N/A'}</Text>
                    </Text>
                    <View className="flex-row items-start justify-between">
                      <View>
                        <Text className="text-black text-base mb-1">
                          Mobile: <Text className="font-medium">{userData.contactno || 'N/A'}</Text>
                        </Text>
                        <Text className="text-black text-base capitalize">
                          Role: <Text className="font-medium">{userData.usertype || 'N/A'}</Text>
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => router.push('/dashboard/editprofile')}
                        className="bg-primary-200 px-4 py-2 rounded-lg self-end ms-10"
                      >
                        <Text className="text-primary-300 text-base font-rubik-medium">
                          Edit Profile
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                )}
              </View>
            </View>


            <View className="flex flex-col mt-5 border-primary-200">
              {settings.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => router.push(item.onPress)} className="flex flex-row items-center py-2 border border-gray-300 mb-2 rounded-2xl ps-4 bg-white">
                  <Image source={item.icon} className="size-6" />
                  <View>
                    <Text className="text-lg font-rubik-medium text-black-300 ml-3">{item.title}</Text>
                    <Text className="text-sm font-rubik text-gray-700 ml-3">{item.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">

              {userData && userData.usertype == 'User' && (
                <TouchableOpacity onPress={() => router.push('/dashboard/registerdealer')} className="flex flex-row items-center py-2 border border-gray-300 mb-2 rounded-2xl ps-4 bg-white">
                  <Image source={icons.person} className="size-6" />
                  <View>
                    <Text className="text-lg font-rubik-medium text-primary-300 ml-3">Become A Dealer</Text>
                    <Text className="text-sm font-rubik text-gray-700 ml-3">Sell Car of Multiple Brands</Text>
                  </View>

                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => router.push('/dashboard/news/allnews')} className="flex flex-row items-center py-2 border border-gray-300 mb-2 rounded-2xl ps-4 bg-white">
                <Image source={icons.customersupport} className="size-8 backgroundColor: blue" />
                <View>
                  <Text className="text-lg font-rubik-medium text-black-300 ml-3">News</Text>
                  <Text className="text-sm font-rubik text-gray-700 ml-3">Help Center & Legal terms</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/dashboard/support')} className="flex flex-row items-center py-2 border border-gray-300 mb-2 rounded-2xl ps-4 bg-white">
                <Image source={icons.customersupport} className="size-8 backgroundColor: blue" />
                <View>
                  <Text className="text-lg font-rubik-medium text-black-300 ml-3">Help & Support</Text>
                  <Text className="text-sm font-rubik text-gray-700 ml-3">Help Center & Legal terms</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/dealers/exploredealers')} className="flex flex-row items-center py-2 border border-gray-300 mb-2 rounded-2xl ps-4 bg-white">
                <Image source={icons.customersupport} className="size-8 backgroundColor: blue" />
                <View>
                  <Text className="text-lg font-rubik-medium text-black-300 ml-3">Explore Dealers</Text>
                </View>

              </TouchableOpacity>
            </View>

            <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
              <TouchableOpacity onPress={handleLogout} className="flex flex-row items-center py-2 border border-red-300 mb-2 rounded-2xl ps-4 bg-white">
                <Image source={icons.logout} className="size-6" />
                <Text className="text-lg font-rubik-medium text-danger ml-3">Logout</Text>
              </TouchableOpacity>

            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;

import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import images from '@/constants/images';
import icons from '@/constants/icons';
import { settings } from '@/constants/data';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast, { BaseToast } from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [image, setImage] = useState(images.avatar);

  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: 'green' }}
        text1Style={{ fontSize: 16, fontWeight: 'bold' }}
        text2Style={{ fontSize: 14 }}
      />
    ),
    error: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: 'red' }}
        text1Style={{ fontSize: 16, fontWeight: 'bold' }}
        text2Style={{ fontSize: 14 }}
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

      const response = await axios.get(`https://carzchoice.com/api/userprofile/${parsedUserData.id}`);
      if (response.data?.userData?.length > 0) {
        const apiUserData = response.data.userData[0];
        setUserData(apiUserData);
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

  return (
    <View className="flex-1 bg-gray-100">
      <View className="absolute top-0 left-0 right-0 z-50">
        <Toast config={toastConfig} position="top" />
      </View>

      {/* Header */}
      <LinearGradient
        colors={['#0061ff', '#003087']}
        className="p-3 px-5 flex-row items-center justify-between"
      >
        <Text className="text-xl font-rubik-bold text-white">My Account</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white/80 p-2 rounded-lg"
          accessibilityLabel="Go back"
        >
          <Image source={icons.backArrow} className="w-6 h-6 tint-white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-5"
      >
        {loading ? (
          <View className="flex-1 justify-center items-center mt-40">
            <ActivityIndicator size="large" color="#0061ff" />
            <Text className="text-gray-600 font-rubik-regular mt-4">Loading profile...</Text>
          </View>
        ) : (
          <View className="mt-6">
            {/* Profile Card */}
            <View className="bg-white rounded-2xl p-5 shadow-sm mb-6">
              <View className="flex-row items-center">
                <Image
                  source={typeof image === 'string' ? { uri: image } : image}
                  className="w-16 h-16 rounded-full border-2 border-gray-200"
                />
                <View className="ml-4 flex-1">
                  <Text className="text-xl font-rubik-bold text-gray-800 capitalize">
                    {userData?.fullname || 'User'}
                  </Text>
                  <Text className="text-gray-600 font-rubik-regular mt-1">
                    {userData?.email || 'N/A'}
                  </Text>
                </View>
              </View>
              <View className="mt-4 flex-row justify-between items-center">
                <View>
                  <Text className="text-gray-600 font-rubik-regular">
                    Mobile: <Text className="font-rubik-medium">{userData?.contactno || 'N/A'}</Text>
                  </Text>
                  <Text className="text-gray-600 font-rubik-regular mt-1 capitalize">
                    Role: <Text className="font-rubik-medium">{userData?.usertype || 'N/A'}</Text>
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/dashboard/editprofile')}
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                  accessibilityLabel="Edit profile"
                >
                  <Text className="text-white font-rubik-medium">Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Settings Section */}
            <View className="mb-6">
              {settings.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push(item.onPress)}
                  className="flex-row items-center justify-between bg-white rounded-2xl p-4 mb-3 shadow-sm active:opacity-70"
                  accessibilityLabel={item.title}
                >
                  <View className="flex-row items-center">
                    <Image source={item.icon} className="w-6 h-6" />
                    <View className="ml-3">
                      <Text className="text-lg font-rubik-medium text-gray-800">{item.title}</Text>
                      <Text className="text-sm font-rubik-regular text-gray-500">{item.subtitle}</Text>
                    </View>
                  </View>
                  <Image source={icons.rightArrow} className="w-5 h-5 tint-gray-400" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Additional Actions */}
            <View>
              <TouchableOpacity
                onPress={() => router.push('/dashboard/registerdealer')}
                className="flex-row items-center justify-between bg-white rounded-2xl p-4 mb-3 shadow-sm active:opacity-70"
                accessibilityLabel="Become a dealer"
              >
                <View className="flex-row items-center">
                  <Image source={icons.person} className="w-6 h-6" />
                  <View className="ml-3">
                    <Text className="text-lg font-rubik-medium text-gray-800">Become A Dealer</Text>
                    <Text className="text-sm font-rubik-regular text-gray-500">
                      Sell Car of Multiple Brands
                    </Text>
                  </View>
                </View>
                <Image source={icons.rightArrow} className="w-5 h-5 tint-gray-400" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('./allnews')}
                className="flex-row items-center justify-between bg-white rounded-2xl p-4 mb-3 shadow-sm active:opacity-70"
                accessibilityLabel="View news"
              >
                <View className="flex-row items-center">
                  <Image source={icons.newspaper} className="w-6 h-6" />
                  <View className="ml-3">
                    <Text className="text-lg font-rubik-medium text-gray-800">News</Text>
                    <Text className="text-sm font-rubik-regular text-gray-500">
                      All Car News & Expert Reviews
                    </Text>
                  </View>
                </View>
                <Image source={icons.rightArrow} className="w-5 h-5 tint-gray-400" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/dashboard/support')}
                className="flex-row items-center justify-between bg-white rounded-2xl p-4 mb-3 shadow-sm active:opacity-70"
                accessibilityLabel="Help and support"
              >
                <View className="flex-row items-center">
                  <Image source={icons.customersupport} className="w-6 h-6" />
                  <View className="ml-3">
                    <Text className="text-lg font-rubik-medium text-gray-800">Help & Support</Text>
                    <Text className="text-sm font-rubik-regular text-gray-500">
                      Help Center & Legal terms
                    </Text>
                  </View>
                </View>
                <Image source={icons.rightArrow} className="w-5 h-5 tint-gray-400" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Dashboard;
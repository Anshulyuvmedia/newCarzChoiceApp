import { StyleSheet, Text, TouchableOpacity, View, Image, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import images from '@/constants/images';
import icons from '@/constants/icons';

const MyVehicles = () => {
  const [userPropertyData, setUserPropertyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleItemsCount, setVisibleItemsCount] = useState(8); // To control number of visible items
  const router = useRouter();
  const handleCardPress = (id) => router.push(`/vehicles/${id}`);
  const handleEditPress = (id) => router.push(`/dashboard/editvehicle/${id}`);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const parsedUserData = JSON.parse(await AsyncStorage.getItem('userData'));

      // Fetch user cars from API
      const response = await axios.get(`https://carzchoice.com/api/myoldvehiclelist/${parsedUserData.id}`);

      if (response.data && response.data.oldvehicles) {
        const formattedData = response.data.oldvehicles.map((item) => {
          // ✅ Parse `images` field since it's a JSON string
          let parsedImages = [];
          try {
            parsedImages = JSON.parse(item.images); // Convert string to array
          } catch (error) {
            console.error("Error parsing images:", error);
          }

          // ✅ Get the first image (if exists) or fallback to a default image
          let firstImage = parsedImages.length > 0 && parsedImages[0].imageurl
            ? `https://carzchoice.com/${parsedImages[0].imageurl}`
            : 'https://carzchoice.com/assets/backend-assets/images/1720680106_3.png'; // Fallback image

          return {
            id: item.id,
            carname: item.carname,
            brandname: item.brandname,
            modalname: item.modalname,
            address: item.address,
            price: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price),
            status: item.activationstatus,
            thumbnail: firstImage, // ✅ Use the first image
            city: item.district,
            state: item.state,
            manufactureyear: item.manufactureyear,
          };
        });

        setUserPropertyData(formattedData);
      } else {
        console.error('Unexpected API response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Handle loading more items on scroll
  const loadMoreItems = () => {
    if (userPropertyData.length > visibleItemsCount) {
      setVisibleItemsCount(visibleItemsCount + 8); // Increase the visible items by 8
    }
  };

  return (
    <View className="bg-white flex-1 px-4 pb-20 ">
      <View className="flex-row items-center ml-2 justify-between">
        <Text className="text-lg mr-2 text-center font-rubik text-gray-700">My Vehicles</Text>
        <TouchableOpacity onPress={() => router.back()} className="flex-row rounded-full w-11 h-11 items-center justify-center">
          <Image source={icons.backArrow} className="w-5 h-5" />
        </TouchableOpacity>

      </View>

      <View className="mt-6 mb-12">
        {loading ? (
          <View>
            <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 300 }} />
            <Text className="text-center text-gray-500 mt-10">Loading car...</Text>
          </View>
        ) : userPropertyData.length === 0 ? (
          <Text className="text-center text-gray-500 mt-10">No cars found.</Text>
        ) : (
          <FlatList
            data={userPropertyData.slice(0, visibleItemsCount)} // Slice data to show only the visible items
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="mb-4 px-1 ">
                <View className="p-3 rounded-2xl border border-gray-200 bg-white shadow-sm">
                  {/* Main Card */}
                  <TouchableOpacity
                    className="flex-row "
                    onPress={() => handleCardPress(item.id)}
                  >
                    {/* Car Image */}
                    <View className="w-24 h-24 overflow-hidden rounded-lg border border-gray-300 bg-gray-100">
                      <Image
                        source={item.thumbnail ? { uri: item.thumbnail } : images.newYork}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>

                    {/* Car Details */}
                    <View className="flex-1 ml-4 justify-between">
                      <View className="flex-row justify-between items-start">
                        <Text className="text-base font-rubik-bold text-gray-900 leading-tight">
                          {item.manufactureyear} {item.carname}
                        </Text>
                        <View
                          className={`flex-row items-center px-2 py-0.5 rounded-md border
                          ${item.status === 'Activated'
                              ? 'bg-green-50 border-green-500'
                              : 'bg-red-50 border-red-400'}`}
                        >
                          <View
                            className={`w-2 h-2 rounded-full mr-1 ${item.status === 'Activated' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                          />
                          <Text
                            className={`text-xs font-rubik-bold ${item.status === 'Activated' ? 'text-green-700' : 'text-red-600'
                              }`}
                          >
                            {item.status}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-sm text-gray-700 font-rubik-medium mt-0.5">
                        {item.modalname}
                      </Text>

                      <Text className="text-xs text-gray-500 mt-0.5 capitalize">
                        {item.city}, {item.state}
                      </Text>

                      <View className="flex-row justify-between items-center mt-1">
                        <Text className="text-sm font-rubik text-gray-800">{item.brandname}</Text>
                        <Text className="text-sm font-rubik text-blue-700">{item.price}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Actions Row */}
                  <View className="flex-row justify-between items-center mt-2 space-x-2">
                    <TouchableOpacity
                      onPress={() => handleCardPress(item.id)}
                      className="flex-1 flex-row items-center justify-center border border-gray-400 bg-blue-50 rounded-lg px-3 py-2 me-2"
                    >
                      <Image source={icons.eye} className="w-4 h-4 mr-2 " />
                      <Text className="text-sm font-rubik text-gray-700">View My Car</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleEditPress(item.id)}
                      className="flex-1 flex-row items-center justify-center border border-blue-600 bg-blue-50 rounded-lg px-3 py-2"
                    >
                      <Image source={icons.gear} className="w-4 h-4 mr-2 tint-blue-600" />
                      <Text className="text-sm font-rubik text-blue-700">Edit My Car</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

            )}
            onEndReached={loadMoreItems} // Trigger loading more items when scrolled to the end
            onEndReachedThreshold={0.5} // Trigger when 50% of the list is visible
          />
        )}
      </View>
    </View>
  );
};

export default MyVehicles;

const styles = StyleSheet.create({});

import { StyleSheet, Text, TouchableOpacity, View, Image, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import icons from '@/constants/icons';
import { LinearGradient } from 'expo-linear-gradient';

const MyEnquires = () => {
    const [userLeadData, setUserLeadData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visibleItemsCount, setVisibleItemsCount] = useState(8); // To control number of visible items
    const router = useRouter();
    const handleCardPress = (id) => router.push(`/vehicles/${id}`);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const parsedUserData = JSON.parse(await AsyncStorage.getItem('userData'));

            // Fetch user cars from API
            const response = await axios.get(`https://carzchoice.com/api/getnewcarenquires/${parsedUserData.id}`);
            // console.log('API Response:', response.data.data); // Log the API response
            if (response.data && response.data.data) {
                const formattedData = response.data.data.map((item) => {
                    // console.log('item:',item);
                    return {
                        id: item.carid,
                        carname: item.vehicle,
                        remarks: item.remarks,
                        cartype: item.cartype,
                        mobile: item.mobile,
                        created_at: new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        }),
                        status: item.leadstatus,
                        city: item.city,
                        state: item.state,
                    };
                });
                // Only store data whose cartype is 'newcarlead'
                setUserLeadData(formattedData);
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
        if (userLeadData.length > visibleItemsCount) {
            setVisibleItemsCount(visibleItemsCount + 8); // Increase the visible items by 8
        }
    };

    return (
        <View className="bg-white flex-1  pb-20 ">
            {/* Header */}
            <LinearGradient
                colors={['#0061ff', '#003087']}
                className="p-3 px-5 flex-row items-center justify-between"
            >
                <Text className="text-xl font-rubik-bold text-white">My Enquires</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-white/80 p-2 rounded-lg"
                    accessibilityLabel="Go back"
                >
                    <Image source={icons.backArrow} className="w-6 h-6 tint-white" />
                </TouchableOpacity>
            </LinearGradient>

            <View className="mt-6 mb-12 px-4">
                {loading ? (
                    <View>
                        <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 300 }} />
                        <Text className="text-center text-gray-500 mt-10">Loading car...</Text>
                    </View>
                ) : userLeadData.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-10">No cars found.</Text>
                ) : (
                    <FlatList
                        data={userLeadData.slice(0, visibleItemsCount)} // Slice data to show only the visible items
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <View className="mb-4 px-1">
                                <View className="p-3 rounded-2xl border border-gray-200 bg-white shadow-sm">

                                    {/* Main Card */}
                                    <TouchableOpacity
                                        className="flex-row"
                                        onPress={() => handleCardPress(item.id)}
                                    >

                                        {/* Car Details */}
                                        <View className="flex-1 justify-between">
                                            <View className="flex-row justify-start items-start">
                                                {/* Serial Number */}
                                                <Text className="text-base font-rubik-bold text-gray-900 mr-2">
                                                    #{index + 1}.
                                                </Text>

                                                {/* Car Name */}
                                                <Text className="text-base font-rubik-bold text-primary-300 leading-tight ">
                                                    {item.carname}
                                                </Text>
                                            </View>

                                            <View className="flex-row justify-between items-start mt-1">
                                                <Text className="text-base text-gray-700 capitalize font-rubik">
                                                    {item.city}, {item.state}
                                                </Text>
                                                <Text className="text-base  text-green-700 font-rubik">
                                                    {item.created_at}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    {/* Actions Row */}
                                    <View className="flex-row justify-between items-center mt-2 space-x-2">
                                        <TouchableOpacity
                                            onPress={() => handleCardPress(item.id)}
                                            className="flex-1 flex-row items-center justify-center border border-gray-400 bg-blue-50 rounded-lg px-3 py-2 me-2"
                                        >
                                            <Image source={icons.eye} className="w-4 h-4 mr-2" />
                                            <Text className="text-sm font-rubik text-gray-700">View Enquired Car</Text>
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

export default MyEnquires;

const styles = StyleSheet.create({
    backButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    backButtonGradient: {
        padding: 10,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    icon: {
        width: 20,
        height: 20,
        tintColor: '#1A1A1A',
    },
});

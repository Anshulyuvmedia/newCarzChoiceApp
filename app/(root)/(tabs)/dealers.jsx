import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect, useContext } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import icons from '@/constants/icons';
import images from '@/constants/images';
import GetLocation from '../../../components/GetLocation';
import Dealerbrands from '../../../components/dealerbrands';
import { LocationContext } from '@/components/LocationContext';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const Dealers = () => {
    const { currentCity } = useContext(LocationContext);
    const [listingData, setListingData] = useState([]);
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();

    const params = useLocalSearchParams();

    const [selectedFilters, setSelectedFilters] = useState({
        city: currentCity,
        budget: null,
        fuelType: null,
        transmission: null,
        color: null,
        brand: null,
    });

    const renderCarItem = ({ item }) => (
        <View className="bg-white mb-4 p-4 rounded-2xl shadow-sm border border-gray-100">
            <Text className="text-base font-rubik-medium text-black">{item.name}</Text>
            {/* You can add additional car info here */}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 pt-3">
                {/* Header */}
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-xl font-rubik-bold text-black">Dealers</Text>
                    <TouchableOpacity
                        onPress={() => router.navigate('/')}
                        className="bg-primary-200 rounded-full w-11 h-11 flex items-center justify-center"
                    >
                        <Image source={icons.backArrow} className="w-5 h-5" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 300 }} />
            ) : (
                <FlatList
                    data={listingData}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderCarItem}
                    ListHeaderComponent={
                        <>
                            {/* Banner */}
                            <View className="w-full h-52 mb-4 relative ">
                                <Image
                                    source={images.dealerbanner}
                                    className="w-full h-full rounded-2xl"
                                    style={{ resizeMode: 'cover' }}
                                />
                                <View className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-end px-4">
                                    <Text className="text-white text-xl font-rubik-bold text-center ">
                                        5000+ Trusted Car Dealers
                                    </Text>
                                    <Text className="text-white text-base font-rubik-semibold text-center mb-2">
                                        Connect to the Right Dealer
                                    </Text>
                                </View>
                            </View>

                            {/* Location Selector */}
                            <View className="flex-row items-center justify-center mx-5 py-3 px-4 bg-gray-100 rounded-full mb-2">
                                <Text className="text-base font-rubik-semibold text-black mr-2">Select Location:</Text>
                                <GetLocation />
                            </View>

                            {/* Brand Filters */}
                            <View className="px-5 mb-4">
                                <Text className="text-black text-base font-rubik-bold text-center mt-2">
                                    Connect to the Right Car Dealer
                                </Text>
                                <Dealerbrands />
                            </View>
                        </>
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: insets.bottom + tabBarHeight,
                        paddingHorizontal: 16,
                    }}
                />
            )}
        </SafeAreaView>
    );
};

export default Dealers;

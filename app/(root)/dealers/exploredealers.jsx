import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import icons from '@/constants/icons';
import Search from '@/components/Search';
import { LocationContext } from '@/components/LocationContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ExploreDealers = () => {
    const { currentCity } = useContext(LocationContext);
    const [listingData, setListingData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(2);
    const [loadingMore, setLoadingMore] = useState(false);
    const params = useLocalSearchParams();
    const [selectedFilters, setSelectedFilters] = useState({
        cityname: currentCity,
        brandname: null,
    });
    const insets = useSafeAreaInsets();

    const handleCardPress = (id) => router.push(`/dealers/${id}`);

    const loadMoreCars = () => {
        if (loadingMore || visibleCount >= listingData.length) return;
        setLoadingMore(true);
        setTimeout(() => {
            setVisibleCount((prev) => prev + 2);
            setLoadingMore(false);
        }, 300);
    };

    const fetchFilterData = async () => {
        setLoading(true);
        setListingData([]);

        try {
            const response = await axios.get("https://carzchoice.com/api/filternewcardealers", {
                params: {
                    brandname: params.brand || undefined,
                    cityname: params.city || currentCity,
                },
            });

            if (response.data.dealers) {
                const parsedDealers = response.data.dealers.map(dealer => ({
                    ...dealer,
                    brands: JSON.parse(dealer.brands),
                }));
                setListingData(parsedDealers);
            } else {
                setListingData([]);
            }
        } catch (error) {
            console.error("Error fetching dealers:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setSelectedFilters({
            cityname: params.city || null,
            brandname: params.brand || null,
        });

        setVisibleCount(2);
        fetchFilterData();
    }, [JSON.stringify(params)]);

    const visibleCars = listingData.slice(0, visibleCount);

    return (
        <SafeAreaView className="bg-white flex-1">
            <View className="px-5">
                <View className="flex flex-row items-center ml-2 mb-3 justify-between">
                    <TouchableOpacity onPress={() => router.navigate('/')} className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center">
                        <Image source={icons.backArrow} className="size-5" />
                    </TouchableOpacity>
                    <Text className="text-base mr-2 text-center font-rubik-medium text-black-300">
                        Search for Car Dealers
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/notifications')}>
                        <Image source={icons.bell} className="size-6" />
                    </TouchableOpacity>
                </View>

                <View className="min-h-[60px]">
                    <Search selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
                </View>

                <View className="mt-3">
                    <Text className="text-xl font-rubik-bold text-black-300 capitalize">
                        {listingData.length > 0
                            ? `${listingData.length} dealers found in ${currentCity}`
                            : ''}
                    </Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#a62325" style={{ marginTop: 300 }} />
            ) : (
                <FlatList
                    data={visibleCars}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleCardPress(item.id)}
                            className="bg-white border border-gray-200 rounded-2xl m-2 p-3 flex-row shadow-sm"
                            activeOpacity={0.9}
                        >
                            <Image
                                source={{ uri: `https://carzchoice.com/${item.businesspics}` }}
                                className="w-32 h-28 rounded-xl"
                                resizeMode="cover"
                            />

                            <View className="flex-1 ms-4 justify-between">
                                <View>
                                    <Text className="text-base font-rubik-bold text-black-300 mb-1">
                                        {item.businessname}
                                    </Text>
                                    <Text className="text-sm text-gray-500 mb-1 font-rubik-medium">
                                        {item.district}, {item.state}
                                    </Text>

                                    <View className="flex flex-wrap flex-row gap-1 mb-1">
                                        {item.brands?.map((brand, index) => (
                                            <Text
                                                key={index}
                                                className="text-xs bg-gray-200 text-primary-300 rounded-full px-2 py-1 font-rubik-medium"
                                            >
                                                {brand}
                                            </Text>
                                        ))}
                                    </View>
                                </View>

                                <View className="flex-row mt-2 space-x-3">
                                    <TouchableOpacity
                                        onPress={() => handleCardPress(item.id)}
                                        className="bg-primary-300 px-4 py-1 rounded-full me-2"
                                    >
                                        <Text className="text-white text-base font-semibold ">View Details</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {/* insert call logic here */ }}
                                        className="bg-green-500 px-4 py-1 rounded-full"
                                    >
                                        <Text className="text-white text-base font-semibold">Call Now</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>

                    )}
                    keyExtractor={(item) => item.id?.toString()}

                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-center text-red-700 mt-10 font-rubik-bold">Sorry No Dealer Found...</Text>
                            <Text className="text-center text-black-300 mt-10 font-rubik-bold">But you can sell your vehicle now!</Text>
                            <TouchableOpacity onPress={() => router.push('/sellvehicle')} className="mt-4 rounded-full bg-primary-300 px-6 py-2">
                                <Text className="text-center text-white">Sell Your Car Now</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    contentContainerStyle={{
                        paddingBottom: insets.bottom + 80,
                        paddingTop: 10,
                    }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={loadMoreCars}
                    onEndReachedThreshold={0.5}
                />
            )}
        </SafeAreaView>
    );
};

export default ExploreDealers;

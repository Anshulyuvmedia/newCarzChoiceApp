import { View, Text, Image, TouchableOpacity, FlatList, Linking, RefreshControl } from 'react-native';
import { useState, useEffect, useContext } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import * as Haptics from 'expo-haptics';
import icons from '@/constants/icons';
import { LocationContext } from '@/components/LocationContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchDealer from '@/components/SearchDealer';
import { LinearGradient } from 'expo-linear-gradient';

const ExploreDealers = () => {
    const { currentCity } = useContext(LocationContext);
    const [listingData, setListingData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(2);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const params = useLocalSearchParams();
    const [selectedFilters, setSelectedFilters] = useState({
        cityname: params.city || currentCity || null,
        brandname: params.brandname || null,
    });
    const insets = useSafeAreaInsets();

    const handleCardPress = (id) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push(`/dealers/${id}`);
    };

    const handleFiltersApplied = (filters) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSelectedFilters(filters);
    };

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
            const params = {
                brandname: selectedFilters.brandname || undefined,
                cityname: selectedFilters.cityname || currentCity || undefined,
            };
            const response = await axios.get("https://carzchoice.com/api/filternewcardealers", { params });
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

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFilterData();
        setVisibleCount(2);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchFilterData();
    }, [selectedFilters]);

    const visibleCars = listingData.slice(0, visibleCount);

    const renderSkeleton = () => (
        <View className="m-2">
            {[...Array(2)].map((_, index) => (
                <View
                    key={index}
                    className="bg-white border border-gray-200 rounded-2xl p-3 flex-row shadow-sm mb-3"
                >
                    <View className="w-32 h-28 bg-gray-200 rounded-xl animate-pulse" />
                    <View className="flex-1 ms-4 justify-between">
                        <View>
                            <View className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                            <View className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
                            <View className="flex-row gap-2">
                                <View className="h-4 bg-gray-200 rounded-full w-16 animate-pulse" />
                                <View className="h-4 bg-gray-200 rounded-full w-16 animate-pulse" />
                            </View>
                        </View>
                        <View className="flex-row mt-2 space-x-3">
                            <View className="h-8 bg-gray-200 rounded-full w-24 animate-pulse" />
                            <View className="h-8 bg-gray-200 rounded-full w-24 animate-pulse" />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <View className="bg-white flex-1">
            {/* Header */}
            <LinearGradient
                colors={['#0061ff', '#003087']}
                className="p-3 px-5 mb-3 flex-row items-center justify-between"
            >
                <Text className="text-xl font-rubik-bold text-white">Search for Car Dealers</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-white/80 p-2 rounded-lg"
                    accessibilityLabel="Go back"
                >
                    <Image source={icons.backArrow} className="w-6 h-6 tint-white" />
                </TouchableOpacity>
            </LinearGradient>
            <View className="min-h-[60px]">
                <SearchDealer
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    onFiltersApplied={handleFiltersApplied}
                />
            </View>

            <View className="px-5">
                <View className="mt-3">
                    <Text className="text-xl font-rubik-bold text-black-300 capitalize">
                        {listingData.length > 0
                            ? `${listingData.length} dealers found in ${selectedFilters.cityname || currentCity || 'your area'}`
                            : ''}
                    </Text>
                </View>
            </View>

            {loading ? (
                renderSkeleton()
            ) : (
                <FlatList
                    data={visibleCars}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleCardPress(item.userid)}
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
                                        onPress={() => handleCardPress(item.userid)}
                                        className="bg-primary-300 px-4 py-1 rounded-full me-2"
                                    >
                                        <Text className="text-white text-base font-semibold">View Details</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const phoneNumber = item.mobilenumber || '1234567890';
                                            const url = `tel:${phoneNumber}`;
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            Linking.openURL(url).catch(err => console.error('Error opening dialer:', err));
                                        }}
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
                            <Text className="text-center text-red-700 mt-10 font-rubik-bold">
                                Sorry No Dealer Found...
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{
                        paddingBottom: insets.bottom + 80,
                        paddingTop: 10,
                    }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={loadMoreCars}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#0061ff']}
                            tintColor={'#0061ff'}
                        />
                    }
                />
            )}
        </View>
    );
};

export default ExploreDealers;
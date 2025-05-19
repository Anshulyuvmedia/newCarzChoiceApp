import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect, useContext } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import icons from '@/constants/icons';
import Search from '@/components/Search';
import { Card } from '@/components/Cards';
import { LocationContext } from '@/components/LocationContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const Explore = () => {
    const { currentCity } = useContext(LocationContext);
    const [listingData, setListingData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(2);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const params = useLocalSearchParams();
    const [selectedFilters, setSelectedFilters] = useState({
        budget: params.budget || null,
        fuelType: params.fuelType || null,
        transmission: params.transmission || null,
        brand: params.brand || null,
        bodyType: params.bodyType || null,
    });

    // console.log('parms inside explore', params);
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();

    // Animation setup
    const opacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    // Start fade-in animation on mount
    useEffect(() => {
        opacity.value = withTiming(1, { duration: 1000 });
    }, []);

    const handleCardPress = (id) => router.push(`/vehicles/${id}`);

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const loadMoreCars = debounce(() => {
        if (loadingMore || visibleCount >= listingData.length) return;
        setLoadingMore(true);
        setTimeout(() => {
            setVisibleCount((prev) => prev + 2);
            setLoadingMore(false);
        }, 300);
    }, 500);

    const fetchFilterData = async () => {
        setLoading(true);
        setListingData([]);

        const requestBody = {
            bodyType: selectedFilters.bodyType || null,
            brand: selectedFilters.brand || null,
            budget: selectedFilters.budget || null,
            fuelType: selectedFilters.fuelType || null,
            transmission: selectedFilters.transmission || null,
        };
        Object.keys(requestBody).forEach(key => requestBody[key] === null && delete requestBody[key]);

        try {
            const response = await axios.post("https://carzchoice.com/api/filterByAttribute", requestBody, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data.success) {
                const variants = Array.isArray(response.data.variants) ? response.data.variants : [];
                const variantsWithUniqueIds = variants.map((item, index) => ({
                    ...item,
                    id: item.id ? `${item.id}-${index}` : `fallback-${index}-${item.carname || index}`,
                }));
                setListingData(variantsWithUniqueIds);
            } else {
                throw new Error(response.data.message || "Failed to fetch variants");
            }
        } catch (error) {
            console.error("Error fetching listings:", error.response?.data || error.message);
            setListingData([]);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to fetch vehicle listings. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Reset animation
        opacity.value = 0;
        opacity.value = withTiming(1, { duration: 1000 });

        try {
            await fetchFilterData();
        } catch (error) {
            console.error('Error during refresh:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFilterData();
    }, [JSON.stringify(selectedFilters)]);

    const visibleCars = Array.isArray(listingData) ? listingData.slice(0, visibleCount) : [];

    return (
        <View className="bg-white flex-1">
            <View className="px-5">
                <View className="flex flex-row items-center ml-2 mb-3 justify-between">
                    <Text className="text-base mr-2 text-center font-rubik-medium text-black-300">
                        Search for Your Dream Car
                    </Text>
                    <TouchableOpacity onPress={() => router.navigate('/')} className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center">
                        <Image source={icons.backArrow} className="size-5" />
                    </TouchableOpacity>
                </View>

                <View className="min-h-[60px]">
                    <Search selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
                </View>

                <View className="mt-3">
                    <Text className="text-xl font-rubik-bold text-black-300 capitalize">
                        {listingData.length > 0
                            ? `${listingData.length} cars found in ${currentCity || 'your area'}`
                            : ' '}
                    </Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 300 }} />
            ) : (
                <Animated.View style={animatedStyle}>
                    <FlatList
                        data={visibleCars}
                        renderItem={({ item }) => (
                            <Card item={item} onPress={() => handleCardPress(item.id)} />
                        )}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        extraData={selectedFilters}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#0061FF']}
                                tintColor="#0061FF"
                            />
                        }
                        ListEmptyComponent={
                            <View className="flex-1 justify-center items-center mt-10">
                                <Text className="text-center text-red-700 font-rubik-bold text-lg">
                                    {listingData.length === 0 && !Object.values(selectedFilters).some(val => val)
                                        ? "Select Filters to Start"
                                        : "No Vehicles Found"}
                                </Text>
                                <Text className="text-center text-black-300 mt-2 font-rubik-regular">
                                    {listingData.length === 0 && !Object.values(selectedFilters).some(val => val)
                                        ? "Choose filters to find your dream car!"
                                        : "Try adjusting your filters."}
                                </Text>
                            </View>
                        }
                        ListFooterComponent={
                            loadingMore && <ActivityIndicator size="small" color="#0061ff" style={{ marginVertical: 10 }} />
                        }
                        contentContainerStyle={{
                            paddingBottom: insets.bottom + tabBarHeight + 80,
                            paddingTop: 10,
                        }}
                        columnWrapperStyle={{ flex: 1, gap: 5, paddingHorizontal: 5 }}
                        showsVerticalScrollIndicator={false}
                        onEndReached={loadMoreCars}
                        onEndReachedThreshold={0.5}
                    />
                </Animated.View>
            )}
        </View>
    );
};

export default Explore;
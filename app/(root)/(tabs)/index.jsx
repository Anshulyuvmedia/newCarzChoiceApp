import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import Search from '@/components/Search';
import { Card, LocationCard, FeaturedCard, PopularCard } from '@/components/Cards';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BrandList from '../../../components/BrandList';
import GetLocation from '../../../components/GetLocation';
import { LocationContext } from '@/components/LocationContext';
import BannerSlider from '../../../components/BannerSlider';
import BodyTypeList from '../../../components/BodyTypeList';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const Index = () => {
    const router = useRouter();
    const { currentCity } = useContext(LocationContext);
    const [image, setImage] = useState(images.avatar);
    const [locationData, setLocationData] = useState();
    const [userLoading, setUserLoading] = useState(false);
    const [listingLoading, setListingLoading] = useState(false);
    const [filterLoading, setFilterLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [visibleListingCount, setVisibleListingCount] = useState(6);
    const [visibleLocationCount, setVisibleLocationCount] = useState(6);

    const [trendingCars, setTrendingCars] = useState([]);
    const [popularCars, setPopularCars] = useState([]);
    const [upcomingCars, setUpcomingCars] = useState([]);
    const [offerCars, setOfferCars] = useState([]);
    const [topCarsIndia, setTopCarsIndia] = useState([]);

    // Animation setup
    const opacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    // Start fade-in animation on mount
    useEffect(() => {
        opacity.value = withTiming(1, { duration: 1000 });
    }, []);

    // Memoized handleCardPress
    const handleCardPress = useCallback((id) => {
        router.push(`/vehicles/${id}`);
    }, [router]);

    const fetchUserData = async () => {
        setUserLoading(true);
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            let parsedUserData;
            try {
                parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;
            } catch (e) {
                await AsyncStorage.removeItem('userData');
                router.push('/signin');
                return;
            }

            if (!parsedUserData || typeof parsedUserData !== 'object' || !parsedUserData.id) {
                await AsyncStorage.removeItem('userData');
                router.push('/signin');
                return;
            }

            const response = await axios.get(`https://carzchoice.com/api/userprofile/${parsedUserData.id}`);

            if (response.data && Array.isArray(response.data.userData) && response.data.userData.length > 0) {
                const apiUserData = response.data.userData[0];
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
            setUserLoading(false);
        }
    };

    const fetchListingData = async () => {
        setListingLoading(true);
        try {
            const response = await axios.get(`https://carzchoice.com/api/featuredCars`);
            const resData = response.data.data;

            if (resData && typeof resData === 'object') {
                setTrendingCars(Object.values(resData.matches || {}));
                setPopularCars(Object.values(resData.matchespopular || {}));
                setUpcomingCars(Object.values(resData.matchesupcoming || {}));
                setOfferCars(Object.values(resData.matchesoffer || {}));
                setTopCarsIndia(Object.values(resData.matchestopcarsindia || {}));
            } else {
                console.error('Unexpected API response format:', response.data);
                setTrendingCars([]);
                setPopularCars([]);
                setUpcomingCars([]);
                setOfferCars([]);
                setTopCarsIndia([]);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
            setTrendingCars([]);
            setPopularCars([]);
            setUpcomingCars([]);
            setOfferCars([]);
            setTopCarsIndia([]);
        } finally {
            setListingLoading(false);
        }
    };

    const fetchFilterData = async () => {
        setFilterLoading(true);
        try {
            const response = await axios.post(
                "https://carzchoice.com/api/filterOldCarByAttribute",
                {
                    location: currentCity || null,
                    attribute: {},
                },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (response.data.variants) {
                setLocationData(response.data.variants);
            } else {
                setLocationData([]);
            }
        } catch (error) {
            console.error("Error fetching filter data:", error.response?.data || error.message);
        } finally {
            setFilterLoading(false);
        }
    };

    // Handle pull-to-refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Reset animation
        opacity.value = 0;
        opacity.value = withTiming(1, { duration: 1000 });

        try {
            await Promise.all([fetchUserData(), fetchListingData(), currentCity && fetchFilterData()]);
        } catch (error) {
            console.error('Error during refresh:', error);
        } finally {
            setRefreshing(false);
        }
    }, [currentCity]);

    useEffect(() => {
        if (currentCity) {
            fetchFilterData();
        }
    }, [currentCity]);

    useEffect(() => {
        fetchUserData();
        fetchListingData();
    }, []);

    return (
        <SafeAreaView className='bg-white h-full '>
            <View className='flex flex-row items-center justify-between px-3'>
                <TouchableOpacity onPress={() => router.push('/dashboard')} className='flex flex-row items-center ml-2 justify-center'>
                    <Image source={images.applogo} className='w-24 h-12' />
                </TouchableOpacity>
                <GetLocation />
            </View>

            {userLoading || listingLoading || filterLoading ? (
                <ActivityIndicator size="large" color="#0061FF" style={{ marginTop: 300 }} />
            ) : (
                <Animated.View style={animatedStyle}>
                    <FlatList
                        data={topCarsIndia?.slice(0, visibleListingCount) || []}
                        renderItem={({ item }) => <Card item={item} onPress={() => handleCardPress(item.id)} />}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        numColumns={2}
                        contentContainerClassName="pb-32"
                        columnWrapperClassName='flex gap-2 px-3  mb-5'
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#0061FF']}
                                tintColor="#0061FF"
                            />
                        }
                        onEndReached={() => {
                            if (topCarsIndia?.length > visibleListingCount) {
                                setVisibleListingCount((prev) => prev + 6);
                            }
                        }}
                        onEndReachedThreshold={0.5}
                        ListHeaderComponent={
                            <View className='px-3 '>
                                <Search />
                                <View className='mt-5'>
                                    <BannerSlider />
                                </View>
                                {trendingCars?.length > 0 && (
                                    <View className='mt-5'>
                                        <Text className='text-xl font-rubik-bold text-black-300 capitalize mb-3'>Featured Cars</Text>
                                        <FlatList
                                            data={trendingCars.slice(0, visibleLocationCount)}
                                            renderItem={({ item }) => (
                                                <FeaturedCard item={item} onPress={() => handleCardPress(item.id)} />
                                            )}
                                            keyExtractor={(item, index) => item.id.toString() || index.toString()}
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={{
                                                paddingHorizontal: 0,
                                                gap: 16,
                                                paddingBottom: 24,
                                            }}
                                            onEndReached={() => {
                                                if (trendingCars.length > visibleLocationCount) {
                                                    setVisibleLocationCount((prev) => prev + 6);
                                                }
                                            }}
                                            onEndReachedThreshold={0.5}
                                        />
                                    </View>
                                )}
                                <View className='mt-5'>
                                    <Text className='text-xl font-rubik-bold text-black-300 capitalize'>Get Car By Brand</Text>
                                    <BrandList />
                                </View>
                                {popularCars?.length > 0 && (
                                    <View className='mt-5'>
                                        <Text className='text-xl font-rubik-bold text-black-300 capitalize mb-3'>Popular Cars</Text>
                                        <FlatList
                                            data={popularCars.slice(0, visibleLocationCount)}
                                            renderItem={({ item }) => (
                                                <PopularCard item={item} onPress={() => handleCardPress(item.id)} />
                                            )}
                                            keyExtractor={(item, index) => item.id.toString() || index.toString()}
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={{
                                                paddingHorizontal: 0,
                                                gap: 16,
                                                paddingBottom: 24,
                                            }}
                                            onEndReached={() => {
                                                if (popularCars.length > visibleLocationCount) {
                                                    setVisibleLocationCount((prev) => prev + 6);
                                                }
                                            }}
                                            onEndReachedThreshold={0.5}
                                        />
                                    </View>
                                )}
                                <View className='mt-5'>
                                    <Text className='text-xl font-rubik-bold text-black-300 mb-3'>Search Car By Body Type</Text>
                                    <BodyTypeList />
                                </View>
                                {upcomingCars?.length > 0 && (
                                    <View className='mt-5'>
                                        <Text className='text-xl font-rubik-bold text-black-300 capitalize mb-3'>Upcoming Cars</Text>
                                        <FlatList
                                            data={upcomingCars.slice(0, visibleLocationCount)}
                                            renderItem={({ item }) => (
                                                <FeaturedCard item={item} onPress={() => handleCardPress(item.id)} />
                                            )}
                                            keyExtractor={(item, index) => item.id.toString() || index.toString()}
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={{
                                                paddingHorizontal: 0,
                                                gap: 16,
                                                paddingBottom: 24,
                                            }}
                                            onEndReached={() => {
                                                if (upcomingCars.length > visibleLocationCount) {
                                                    setVisibleLocationCount((prev) => prev + 6);
                                                }
                                            }}
                                            onEndReachedThreshold={0.5}
                                        />
                                    </View>
                                )}
                                <View className='mt-4'>
                                    <Text className='text-xl font-rubik-bold text-black-300'>Top Car in India</Text>
                                </View>
                            </View>
                        }
                    />
                </Animated.View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({});

export default Index;
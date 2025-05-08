import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import Search from '@/components/Search';
import { Card, LocationCard, FeaturedCard, PopularCard } from '@/components/Cards';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BrandList from '../../../components/BrandList';
import LocationList from '../../../components/LocationList';
import GetLocation from '../../../components/GetLocation';
import { LocationContext } from '@/components/LocationContext';
import BannerSlider from '../../../components/BannerSlider';

const Index = () => {
    const router = useRouter();
    const { currentCity } = useContext(LocationContext);
    const [image, setImage] = useState(images.avatar);
    const [listingData, setListingData] = useState();
    const [locationData, setLocationData] = useState();
    const [userLoading, setUserLoading] = useState(false);
    const [listingLoading, setListingLoading] = useState(false);
    const [filterLoading, setFilterLoading] = useState(false);

    const [visibleListingCount, setVisibleListingCount] = useState(6);
    const [visibleLocationCount, setVisibleLocationCount] = useState(6);

    const [trendingCars, setTrendingCars] = useState([]);
    const [popularCars, setPopularCars] = useState([]);
    const [upcomingCars, setUpcomingCars] = useState([]);
    const [offerCars, setOfferCars] = useState([]);
    const [topCarsIndia, setTopCarsIndia] = useState([]);


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
            // console.log("Listing API Response:", resData);

            if (resData && typeof resData === 'object') {
                setTrendingCars(Object.values(resData.matches || {}));
                setPopularCars(Object.values(resData.matchespopular || {}));
                setUpcomingCars(Object.values(resData.matchesupcoming || {}));
                setOfferCars(Object.values(resData.matchesoffer || {}));
                setTopCarsIndia(Object.values(resData.matchestopcarsindia || {}));

                // console.log("Trending Cars:", Object.values(resData.matches || {}));
                // console.log("Popular Cars:", Object.values(resData.matchespopular || {}));
                // console.log("Upcoming Cars:", Object.values(resData.matchesupcoming || {}));
                // console.log("Offer Cars:", Object.values(resData.matchesoffer || {}));
                // console.log("Top Cars India:", Object.values(resData.matchestopcarsindia || {}));
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
        // setListingData([]); // Clear the listing data

        let requestBody = {
            location: currentCity || null,
            attribute: {},
        };

        Object.keys(requestBody.attribute).forEach(
            (key) => requestBody.attribute[key] === null && delete requestBody.attribute[key]
        );

        if (!requestBody.location) delete requestBody.location;

        try {
            const response = await axios.post("https://carzchoice.com/api/filterOldCarByAttribute", requestBody, {
                headers: { "Content-Type": "application/json" },
            });

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

    useEffect(() => {
        if (currentCity) {
            fetchFilterData(); // Call only after currentCity is available
        }
    }, [currentCity]);

    useEffect(() => {
        fetchUserData();
        fetchListingData();
    }, []);

    return (
        <SafeAreaView className='bg-white h-full'>
            <View className='flex flex-row items-center justify-between px-3'>
                <TouchableOpacity onPress={() => router.push('/dashboard')} className='flex flex-row items-center ml-2 justify-center'>
                    <Image source={images.applogo} className='w-24 h-12' />
                </TouchableOpacity>

                <GetLocation />

                {/* <View className='flex flex-row items-center justify-between'>
                    
                    <TouchableOpacity onPress={() => router.push('explore')}>
                        <Text className="ms-4 font-rubik-bold text-lg">Buy</Text>
                    </TouchableOpacity>
                </View> */}
            </View>

            {userLoading || listingLoading || filterLoading ? (
                <ActivityIndicator size="large" color="#a62325" style={{ marginTop: 300 }} />
            ) : (
                <FlatList
                    data={topCarsIndia?.slice(0, visibleListingCount) || []}
                    renderItem={({ item }) => <Card item={item} onPress={() => handleCardPress(item.id)} />}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    numColumns={2}
                    contentContainerClassName="pb-32"
                    columnWrapperClassName='flex gap-2 px-3'
                    showsVerticalScrollIndicator={false}
                    onEndReached={() => {
                        if (topCarsIndia?.length > visibleListingCount) {
                            setVisibleListingCount((prev) => prev + 6);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListHeaderComponent={
                        <View className='px-3'>
                            <Search />

                            <View className='mt-5'>
                                <BannerSlider />
                            </View>
                            <View className='mt-5'>
                                <Text className='text-xl font-rubik-bold text-black-300 capitalize'>Get Car in {currentCity}</Text>
                                {locationData && locationData.length > 0 ? (
                                    <FlatList
                                        data={locationData.slice(0, visibleLocationCount)}
                                        renderItem={({ item }) => (
                                            <LocationCard item={item} onPress={() => handleCardPress(item.id)} />
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
                                            if (locationData.length > visibleLocationCount) {
                                                setVisibleLocationCount((prev) => prev + 6);
                                            }
                                        }}
                                        onEndReachedThreshold={0.5}
                                    />
                                ) : (
                                    <Text className='text-base font-rubik text-black-300'>
                                        No cars in your location
                                    </Text>
                                )}
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
                                <Text className='text-xl font-rubik-bold text-black-300 mb-3'>Old Car By Cities</Text>
                                <LocationList />
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
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({});

export default Index;
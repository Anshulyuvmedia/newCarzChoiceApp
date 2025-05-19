import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect, useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import icons from '@/constants/icons';
import images from '@/constants/images';
import GetLocation from '@/components/GetLocation';
import Dealerbrands from '@/components/Dealerbrands';
import { LocationContext } from '@/components/LocationContext';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const Dealers = () => {
    const { currentCity } = useContext(LocationContext);
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();


    // Animation for header
    const headerScale = useSharedValue(1);
    const headerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(headerScale.value) }],
    }));

    // Handle back button press with animation
    const handleBackPress = () => {
        headerScale.value = 0.95;
        setTimeout(() => router.navigate('/'), 100);
    };

    // Handle explore navigation with debug logging
    const handleExplorePress = () => {
        // console.log('Navigating to /dealers/exploredealers with params:', { city: currentCity || null });
        router.push({
            pathname: '/dealers/exploredealers',
            params: { city: currentCity || null },
        });
    };

    return (
        <View className="flex-1 bg-gray-50">
            {loading ? (
                <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 300 }} />
            ) : (
                <FlatList
                    keyExtractor={(item, index) => `dealer-${index}`}
                    ListHeaderComponent={
                        <>
                            {/* Header with wrapper to avoid Reanimated layout animation conflict */}
                            <Animated.View entering={FadeInDown.duration(300)}>
                                <Animated.View style={headerAnimatedStyle}>
                                    <View className="px-5 pt-5 pb-4 flex-row items-center justify-between">
                                        <TouchableOpacity
                                            onPress={handleBackPress}
                                            className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center"
                                            accessibilityLabel="Go back to home"
                                        >
                                            <Image source={icons.backArrow} className="w-6 h-6" style={{ tintColor: 'white' }} />
                                        </TouchableOpacity>
                                        <Text className="text-xl font-rubik-bold flex-1 text-center">
                                            Find Trusted Dealers
                                        </Text>
                                        <View className="w-12" />
                                    </View>
                                </Animated.View>
                            </Animated.View>

                            {/* Banner */}
                            <Animated.View className="px-5 mt-4" entering={FadeIn.duration(400)}>
                                <View className="w-full h-56 rounded-2xl overflow-hidden relative shadow-lg">
                                    <Image
                                        source={images.dealerbanner}
                                        className="w-full h-full"
                                        style={{ resizeMode: 'cover' }}
                                    />
                                    <LinearGradient
                                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                                        className="absolute inset-0 flex items-center justify-end p-5"
                                    >
                                        <Text className="text-white text-2xl font-rubik-bold text-center">
                                            5000+ Trusted Car Dealers
                                        </Text>
                                        <Text className="text-white text-base font-rubik-medium text-center mt-1">
                                            Connect with the Best in Your Area
                                        </Text>
                                        <TouchableOpacity
                                            className="bg-white rounded-full px-6 py-3 mt-4"
                                            onPress={handleExplorePress}
                                            accessibilityLabel="Explore dealers now"
                                        >
                                            <Text className="text-primary-600 font-rubik-semibold text-base">
                                                Explore Now
                                            </Text>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                            </Animated.View>

                            {/* Location Selector */}
                            <Animated.View className="px-5 mt-5" entering={FadeIn.duration(500)}>
                                <View className="flex-row items-center justify-between bg-white rounded-2xl py-3 px-4 shadow-md">
                                    <Text className="text-base font-rubik-semibold text-gray-800 mr-3">
                                        Location: {currentCity ? currentCity : 'Select City'}
                                    </Text>
                                    <GetLocation />
                                </View>
                            </Animated.View>

                            {/* Brand Filters */}
                            <Animated.View className="px-5 mt-6 mb-6" entering={FadeIn.duration(600)}>
                                <Text className="text-xl font-rubik-bold text-gray-800 mb-3 text-center">
                                    Browse by Brand
                                </Text>
                                <Dealerbrands />
                            </Animated.View>
                        </>
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: insets.bottom + tabBarHeight + 20,
                    }}
                />
            )}
        </View>
    );
};

export default Dealers;
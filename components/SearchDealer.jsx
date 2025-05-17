import { View, Text, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import axios from 'axios';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import icons from '@/constants/icons';
import images from '@/constants/images';
import CitySelector from './CitySelector';

const SearchDealer = ({ selectedFilters = { cityname: null, brandname: null }, setSelectedFilters }) => {
    const refRBSheet = useRef(null);
    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState([]);
    const [brands, setBrands] = useState([]);

    // Animation for filter chips
    const chipScale = useSharedValue(1);
    const chipAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(chipScale.value) }],
    }));

    useEffect(() => {
        fetchFilterData();
    }, []);

    const fetchUserLocationFromStorage = useCallback(async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const parsedData = JSON.parse(userData);
                // console.log("User current city from storage:", parsedData.district);
                const fallbackCity = parsedData.district || parsedData.city || "Unknown";
                setDisplayCity(fallbackCity);
                setSelectedCity(fallbackCity);
                if (parsedData.district && parsedData.district !== currentCity) {
                    await updateCity(parsedData.district);
                }


            } else {
                console.log("No user data found in storage.");
                setDisplayCity("Unknown");
            }
        } catch (error) {
            console.error('Error fetching from storage:', error);
        }
    }, []);

    const detectCurrentCity = async () => {
        try {
            setLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = loc.coords;
            const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

            if (geocode.length > 0) {
                const cityName = geocode[0].city || geocode[0].subregion || "Unknown";
                setSelectedCity(cityName);
                setDisplayCity(cityName);
            }
        } catch (error) {
            console.error("Error fetching location:", error);
            setErrorMsg('Failed to fetch location');
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterData = async () => {
        setLoading(true);
        try {
            // Fetch data from API
            const response = await axios.get('https://carzchoice.com/api/getMasterDataLists');

            // Handle brands
            if (response.data?.data?.brands) {
                setBrands(response.data.data.brands);
            } else {
                throw new Error('No brands data');
            }

            // Handle cities
            if (response.data?.data?.newcarcity && Array.isArray(response.data.data.newcarcity)) {
                const formattedCities = response.data.data.newcarcity.map((city, index) => ({
                    label: city.district || `City ${index + 1}`,
                    value: city.district || `city-${index}`,
                }));
                setCities(formattedCities);
            } else {
                throw new Error('No cities data');
            }
        } catch (error) {
            console.warn('API failed, using fallback cities:', error.message);
            setCities([
                { label: 'Mumbai', value: 'Mumbai' },
                { label: 'Delhi', value: 'Delhi' },
                { label: 'Bangalore', value: 'Bangalore' },
                { label: 'Chennai', value: 'Chennai' },
                { label: 'Kolkata', value: 'Kolkata' },
            ]);
            console.error('Error fetching filter data:', error.message);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load filter options. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = () => {
        if (!selectedFilters.cityname && !selectedFilters.brandname) {
            Toast.show({
                type: 'info',
                text1: 'No Filters Selected',
                text2: 'Please select at least one filter to search.',
            });
            return;
        }
        if (refRBSheet.current) {
            refRBSheet.current.close();
        }
        Toast.show({
            type: 'success',
            text1: 'Filters Applied',
            text2: 'Dealer search filters applied successfully.',
        });
    };

    const resetFilters = () => {
        setSelectedFilters({
            cityname: null,
            brandname: null,
        });
        Toast.show({
            type: 'info',
            text1: 'Filters Reset',
            text2: 'All dealer search filters cleared.',
        });
    };

    const FilterChip = React.memo(({ item, isSelected, onPress, labelKey }) => {
        const [imageError, setImageError] = useState(false);

        const handlePress = () => {
            chipScale.value = 0.95;
            setTimeout(() => (chipScale.value = 1), 100);
            onPress();
        };

        return (
            <Animated.View style={chipAnimatedStyle}>
                <TouchableOpacity
                    onPress={handlePress}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 50,
                        borderWidth: 1,
                        borderColor: isSelected ? '#0061ff' : '#ddd',
                        backgroundColor: isSelected ? '#e3f2fd' : '#f8f9fa',
                        marginRight: 10,
                    }}
                    accessibilityLabel={`${isSelected ? 'Deselect' : 'Select'} ${item[labelKey]}`}
                >
                    {item.iconimage && !imageError ? (
                        <Image
                            style={{
                                width: 24,
                                height: 24,
                                marginRight: 6,
                                resizeMode: 'contain',
                                borderRadius: 50,
                            }}
                            source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${item.iconimage}` }}
                            onError={() => setImageError(true)}
                            defaultSource={images.reactlogo}
                        />
                    ) : item.iconimage && imageError ? (
                        <Image
                            style={{
                                width: 24,
                                height: 24,
                                marginRight: 6,
                                resizeMode: 'contain',
                                borderRadius: 50,
                            }}
                            source={images.reactlogo}
                        />
                    ) : null}
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: isSelected ? '600' : '400',
                            color: isSelected ? '#0061ff' : '#1a1a1a',
                            textTransform: 'capitalize',
                        }}
                    >
                        {item[labelKey]}
                    </Text>
                    {isSelected && (
                        <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#0061ff"
                            style={{ marginLeft: 6 }}
                        />
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    });

    return (
        <View className="flex-1">
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0061ff" />
                </View>
            )}
            <TouchableOpacity
                onPress={() => refRBSheet.current?.open()}
                style={styles.searchBar}
                accessibilityLabel="Open dealer search filters"
            >
                <LinearGradient
                    colors={['#ffffff', '#f0f0f0']}
                    style={styles.searchBarGradient}
                >
                    <View className="flex-row items-center justify-start flex-1">
                        <Image source={icons.search} className="w-6 h-6" />
                        <TextInput
                            value={[selectedFilters.cityname, selectedFilters.brandname]
                                .filter(val => val)
                                .join(', ')}
                            editable={false}
                            placeholder="Search Dealers by City or Brand..."
                            className="text-sm font-rubik-medium text-gray-800 ml-3 flex-1 capitalize"
                        />
                    </View>
                    <Image source={icons.filter} className="w-5 h-5" />
                </LinearGradient>
            </TouchableOpacity>

            <RBSheet
                ref={refRBSheet}
                height={350}
                openDuration={250}
                closeOnDragDown={true}
                customStyles={{
                    container: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        paddingHorizontal: 0,
                        paddingBottom: 20,
                        backgroundColor: '#fff',
                    },
                    draggableIcon: {
                        backgroundColor: '#ddd',
                        width: 50,
                        height: 5,
                        borderRadius: 3,
                        marginVertical: 10,
                    },
                }}
            >
                <Animated.View entering={FadeIn.duration(300)}>
                    <LinearGradient
                        colors={['#0061ff', '#003087']}
                        style={styles.header}
                    >
                        <Text className="text-xl font-rubik-bold text-white">
                            Filter Dealers
                        </Text>
                        <View className="flex-row">
                            <TouchableOpacity
                                onPress={resetFilters}
                                style={styles.headerButton}
                                accessibilityLabel="Reset all filters"
                            >
                                <LinearGradient
                                    colors={['#ffffff', '#f0f0f0']}
                                    style={styles.headerButtonGradient}
                                >
                                    <Text className="text-sm font-rubik-medium text-gray-800">
                                        Reset
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => refRBSheet.current?.close()}
                                style={[styles.headerButton, { marginLeft: 10 }]}
                                accessibilityLabel="Close filter sheet"
                            >
                                <LinearGradient
                                    colors={['#ff4444', '#cc0000']}
                                    style={styles.headerButtonGradient}
                                >
                                    <Text className="text-sm font-rubik-medium text-white">
                                        Close
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    {/* City Filter */}
                    <Text className="text-lg font-rubik-bold text-gray-800 mt-5 mx-4">
                        Select City
                    </Text>
                    <View className="flex flex-row justify-between items-center mb-3 px-3">
                        <View className="flex flex-row items-center flex-grow bg-blue-50 rounded-lg px-3 me-3">
                            <Image source={icons.search} className="size-5" />
                            <CitySelector
                                cityData={cities}
                                onSelectCity={(cityValue) =>
                                    setSelectedFilters(prev => ({
                                        ...prev,
                                        cityname: prev.cityname === cityValue ? null : cityValue,
                                    }))
                                }
                                selectedCity={selectedFilters.cityname}
                            />
                        </View>
                        <TouchableOpacity onPress={detectCurrentCity}>
                            <View className="border border-primary-300 p-3 rounded-lg">
                                <View className='flex flex-row items-center'>
                                    <Image source={icons.aim} className="size-5 me-1" />
                                    <Text className="text-sm font-rubik-bold">
                                        {loading ? "Detecting..." : "Detect"}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                    {cities.length === 0 && (
                        <Text className="text-sm text-gray-500 mx-4 mt-2">
                            No cities available
                        </Text>
                    )}

                    {/* Brand Filter */}
                    <Text className="text-lg font-rubik-bold text-gray-800 mt-3 mx-3">
                        Select Brand
                    </Text>
                    {brands.length > 0 ? (
                        <FlatList
                            data={brands}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={item => `brand-${item.id}`}
                            style={{ marginTop: 10, marginStart: 10 }}
                            renderItem={({ item }) => (
                                <FilterChip
                                    item={item}
                                    isSelected={selectedFilters.brandname === item.label}
                                    onPress={() =>
                                        setSelectedFilters(prev => ({
                                            ...prev,
                                            brandname: prev.brandname === item.label ? null : item.label,
                                        }))
                                    }
                                    labelKey="label"
                                />
                            )}
                        />
                    ) : (
                        <Text className="text-sm text-gray-500 mx-4 mt-2">
                            No brands available
                        </Text>
                    )}

                    <TouchableOpacity
                        onPress={handleApplyFilters}
                        style={styles.applyButton}
                        accessibilityLabel="Apply dealer filters"
                    >
                        <LinearGradient
                            colors={['#0061ff', '#003087']}
                            style={styles.applyButtonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="font-rubik-bold text-white text-center text-lg">
                                    Apply Filters
                                </Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </RBSheet>
        </View >
    );
};

const styles = StyleSheet.create({
    searchBar: {
        marginHorizontal: 15,
        marginVertical: 5,
        borderRadius: 50,
    },
    searchBarGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    headerButton: {
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerButtonGradient: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    applyButton: {
        marginTop: 20,
        borderRadius: 12,
    },
    applyButtonGradient: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 15,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});

export default SearchDealer;
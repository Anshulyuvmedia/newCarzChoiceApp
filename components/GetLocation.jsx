import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import * as Location from 'expo-location';
import icons from '@/constants/icons';
import RBSheet from "react-native-raw-bottom-sheet";
import LocationList from './LocationList';
import CitySelector from './CitySelector';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationContext } from '@/components/LocationContext';

const GetLocation = () => {
    const [errorMsg, setErrorMsg] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cityData, setCityData] = useState([]);
    const [displayCity, setDisplayCity] = useState('');
    const refRBSheet = useRef(null);
    const { updateCity } = useContext(LocationContext);

    const setNewLocation = async () => {
        if (selectedCity) {
            try {
                await updateCity(selectedCity);
                await AsyncStorage.setItem('userCurrentCity', selectedCity);
                setDisplayCity(selectedCity);
                refRBSheet.current.close();
            } catch (error) {
                console.error('Error updating location:', error);
            }
        }
    };

    const fetchUserLocationFromStorage = useCallback(async () => {
        try {
            const userCurrentCity = await AsyncStorage.getItem('userCurrentCity');
            if (userCurrentCity) {
                setDisplayCity(userCurrentCity);
            } else {
                const userData = await AsyncStorage.getItem('userData');
                const parsed = userData ? JSON.parse(userData) : {};
                const fallbackCity = parsed.district || parsed.city || "Unknown";
                setDisplayCity(fallbackCity);
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

    const fetchCityList = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("https://carzchoice.com/api/getMasterDataLists");

            if (data?.data?.city) {
                const formattedCities = data.data.city.map((item, index) => ({
                    label: item.district || `City ${index}`,
                    value: item.district || `city-${index}`,
                }));
                setCityData(formattedCities);
            }
        } catch (error) {
            console.error("Error fetching city list:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCityList();
        fetchUserLocationFromStorage();
    }, []);

    return (
        <View>
            <TouchableOpacity onPress={() => refRBSheet.current.open()} className='flex flex-row items-center ml-2 justify-center'>
                <View>
                    {errorMsg ? (
                        <Text className="text-red-500">{errorMsg}</Text>
                    ) : displayCity ? (
                        <View className='flex flex-row items-center bg-gray-100 border border-gray-200 rounded-full px-3 py-1'>
                            <Image source={icons.location} className="size-5 me-1" />
                            <Text className="text-sm font-rubik-medium capitalize">{displayCity}</Text>
                            <Image source={icons.downarrow} className="size-5 ms-1" />
                        </View>
                    ) : (
                        <View className='flex flex-row items-center'>
                            <Image source={icons.location} className="size-3 me-1" />
                            <Text className="text-sm font-rubik">Select city</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            <RBSheet
                ref={refRBSheet}
                height={600}
                openDuration={150}
                closeOnDragDown
                customStyles={{
                    container: {
                        borderTopLeftRadius: 15,
                        borderTopRightRadius: 15,
                        padding: 15,
                        backgroundColor: "white",
                    }
                }}
            >
                <View>
                    <View className="flex flex-row justify-between items-center mb-3">
                        <Text className="text-lg font-rubik-bold text-black-300">Select City</Text>
                        <TouchableOpacity onPress={() => refRBSheet.current.close()}>
                            <Text className="text-lg font-rubik-bold text-red-500">Close</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex flex-row justify-between items-center mb-3">
                        <View className="flex flex-row items-center flex-grow bg-blue-50 rounded-lg px-3 me-3">
                            <Image source={icons.search} className="size-5" />
                            <CitySelector
                                cityData={cityData}
                                onSelectCity={setSelectedCity}
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

                    <Text className="text-sm font-rubik-medium text-center mb-4 capitalize">
                        {displayCity ? `Looking in ${displayCity}` : 'Press detect to find your current location'}
                    </Text>

                    <Text className="text-lg font-rubik text-black-300 mb-2">Popular Cities</Text>
                    <LocationList />

                    <TouchableOpacity
                        disabled={loading || !selectedCity}
                        onPress={setNewLocation}
                        className="p-2 rounded-lg bg-primary-300 "
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="font-rubik-bold text-white text-center">Search</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </RBSheet>
        </View>
    );
};

export default GetLocation;

const styles = StyleSheet.create({});

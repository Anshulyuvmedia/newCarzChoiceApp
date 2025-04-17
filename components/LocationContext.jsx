import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [currentCity, setCurrentCity] = useState(null);

    useEffect(() => {
        const loadCity = async () => {
            try {
                // Check if city is already stored
                const storedCity = await AsyncStorage.getItem('userCurrentCity');

                if (storedCity) {
                    setCurrentCity(storedCity);
                } else {
                    // Fallback: Try loading city from user data
                    const storedUserData = await AsyncStorage.getItem('userData');
                    const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;

                    const fallbackCity = parsedUserData?.district || parsedUserData?.city || "Unknown";
                    setCurrentCity(fallbackCity);

                    // Save fallback city for future loads
                    await AsyncStorage.setItem('userCurrentCity', fallbackCity);
                }
            } catch (error) {
                console.error('Error loading city from AsyncStorage or userData:', error);
            }
        };

        loadCity();
    }, []);

    const updateCity = async (city) => {
        try {
            await AsyncStorage.setItem('userCurrentCity', city);
            setCurrentCity(city);
        } catch (error) {
            console.error('Error saving city to AsyncStorage:', error);
        }
    };

    return (
        <LocationContext.Provider value={{ currentCity, updateCity }}>
            {children}
        </LocationContext.Provider>
    );
};

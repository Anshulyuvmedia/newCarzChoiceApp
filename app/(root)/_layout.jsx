import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AppLayout() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const userData = await AsyncStorage.getItem("userData");
                const parsed = userData ? JSON.parse(userData) : null;

                if (parsed?.id) {
                    setIsAuthenticated(true);
                } else {
                    await AsyncStorage.removeItem("userData");
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.error("Auth check failed", err);
                setIsAuthenticated(false);
            }
        })();
    }, []);

    // Still checking → keep splash (or show loader if you prefer)
    if (isAuthenticated === null) {
        return null; // Splash stays
    }

    // Not logged in → redirect to sign-in
    if (!isAuthenticated) {
        return <Redirect href="/signin" />;
    }

    // Logged in → show the real app navigation
    return (
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", gestureEnabled: true, }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="vehicles/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="vehicles/CompareCars" options={{ headerShown: false }} />
            <Stack.Screen name="dealers/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="dealers/exploredealers" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        </Stack>
    );
}
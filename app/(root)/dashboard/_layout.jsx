import { Stack } from 'expo-router';

const RootLayout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true, // Enable gestures for back navigation
            }}
        >
            <Stack.Screen name="editvehicle/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="news/newsdetailview" options={{ headerShown: false }} />
            <Stack.Screen name="AllBrands" options={{ headerShown: false }} />
            <Stack.Screen name="carinsurance" options={{ headerShown: false }} />
            <Stack.Screen name="carloan" options={{ headerShown: false }} />
            <Stack.Screen name="editprofile" options={{ headerShown: false }} />
            <Stack.Screen name="myenquires" options={{ headerShown: false }} />
            <Stack.Screen name="myvehicles" options={{ headerShown: false }} />
            <Stack.Screen name="registerdealer" options={{ headerShown: false }} />
            <Stack.Screen name="sellvehicle" options={{ headerShown: false }} />
            <Stack.Screen name="support" options={{ headerShown: false }} />
        </Stack>
    );
};

export default RootLayout;
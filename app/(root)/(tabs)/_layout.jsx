import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";

const AnimatedTabIcon = ({ focused, icon, title }) => {
    const scale = useSharedValue(1);

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value) }],
    }));

    // Update animation value when focused state changes
    useEffect(() => {
        scale.value = focused ? 1.05 : 1;
    }, [focused]);

    return (
        <View style={{ width: 70, alignItems: "center", justifyContent: "center" }}>
            <Animated.View style={animatedIconStyle}>
                <Ionicons
                    name={icon}
                    size={24}
                    color={focused ? "#0061ff" : "#666876"}
                />
            </Animated.View>
            <Text
                style={{
                    fontSize: 12,
                    fontFamily: focused ? "Rubik-Medium" : "Rubik-Regular",
                    color: focused ? "#0061ff" : "#666876",
                    marginTop: 4,
                    textAlign: "center",
                }}
            >
                {title}
            </Text>
        </View>
    );
};

const TabsLayout = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: "#ffffff",
                    position: "absolute",
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    height: 70 + insets.bottom,
                    paddingBottom: insets.bottom + 8,
                    paddingTop: 15,
                    borderRadius: 10,
                    marginHorizontal: 10,
                    marginBottom: 10,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <AnimatedTabIcon focused={focused} icon="home" title="Home" />
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: "Buy Car",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <AnimatedTabIcon focused={focused} icon="car-sport" title="Buy Car" />
                    ),
                }}
            />
            <Tabs.Screen
                name="dealers"
                options={{
                    title: "Dealers",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <AnimatedTabIcon focused={focused} icon="storefront" title="Dealers" />
                    ),
                }}
            />
            <Tabs.Screen
                name="allnews"
                options={{
                    title: "News",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <AnimatedTabIcon focused={focused} icon="newspaper" title="News" />
                    ),
                }}
            />
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: "Dashboard",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <AnimatedTabIcon focused={focused} icon="person" title="Account" />
                    ),
                }}
            />
        </Tabs>
    );
};

export default TabsLayout;
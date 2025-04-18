import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";

import icons from "@/constants/icons";

const TabIcon = ({focused, icon, title}) => (
    <View className="flex-1 mt-3 flex flex-col items-center">
        <Image
            source={icon}
            tintColor={focused ? "#a62325" : "#666876"}
            resizeMode="contain"
            className="size-6"
        />
        <Text
            className={`${focused
                ? "text-primary-300 font-rubik-medium"
                : "text-black-200 font-rubik"
                } text-xs w-full text-center mt-1`}
        >
            {title}
        </Text>
    </View>
);

const TabsLayout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: "white",
                    position: "absolute",
                    borderTopColor: "#a623251A",
                    borderTopWidth: 1,
                    minHeight: 70,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.home} title="Home" />
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: "Buy Car",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.keys} title="Buy Car" />
                    ),
                }}
            />
            <Tabs.Screen
                name="myvehicles"
                options={{
                    title: "My Vehicles",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.showroom} title="My Vehicles" />
                    ),
                }}
            />
            
            <Tabs.Screen
                name="sellvehicle"
                options={{
                    title: "Sell Car",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.sell} title="Sell Car" />
                    ),
                }}
            />
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: "Dashboard",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.person} title="My Account" />
                    ),
                }}
            />
            
        </Tabs>
    );
};

export default TabsLayout;
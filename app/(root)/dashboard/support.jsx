import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import icons from '@/constants/icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast, { BaseToast } from 'react-native-toast-message';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';

const Support = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const toastConfig = {
        success: (props) => (
            <BaseToast
                {...props}
                style={{ borderLeftColor: "green" }}
                text1Style={{
                    fontSize: 16,
                    fontWeight: "bold",
                }}
                text2Style={{
                    fontSize: 14,
                }}
            />
        ),
        error: (props) => (
            <BaseToast
                {...props}
                style={{ borderLeftColor: "red" }}
                text1Style={{
                    fontSize: 16,
                    fontWeight: "bold",
                }}
                text2Style={{
                    fontSize: 14,
                }}
            />
        ),
    };


    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            Toast.show({
                type: 'success',
                text1: 'Logged Out',
                text2: 'You have been logged out successfully.',
                position: 'bottom',  // Optional: top, bottom, or center
                visibilityTime: 4000, // Duration in ms
                autoHide: true,
            });

            setTimeout(() => {
                router.push('/signin'); // Ensure redirection happens after showing the toast
            }, 1000);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32 ">
                {loading ? (
                    <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 400 }} />
                ) : (
                    <View>
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999 }}>
                            <Toast config={toastConfig} position="top" />
                        </View>

                        {/* Header */}
                        <LinearGradient
                            colors={['#0061ff', '#003087']}
                            className="p-3 px-5 flex-row items-center justify-between"
                        >
                            <Text className="text-xl font-rubik-bold text-white">Help & Support</Text>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="bg-white/80 p-2 rounded-lg"
                                accessibilityLabel="Go back"
                            >
                                <Image source={icons.backArrow} className="w-6 h-6 tint-white" />
                            </TouchableOpacity>
                        </LinearGradient>
                        


                        <View className="flex flex-col px-5 mt-5 border-primary-200">
                            <TouchableOpacity
                                onPress={() => Linking.openURL("https://carzchoice.com/privacypolicy")}
                                className="flex flex-row items-center py-2 border border-gray-300 mb-2 rounded-2xl ps-4 bg-white"
                            >
                                <View>
                                    <Text className="text-lg font-rubik-medium text-black-300 ml-3">Privacy Policy</Text>
                                    <Text className="text-sm font-rubik text-gray-700 ml-3">Help Center & Legal terms</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => Linking.openURL("https://carzchoice.com/disclaimer")}
                                className="flex flex-row items-center py-2 border border-gray-300 mb-2 rounded-2xl ps-4 bg-white"
                            >
                                <View>
                                    <Text className="text-lg font-rubik-medium text-black-300 ml-3">Disclaimer</Text>
                                    <Text className="text-sm font-rubik text-gray-700 ml-3">Legal info and clarification</Text>
                                </View>
                            </TouchableOpacity>


                            <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
                                <TouchableOpacity onPress={handleLogout} className="flex flex-row items-center py-2 border border-red-300 mb-2 rounded-2xl ps-4 bg-white">
                                    <Image source={icons.logout} className="size-6" />
                                    <Text className="text-lg font-rubik-medium text-danger ml-3">Logout</Text>
                                </TouchableOpacity>

                            </View>
                        </View>


                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default Support;

const styles = StyleSheet.create({
    backButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    backButtonGradient: {
        padding: 10,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    icon: {
        width: 20,
        height: 20,
        tintColor: '#1A1A1A',
    }
});
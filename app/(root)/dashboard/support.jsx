import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import icons from '@/constants/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Toast, { BaseToast } from 'react-native-toast-message';
import * as Linking from 'expo-linking';
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



    return (
        <SafeAreaView>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32 px-7">
                {loading ? (
                    <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 400 }} />
                ) : (
                    <View>
                        <Toast config={toastConfig} position="top" />
                        <View className="flex flex-row items-center justify-between my-5">
                            <Text className="text-xl font-rubik-bold upper">Help & Support</Text>

                            <TouchableOpacity onPress={() => router.back()} className="flex-row bg-gray-300 rounded-full w-11 h-11 items-center justify-center">
                                <Image source={icons.backArrow} className="w-5 h-5" />
                            </TouchableOpacity>
                        </View>


                        <View className="flex flex-col mt-5 border-primary-200">
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
                        </View>


                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Support;

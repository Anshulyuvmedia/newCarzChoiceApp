import { StyleSheet, Text, View, SafeAreaView, ScrollView, ActivityIndicator, Image, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from "expo-router";
import Toast, { BaseToast } from 'react-native-toast-message';
import icons from '@/constants/icons';
import images from '@/constants/images';
import axios from 'axios';

const DealerDetails = () => {
    const toastConfig = {
        success: (props) => (
            <BaseToast {...props} style={{ borderLeftColor: "green" }} text1Style={{ fontSize: 16, fontWeight: "bold" }} text2Style={{ fontSize: 14 }} />
        ),
        error: (props) => (
            <BaseToast {...props} style={{ borderLeftColor: "red" }} text1Style={{ fontSize: 16, fontWeight: "bold" }} text2Style={{ fontSize: 14 }} />
        ),
    };

    const dealerId = useLocalSearchParams().id;
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(images.avatar);
    const [officeImages, setOfficeImages] = useState([]);
    const [dealerData, setDealerData] = useState(null);
    const [brandData, setBrandData] = useState([]);
    const [matchedBrands, setMatchedBrands] = useState([]);

    const fetchDealerData = async () => {
        setLoading(true);
        try {
            console.log('id', dealerId);
            const response = await axios.get(`https://carzchoice.com/api/dealerprofile/${dealerId}`);
            // console.log('Dealer Data:', response.data);
            const apiDealerData = response.data?.dealerData?.[0];

            if (apiDealerData) {
                setDealerData(apiDealerData);

                setImage(apiDealerData.businesspics?.startsWith('http')
                    ? apiDealerData.businesspics
                    : `https://carzchoice.com/${apiDealerData.businesspics}`
                );

                const imagesArray = apiDealerData.officepics
                    ? apiDealerData.officepics.split(',').map((img) =>
                        img.startsWith('http') ? img : `https://carzchoice.com/${img.trim()}`
                    )
                    : [];

                setOfficeImages(imagesArray);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setImage(images.avatar);
        } finally {
            setLoading(false);
        }
    };

    const fetchBrandList = async () => {
        try {
            const response = await axios.get("https://carzchoice.com/api/brandlist");
            const brands = response.data?.data || [];
            setBrandData(brands);

            if (dealerData?.brands) {
                const dealerBrands = typeof dealerData.brands === 'string' ? JSON.parse(dealerData.brands) : dealerData.brands;

                const matched = brands.filter((brand) =>
                    dealerBrands.includes(brand.label)
                );
                setMatchedBrands(matched);
            }
        } catch (error) {
            console.error("Error fetching brand list:", error);
        }
    };



    useEffect(() => {
        fetchDealerData();
    }, []);

    useEffect(() => {
        if (dealerData) {
            fetchBrandList();
        }
    }, [dealerData]);

    const renderBrandItem = ({ item }) => (
        <View className="bg-white rounded-lg shadow mr-3 p-2 items-center justify-center w-24">
            <Image
                source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${item.iconimage}` }}
                className="w-16 h-16 mb-1 rounded-full"
                resizeMode="contain"
            />
            <Text className="text-sm text-center text-black font-medium">{item.label}</Text>
        </View>
    );


    const renderOfficeImage = ({ item }) => (
        <Image source={{ uri: item }} className="w-28 h-28 rounded-lg mr-3" />
    );

    return (
        <SafeAreaView>
            {loading ? (
                <ActivityIndicator size="large" color="#a62325" style={{ marginTop: 400 }} />
            ) : (

                <FlatList
                    ListHeaderComponent={
                        <View>
                            {/* Toast + Back Button + Dealer Info */}
                            <Toast config={toastConfig} position="top" />
                            <View className="flex-row justify-between items-center my-5">
                                <Text className="text-xl font-bold">Dealer Profile</Text>
                                <TouchableOpacity onPress={() => router.back()} className="bg-gray-300 rounded-full w-11 h-11 items-center justify-center">
                                    <Image source={icons.backArrow} className="w-5 h-5" />
                                </TouchableOpacity>
                            </View>

                            {/* Dealer Info */}
                            <View className="flex-row items-center bg-white rounded-2xl p-4 shadow">
                                <Image source={typeof image === 'string' ? { uri: image } : image} className="w-24 h-24 rounded-lg" />
                                <View className="ml-4 flex-1">
                                    <Text className="text-lg font-bold">{dealerData?.businessname || 'Business Name'}</Text>
                                    <Text className="text-base text-gray-700">Email: {dealerData?.email || 'N/A'}</Text>
                                    <Text className="text-base text-gray-700">Mobile: {dealerData?.mobilenumber || 'N/A'}</Text>
                                    <Text className="text-base text-gray-700">WhatsApp: {dealerData?.whatsappnumber || 'N/A'}</Text>
                                </View>
                            </View>

                            {/* Address */}
                            <View className="mt-6">
                                <Text className="text-lg font-semibold mb-2">Dealer Address</Text>
                                <Text className="text-base text-gray-700">{dealerData?.district || 'N/A'}, {dealerData?.state || 'N/A'}, {dealerData?.pincode || 'N/A'}</Text>
                            </View>

                            {/* Office Images */}
                            <View className="mt-6">
                                <Text className="text-lg font-semibold mb-2">Office Images</Text>
                                <FlatList
                                    data={officeImages}
                                    renderItem={renderOfficeImage}
                                    keyExtractor={(item, index) => index.toString()}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                />
                            </View>

                            {/* Brands Title */}
                            <View className="mt-6">
                                <Text className="text-lg font-semibold mb-2">Dealer's Brands</Text>
                            </View>
                        </View>
                    }
                    data={matchedBrands}
                    renderItem={renderBrandItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={4}
                    columnWrapperStyle={{ justifyContent: 'start', marginTop: 12 }}
                    contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
                    ListEmptyComponent={!loading && <Text className="text-center text-gray-500 mt-4">No Brands Found</Text>}
                />

            )}
        </SafeAreaView>
    );
};

export default DealerDetails;

const styles = StyleSheet.create({});

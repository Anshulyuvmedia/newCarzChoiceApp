import { StyleSheet, Text, View, ActivityIndicator, Image, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from "expo-router";
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
    const [dealerData, setDealerData] = useState([]);
    const [matchedBrands, setMatchedBrands] = useState([]);
    const [dealerCars, setDealerCars] = useState([]);
    const [visibleItemsCount, setVisibleItemsCount] = useState(8);
    const router = useRouter();
    const [groupedCarsByBrand, setGroupedCarsByBrand] = useState({});

    const handleCardPress = (id) => router.push(`/vehicles/${id}`);

    const fetchDealerData = async () => {
        setLoading(true);
        try {
            // console.log('id', dealerId);
            const response = await axios.get(`https://carzchoice.com/api/dealerprofile/${dealerId}`);
            // console.log('Dealer Data:', response.data);
            const apiDealerData = response.data?.dealerData?.[0];

            if (apiDealerData) {
                setDealerData(apiDealerData);

                setImage(apiDealerData.businesspics?.startsWith('http')
                    ? apiDealerData.businesspics
                    : `https://carzchoice.com/${apiDealerData.businesspics}`
                );

                // const imagesArray = apiDealerData.officepics
                //     ? apiDealerData.officepics.split(',').map((img) =>
                //         img.startsWith('http') ? img : `https://carzchoice.com/${img.trim()}`
                //     )
                //     : [];

                // setOfficeImages(imagesArray);
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

    const fetchDealerCarData = async () => {
        setLoading(true);
        try {
            // Fetch user cars from API
            const response = await axios.get(`https://carzchoice.com/api/newcardealercarlist/${dealerId}`);
            // console.log('dealerCars:', response.data.dealercarlist);
            if (response.data && response.data.dealercarlist) {
                const formattedData = Object.values(response.data.dealercarlist).map((item) => {
                    // ✅ Parse `images` field (if present)
                    let parsedImages = [];
                    try {
                        parsedImages = item.images ? JSON.parse(item.images) : [];
                    } catch (error) {
                        console.error("Error parsing images:", error);
                    }
                    // console.log('fueltype:', item.fueltype);
                    // ✅ Use first image or fallback
                    let firstImage = parsedImages.length > 0 && parsedImages[0].imageurl
                        ? `https://carzchoice.com/${parsedImages[0].imageurl}`
                        : 'https://carzchoice.com/assets/backend-assets/images/1720680106_3.png';

                    return {
                        id: item.id,
                        carname: item.carname,
                        brandname: item.brandname,
                        modalname: item.carmodalname, // corrected from modalname to carmodalname
                        // handle undefined
                        price: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price),
                        created_at: new Date(item.created_at).toLocaleDateString('en-GB'),
                        thumbnail: firstImage,
                        bodytype: item.bodytype || '',
                        manufactureyear: item.manufactureyear || '',
                    };
                });

                setDealerCars(formattedData);
                setGroupedCarsByBrand(groupCarsByBrand(formattedData));
            } else {
                console.error('Unexpected API response format:', response.data);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupCarsByBrand = (cars) => {
        return cars.reduce((acc, car) => {
            if (!acc[car.brandname]) acc[car.brandname] = [];
            acc[car.brandname].push(car);
            return acc;
        }, {});
    };


    // Handle loading more items on scroll
    const loadMoreItems = () => {
        if (dealerCars.length > visibleItemsCount) {
            setVisibleItemsCount(visibleItemsCount + 8); // Increase the visible items by 8
        }
    };

    useEffect(() => {
        const loadAllData = async () => {
            await fetchDealerData();
            await fetchDealerCarData();
        };
        loadAllData();
    }, []);

    useEffect(() => {
        if (dealerData) {
            fetchBrandList();
        }
    }, [dealerData]);

    const renderBrandItem = ({ item }) => (
        <View className="flex-row bg-white rounded-xl shadow me-2 mb-3 px-2 items-center ">
            <Image
                source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${item.iconimage}` }}
                className="w-12 h-12 me-1 rounded-full"
                resizeMode="contain"
            />
            <Text className="text-sm text-center text-black font-semibold flex-wrap">{item.label}</Text>
        </View>
    );

    // const renderOfficeImage = ({ item }) => (
    //     <Image source={{ uri: item }} className="w-28 h-28 rounded-lg mr-3" />
    // );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Toast + Back Button */}
            <Toast config={toastConfig} position="top" />
            <View className="flex-row justify-between items-center my-5 px-5">
                <Text className="text-xl font-bold">Dealer Profile</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-gray-300 rounded-full w-11 h-11 items-center justify-center">
                    <Image source={icons.backArrow} className="w-5 h-5" />
                </TouchableOpacity>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 400 }} />
            ) : (
                <FlatList
                    ListHeaderComponent={
                        <View className="px-5">


                            {/* Dealer Info */}
                            <View className="flex-row items-center bg-white rounded-2xl p-4 shadow">
                                <Image source={typeof image === 'string' ? { uri: image } : image} className="w-24 h-24 rounded-lg" />
                                <View className="ml-4 flex-1">
                                    <Text className="text-lg font-bold">{dealerData?.businessname || 'Business Name'}</Text>
                                    <Text className="text-base text-gray-700">Email: {dealerData?.email || 'N/A'}</Text>
                                    <Text className="text-base text-gray-700">WhatsApp: {dealerData?.whatsappnumber || 'N/A'}</Text>
                                    <Text className="text-base text-gray-700">Address: {dealerData?.district || 'N/A'}, {dealerData?.state || 'N/A'}, {dealerData?.pincode || 'N/A'}</Text>
                                </View>
                            </View>

                            {/* Dealer Brands */}
                            <View className="mt-6">
                                <Text className="text-lg font-bold text-black mb-3">Dealer's Brands</Text>
                                {matchedBrands.length > 0 ? (
                                    <FlatList
                                        data={matchedBrands}
                                        renderItem={renderBrandItem}
                                        keyExtractor={(item) => item.id.toString()}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ paddingHorizontal: 0 }}
                                    />
                                ) : (
                                    <Text className="text-center text-gray-500">No Brands Found</Text>
                                )}
                            </View>


                            {/* Cars List */}
                            <View className="mt-3">
                                <Text className="text-lg font-semibold mb-4">Cars by Dealer</Text>
                            </View>
                        </View>
                    }
                    data={dealerCars.slice(10, visibleItemsCount)}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View className="px-5 mb-2">
                            <View className="p-3 rounded-2xl border border-gray-200 bg-white shadow-sm">
                                {/* Main Card */}
                                <TouchableOpacity
                                    className="flex-row "
                                    onPress={() => handleCardPress(item.id)}
                                >
                                    {/* Car Image */}
                                    <View className="w-20 h-20 overflow-hidden rounded-lg border border-gray-300 bg-gray-100">
                                        <Image
                                            source={item.thumbnail ? { uri: item.thumbnail } : images.newYork}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    </View>

                                    {/* Car Details */}
                                    <View className="flex-1 ml-4 justify-between">
                                        <View className="flex-row justify-between items-start">
                                            <Text className="text-base font-rubik-bold text-gray-900 leading-tight">
                                                {item.brandname} {item.carname}
                                            </Text>
                                        </View>

                                        <Text className="text-sm text-gray-700 font-rubik-medium mt-0.5">
                                            {item.modalname}
                                        </Text>

                                        <View className="flex-row justify-between items-center mt-1">
                                            <Text className="text-sm font-rubik text-gray-800">{item.bodytype}</Text>
                                            <Text className="text-sm font-rubik text-blue-700">{item.price}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                {/* Actions Row */}
                                {/* <View className="flex-row justify-between items-center mt-2 space-x-2">
                                    <TouchableOpacity
                                        onPress={() => handleCardPress(item.id)}
                                        className="flex-1 flex-row items-center justify-center border border-gray-400 bg-blue-50 rounded-lg px-3 py-2 me-2"
                                    >
                                        <Image source={icons.eye} className="w-4 h-4 mr-2 " />
                                        <Text className="text-sm font-rubik text-gray-700">View Car</Text>
                                    </TouchableOpacity>
                                </View> */}
                            </View>
                        </View>
                    )}
                    onEndReached={loadMoreItems}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No cars found.</Text>}
                    contentContainerStyle={{ paddingBottom: 50 }}
                />


            )}


        </View>
    );
};

export default DealerDetails;

const styles = StyleSheet.create({});

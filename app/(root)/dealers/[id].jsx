import { StyleSheet, Text, View, ActivityIndicator, Image, TouchableOpacity, FlatList, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast, { BaseToast } from 'react-native-toast-message';
import icons from '@/constants/icons';
import images from '@/constants/images';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { PopularCard } from '@/components/Cards';

// const PopularCard = ({ item, onPress }) => (
//     <Pressable
//         onPress={onPress}
//         style={({ pressed }) => [
//             styles.carCard,
//             { opacity: pressed ? 0.7 : 1 },
//         ]}
//     >
//         <LinearGradient
//             colors={['#ffffff', '#f8fafc']}
//             style={styles.carCardGradient}
//         >
//             <View className="relative">
//                 <Image
//                     source={item.thumbnail ? { uri: item.thumbnail } : images.newYork}
//                     className="w-full h-36 rounded-t-lg"
//                     resizeMode="cover"
//                 />
//                 {item.isNew && (
//                     <View className="absolute top-2 left-2 bg-green-500 rounded-full px-2 py-1">
//                         <Text className="text-xs font-semibold text-white">New</Text>
//                     </View>
//                 )}
//             </View>
//             <View className="p-4">
//                 <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
//                     {item.brandname} {item.carname}
//                 </Text>
//                 <Text className="text-sm text-gray-600 mt-1" numberOfLines={1}>
//                     {item.modalname}
//                 </Text>
//                 <View className="flex-row justify-between items-center mt-2">
//                     <Text className="text-xs font-medium text-gray-500">{item.bodytype || 'N/A'}</Text>
//                     <Text className="text-sm font-bold text-blue-600">{item.price}</Text>
//                 </View>
//                 <Text className="text-xs text-gray-400 mt-1">Year: {item.manufactureyear || 'N/A'}</Text>
//             </View>
//         </LinearGradient>
//     </Pressable>
// );

const DealerDetails = () => {
    const toastConfig = {
        success: (props) => (
            <BaseToast {...props} style={{ borderLeftColor: "#22c55e", backgroundColor: "#f0fdf4" }} text1Style={{ fontSize: 16, fontWeight: "600", color: "#166534" }} text2Style={{ fontSize: 14, color: "#1f2937" }} />
        ),
        error: (props) => (
            <BaseToast {...props} style={{ borderLeftColor: "#ef4444", backgroundColor: "#fef2f2" }} text1Style={{ fontSize: 16, fontWeight: "600", color: "#991b1b" }} text2Style={{ fontSize: 14, color: "#1f2937" }} />
        ),
    };

    const dealerId = useLocalSearchParams().id;
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(images.avatar);
    const [dealerData, setDealerData] = useState([]);
    const [matchedBrands, setMatchedBrands] = useState([]);
    const [dealerCars, setDealerCars] = useState([]);
    const [groupedCarsByBrand, setGroupedCarsByBrand] = useState({});
    const [visibleCarsByBrand, setVisibleCarsByBrand] = useState({});
    const router = useRouter();

    const handleCardPress = (id) => router.push(`/vehicles/${id}`);

    const fetchDealerData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://carzchoice.com/api/dealerprofile/${dealerId}`);
            const apiDealerData = response.data?.dealerData?.[0];

            if (apiDealerData) {
                setDealerData(apiDealerData);
                setImage(apiDealerData.businesspics?.startsWith('http')
                    ? apiDealerData.businesspics
                    : `https://carzchoice.com/${apiDealerData.businesspics}`
                );
            }
        } catch (error) {
            console.error('Error fetching dealer data:', error);
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
            const response = await axios.get(`https://carzchoice.com/api/newcardealercarlist/${dealerId}`);
            if (response.data && response.data.dealercarlist) {
                const formattedData = Object.values(response.data.dealercarlist).map((item) => {
                    // console.log('formattedData', item);
                    let parsedImages = [];
                    try {
                        parsedImages = item.images ? JSON.parse(item.images) : [];
                    } catch (error) {
                        console.error("Error parsing images:", error);
                    }
                    let firstImage = parsedImages.length > 0 && parsedImages[0].imageurl
                        ? `https://carzchoice.com/${parsedImages[0].imageurl}`
                        : '1720680106_3.png';


                    return {
                        id: item.id,
                        carname: item.carname,
                        brandname: item.brandname,
                        modalname: item.carmodalname,
                        price: item.price,
                        pricetype: item.pricetype,
                        addimage: firstImage,
                        mileage: item.mileage,
                        bodytype: item.bodytype || '',
                        fueltype: item.fueltype,
                        transmission: item.transmission,
                        seatingcapacity: item.seatingcapacity || '',
                        engine: item.engine || '',
                        isNew: true, // You can adjust this logic as needed
                    };
                });

                setDealerCars(formattedData);
                const grouped = groupCarsByBrand(formattedData);
                setGroupedCarsByBrand(grouped);

                const initialVisible = {};
                Object.keys(grouped).forEach((brand) => {
                    initialVisible[brand] = 3;
                });
                setVisibleCarsByBrand(initialVisible);
            } else {
                console.error('Unexpected API response format:', response.data);
            }
        } catch (error) {
            console.error('Error fetching car data:', error);
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

    const loadMoreCars = (brand) => {
        setVisibleCarsByBrand((prev) => ({
            ...prev,
            [brand]: (prev[brand] || 3) + 6,
        }));
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
        <View className="bg-white rounded-lg shadow-sm mr-3 px-3 py-2 flex-row items-center">
            <Image
                source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${item.iconimage}` }}
                className="w-10 h-10 mr-2 rounded-full"
                resizeMode="contain"
            />
            <Text className="text-sm font-semibold text-gray-800">{item.label}</Text>
        </View>
    );

    const renderBrandSection = (brand, cars) => (
        <View key={brand} className="mb-8 px-5">
            <Text className="text-xl font-bold text-gray-900 mb-4">{brand}</Text>
            <FlatList
                data={cars.slice(0, visibleCarsByBrand[brand] || 3)}
                renderItem={({ item }) => (
                    <PopularCard item={item} onPress={() => handleCardPress(item.id)} />
                )}
                keyExtractor={(item, index) => item.id.toString() || index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 0,
                    gap: 16,
                    paddingBottom: 24,
                }}
                onEndReached={() => {
                    if (cars.length > visibleCarsByBrand[brand]) {
                        loadMoreCars(brand);
                    }
                }}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={<Text className="text-gray-500 text-center py-4">No cars found for {brand}</Text>}
            />
        </View>
    );

    return (
        <LinearGradient
            colors={['#e5e7eb', '#f3f4f6']}
            style={styles.container}
        >
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999 }}>
                <Toast config={toastConfig} position="top" />
            </View>
            <View className="flex-row justify-between items-center my-6 px-5">
                <Text className="text-2xl font-bold text-gray-900">Dealer Profile</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-white rounded-full w-12 h-12 items-center justify-center shadow-sm"
                >
                    <Image source={icons.backArrow} className="w-6 h-6" />
                </TouchableOpacity>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: '50%' }} />
            ) : (
                <FlatList
                    ListHeaderComponent={
                        <View className="px-5">
                            <LinearGradient
                                colors={['#ffffff', '#f8fafc']}
                                style={styles.dealerCard}
                            >
                                <View className="flex-row items-center p-5">
                                    <Image
                                        source={typeof image === 'string' ? { uri: image } : image}
                                        className="w-28 h-28 rounded-xl border border-gray-200"
                                    />
                                    <View className="ml-5 flex-1">
                                        <Text className="text-xl font-bold text-gray-900">{dealerData?.businessname || 'Business Name'}</Text>
                                        <Text className="text-sm text-gray-600 mt-1">Email: {dealerData?.email || 'N/A'}</Text>
                                        <Text className="text-sm text-gray-600">WhatsApp: {dealerData?.whatsappnumber || 'N/A'}</Text>
                                        <Text className="text-sm text-gray-600">Address: {dealerData?.district || 'N/A'}, {dealerData?.state || 'N/A'}, {dealerData?.pincode || 'N/A'}</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                            <View className="mt-8">
                                <Text className="text-xl font-bold text-gray-900 mb-4">Dealer's Brands</Text>
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
                                    <Text className="text-center text-gray-500 py-4">No Brands Found</Text>
                                )}
                            </View>
                            <View className="mt-8">
                                <Text className="text-xl font-bold text-gray-900 mb-4">Cars by Dealer</Text>
                            </View>
                        </View>
                    }
                    data={[]}
                    renderItem={() => null}
                    ListFooterComponent={
                        <View>
                            {Object.keys(groupedCarsByBrand).map((brand) => (
                                <View key={brand}>
                                    {renderBrandSection(brand, groupedCarsByBrand[brand])}
                                </View>
                            ))}
                            {Object.keys(groupedCarsByBrand).length === 0 && (
                                <Text className="text-center text-gray-500 py-10">No cars found.</Text>
                            )}
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 50 }}
                />
            )}
        </LinearGradient>
    );
};

export default DealerDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dealerCard: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    carCard: {
        width: 220,
        marginRight: 0, // Gap handled by contentContainerStyle
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    carCardGradient: {
        flex: 1,
    },
});
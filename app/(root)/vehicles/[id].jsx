import { StyleSheet, Image, Text, TouchableOpacity, View, ScrollView, Dimensions, ActivityIndicator, Share, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import icons from "@/constants/icons";
import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { useNavigation } from "@react-navigation/native";
import MortgageCalculator from "@/components/MortgageCalculator";
import Carousel from "react-native-reanimated-carousel";
import { AntDesign } from "@expo/vector-icons";
import FeaturesAccordion from "../../../components/FeaturesAccordion";
import SpecsAccordion from "../../../components/SpecsAccordion";
import Toast, { BaseToast } from 'react-native-toast-message';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Carcolorgallery from "../../../components/carcolorgallery";
import CarImageGallery from "../../../components/CarImageGallery";
import SimilarCars from "../../../components/SimilarCars";

const { width } = Dimensions.get("window");

const CarDetails = () => {
    const { id: CarId } = useLocalSearchParams();
    const [error, setError] = useState(null);
    const [CarData, setCarData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [CarGallery, setCarGallery] = useState([]);
    const [userData, setUserData] = useState({});
    const [loggedinUserId, setLoggedinUserId] = useState(null);
    const carouselRef = useRef(null);
    const navigation = useNavigation();
    const [specifications, setSpecifications] = useState([]);
    const [similarCarsData, setSimilarCarsData] = useState([]);
    const [features, setFeatures] = useState([]);
    const router = useRouter();

    const toastConfig = {
        success: (props) => (
            <BaseToast
                {...props}
                style={{ borderLeftColor: "green" }}
                text1Style={{ fontSize: 16, fontWeight: "bold" }}
                text2Style={{ fontSize: 14 }}
            />
        ),
        error: (props) => (
            <BaseToast
                {...props}
                style={{ borderLeftColor: "red" }}
                text1Style={{ fontSize: 16, fontWeight: "bold" }}
                text2Style={{ fontSize: 14 }}
            />
        ),
    };

    const shareCar = async () => {
        try {
            const CarUrl = `https://carzchoice.com/carlistingdetails/${CarId}`;
            const message = `View my Car: ${CarUrl}`;

            const result = await Share.share({
                message: message,
                url: CarUrl,
                title: "Check out this Car!",
            });
            if (result.action === Share.sharedAction) {
                console.log("Car shared successfully!");
            } else if (result.action === Share.dismissedAction) {
                console.log("Share dismissed.");
            }
        } catch (error) {
            console.error("Error sharing Car:", error);
        }
    };


    const fetchUserData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('userData');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                setUserData(parsedData);
                setLoggedinUserId(parsedData.id);
            }
        } catch (error) {
            console.error("❌ Error fetching user data:", error);
        }
    };

    const handleEnquiry = async () => {
        try {
            setLoading(true);
            const storedData = await AsyncStorage.getItem('userData');
            if (!storedData) {
                Toast.show({ type: 'error', text1: 'Error', text2: 'User data not found.' });
                return;
            }
            const parsedUserData = JSON.parse(storedData);
            const carImage = CarGallery?.length > 0 ? CarGallery[0] : null;

            const enquiryData = {
                fullname: parsedUserData.fullname || "Unknown",
                userid: parsedUserData.id,
                carid: CarId,
                mobile: parsedUserData.contactno,
                email: parsedUserData.email,
                vehiclename: `${CarData?.manufactureyear} ${CarData?.brandname} ${CarData?.carname} ${CarData?.modalname}`,
                city: parsedUserData.district,
                statename: CarData?.state,
                leadstatus: 'interested',
                remarks: `Interested in ${CarData?.manufactureyear} ${CarData?.brandname} ${CarData?.carname} ${CarData?.modalname}`,
            };

            const response = await axios.post('https://carzchoice.com/api/submit-enquiry', enquiryData);
            if (response.data?.success) {
                Toast.show({ type: 'success', text1: 'Success', text2: 'Enquiry submitted successfully!' });
                router.push({ pathname: "/chat" });
            } else {
                throw new Error(response.data?.message || 'Failed to submit enquiry.');
            }
        } catch (error) {
            console.error("Error submitting enquiry or starting chat:", error);
            Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChatPress = () => {
        router.push({ pathname: "/chat" });
    };

    const fetchCarData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`https://carzchoice.com/api/carlistingdetails/${CarId}`);
            if (response.data?.data?.cardetails) {
                let apiData = response.data.data.cardetails;
                let parsedSpecifications = [];
                let parsedFeatures = [];
                // console.log('similarcars variants', response.data.data.similarcars);
                try {
                    if (Array.isArray(apiData.specifications) && apiData.specifications.length > 0) {
                        let parsedSpecData = JSON.parse(apiData.specifications[0]);
                        if (Array.isArray(parsedSpecData)) {
                            parsedSpecifications = parsedSpecData.map((spec) => ({
                                name: spec.type || "Unknown",
                                details: [{
                                    label: spec.label || "N/A",
                                    value: spec.value || "N/A"
                                }]
                            }));
                        }
                    }
                } catch (error) {
                    console.error("❌ Error parsing specifications:", error);
                }

                try {
                    let rawFeatures = apiData.features;
                    if (Array.isArray(rawFeatures) && rawFeatures.length > 0 && typeof rawFeatures[0] === "string") {
                        rawFeatures = JSON.parse(rawFeatures[0]);
                    }
                    if (Array.isArray(rawFeatures)) {
                        parsedFeatures = rawFeatures.map((feature) => ({
                            name: feature?.type || "Unknown",
                            details: Array.isArray(feature?.label) ? feature.label : []
                        }));
                    }
                } catch (error) {
                    console.error("❌ Error parsing features:", error);
                }

                try {
                    let imageBaseURL = "https://carzchoice.com/assets/backend-assets/images/";
                    let imagesArray = [];
                    if (typeof apiData.images === "string") {
                        imagesArray = JSON.parse(apiData.images);
                    } else if (Array.isArray(apiData.images)) {
                        imagesArray = apiData.images;
                    }
                    const formattedImages = imagesArray
                        .filter(image => typeof image === 'string' && image.trim() !== '')
                        .map(image => `${imageBaseURL}${image.replace(/\\/g, "/")}`);
                    setCarGallery(formattedImages);
                } catch (error) {
                    console.error("❌ Error formatting images:", error);
                }
                setCarData(apiData);
                setSpecifications(parsedSpecifications);
                setFeatures(parsedFeatures);
                setSimilarCarsData(response.data.data.similarcars);

            } else {
                throw new Error("Car details not found in response.");
            }
        } catch (error) {
            if (error.response) {
                console.error("❌ API Error:", error.response.status, error.response.data);
                setError(error.response.status === 404 ? "Car not found. Please check the Car ID." : `Error ${error.response.status}: ${error.response.data?.message || "Something went wrong."}`);
            } else if (error.request) {
                console.error("❌ Network Error: No response received from server.");
                setError("Network error. Please try again later.");
            } else {
                console.error("❌ Unexpected Error:", error.message);
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    const [routes] = useState([
        { key: 'overview', title: 'Overview' },
        { key: 'price', title: 'Price' },
        { key: 'compare', title: 'Compare' },
        { key: 'variants', title: 'Variants' },
        { key: 'colours', title: 'Colours' },
        { key: 'specs', title: 'Specs & Features' },
        { key: 'images', title: 'Images' },
        { key: 'pros', title: 'Pros & Cons' },
        { key: 'faq', title: 'FAQ' },
    ]);
    const [index, setIndex] = useState(0);

    const renderTabBar = props => (
        <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={{ backgroundColor: 'white' }}
            style={{ backgroundColor: '#0061ff' }}
            tabStyle={{ width: 'auto', paddingHorizontal: 16 }}
            labelStyle={{ fontSize: 14, fontWeight: 'bold' }}
            renderLabel={({ route, focused }) => (
                <Text
                    style={{
                        color: focused ? '#fff' : '#ccc',
                        fontWeight: 'bold',
                    }}
                >
                    {route.title}
                </Text>
            )}
        />
    );

    const carDetails = [
        {
            key: 'Fuel Type',
            icon: icons.fuel,
            value: (() => {
                try {
                    const fuelData = JSON.parse(CarData?.fueltype || '""');
                    return Array.isArray(fuelData) ? fuelData.join(', ') : fuelData;
                } catch {
                    return CarData?.fueltype || '-';
                }
            })()
        },
        {
            key: 'Mileage',
            icon: icons.seats,
            value: (() => {
                try {
                    const mileageData = JSON.parse(CarData?.mileage || '{}');
                    return Object.entries(mileageData)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                } catch {
                    return CarData?.mileage || '-';
                }
            })()
        },
        { key: 'Seats', icon: icons.seats, value: CarData?.seatingcapacity || '-' },
        { key: 'Body Type', icon: icons.seats, value: CarData?.bodytype || '-' },
        { key: 'Engine', icon: icons.engineDisplacement, value: CarData?.engine || '-' },
        {
            key: 'Transmission',
            icon: icons.transmission,
            value: (() => {
                try {
                    const transmissionData = JSON.parse(CarData?.transmission || '""');
                    return Array.isArray(transmissionData) ? transmissionData.join(', ') : transmissionData;
                } catch {
                    return CarData?.transmission || '-';
                }
            })()
        },
    ];

    const carMeta = [
        {
            id: 'fuel',
            icon: icons.fuel2,
            text: (() => {
                try {
                    const fuelData = JSON.parse(CarData?.fueltype || '""');
                    return Array.isArray(fuelData) ? fuelData.map(fuel => fuel.charAt(0).toUpperCase() + fuel.slice(1)).join(', ') : fuelData;
                } catch {
                    return CarData?.fueltype || '-';
                }
            })(),
            capitalize: CarData?.fueltype === 'CNG' ? 'uppercase' : 'capitalize'
        },
        {
            id: 'transmission',
            icon: icons.transmission2,
            text: (() => {
                try {
                    const transmissionData = JSON.parse(CarData?.transmission || '""');
                    return Array.isArray(transmissionData) ? transmissionData.map(trans => trans.charAt(0).toUpperCase() + trans.slice(1)).join(', ') : transmissionData;
                } catch {
                    return CarData?.transmission || '-';
                }
            })(),
            capitalize: 'capitalize'
        },
        {
            id: 'bodytype',
            icon: icons.kms,
            text: `${CarData?.bodytype || '-'}`,
            capitalize: ''
        }
    ];

    const renderImageItem = ({ item }) => {
        // console.log("Image item:", item);
        return (
            <View>
                <Image
                    source={{ uri: item }}
                    style={styles.tabImage}
                />
                <Text>{item.colorname}</Text>
            </View>
        )
    };

    const getImageItemLayout = (data, index) => ({
        length: 220,
        offset: 220 * index,
        index,
    });

    const renderScene = useMemo(() => SceneMap({
        overview: () => (
            <ScrollView style={styles.tabContent}>
                {!carDetails ? (
                    <Text className="text-gray-500">No car details available</Text>
                ) : (
                    <>
                        <View className="">
                            <View className="relative w-full">
                                {CarGallery.length > 0 ? (
                                    <>
                                        <TouchableOpacity style={styles.arrowLeft} onPress={() => carouselRef.current?.prev()}>
                                            <AntDesign name="left" size={24} color="white" />
                                        </TouchableOpacity>
                                        <Carousel
                                            ref={carouselRef}
                                            loop
                                            width={width}
                                            height={230}
                                            autoPlay={true}
                                            autoPlayInterval={7000}
                                            data={CarGallery}
                                            scrollAnimationDuration={3000}
                                            renderItem={renderCarouselItem}
                                        />
                                        <TouchableOpacity style={styles.arrowRight} onPress={() => carouselRef.current?.next()}>
                                            <AntDesign name="right" size={24} color="white" />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <View style={styles.noImageContainer}>
                                        <Text style={styles.noImageText}>No Images Available</Text>
                                    </View>
                                )}
                            </View>
                            <Text className="text-xl font-rubik-bold px-4 mt-3">
                                {CarData.brandname} {CarData.carname}
                            </Text>
                            <View className="flex-row flex-wrap px-4 mt-3">
                                {carMeta.map((item) => (
                                    <View key={item.id} className="flex-row items-center mr-7 mb-2">
                                        <View className="flex items-center justify-center bg-primary-100 rounded-full size-10">
                                            <Image source={item.icon} className="size-4" />
                                        </View>
                                        <Text className={`text-black-300 text-sm font-rubik-medium ml-2 ${item.capitalize}`}>
                                            {item.text}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                            <View className="flex-row border-t-1 mt-4 px-4">
                                <Text className="text-black-300 text-base font-rubik-medium mb-1 me-3">Price</Text>
                                <Text className="text-primary-300 text-base font-rubik-bold">
                                    {new Intl.NumberFormat('en-IN', {
                                        style: 'currency',
                                        currency: 'INR',
                                        maximumFractionDigits: 0,
                                    }).format(CarData.price)}
                                </Text>
                            </View>
                        </View>
                        <View className="flex flex-wrap flex-row mt-4 px-4">
                            {carDetails.map((item, index) => (
                                <View
                                    key={item.key}
                                    className="flex-row items-center mb-4 w-1/2"
                                >
                                    <View className="bg-gray-200 rounded-full p-2 mr-3">
                                        <Image source={item.icon} className="w-6 h-6" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-rubik-medium text-black">{item.key}:</Text>
                                        <Text className="text-sm text-gray-900 font-rubik" numberOfLines={2}>{item.value}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        ),
        price: () => {

            return (
                <View>
                    <Text style={styles.tabTitle}>EMI Calculator</Text>
                    <ScrollView style={styles.tabContent}>
                        <MortgageCalculator totalprice={Number(CarData?.price || 0)} />
                    </ScrollView>
                </View>
            )
        },
        compare: () => (
            <ScrollView style={styles.tabContent}>
                <Text style={styles.tabTitle}>Compare</Text>
                <Text>Comparison with other cars will be added here.</Text>
            </ScrollView>
        ),
        variants: () => {

            return (
                <View>
                    <Text style={styles.tabTitle}>Variants</Text>
                    <ScrollView style={styles.tabContent}>
                        <SimilarCars data={similarCarsData} />
                    </ScrollView>
                </View>
            )
        },
        colours: () => (
            <View style={styles.tabContent}>
                <View className="px-2 my-4">
                    <Text className="text-xl font-rubik-bold px-4 my-3">
                        {CarData.brandname} {CarData.carname}
                    </Text>
                    <ScrollView className="">
                        <Carcolorgallery id={CarId} />
                    </ScrollView>
                </View>
            </View>
        ),
        specs: () => (
            <ScrollView style={styles.tabContent}>
                <Text style={styles.tabTitle}>Specs & Features</Text>
                {Array.isArray(features) && features.length > 0 ? (
                    <View className="bg-white rounded-lg pb-5">
                        <Text className="text-xl font-rubik-bold text-primary-300 m-5">Car Features</Text>
                        <FeaturesAccordion features={features} />
                    </View>
                ) : (
                    <Text>No features available.</Text>
                )}
                {Array.isArray(specifications) && specifications.length > 0 ? (
                    <View className="bg-white rounded-lg pb-5 my-5">
                        <Text className="text-xl font-rubik-bold text-primary-300 m-5">Car Specifications</Text>
                        <SpecsAccordion specifications={specifications} />
                    </View>
                ) : (
                    <Text>No specifications available.</Text>
                )}
            </ScrollView>
        ),
        images: () => (
            <View style={styles.tabContent}>
                <Text className="text-xl font-rubik-bold px-4 my-3">
                    {CarData.brandname} {CarData.carname} Images
                </Text>
                <CarImageGallery id={CarId} />
            </View>
        ),
        pros: () => (
            <ScrollView style={styles.tabContent}>
                <Text style={styles.tabTitle}>Pros & Cons</Text>
                <Text>Pros and cons will be added here.</Text>
            </ScrollView>
        ),
        faq: () => (
            <ScrollView style={styles.tabContent}>
                <Text style={styles.tabTitle}>FAQ</Text>
                <Text>Frequently asked questions will be added here.</Text>
            </ScrollView>
        ),
    }), [carDetails, CarGallery, features, specifications, CarData]);

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (CarId && loggedinUserId !== null) {
            fetchCarData().then(() => {
                if (isMounted) setLoading(false);
            });
        }
        return () => { isMounted = false; };
    }, [CarId, loggedinUserId]);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0061ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!CarData) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.noDataText}>No car data available</Text>
            </View>
        );
    }

    const renderCarouselItem = ({ item }) => (
        <View style={styles.slide}>
            <Image source={{ uri: item }} style={styles.image} />
        </View>
    );

    return (
        <View className="flex-1">
            <Toast config={toastConfig} position="bottom" />
            <View style={[styles.tabView, { paddingBottom: 80 }]}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width }}
                    renderTabBar={renderTabBar}
                />
            </View>

            <View style={styles.bottomButtonBar}>
                <View className="flex flex-row justify-between gap-4">
                    <TouchableOpacity
                        onPress={handleChatPress}
                        className="flex-1 flex-row items-center justify-center bg-green-600 py-3 rounded-full shadow-sm"
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Image source={icons.bubblechat} className="w-5 h-5 mr-2" />
                                <Text className="text-white text-lg font-rubik-bold">View Chat</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleEnquiry}
                        className="flex-1 flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-sm"
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Image source={icons.bubblechat} className="w-5 h-5 mr-2" />
                                <Text className="text-white text-lg font-rubik-bold">Send Enquiry</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',
        textAlign: 'center',
    },
    noDataText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        textAlign: 'center',
    },
    noImageContainer: {
        height: 230,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        fontSize: 16,
        color: '#666',
    },
    slide: {
        width: width,
        height: 230,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: width,
        height: 230,
        resizeMode: "cover",
    },
    arrowLeft: {
        position: "absolute",
        left: 10,
        top: "40%",
        zIndex: 1,
    },
    arrowRight: {
        position: "absolute",
        right: 10,
        top: "40%",
        zIndex: 1,
    },
    tabView: {
        flex: 1,
    },
    tabContent: {
        backgroundColor: '#f8f8f8',
        flexGrow: 1,
    },
    tabTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        // marginBottom: 10,
        padding: 20,
    },
    tabImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        marginBottom: 10,
        borderRadius: 8,
    },
    bottomButtonBar: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderWidth: 1,
        borderColor: 'white',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default CarDetails;
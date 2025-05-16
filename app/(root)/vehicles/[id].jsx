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
import VariantsList from "../../../components/VariantsList";
import ProsAndCons from "../../../components/ProsAndCons";
import CarFaq from "../../../components/CarFaq";
import CompareOtherCars from "../../../components/CompareOtherCars";

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
    const [prosConsData, setProsConsData] = useState([]);
    const [faqData, setFaqData] = useState([]);
    const [otherCardata, setOtherCardata] = useState([]);
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
            console.log('user data', parsedUserData);
            // Prepare enquiry data with fallbacks
            const enquiryData = {
                fullname: parsedUserData.fullname || "Unknown",
                userid: parsedUserData.id,
                carid: CarId,
                mobile: parsedUserData.contactno || "",
                email: parsedUserData.email || "",
                vehiclename: `${CarData?.manufactureyear || ''} ${CarData?.brandname || ''} ${CarData?.carname || ''} ${CarData?.modalname || ''}`.trim() || "Unknown Vehicle",
                city: parsedUserData.district || "",
                statename: parsedUserData?.state || "",
                leadstatus: 'interested',
                remarks: `Interested in ${CarData?.manufactureyear || ''} ${CarData?.brandname || ''} ${CarData?.carname || ''} ${CarData?.modalname || ''}`.trim() || "Interested in a vehicle",
            };

            // Client-side validation
            const errors = [];
            if (!enquiryData.mobile) errors.push("Mobile number is required");
            if (!enquiryData.email) errors.push("Email is required");
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiryData.email)) errors.push("Email is invalid");
            if (!enquiryData.city) errors.push("City is required");
            if (!enquiryData.vehiclename) errors.push("Vehicle name is required");
            if (!enquiryData.statename) errors.push("State is required");

            if (errors.length > 0) {
                Toast.show({ type: 'error', text1: 'Validation Error', text2: errors.join('. ') });
                return;
            }

            console.log('Submitting enquiry with data:', enquiryData);
            const response = await axios.post('https://carzchoice.com/api/bookvehiclenow', enquiryData);
            if (response.data?.success) {
                Toast.show({ type: 'success', text1: 'Success', text2: 'Enquiry submitted successfully!' });
            } else {
                throw new Error(response.data?.message || 'Failed to submit enquiry.');
            }
        } catch (error) {
            console.error("Error submitting enquiry ", error);
            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors;
                const errorMessage = Object.values(validationErrors).flat().join(' ');
                Toast.show({ type: 'error', text1: 'Validation Error', text2: errorMessage || 'Please check your input.' });
            } else {
                Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'An error occurred. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
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

                // console.log('apidata', response.data.data.variantsfaqs);

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
                setSimilarCarsData(response.data.data.cardetails.variants);
                setProsConsData({
                    pros: response.data.data.pros,
                    cons: response.data.data.cons
                });
                setFaqData(response.data.data.variantsfaqs);
                setOtherCardata(response.data.data.similarcars);

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
        { key: 'overview', title: 'OVERVIEW' },
        { key: 'variants', title: 'VARIANTS' },
        { key: 'colours', title: 'COLOURS' },
        { key: 'images', title: 'IMAGES' },
        { key: 'specs', title: 'FEATURES & SPECS.' },
        { key: 'compare', title: 'COMPARE' },
        { key: 'emi', title: 'EMI' },
        { key: 'pros', title: 'PROS & CONS' },
        { key: 'faq', title: 'FAQ' },
    ]);
    const [index, setIndex] = useState(0);
    // Find the index of the 'specs' tab
    const specsTabIndex = routes.findIndex(route => route.key === 'specs');
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
            icon: icons.oil,
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
            icon: icons.fast,
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
        { key: 'Seats', icon: icons.seat, value: CarData?.seatingcapacity || '-' },
        { key: 'Body Type', icon: icons.chassis, value: CarData?.bodytype || '-' },
        { key: 'Engine', icon: icons.piston, value: CarData?.engine || '-' },
        {
            key: 'Transmission',
            icon: icons.gearshift,
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
                                        <TouchableOpacity style={styles.arrowLeft} onPress={() => carouselRef.current?.prev()} className="bg-white p-2 rounded-full">
                                            <AntDesign name="left" size={24} color="black" />
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
                                        <TouchableOpacity style={styles.arrowRight} onPress={() => carouselRef.current?.next()} className="bg-white p-2 rounded-full">
                                            <AntDesign name="right" size={24} color="black" />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <View style={styles.noImageContainer}>
                                        <Text style={styles.noImageText}>No Images Available</Text>
                                    </View>
                                )}
                            </View>
                            <View className="bg-white p-3 m-3 rounded-lg shadow-md">
                                <Text className="text-xl font-rubik-bold px-4 mt-3 text-primary-300">
                                    {CarData.brandname} {CarData.carname}
                                </Text>
                                <Text className="text-base font-rubik-bold px-4 mt-1">
                                    ( {CarData.carmodalname} )
                                </Text>

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

                        </View>
                        <View className="flex flex-wrap flex-row item-center justify-start m-3 p-3 shadow-md bg-white rounded-lg">
                            {carDetails.map((item, index) => (
                                <View
                                    key={item.key}
                                    className="flex-row items-center mb-4 w-1/2 py-3 px-2"
                                >
                                    <View className="bg-gray-100 rounded-full p-2 mr-3">
                                        <Image source={item.icon} className="size-7" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-rubik text-gray-500">{item.key}:</Text>
                                        <Text className="text-base text-black font-rubik-medium" numberOfLines={2}>{item.value}</Text>
                                    </View>
                                </View>
                            ))}
                            <TouchableOpacity className="flex flex-row px-3 align-center"
                                onPress={() => setIndex(specsTabIndex)}
                            >
                                <Text className="font-rubik-bold text-primary-300">See more</Text>
                                <Image source={icons.bluerightarrow} className="size-4 mt-1" />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>
        ),
        emi: () => {

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
            <View style={styles.tabContent}>
                {/* <Text style={styles.tabTitle}>Compare</Text> */}
                <CompareOtherCars data={otherCardata} headerTitle={`Compare ${CarData.brandname} ${CarData.carname} with similar cars`} currentCar={`${CarData.brandname} ${CarData.carname}`} currentCarId={CarId} />
            </View>
        ),
        variants: () => {
            return (
                <View className="flex-1">
                    <VariantsList
                        data={similarCarsData}
                        headerTitle={`${CarData.brandname} ${CarData.carname} variants price list`}
                    />
                </View>
            )
        },
        colours: () => (
            <View style={styles.tabContent}>
                <Text className="text-xl font-rubik-bold px-4 my-3">
                    {CarData.brandname} {CarData.carname}
                </Text>
                <ScrollView className="">
                    <Carcolorgallery id={CarId} />
                </ScrollView>
            </View>
        ),
        specs: () => (
            <View style={styles.tabContent}>
                <Text className="text-xl font-rubik-bold px-4 my-3">
                    Features & Specifications
                </Text>
                <ScrollView>

                    {Array.isArray(features) && features.length > 0 ? (
                        <View className="bg-white rounded-lg pb-5">
                            <Text className="text-xl font-rubik-bold text-primary-300 m-5">Car Features</Text>
                            <FeaturesAccordion features={features} />
                        </View>
                    ) : (
                        <Text className="p-3">No features available.</Text>
                    )}
                    {Array.isArray(specifications) && specifications.length > 0 ? (
                        <View className="bg-white rounded-lg pb-5 my-5">
                            <Text className="text-xl font-rubik-bold text-primary-300 m-5">Car Specifications</Text>
                            <SpecsAccordion specifications={specifications} />
                        </View>
                    ) : (
                        <Text className="p-3">No specifications available.</Text>
                    )}
                </ScrollView>
            </View>
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
            <View>
                <ScrollView style={styles.tabContent}>
                    <ProsAndCons data={prosConsData} headerTitle={` Pros & Cons of ${CarData.brandname} ${CarData.carname}`} />
                </ScrollView>
            </View>
        ),
        faq: () => (
            <ScrollView style={styles.tabContent}>
                <CarFaq data={faqData} headerTitle={` FAQ of ${CarData.brandname} ${CarData.carname}`} />
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
                        onPress={shareCar}
                        className="flex-1 flex-row items-center justify-center bg-green-600 py-3 rounded-full shadow-sm"
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Image source={icons.shareCar} className="w-5 h-5 mr-2" />
                                <Text className="text-white text-lg font-rubik-bold">Share</Text>
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
        // backgroundColor: '#f8f8f8',
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
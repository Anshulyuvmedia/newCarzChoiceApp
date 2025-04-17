
import { StyleSheet, Image, FlatList, ScrollView, Alert, Text, TouchableOpacity, View, Dimensions, Platform, ActivityIndicator, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import icons from "@/constants/icons";
import images from "@/constants/images";
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { useNavigation } from "@react-navigation/native";
import MortgageCalculator from "@/components/MortgageCalculator";
import * as Linking from 'expo-linking';
import Carousel from "react-native-reanimated-carousel";
import { AntDesign } from "@expo/vector-icons";
import FeaturesAccordion from "../../../components/FeaturesAccordion";
import SpecsAccordion from "../../../components/SpecsAccordion";
import Toast, { BaseToast } from 'react-native-toast-message';
import moment from 'moment';
import RBSheet from "react-native-raw-bottom-sheet";

const { width } = Dimensions.get("window");
const CarDetails = () => {
    const CarId = useLocalSearchParams().id;
    const refRBSheet = useRef();
    const windowHeight = Dimensions.get("window").height;
    const [error, setError] = useState(null);
    const [CarData, setCarData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [CarThumbnail, setCarThumbnail] = useState(images.avatar);
    const [CarGallery, setCarGallery] = useState([]);

    const [loggedinUserId, setLoggedinUserId] = useState([]);
    const carouselRef = useRef(null);
    const navigation = useNavigation();
    const [specifications, setSpecifications] = useState([]);
    const [features, setFeatures] = useState([]);
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
    const openWhatsApp = (phoneNumber) => {
        let url = "";

        if (Platform.OS === "android") {
            url = `whatsapp://send?phone=${phoneNumber}`;
        } else {
            url = `https://wa.me/${phoneNumber}`; // iOS uses wa.me
        }

        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Alert.alert("WhatsApp is not installed");
                }
            })
            .catch((err) => console.error("An error occurred", err));
    };

    const handleEnquiry = async () => {
        try {
            setLoading(true); // Show loading indicator
            const storedData = await AsyncStorage.getItem('userData');

            if (!storedData) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'User data not found.',
                });
                setLoading(false);
                return;
            }

            const parsedUserData = JSON.parse(storedData);

            const enquiryData = {
                fullname: parsedUserData.fullname || "Unknown",
                userid: parsedUserData.id,
                carid: CarId,
                mobile: parsedUserData.contactno,
                email: parsedUserData.email,
                vehiclename: `${CarData.manufactureyear} ${CarData.brandname} ${CarData.carname} ${CarData.modalname}`,
                city: parsedUserData.district,
                statename: CarData.state,
                leadstatus: 'interested',
                remarks: `Interested in ${CarData.manufactureyear} ${CarData.brandname} ${CarData.carname} ${CarData.modalname}`,
            };

            // console.log("Sending Enquiry Data:", enquiryData);

            const response = await axios.post("https://carzchoice.com/api/bookvehiclenow", enquiryData, {
                headers: { "Content-Type": "application/json" }
            });

            // console.log("Full API Response:", response.data);

            // Fix success check
            if (response.data.success === true) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Enquiry submitted successfully!',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Submission Failed',
                    text2: response.data.message || "Unknown error",
                });
            }
        } catch (error) {
            console.error("Error submitting enquiry:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'An error occurred. Please try again.',
            });
        } finally {
            setLoading(false);
        }
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

    const fetchCarData = async () => {
        setLoading(true);
        setError(null); // Reset error state before fetching

        try {
            // console.log("Fetching car data...",CarId);
            const response = await axios.get(`https://carzchoice.com/api/oldcarlistingdetails/${CarId}`);

            // console.log("API Response:", response.data);

            if (response.data?.data?.cardetails) {
                let apiData = response.data.data.cardetails;
                let parsedSpecifications = [];
                let parsedFeatures = [];
                let formattedImages = [];

                // ✅ Parse Specifications
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
                        } else {
                            console.warn("⚠️ Parsed specifications is not an array:", parsedSpecData);
                        }
                    } else {
                        console.warn("⚠️ No valid specifications found.");
                    }
                } catch (error) {
                    console.error("❌ Error parsing specifications:", error);
                }

                // ✅ Parse Features
                try {
                    let rawFeatures = apiData.features;
                    if (Array.isArray(rawFeatures) && rawFeatures.length > 0 && typeof rawFeatures[0] === "string") {
                        rawFeatures = JSON.parse(rawFeatures[0]); // Convert first element (if stringified JSON)
                    }
                    if (Array.isArray(rawFeatures)) {
                        parsedFeatures = rawFeatures.map((feature) => ({
                            name: feature?.type || "Unknown",
                            details: Array.isArray(feature?.label) ? feature.label : []
                        }));
                    } else {
                        console.warn("⚠️ No valid features found.");
                    }
                } catch (error) {
                    console.error("❌ Error parsing features:", error);
                }

                // ✅ Handle Gallery Images
                try {
                    let imageBaseURL = "https://carzchoice.com/";
                    let fallbackImage = "https://carzchoice.com/assets/backend-assets/images/1721106135_9.png";

                    let imagesArray = [];
                    if (typeof apiData.images === "string") {
                        imagesArray = JSON.parse(apiData.images);
                    }

                    formattedImages = imagesArray.map(image =>
                        `${imageBaseURL}${image.imageurl.replace(/\\/g, "/")}`
                    );

                } catch (error) {
                    console.error("❌ Error parsing images:", error);
                }

                // ✅ Update state
                setCarData(apiData);
                setSpecifications(parsedSpecifications);
                setFeatures(parsedFeatures);
                setCarGallery(formattedImages);

            } else {
                throw new Error("Car details not found in response.");
            }

        } catch (error) {
            if (error.response) {
                // API returned an error response
                console.error("❌ API Error:", error.response.status, error.response.data);
                if (error.response.status === 404) {
                    setError("Car not found. Please check the Car ID.", error.response.data?.message);
                } else {
                    setError(`Error ${error.response.status}: ${error.response.data?.message || "Something went wrong."}`);
                }
            } else if (error.request) {
                // Network error or no response
                console.error("❌ Network Error: No response received from server.");
                setError("Network error. Please try again later.");
            } else {
                // Other errors
                console.error("❌ Unexpected Error:", error.message);
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        let isMounted = true;
        if (CarId) {
            fetchCarData().then(() => {
                if (isMounted) setLoading(false);
            });
        }
        return () => { isMounted = false; };  // Cleanup on unmount
    }, [CarId]);




    // ✅ Loading State
    if (loading) {
        return <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 400 }} />;
    }

    // ✅ Error State
    if (error) {
        return (
            <View className="flex-1 items-center justify-center p-5">
                <Text className="text-lg font-bold text-red-500">{error}</Text>
            </View>
        );
    }

    // ✅ No Data State
    if (!CarData) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-lg font-bold text-gray-500">No car data available</Text>
            </View>
        );
    }

    const carDetails = [
        { key: 'Registration Year', icon: icons.registrationYear, value: CarData.registeryear || '-' },
        { key: 'Insurance', icon: icons.insuranceValidity, value: CarData.insurance || '-' },
        { key: 'Fuel Type', icon: icons.fuel, value: CarData.fueltype || '-' },
        { key: 'Seats', icon: icons.seats, value: CarData.seats || '-' },
        { key: 'Kms Driven', icon: icons.kmsDriven, value: `${CarData.kilometersdriven || '-'} Kms` },
        { key: 'RTO', icon: icons.rto, value: CarData.district || '-' },
        { key: 'Ownership', icon: icons.ownership, value: CarData.ownernumbers || '-' },
        { key: 'Engine Displacement', icon: icons.engineDisplacement, value: CarData.engine || '-' },
        { key: 'Transmission', icon: icons.transmission, value: CarData.transmissiontype },
        { key: 'Year of Manufacture', icon: icons.yearManufacture, value: CarData.manufactureyear || '-' },
        { key: 'Color', icon: icons.color, value: CarData.color || '-' },
        { key: 'Last Updated', icon: icons.lastUpdated, value: CarData.lastupdated ? moment(CarData.lastupdated, "YYYY-MM-DD HH:mm:ss").fromNow(true) : '-' },
    ];

    const renderCarouselItem = ({ item }) => (
        <View style={styles.slide}>
            <Image source={{ uri: item }} style={styles.image} />
        </View>
    );

    const renderHeader = () => (
        <View className="relative w-full" >
            <View
                className="z-50 absolute inset-x-7"
                style={{ top: Platform.OS === "ios" ? 70 : 20, }}
            >
                <View className="flex flex-row items-center w-full justify-between">
                    <TouchableOpacity onPress={() => router.back()}
                        className="flex flex-row bg-white rounded-full size-11 items-center justify-center"
                    >
                        <Image source={icons.backArrow} className="size-5" />
                    </TouchableOpacity>
                    <View className="flex flex-row items-center gap-3">
                        {CarData.roleid == loggedinUserId &&
                            <Text className={`inline-flex items-center rounded-md capitalize px-2 py-1 text-xs font-rubik ring-1 ring-inset ${CarData.status === 'published' ? ' bg-green-50  text-green-700  ring-green-600/20 ' : 'bg-red-50  text-red-700 ring-red-600/20'}`}>{CarData.status}</Text>
                        }
                        {/* <Image source={icons.heart} className="size-7" tintColor={"#191D31"}/> */}
                        <TouchableOpacity onPress={shareCar}
                            className="flex flex-row bg-white rounded-full size-11 items-center justify-center"
                        >
                            <Image source={icons.send} className="size-7" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
                <Text>No Images Available</Text>
            )}

        </View>
    );

    const renderItem = ({ item }) => (
        <View className='px-5 mt-2 flex gap-2'>
            {item}
        </View>
    );

    const carMeta = [
        {
            id: 'fuel',
            icon: icons.fuel2,
            text: CarData.fueltype,
            capitalize: CarData.fueltype === 'CNG' ? 'uppercase' : 'capitalize'
        },
        {
            id: 'transmission',
            icon: icons.transmission2,
            text: CarData.transmissiontype,
            capitalize: 'capitalize'
        },
        {
            id: 'kms',
            icon: icons.kms,
            text: `${CarData.kilometersdriven} kms`,
            capitalize: ''
        }
    ];

    return (
        <View className="pb-24">
            <FlatList
                data={[
                    <Toast config={toastConfig} position="top" />,
                    <Text className='text-xl font-rubik-bold'>{CarData.manufactureyear} {CarData.brandname} {CarData.carname} {CarData.modalname}</Text>,
                    <View className='flex flex-row items-center gap-3'>
                        <View className='flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full'>
                            <Text className='text-xs font-rubik-bold text-primary-300'> State: </Text>
                            <Text className='text-xs font-rubik-bold '> {CarData.state}</Text>
                        </View>
                        <View className='flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full'>
                            <Text className='text-xs font-rubik-bold text-primary-300'> City: </Text>
                            <Text className='text-xs font-rubik-bold capitalize'> {CarData.district}</Text>
                        </View>
                        <View className='flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full'>
                            <Text className='text-xs font-rubik-bold text-primary-300'> Color: </Text>
                            <Text className='text-black-300 text-sm font-rubik-medium ml-2'>{CarData.color}</Text>
                        </View>
                    </View>,

                    <FlatList
                        data={carMeta}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 16 }}
                        renderItem={({ item }) => (
                            <View className='flex-row items-center mr-7'>
                                <View className='flex items-center justify-center bg-primary-100 rounded-full size-10'>
                                    <Image source={item.icon} className='size-4' />
                                </View>
                                <Text className={`text-black-300 text-sm font-rubik-medium ml-2 ${item.capitalize}`}>
                                    {item.text}
                                </Text>
                            </View>
                        )}
                    />,

                    carDetails && (
                        <View className="bg-white drop-shadow-sm px-5 py-3 rounded-lg mb-5">
                            <Text className='text-xl font-rubik-bold text-primary-300'>Car Overview</Text>
                            <FlatList
                                data={carDetails}
                                keyExtractor={(item) => item.key}
                                className=""
                                renderItem={({ item }) => (
                                    <View className="flex flex-row justify-between my-2">
                                        <View className="flex flex-row items-center justify-start gap-2">
                                            <Image source={item.icon} className="w-5 h-5" />
                                            <Text className="text-black text-base font-rubik-medium ">{item.key}:</Text>
                                        </View>
                                        <Text className="text-black-200 text-base font-rubik-medium capitalize">{item.value}</Text>
                                    </View>
                                )}
                                scrollEnabled={false}
                                nestedScrollEnabled={true}
                            />
                        </View>
                    ),
                    <View>
                        {Array.isArray(features) && features.length > 0 && (
                            <View className="bg-white rounded-lg pb-5">
                                <Text className="text-xl font-rubik-bold text-primary-300 m-5">Car Features</Text>
                                <FeaturesAccordion features={features} />
                            </View>
                        )
                        }
                    </View>,
                    <View>
                        {Array.isArray(specifications) && specifications.length > 0 && (
                            <View className="bg-white rounded-lg pb-5">
                                <Text className="text-xl font-rubik-bold text-primary-300 m-5">Car Specifications</Text>
                                <SpecsAccordion specifications={specifications} />
                            </View>
                        )
                        }
                    </View>,


                    <TouchableOpacity
                        onPress={() => refRBSheet.current.open()}
                        style={{
                            backgroundColor: "white",
                            borderColor: "#0061FF",
                            borderWidth: 2,
                            paddingHorizontal: 20,
                            paddingVertical: 12,
                            borderRadius: 100,
                            marginBottom: 20,
                        }}
                    >
                        <Text style={{ color: "#0061FF", fontSize: 16, textAlign: 'center', fontWeight: 600 }}>🧮 Calculate Your EMI</Text>
                    </TouchableOpacity>,

                    <RBSheet
                        ref={refRBSheet}
                        height={550}
                        openDuration={300}
                        closeOnDragDown={true}
                        customStyles={{
                            container: {
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                paddingHorizontal: 10,
                            },
                        }}
                        closeOnPressMask={false}
                        keyboardAvoidingViewEnabled={true}
                    >
                        <MortgageCalculator closeSheet={() => refRBSheet.current.close()} totalprice={Number(CarData.price)} />
                    </RBSheet>

                ]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
            />

            <View className="absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 p-7">
                <View className="flex flex-row items-center justify-between gap-10">
                    <View className="flex flex-col items-start">
                        <Text className="text-black-200 text-xs font-rubik-medium">Price</Text>
                        <Text numberOfLines={1} className="text-primary-300 text-start text-2xl font-rubik-bold">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(CarData.price)}
                        </Text>
                    </View>


                    <TouchableOpacity onPress={() => handleEnquiry()} className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400">
                        <Text className="text-white text-lg text-center font-rubik-bold">Enquire Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default CarDetails

const styles = StyleSheet.create({
    slide: {
        width: width,
        height: 230, // match Carousel height
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: width,
        height: 230,
        resizeMode: "cover", // or "contain" depending on your need
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
    section: {
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    bullet: {
        fontSize: 16,
        marginRight: 8,
    },
    text: {
        fontSize: 16,
    },
    overviewbox: {
        backgroundColor: 'red',
    },

});
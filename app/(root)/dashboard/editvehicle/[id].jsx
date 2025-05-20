import { Image, StyleSheet, Text, ScrollView, TouchableOpacity, View, TextInput, FlatList, Platform, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import icons from '@/constants/icons';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import Toast, { BaseToast } from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const EditVehicle = () => {
    const { id } = useLocalSearchParams();
    const navigation = useNavigation();
    const [errors, setErrors] = useState(false);
    const [vehicleStatus, setVehicleStatus] = useState('Deactivate');
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);
    const [carData, setCarData] = useState(null);

    const [brandData, setBrandData] = useState([]);
    const [modalData, setModalData] = useState(null);
    const [variantData, setVariantData] = useState(null);
    const [cityData, setCityData] = useState(null);
    const [stateData, setStateData] = useState("");
    const [pincodeList, setPincodeList] = useState([]); // Store multiple pincodes

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModal, setSelectedModal] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [city, setCity] = useState(null);
    const [state, setState] = useState(null);
    const [pincode, setPincode] = useState("");
    const [insurance, setInsurance] = useState(null);
    const [color, setColor] = useState("");

    const [sellingPrice, setSellingPrice] = useState(null);
    const [kmsDriven, setKmsDriven] = useState(null);
    const [selectedFuel, setSelectedFuel] = useState(null);
    const [regType, setRegType] = useState(null);
    const [ownerChanged, setOwnerChanged] = useState(null);
    const [transmissionType, setTransmissionType] = useState(null);
    const [regYear, setRegYear] = useState(null);
    const [makeYear, setMakeYear] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    const [galleryImages, setGalleryImages] = useState([]);

    const [show, setShow] = useState(false);

    const buttonPreviousTextStyle = {
        paddingInline: 20,
        paddingBlock: 5,
        borderRadius: 10,
        backgroundColor: '#ff938f',
        color: 'black',
    };
    const buttonNextTextStyle = {
        paddingInline: 20,
        paddingBlock: 5,
        borderRadius: 10,
        backgroundColor: 'lightgreen',
        color: 'black',
    };

    const status = [
        { label: 'Deactivate', value: 'Deactivate' },
    ];
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

    // const validateStep = (step) => {
    //     if (step === 1) {
    //         return step1Data?.property_name && step1Data?.description && step1Data?.nearbylocation;
    //     }
    //     if (step === 2) {
    //         return step3Data?.sqfoot && step3Data?.bathroom && step3Data?.floor && step3Data?.city;
    //     }
    //     return true;
    // };

    const onNextStep = (step) => {
        if (!validateStep(step)) {
            setErrors(true);
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: "Please fill all required fields.",
            });
        } else {
            setErrors(false);
        }
    };

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Sorry, we need camera roll permissions to make this work!",
            });
            return false;
        }
        return true;
    };

    const pickGalleryImages = async () => {
        if (!(await requestPermissions())) return;

        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.5,
            });

            // console.log("🚀 Image Picker Result:", result); // Debugging log

            if (!result.canceled && result.assets?.length) {
                // Extract only the URI (ensuring no extra object nesting)
                const selectedImages = result.assets.map(image => image.uri);

                // console.log("✅ Processed Image URIs:", selectedImages);

                // Ensure state only stores an array of URIs (not objects)
                setGalleryImages(prevImages => [
                    ...prevImages,
                    ...selectedImages,
                ]);
            } else {
                console.warn("⚠️ No images selected.");
            }
        } catch (error) {
            console.error("❌ Error picking images:", error);
        }
    };

    const removeGalleryImage = async (index, imageUri) => {
        setGalleryImages(prevImages => prevImages.filter((_, i) => i !== index));

        if (imageUri.startsWith("http")) {
            try {
                await axios.post("https://carzchoice.com/api/deletefile", {
                    vehicle_id: carData.id,
                    file_type: "gallery",
                    file_path: imageUri.replace("https://carzchoice.com/", ""),
                });

                Toast.show({ type: "success", text1: "Image deleted successfully." });

                // Fetch updated images from API (optional, if required)
                // fetchUpdatedImages();
            } catch (error) {
                console.error("Failed to delete image:", error);
                Toast.show({ type: "error", text1: "Failed to delete image." });
            }
        }
    };

    // Handle Date Selection
    const handleLastUpdated = (event, date) => {
        if (date) {
            const formattedDate = date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
            setLastUpdate(formattedDate);
            setSelectedDate(date);
        }
        setShow(false); // Hide picker after selection
    };

    const getUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            const userToken = await AsyncStorage.getItem('userToken');

            return {
                userData: userData ? JSON.parse(userData) : null,
                userToken: userToken ? userToken : null
            };
        } catch (error) {
            console.error("Error fetching user data:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Could not retrieve user data.",
            });
            return null;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { userData } = await getUserData();
            if (!userData) {
                throw new Error("User is not authenticated. Token missing.");
            }
            const carId = carData?.id ?? id;
            const { id, user_type } = userData;

            const formData = new FormData();

            formData.append("userid", id ?? "");
            formData.append("brandname", selectedBrand);
            formData.append("carname", selectedModal);
            formData.append("modalname", selectedVariant);
            formData.append("district", city);
            formData.append("state", state);
            formData.append("pincode", pincode);
            formData.append("price", sellingPrice);
            formData.append("kilometersdriven", kmsDriven);
            formData.append("fueltype", selectedFuel);
            formData.append("registeryear", regYear);
            formData.append("manufactureyear", makeYear);
            formData.append("ownernumbers", ownerChanged);
            formData.append("transmissiontype", transmissionType);
            formData.append("color", color);
            formData.append("insurance", insurance || "Unavailable");
            formData.append("registertype", regType);
            formData.append("lastupdated", lastUpdate);
            formData.append("activationstatus", vehicleStatus);

            // ✅ Fix: Append Images as "images" array
            galleryImages.forEach((imageUri, index) => {
                if (imageUri) {
                    const fileType = imageUri.split('.').pop() || "jpeg";
                    formData.append(`images[${index}]`, {
                        uri: imageUri,
                        type: `image/${fileType}`,
                        name: `vehicle-image-${index}.${fileType}`,
                    });
                }
            });


            // console.log("Uploading FormData:");
            // for (let pair of formData.entries()) {
            //     console.log(pair[0], pair[1]);
            // }
            // console.log("Uploading FormData:", formData);

            // ✅ Send API Request
            const response = await axios.post(`https://carzchoice.com/api/updateOldCarData/${carId}`, formData, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "multipart/form-data; charset=utf-8",
                },
            });

            // console.log("API Response:", response.data);
            if (response.status === 200 && !response.data.error) {
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Property updated successfully!",
                });
            } else {
                console.error("❌ API Error:", response.data.message);
                Toast.show({
                    type: "error",
                    text1: "Failed to update property.",
                    text2: response.data.message || "An error occurred.",
                });
            }
        } catch (error) {
            console.error("❌ Error updating property:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to update property. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch Car Data
    const fetchCarData = async (id) => {
        try {
            // console.log("🚗 Fetching Vehicle ID:", id);

            const response = await axios.get(`https://carzchoice.com/api/getOldCarData/${id}`);
            // console.log("API Full Response:", response.data);

            if (response.data && response.data.success && response.data.data) {
                let apiData = response.data.data; // Correctly accessing nested `data`
                // console.log("API Full Response:", apiData);

                // ✅ Update states correctly
                setCarData(apiData);
                setSelectedBrand(apiData.brandname);
                setSelectedModal(apiData.carname);
                setSelectedVariant(apiData.modalname);
                setCity(apiData.district);
                setState(apiData.state);
                setPincode(apiData.pincode);
                setInsurance(apiData.insurance);
                setColor(apiData.color);
                setSellingPrice(apiData.price);
                setRegType(apiData.registertype);
                setRegYear(apiData.registeryear);
                setMakeYear(apiData.manufactureyear);
                setLastUpdate(apiData.lastupdated);
                setKmsDriven(apiData.kilometersdriven);
                setSelectedFuel(apiData.fueltype);
                setOwnerChanged(apiData.ownernumbers);
                setVehicleStatus(apiData.activationstatus);
                setTransmissionType(apiData.transmissiontype.toLowerCase()); // Normalize to lowercase


                // ✅ Handle Images
                let imageBaseURL = "https://carzchoice.com/";
                let fallbackImage = "https://carzchoice.com/assets/backend-assets/images/placeholder.png"; // Use an actual fallback URL
                let imagesArray = [];

                if (typeof apiData.images === "string") {
                    try {
                        imagesArray = JSON.parse(apiData.images);
                    } catch (error) {
                        console.error("❌ Error parsing images JSON:", error);
                    }
                }

                // ✅ Handle Gallery Images
                let formattedImages = imagesArray.map(image =>
                    `${imageBaseURL}${image.imageurl.replace(/\\/g, "/")}`
                );
                setGalleryImages(formattedImages);

                // console.log("✅ Car Data Fetched Successfully!");
            } else {
                console.error("⚠️ Unexpected API response format:", response.data);
            }
        } catch (error) {
            console.error("❌ Error fetching Car data:", error.response?.status, error.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (id) {
            fetchCarData(id);
        }
    }, [id]);

    const fetchBrandList = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://carzchoice.com/api/brandlist");
            if (response.data && response.data.data) {
                setBrandData(response.data.data); // API now sends correctly formatted {label, value}
                // console.log("Brand List:", brandData);
            } else {
                console.error("Unexpected API response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching brand list:", error);
        } finally {
            setLoading(false);
        }
    };

    const getCarModal = async (selectedBrand) => {
        if (!selectedBrand) return; // Ensure selectedBrand is valid
        setLoading(true);

        const url = `https://carzchoice.com/api/getCarModal/${selectedBrand}`;
        // console.log("Fetching:", url);

        try {
            const response = await axios.get(url);
            // console.log("Response:", response.data);

            if (response.data && response.data.carModal) {
                setModalData(response.data.carModal);
            } else {
                console.error("Unexpected API response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching car models:", error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    const getCarVariant = async (modalName) => {
        if (!modalName) return; // Ensure modalName is valid
        setLoading(true);
        try {
            const response = await axios.get(`https://carzchoice.com/api/getCarVariant/${modalName}`);
            if (response.data && response.data.carVariant) {
                setVariantData(response.data.carVariant.map((variant) => ({
                    label: String(variant), // Ensure it's a string
                    value: String(variant), // Ensure it's a string
                })));
            } else {
                console.error("Unexpected API response format:", response.data);
            }

        } catch (error) {
            console.error("Error fetching car variants:", error);
        } finally {
            setLoading(false);
        }
    };

    const getCityList = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://carzchoice.com/api/getCityList");
            // console.log("API Response:", response.data); // Debug API response

            if (response.data && Array.isArray(response.data.data)) {
                const formattedCities = response.data.data.map((city, index) => ({
                    label: city.District || `City ${index}`, // Use "District" instead of "name"
                    value: city.District || index, // Ensure a valid value
                }));

                // console.log("Formatted Cities:", formattedCities); // Debug formatted data
                setCityData(formattedCities);
            } else {
                console.error("Unexpected API response format:", response.data);
            }

        } catch (error) {
            console.error("Error fetching city list:", error);
        } finally {
            setLoading(false);
        }
    };

    const getLocationData = async (city) => {
        if (!city) return;
        setLoading(true);

        const url = `https://carzchoice.com/api/getLocationData/${city}`;
        // console.log("Fetching:", url);

        try {
            const response = await axios.get(url);
            // console.log("Response:", response.data);

            if (response.data && response.data.data) {
                const locationData = response.data.data;

                // Extract unique state (since all values are the same, pick the first)
                const uniqueState = Object.values(locationData)[0] || "";

                // Convert pincodes into an array for dropdown
                const pincodesArray = Object.keys(locationData).map((pincode) => ({
                    label: pincode, // Show pincode in dropdown
                    value: pincode, // Set value as pincode
                }));

                // Update state values
                setStateData(uniqueState); // Set single state value
                setState(uniqueState);
                setPincodeList(pincodesArray); // Set pincode dropdown list
                setPincode(pincodesArray[0]?.value || ""); // Reset selected pincode
                // console.log("State:", pincode);

            } else {
                console.error("Unexpected API response format:", response.data);
                setStateData("");
                setPincodeList([]); // Clear pincode dropdown if no data
                setPincode("");
            }
        } catch (error) {
            console.error("Error fetching location data:", error.response?.data || error);
            setStateData("");
            setPincodeList([]);
            setPincode("");
        } finally {
            setLoading(false);
        }
    };

    // Call functions when dependencies change
    useEffect(() => {
        fetchBrandList();
        getCityList();
    }, []);

    useEffect(() => {
        if (selectedBrand) getCarModal(selectedBrand);
    }, [selectedBrand]);

    useEffect(() => {
        if (selectedModal) getCarVariant(selectedModal);
    }, [selectedModal]);

    useEffect(() => {
        if (city) getLocationData(city);
    }, [city]);

    if (loading) {
        return (
            <ActivityIndicator size="large" color="#8a4c00" style={{ marginTop: 400 }} />
        );
    }

    if (!carData) {
        return (
            <ActivityIndicator size="large" color="#8a4c00" style={{ marginTop: 400 }} />
        );
    }

    return (
        <View style={{ backgroundColor: 'white', height: '100%', paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, marginRight: 10, textAlign: 'center', fontFamily: 'Rubik-Medium', color: '#4A4A4A' }}>
                    Edit My Vehicle
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={['#FFFFFF', '#E8ECEF']}
                        style={styles.backButtonGradient}
                    >
                        <Image source={icons.backArrow} style={styles.icon} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <View className="flex justify-between items-center pt-3 flex-row">
                <Text className="font-rubik-bold text-lg">{carData.name}</Text>
                <Text className={`inline-flex items-center rounded-md capitalize px-2 py-1 text-xs font-rubik-bold border ${vehicleStatus === 'Activated' ? ' bg-green-50  text-green-700  border-green-600 ' : 'bg-red-50  text-red-700 border-red-600'}`}>{vehicleStatus === 'Activated' ? 'Activated' : 'Under Review'}</Text>
            </View>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999 }}>
                <Toast config={toastConfig} position="top" />
            </View>

            <View style={styles.container}>
                <ProgressSteps>
                    <ProgressStep label="General"
                        nextBtnTextStyle={buttonNextTextStyle}
                    // onNext={() => onNextStep(1)}
                    // errors={errors}
                    >
                        <View style={styles.stepContent}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    {/* Car Brand Name */}
                                    <Text style={styles.label}>Car Brand Name</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => setSelectedBrand(value)}
                                            value={selectedBrand}  // ✅ Ensure selected value is shown
                                            items={brandData || []}
                                            style={pickerSelectStyles}
                                            placeholder={{ label: 'Choose an option...', value: null }}
                                        />
                                    </View>
                                </View>

                                <View style={{ flex: 1 }}>
                                    {/* Car Model */}
                                    <Text style={styles.label}>Car Model</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => setSelectedModal(value)}
                                            value={selectedModal}  // ✅ Ensure selected value is shown
                                            items={modalData?.map((model, index) => ({
                                                label: model,
                                                value: model,
                                                key: index.toString(),
                                            })) || []}
                                            style={pickerSelectStyles}
                                            placeholder={{ label: 'Choose an option...', value: null }}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Car Variant */}
                            <Text style={styles.label}>Car Version</Text>
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => setSelectedVariant(value)}
                                    value={selectedVariant}  // ✅ Ensure selected value is shown
                                    items={variantData && Array.isArray(variantData) ? variantData : []}
                                    style={pickerSelectStyles}
                                    placeholder={{ label: 'Choose an option...', value: null }}
                                />
                            </View>

                            {/* Select City */}
                            <Text style={styles.label}>Select District / City</Text>
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => setCity(value)}
                                    value={city}  // ✅ Ensure selected value is shown
                                    items={Array.isArray(cityData) ? cityData : []}
                                    style={pickerSelectStyles}
                                    placeholder={{ label: 'Choose an option...', value: null }}
                                />
                            </View>

                            {/* State */}
                            <Text style={styles.label}>State</Text>
                            <TextInput
                                style={styles.input}
                                value={stateData}
                                placeholder='Enter state...'
                                onChangeText={(text) => setState(text)}
                            />

                            {/* Select Pincode */}
                            <Text style={styles.label}>Select Pincode</Text>
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => setPincode(value)}
                                    value={pincode}  // ✅ Ensure selected value is shown
                                    items={pincodeList}
                                    style={pickerSelectStyles}
                                    placeholder={{ label: "Choose Pincode...", value: null }}
                                />
                            </View>

                            {/* Car Color */}
                            <Text style={styles.label}>Enter Car Color</Text>
                            <TextInput
                                style={styles.input}
                                value={color}
                                placeholder='Enter Color...'
                                onChangeText={(text) => setColor(text)}
                            />
                        </View>

                    </ProgressStep>

                    <ProgressStep label="Car Details"
                        nextBtnTextStyle={buttonNextTextStyle}
                        previousBtnTextStyle={buttonPreviousTextStyle}
                    // onNext={() => onNextStep(2)}
                    // errors={errors}
                    >
                        <View style={styles.stepContent}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    {/* enter rental income */}
                                    <Text style={styles.label}>Expected Selling Price</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="number-pad" // ✅ Better compatibility for numeric input
                                        placeholder="Enter Selling Price"
                                        value={sellingPrice}
                                        onChangeText={text => {
                                            // ✅ Allow only numbers & remove leading zeros
                                            let numericText = text.replace(/[^0-9]/g, '');
                                            if (numericText.startsWith("0")) {
                                                numericText = numericText.replace(/^0+/, ""); // Remove leading zeros
                                            }
                                            setSellingPrice(numericText);
                                        }}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    {/* enter vehicle name */}
                                    <Text style={styles.label}>Insurance status</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => { setInsurance(value) }}
                                            items={[
                                                { label: "Available", value: "Available" },
                                                { label: "Unavailable", value: "Unavailable" },
                                            ]}
                                            value={insurance}
                                            style={pickerSelectStyles}
                                            placeholder={{ label: "Choose status...", value: null }}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View className="flex-1">
                                    <Text style={styles.label}>Killometer Driven</Text>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <TextInput
                                            style={styles.input}
                                            keyboardType="numeric"
                                            placeholder="Enter km Driven"
                                            value={kmsDriven}
                                            onChangeText={text => {
                                                const numericText = text.replace(/[^0-9]/g, '');
                                                setKmsDriven(numericText);
                                            }}
                                        />
                                    </View>

                                </View>

                                <View style={{ flex: 1 }}>
                                    {/* enter vehicle name */}
                                    <Text style={styles.label}>Fuel Selection</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => setSelectedFuel(value)}
                                            items={[
                                                { label: "Petrol", value: "petrol" },
                                                { label: "Diesel", value: "diesel" },
                                                { label: "Electric", value: "electric" },
                                                { label: "Hybrid", value: "hybrid" },
                                            ]}
                                            style={pickerSelectStyles}
                                            value={selectedFuel}
                                            placeholder={{ label: "Choose Fuel Type...", value: null }}
                                        />

                                    </View>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, marginRight: 10 }}>

                                    {/* enter vehicle name */}
                                    <Text style={styles.label}>Make Year</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholder="Enter make year"
                                        value={makeYear}
                                        onChangeText={text => {
                                            const numericText = text.replace(/[^0-9]/g, '');
                                            setMakeYear(numericText);
                                        }}
                                    />

                                </View>
                                <View style={{ flex: 1, }}>
                                    {/* enter description */}
                                    <Text style={styles.label}>Registration year</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholder="Enter Year"
                                        value={regYear}
                                        onChangeText={text => {
                                            const numericText = text.replace(/[^0-9]/g, '');
                                            setRegYear(numericText);
                                        }}
                                    />
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                                <View style={{ flex: 1, marginRight: 10 }}>
                                    {/* enter vehicle name */}
                                    <Text style={styles.label}>Registration Type</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => setRegType(value)}
                                            items={[
                                                { label: "Private", value: "private" },
                                                { label: "Commercial", value: "commercial" },
                                            ]}
                                            value={regType}
                                            style={pickerSelectStyles}
                                            placeholder={{ label: "Choose Fuel Type...", value: null }}
                                        />
                                    </View>
                                </View>
                                <View style={{ flex: 1, }}>
                                    {/* enter description */}
                                    <Text style={styles.label}>Car Ownership</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => setOwnerChanged(value)}
                                            items={[
                                                { label: "1st Hand", value: "1st Hand" },
                                                { label: "2nd Hand", value: "2nd Hand" },
                                                { label: "3rd Hand", value: "3rd Hand" },
                                                { label: "4th Hand", value: "4th Hand" },
                                                { label: "5th Hand or More", value: "5th Hand" },
                                            ]}
                                            placeholder={{ label: "Select Ownership", value: null }}
                                            value={ownerChanged}
                                            style={pickerSelectStyles}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, marginRight: 10 }}>

                                    {/* enter vehicle price */}
                                    <Text style={styles.label}>Transmission Type</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => setTransmissionType(value)}
                                            items={[
                                                { label: "Manual", value: "manual" },
                                                { label: "Automatic", value: "automatic" },
                                            ]}
                                            value={transmissionType}
                                            style={pickerSelectStyles} // Ensure picker styles are correctly defined
                                            placeholder={{ label: "Enter Transmission Type", value: null }}
                                        />


                                    </View>

                                </View>

                                <View style={{ flex: 1 }}>

                                    {/* Select Date */}
                                    <Text style={styles.label}>Last updated</Text>
                                    <TouchableOpacity onPress={() => setShow(true)}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="DD-MM-YYYY"
                                            value={lastUpdate}
                                            editable={false}
                                        />
                                    </TouchableOpacity>

                                    {show && (
                                        <DateTimePicker
                                            value={selectedDate}
                                            mode="date"
                                            display={Platform.OS === "ios" ? "inline" : "calendar"}
                                            onChange={handleLastUpdated}
                                        />
                                    )}
                                </View>
                            </View>
                        </View>
                    </ProgressStep>

                    <ProgressStep label="Gallery"
                        nextBtnTextStyle={buttonNextTextStyle}
                        previousBtnTextStyle={buttonPreviousTextStyle}
                        onSubmit={handleSubmit}>

                        {/* upload gallery */}
                        <Text style={styles.label}>Upload Car Images</Text>
                        <View style={{ flexGrow: 1, minHeight: 1 }}>
                            <FlatList
                                data={galleryImages}
                                horizontal
                                keyExtractor={(item, index) => index.toString()}
                                nestedScrollEnabled={true}
                                contentContainerStyle={styles.fileContainer}
                                renderItem={({ item, index }) => (
                                    <View style={styles.thumbnailBox} className="border border-gray-300">
                                        <Image source={{ uri: item }} style={styles.thumbnail} />
                                        <Text className="text-center font-rubik-bold">Image: {index + 1}</Text>

                                        <TouchableOpacity
                                            onPress={() => removeGalleryImage(index, item)}
                                            style={styles.deleteButton}
                                        >
                                            <Text className="text-white">X</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        </View>
                        <TouchableOpacity onPress={pickGalleryImages} style={styles.dropbox}>
                            <Text style={{ textAlign: 'center' }}>Pick images from gallery</Text>
                        </TouchableOpacity>


                        {/* enter vehicle name */}
                        <Text style={styles.label}>Vehicle status</Text>
                        <View style={styles.pickerContainer}>
                            <RNPickerSelect
                                onValueChange={(value) => { setVehicleStatus(value) }}
                                items={status}
                                value={vehicleStatus}
                                style={pickerSelectStyles}
                                placeholder={{ label: "Choose status...", value: null }}
                            />

                        </View>
                    </ProgressStep>
                </ProgressSteps>
            </View>
            {loading && (
                <View className='absolute bottom-28 z-40 right-16'>
                    <ActivityIndicator />
                </View>
            )}
        </View>
    )
}

export default EditVehicle

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
    },
    container: {
        flex: 1,
        padding: 0,
        paddingBottom: 0,
        backgroundColor: '#fff',
    },
    stepContent: {
        paddingBottom: 20,
    },
    fileContainer: {
        padding: 5,
        backgroundColor: '#fff',
        flexDirection: 'row',
        display: 'flex',
    },
    deleteButton: {
        paddingHorizontal: 7,
        color: 'white',
        borderWidth: 1,
        borderRadius: 7,
        borderColor: 'red',
        marginLeft: 10,
        backgroundColor: 'red',
        width: 25,
        position: 'absolute',
        top: 0,
        right: 0,
    },
    label: {
        fontSize: 16,
        marginHorizontal: 5,
        marginTop: 10,
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#edf5ff',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 10,
        marginTop: 10
    },
    amenityItem: {
        flexDirection: 'row',  // Ensure row layout
        alignItems: 'center',  // Align items properly
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 50,
        marginRight: 5,
        marginBottom: 5,
        backgroundColor: '#edf5ff',
        borderColor: 'green',
        borderWidth: 1,
    },


    removeBtn: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 12,
        marginEnd: 5,
        marginTop: 0,

    },
    addBtn: {
        width: 40,
        height: 40,
        marginStart: 10,
        marginTop: 15,
    },
    mapTextInput: {
        width: '100%',
        height: 50,
        borderColor: "#edf5ff",
        borderWidth: 1,
        backgroundColor: "#edf5ff",
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    editor: {
        flex: 1,
        padding: 0,
        borderColor: 'gray',
        borderWidth: 1,
        marginHorizontal: 30,
        marginVertical: 5,
        backgroundColor: 'white',
    },

    textarea: {
        textAlignVertical: 'top',  // hack android
        height: 110,
        fontSize: 14,
        marginTop: 20,
        borderRadius: 10,
        color: '#333',
        padding: 15,
        backgroundColor: '#edf5ff',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    thumbnail: {
        width: 73,
        height: 70,
        borderRadius: 10,
    },
    thumbnailBox: {
        width: 75,
        height: 95,
        borderRadius: 10,
        marginRight: 10,
    },
    dropbox: {
        height: 80,
        padding: 5,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#edf5ff',
        backgroundColor: '#edf5ff',
        borderRadius: 10,
        marginTop: 10,
        marginRight: 10,
        justifyContent: 'center',
        alignContent: 'center',
        flex: 1,
    },
    map: {
        width: '100%',
        height: 150,
        marginTop: 10
    },
    addButton: {
        backgroundColor: '#D3D3D3', padding: 10, marginTop: 10, borderRadius: 5
    },
    addButtonText: { color: 'black', textAlign: 'center', fontWeight: 'bold' },
    tableRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
    tableCell: { flex: 1, textAlign: 'center', borderEnd: 1, borderColor: '#c7c7c7', fontWeight: 600, },
    pickerContainer: {
        borderRadius: 10, // Apply borderRadius here
        overflow: 'hidden',
        backgroundColor: '#edf5ff',
        marginTop: 10,
        // marginBottom: 20,
    },

});
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingHorizontal: 10,
        backgroundColor: '#edf5ff',
        borderRadius: 20,
        color: 'black',
        paddingRight: 30,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        backgroundColor: '#edf5ff',
        borderRadius: 20,
        color: 'black',
        paddingRight: 30,
    },
});

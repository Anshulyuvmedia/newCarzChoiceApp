import { Image, StyleSheet, Text, TouchableOpacity, View, TextInput, FlatList, Platform, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import icons from '@/constants/icons';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import { Link, router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
// import DateTimePicker from '@react-native-community/datetimepicker';
import Toast, { BaseToast } from 'react-native-toast-message';
import CitySelector from '../../../components/CitySelector';

const SellVehicle = () => {

    const [isValid, setIsValid] = useState(false);
    const [errors, setErrors] = useState(false);

    const [brandData, setBrandData] = useState([]);
    const [modalData, setModalData] = useState(null);
    const [variantData, setVariantData] = useState(null);
    const [cityData, setCityData] = useState(null);
    const [stateData, setStateData] = useState("");
    const [pincodeList, setPincodeList] = useState([]); // Store multiple pincodes

    // const [selectedDate, setSelectedDate] = useState(new Date());
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
    // const [lastUpdate, setLastUpdate] = useState(null);

    const [galleryImages, setGalleryImages] = useState([]);

    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);

    const buttonPreviousTextStyle = {
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 10,
        backgroundColor: '#ff938f',
        color: 'black',
        marginEnd: 10, // Add margin to prevent overlap
    };
    const buttonNextTextStyle = {
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 10,
        backgroundColor: 'lightgreen',
        color: 'black',
        marginStart: 10, // Add margin to prevent overlap with the previous button
    };

    const buttonPreviousText = "Back"; // Change text of the previous button to "Back"
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

    const validateStep = (step) => {
        if (step === 1) {
            if (!selectedBrand || !selectedModal || !selectedVariant || !city || !stateData || !pincode || !color) {
                Toast.show({
                    type: 'error',
                    text1: 'Step 1 Error',
                    text2: 'Car Brand, Model, Version, City, State, Pincode, and Color are required.',
                });
                return false;
            }
        }

        if (step === 2) {
            if (!sellingPrice || !insurance || !kmsDriven || !selectedFuel || !makeYear || !regYear || !regType || !ownerChanged || !transmissionType) {
                Toast.show({
                    type: 'error',
                    text1: 'Step 2 Error',
                    text2: 'Selling Price, Insurance, Kilometers Driven, Fuel Type, Make Year, Registration Year, Registration Type, Ownership, Transmission Type, and Last Update are required.',
                });
                return false;
            }
        }

        if (step === 3) {
            if (!galleryImages || galleryImages.length === 0) {
                Toast.show({
                    type: 'error',
                    text1: 'Step 3 Error',
                    text2: 'At least one car image is required.',
                });
                return false;
            }
        }

        return true;
    };

    const onNextStep = (step) => {
        if (!validateStep(step)) {
            setErrors(true);
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

    // Handle Date Selection
    // const handleLastUpdated = (event, date) => {
    //     if (date) {
    //         const formattedDate = date.toLocaleDateString("en-GB", {
    //             day: "2-digit",
    //             month: "2-digit",
    //             year: "numeric",
    //         });
    //         setLastUpdate(formattedDate);
    //         setSelectedDate(date);
    //     }
    //     setShow(false); // Hide picker after selection
    // };

    const getUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');

            return {
                userData: userData ? JSON.parse(userData) : null,
            };
        } catch (error) {
            console.error("❌ Error fetching user data:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Could not retrieve user data.",
            });
            return { userData: null, userToken: null };
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { userData } = await getUserData(); // Only fetching userData, ignoring userToken

            if (!userData) {
                throw new Error("User data is missing.");
            }

            const { id } = userData;
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
            // formData.append("lastupdated", lastUpdate);

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


            console.log("Uploading FormData:");
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            // ✅ API request WITHOUT authentication
            const response = await axios.post("https://carzchoice.com/api/sellvehicle", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 201 && response.data.success) {
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Vehicle added successfully!",
                });
                setTimeout(() => {
                    router.push('/dashboard/myvehicles');
                }, 1500);
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: response.data.message || "Failed to add vehicle.",
                });
            }
        } catch (error) {
            console.error("API Error:", error?.response?.data || error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    // Reset Form Function
    const resetForm = () => {

        setGalleryImages([]);

    };

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

    return (
        <View style={{ backgroundColor: 'white', height: '100%', paddingHorizontal: 20 }}>


            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, marginRight: 10, textAlign: 'center', fontFamily: 'Rubik-Medium', color: '#4A4A4A' }}>
                    Sell Your Vehicle
                </Text>
                <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', backgroundColor: '#E0E0E0', borderRadius: 50, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={icons.backArrow} style={{ width: 20, height: 20 }} />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                <View style={{ position: 'absolute', top: 10, left: 0, right: 0, zIndex: 9999 }}>
                    <Toast config={toastConfig} position="top" />
                </View>
                <ProgressSteps>
                    <ProgressStep label="General"
                        nextBtnTextStyle={buttonNextTextStyle}
                        onNext={() => onNextStep(1)}
                        errors={errors}
                    >
                        <View style={styles.stepContent}>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    {/* enter vehicle name */}
                                    <Text style={styles.label}>Car Brand Name</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => setSelectedBrand(value)}
                                            items={brandData || []} // Ensuring it's always an array
                                            style={pickerSelectStyles}
                                            placeholder={{ label: 'Choose an option...', value: null }}
                                        />
                                    </View>
                                </View>
                                <View style={{ flex: 1, }}>
                                    {/* enter description */}
                                    <Text style={styles.label}>Car Modal</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => setSelectedModal(value)}
                                            items={modalData?.map((model, index) => ({
                                                label: model,
                                                value: model,
                                                key: index.toString(), // Adding unique key
                                            })) || []}
                                            style={pickerSelectStyles}
                                            placeholder={{ label: 'Choose an option...', value: null }}
                                        />

                                    </View>
                                </View>
                            </View>

                            {/* enter thumbnail */}
                            <Text style={styles.label}>Car Version</Text>
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => setSelectedVariant(value)}
                                    items={variantData && Array.isArray(variantData) ? variantData : []}
                                    style={pickerSelectStyles}
                                    placeholder={{ label: 'Choose an option...', value: null }}
                                />
                            </View>

                            {/* select City */}
                            <Text style={styles.label}>Select District / City</Text>
                            <View style={styles.pickerContainer}>

                                {/* // Default mode */}
                                <CitySelector
                                    cityData={cityData}
                                    onSelectCity={(value) => setCity(value)}
                                />

                            </View>




                            <Text style={styles.label}>State</Text>
                            <TextInput
                                style={styles.input}
                                value={stateData} // Show state value
                                // editable={false} // Prevent user from modifying state
                                placeholder='Enter state...'
                                onChangeText={(text) => {
                                    setState(text);
                                }}
                            />



                            {/* Enter Pincode */}
                            <Text style={styles.label}>Select Pincode</Text>
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => setPincode(value)}
                                    items={pincodeList} // Use dynamically generated pincodes
                                    style={pickerSelectStyles}
                                    placeholder={{ label: "Choose Pincode...", value: null }}
                                />
                            </View>

                            <Text style={styles.label}>Enter Car Color</Text>
                            <TextInput
                                style={styles.input}
                                value={color} // Show state value
                                // editable={false} // Prevent user from modifying state
                                placeholder='Enter Color...'
                                onChangeText={(text) => {
                                    setColor(text);
                                }}
                            />


                        </View>
                    </ProgressStep>

                    <ProgressStep label="Car Details"
                        nextBtnTextStyle={buttonNextTextStyle}
                        previousBtnTextStyle={buttonPreviousTextStyle}
                        onNext={() => onNextStep(2)}
                        errors={errors}
                    >
                        <View style={styles.stepContent}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    {/* enter rental income */}
                                    <Text style={styles.label}>Expected Sell Price</Text>
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
                                                { label: "Petrol & CNG", value: "Petrol & CNG" },
                                                { label: "Diesel", value: "diesel" },
                                                { label: "Electric", value: "electric" },
                                                { label: "Hybrid", value: "hybrid" },
                                            ]}
                                            style={pickerSelectStyles}
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
                                            style={pickerSelectStyles}
                                            placeholder={{ label: "Choose Registration Type...", value: null }}
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
                                            style={pickerSelectStyles} // Ensure picker styles are correctly defined
                                            placeholder={{ label: "Enter Transmission Type", value: null }}
                                        />
                                    </View>
                                </View>

                                {/* Select Date */}
                                {/* <View style={{ flex: 1 }}>
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
                                </View> */}
                            </View>
                        </View>
                    </ProgressStep>

                    <ProgressStep label="Gallery"
                        nextBtnTextStyle={buttonNextTextStyle}
                        previousBtnTextStyle={buttonPreviousTextStyle}
                        buttonPreviousText={buttonPreviousText}
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
                                            onPress={() => setGalleryImages(galleryImages.filter((_, i) => i !== index))}
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
                    </ProgressStep>
                </ProgressSteps>
            </View>
            {
                loading && (
                    <View className='absolute bottom-28 z-40 right-16'>
                        <ActivityIndicator />
                    </View>
                )
            }
        </View>
    )
}

export default SellVehicle

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
        paddingBottom: 40,
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
        flexDirection: 'row',
        justifyContent: 'start',
        padding: 5,
        borderRadius: 50,
        marginRight: 5,
        borderColor: 'green',
        backgroundColor: '#edf5ff',
        borderWidth: 1,
    },
    removeBtn: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 12,
        marginEnd: 5,
        marginTop: 3,

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
        marginTop: 10,
        borderRadius: 10,
        color: '#333',
        paddingHorizontal: 15,
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

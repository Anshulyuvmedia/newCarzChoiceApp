import { StyleSheet, Text, View, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast, { BaseToast } from 'react-native-toast-message';
import icons from '@/constants/icons';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { MultiSelect } from 'react-native-element-dropdown';
import { useRouter } from 'expo-router';

const RegisterDealer = () => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const router = useRouter();
    const inputRef = useRef(null);

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
    const [searchText, setSearchText] = useState("");
    const [filteredCities, setFilteredCities] = useState([]);

    const [brandData, setBrandData] = useState([]);
    const [cityData, setCityData] = useState(null);
    const [stateData, setStateData] = useState("");
    const [pincodeList, setPincodeList] = useState([]);

    const [businessName, setBusinessName] = useState('');
    const [selectedBrand, setSelectedBrand] = useState([]);
    const [city, setCity] = useState(null);
    const [state, setState] = useState(null);
    const [pincode, setPincode] = useState("");
    const [businessDocuments, setBusinessDocuments] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);
    const [whatsappNumber, setWhatsappNumber] = useState([]);

    const BASE_URL = "https://carzchoice.com/assets/backend-assets/images/";
    const formattedBrandData = brandData.map(item => ({
        ...item,
        image: item.iconimage ? `${BASE_URL}${item.iconimage}` : null,
    }));
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

    const pickDocument = async () => {
        try {
            let result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'], // Allow PDFs and Images
                multiple: true, // Enable multiple selection
            });

            if (result.canceled) return;

            const selectedDocuments = Array.isArray(result.assets) ? result.assets : [result];

            const newDocuments = selectedDocuments.map(doc => ({
                uri: doc.uri,
                name: doc.name || 'Unnamed Document',
                thumbnail: doc.mimeType.startsWith('image/')
                    ? doc.uri // Show image preview
                    : 'https://cdn-icons-png.flaticon.com/512/337/337946.png', // PDF icon
            }));

            setBusinessDocuments(prevDocs => [...prevDocs, ...newDocuments]);
        } catch (error) {
            console.error('Document selection error:', error);
        }
    };

    // Function to remove a document
    const removeDocument = (index) => {
        setBusinessDocuments(prevDocs => prevDocs.filter((_, i) => i !== index));
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

    const citySearch = (text) => {
        setSearchText(text);
        if (text.length > 0) {
            const filtered = cityData.filter((city) =>
                city.label.toLowerCase().includes(text.toLowerCase()) // ✅ Use label instead of district
            );
            setFilteredCities(filtered);
        } else {
            setFilteredCities(cityData);
        }
    };

    const getCityList = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://carzchoice.com/api/getCityList");

            if (response.data && Array.isArray(response.data.data)) {
                const formattedCities = response.data.data.map((city, index) => ({
                    label: city.District || `City ${index}`, // ✅ Correct property name
                    value: city.District || index,
                }));

                setCityData(formattedCities);
                setFilteredCities(formattedCities); // ✅ Ensure dropdown is populated
            } else {
                console.error("Unexpected API response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching city list:", error);
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
        if (city) getLocationData(city);
    }, [city]);

    const validateForm = () => {
        let newErrors = {};

        if (!selectedBrand || selectedBrand.length === 0) newErrors.selectedBrand = true;
        if (!city || city.trim() === "") newErrors.city = true;
        if (!state || state.trim() === "") newErrors.state = true;
        if (!pincode || pincode.trim() === "" || isNaN(pincode)) newErrors.pincode = true;
        if (!businessName || businessName.trim() === "") newErrors.businessName = true;

        // ✅ Improved WhatsApp Number Validation
        if (!whatsappNumber || !/^\+?\d{10,13}$/.test(whatsappNumber))
            newErrors.whatsappNumber = "Enter a valid WhatsApp number (including country code).";

        if (!galleryImages || galleryImages.length === 0)
            newErrors.galleryImages = "At least one office picture is required.";

        if (!businessDocuments || businessDocuments.length === 0)
            newErrors.businessDocuments = "At least one business document is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async () => {
        if (!validateForm()) {
            const missingFields = Object.keys(errors)
                .filter((key) => errors[key])
                .map((key) => key.replace(/([A-Z])/g, ' $1').toLowerCase())
                .join(', ');

            Toast.show({
                type: "error",
                text1: "Validation Error",
                text2: `Please fill in the following fields: ${missingFields}`,
            });
            return;
        }

        setLoading(true);

        try {
            const { userData } = await getUserData();
            if (!userData) throw new Error("User data is missing.");

            const { id, email, contactno } = userData;
            const formData = new FormData();

            // ✅ Append Basic Data
            formData.append("id", id ?? "");
            formData.append("businessname", businessName);
            formData.append("emailaddress", email);
            formData.append("dealertype", "New Car Dealer");
            formData.append("mobilenumber", contactno);
            formData.append("whatsappnumber", whatsappNumber);
            formData.append("district", city);
            formData.append("state", state);
            formData.append("pincode", pincode);

            // ✅ Append Brands as JSON string
            formData.append("brands", JSON.stringify(selectedBrand));

            // ✅ Append Gallery Images
            galleryImages.forEach((imageUri, index) => {
                if (imageUri) {
                    const fileType = imageUri.split('.').pop() || "jpeg";

                    formData.append(`officepics[]`, {
                        uri: imageUri,
                        type: `image/${fileType}`,
                        name: `gallery-image-${index}.${fileType}`,
                    });
                }
            });

            // ✅ Append Business Documents
            businessDocuments.forEach((doc, index) => {
                if (doc?.uri) {
                    const fileType = doc.uri.split('.').pop()?.toLowerCase() || "pdf";
                    const validFileTypes = ["pdf", "jpeg", "jpg", "png"];

                    if (!validFileTypes.includes(fileType)) {
                        console.warn(`Invalid file type detected: ${fileType}`);
                        return;
                    }

                    formData.append(`businesspics[]`, {
                        uri: doc.uri,
                        type: fileType === "pdf" ? "application/pdf" : `image/${fileType}`,
                        name: `business-doc-${index}.${fileType}`,
                    });
                }
            });

            // console.log("Uploading FormData:", JSON.stringify(formData, null, 2));

            // ✅ API Call
            const response = await axios.post("https://carzchoice.com/api/registerdealer", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // console.log("FormData response:", response);

            if ((response.status === 201 || response.status === 200) && response.data.success) {
                Toast.show({ type: "success", text1: "Success", text2: "Registration successfully!" });
            } else {
                throw new Error(response.data.message || "Failed to Register.");
            }

        } catch (error) {
            console.error("API Error:", error?.response?.data || error);
            Toast.show({ type: "error", text1: "Error", text2: error.message || "Something went wrong. Please try again." });
        } finally {
            setLoading(false);
        }
    };



    return (
        <SafeAreaView className="flex-1">
            {loading ? (
                <ActivityIndicator size="large" color="#a62325" style={{ marginTop: 400 }} />
            ) : (
                <View className="px-5 flex-1">
                    <View className="flex flex-row items-center justify-between my-5">
                        <Text className="text-xl font-rubik-bold upper">Become a Dealer</Text>
                        <View style={{ position: 'absolute', top: 5, left: 0, right: 0, zIndex: 9999 }}>
                            <Toast config={toastConfig} position="top" />
                        </View>
                        <TouchableOpacity onPress={() => router.back()} className="flex-row bg-gray-300 rounded-full w-11 h-11 items-center justify-center">
                            <Image source={icons.backArrow} className="w-5 h-5" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} >



                        <Text className="text-2xl font-rubik-bold">Register yourself as a dealer</Text>

                        <View className="flex my-5 shadow rounded-lg bg-white p-5">

                            <Text style={[styles.label, errors.businessName && { color: 'red' }]}>Business Name</Text>
                            <TextInput style={styles.input} placeholder="Enter Business Name" onChangeText={setBusinessName} value={businessName} />

                            <Text style={[styles.label, errors.whatsappNumber && { color: 'red' }]}>WhatsApp No.</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Whatsapp Number"
                                keyboardType="numeric"
                                onChangeText={(text) => {
                                    const numericValue = text.replace(/[^0-9]/g, '');
                                    setWhatsappNumber(numericValue);
                                }}
                                value={whatsappNumber}
                            />


                            {/* Car Brand Name */}
                            <Text style={[styles.label, errors.selectedBrand && { color: 'red' }]}>Choose Brands That You Represent</Text>
                            <View style={styles.pickerContainer}>
                                <MultiSelect
                                    data={formattedBrandData} // ✅ Use formatted data with full image URLs
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Choose an option..."
                                    value={selectedBrand}
                                    placeholderStyle={styles.placeholderStyle}
                                    onChange={(items) => setSelectedBrand(items)}
                                    style={styles.brandpicker}
                                    selectedStyle={styles.selectedStyle}
                                    selectedTextStyle={styles.selectedTextStyle}

                                    // ✅ Show image in dropdown list
                                    renderItem={(item) => (
                                        <View style={styles.itemContainer}>
                                            {item.image && <Image source={{ uri: item.image }} style={styles.itemImage} />}
                                            <Text style={styles.itemText}>{item.label}</Text>
                                        </View>
                                    )}

                                    // ✅ Show image in selected items
                                    renderSelectedItem={(item) => (
                                        <View style={styles.selectedItemContainer}>
                                            {item.image && <Image source={{ uri: item.image }} style={styles.selectedItemImage} />}
                                            <Text style={styles.selectedItemText}>{item.label}</Text>
                                        </View>
                                    )}
                                />
                            </View>


                            {/* Select City */}
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, errors.city && { color: 'red' }]}>Select District / City</Text>
                                <View style={styles.pickerContainer}>
                                    <View className="flex flex-row items-center w-full bg-blue-50 rounded-lg px-3 py-4">
                                        <Image source={icons.location} className="size-6" />
                                        <TextInput
                                            ref={inputRef}
                                            value={searchText}
                                            onChangeText={(text) => {
                                                setSearchText(text);
                                                citySearch(text);
                                            }}
                                            placeholder="Select Your City..."
                                            className="flex-1 ml-2 text-black-300 text-sm capitalize"
                                        />
                                    </View>
                                </View>

                                {/* ✅ Show FlatList only when searchText is not empty */}
                                {searchText.length > 0 && (
                                    <View style={{ maxHeight: 200, overflow: "hidden" }}>
                                        <FlatList
                                            data={filteredCities}
                                            keyExtractor={(item, index) => `city-${index}`}
                                            keyboardShouldPersistTaps="handled"
                                            nestedScrollEnabled={true}
                                            style={{ maxHeight: 200 }}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setCity(item.label);
                                                        setSearchText(item.label);
                                                        setFilteredCities([]); // Hide dropdown after selection
                                                    }}
                                                    className="p-2 border-b border-gray-200 bg-primary-100"
                                                >
                                                    <Text className="text-black-300 capitalize">{item.label}</Text>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                )}
                            </View>




                            <Text style={[styles.label, errors.city && { color: 'red' }]}>State</Text>
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
                            <Text style={[styles.label, errors.pincode && { color: 'red' }]}>Select Pincode</Text>
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => setPincode(value)}
                                    items={pincodeList} // Use dynamically generated pincodes
                                    style={pickerSelectStyles}
                                    value={pincode}
                                    placeholder={{ label: "Choose Pincode...", value: null }}
                                />
                            </View>


                            {/* upload doc */}
                            <Text style={[styles.label, errors.businessDocuments && { color: 'red' }]}>Upload Business Documents</Text>
                            <View style={{ flexGrow: 1, minHeight: 1, marginTop: 5 }}>
                                <FlatList
                                    data={businessDocuments}
                                    horizontal
                                    nestedScrollEnabled={true}
                                    keyExtractor={(_, index) => index.toString()}
                                    renderItem={({ item, index }) => (
                                        <View style={styles.thumbnailBox} className="border border-gray-300">
                                            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                                            <Text className="text-center font-rubik-bold">Doc {index + 1}</Text>

                                            <TouchableOpacity onPress={() => removeDocument(index)} style={styles.deleteButton}>
                                                <Text className="text-white">X</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            </View>
                            <TouchableOpacity onPress={pickDocument} style={styles.dropbox}>
                                <Text style={{ textAlign: 'center' }}>Pick Doc from gallery</Text>
                            </TouchableOpacity>


                            {/* upload gallery */}
                            <Text style={[styles.label, errors.galleryImages && { color: 'red' }]}>Upload Office Photos</Text>
                            <View style={{ flexGrow: 1, minHeight: 1, marginTop: 5 }}>
                                <FlatList
                                    data={galleryImages}
                                    horizontal
                                    keyExtractor={(item, index) => index.toString()}
                                    nestedScrollEnabled={true}
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

                        </View>
                    </ScrollView>
                    <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
                        <Text style={styles.submitButtonText}>{loading ? 'Submitting...' : 'Register Now'}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    )
}

export default RegisterDealer

const styles = StyleSheet.create({
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
        marginTop: 10,
    },
    pickerContainer: {
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#edf5ff',
        marginTop: 10,
    },
    brandpicker: {
        padding: 15,
    },
    placeholderStyle: {
        color: 'gray', // Placeholder color
        fontSize: 14, // Adjust font size if needed
    },
    selectedStyle: {
        marginStart: 5,
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 10,
        borderWidth: 2, // ✅ Add border width
        borderColor: 'gray', // ✅ Ensure border appears
    },

    selectedTextStyle: {
        color: 'black', // ✅ Set text color of selected items
        fontSize: 14, // Adjust if needed
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
    },
    itemImage: {
        width: 30,
        height: 30,
        marginRight: 10,
        borderRadius: 5, // Optional: Make it circular
        objectFit: 'contain',
    },
    itemText: {
        fontSize: 16,
        color: "black",
    },
    selectedItemContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        paddingVerticle: 5,
        paddingHorizontal: 10,
        borderRadius: 20,
        margin: 3,
        borderWidth: 2,
        borderColor: 'lightgray',
    },
    selectedItemImage: {
        width: 30,
        height: 30,
        marginRight: 5,
        borderRadius: 15,
        objectFit: 'contain',
    },
    selectedItemText: {
        fontSize: 14,
        color: "black",
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: '#a62325',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 20,
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
        textTransform: 'capitalize',
    },
});
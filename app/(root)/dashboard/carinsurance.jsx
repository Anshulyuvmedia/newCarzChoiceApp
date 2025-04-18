import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Platform, TouchableOpacity, Image, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast, { BaseToast } from 'react-native-toast-message';
import icons from '@/constants/icons';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

const carInsurance = () => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
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

    const [brandData, setBrandData] = useState([]);
    const [modalData, setModalData] = useState(null);
    const [variantData, setVariantData] = useState(null);
    const [cityData, setCityData] = useState(null);

    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModal, setSelectedModal] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [city, setCity] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    const [show, setShow] = useState(false);

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

    const handleRegDate = (event, date) => {
        if (date) {
            setSelectedDate(date.toISOString().split("T")[0]); // Convert date to YYYY-MM-DD format
        }
        setShow(false); // Hide picker after selection
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

    const validateForm = () => {
        let newErrors = {};

        // Validate fields
        if (!selectedBrand) newErrors.selectedBrand = true;
        if (!selectedModal) newErrors.selectedModal = true;
        if (!selectedVariant) newErrors.selectedVariant = true;
        if (!city) newErrors.city = true;
        if (!selectedDate) newErrors.selectedDate = true

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async () => {
        if (!validateForm()) {
            Toast.show({
                type: "error",
                text1: "Validation Error",
                text2: "All fields are required!",
            });
            return;
        }
        setLoading(true);
        try {
            const { userData } = await getUserData(); // Only fetching userData, ignoring userToken

            if (!userData) {
                throw new Error("User data is missing.");
            }
            console.log("User Data:", userData); // Debug user data
            const { id } = userData;
            const formData = new FormData();

            formData.append("userid", id ?? "");
            formData.append("brandname", selectedBrand);
            formData.append("carname", selectedModal);
            formData.append("modalname", selectedVariant);
            formData.append("city", city);
            formData.append("registerdate", selectedDate);
            formData.append("fullname", userData.fullname);
            formData.append("emailaddress", userData.email);
            formData.append("phonenumber", userData.contactno);



            console.log("Uploading FormData:");
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            // ✅ API request WITHOUT authentication
            const response = await axios.post("https://carzchoice.com/api/requestinsurance", formData, {
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

    return (
        <SafeAreaView className="flex-1">
            {loading ? (
                <ActivityIndicator size="large" color="#a62325" style={{ marginTop: 400 }} />
            ) : (
                <View className="px-5 flex-1">
                    <ScrollView showsVerticalScrollIndicator={false} >
                        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
                            <Toast config={toastConfig} position="bottom" />
                        </View>
                        <View className="flex flex-row items-center justify-between my-5">
                            <Text className="text-xl font-rubik-bold upper">Car Insurance</Text>

                            <TouchableOpacity onPress={() => router.back()} className="flex-row bg-gray-300 rounded-full w-11 h-11 items-center justify-center">
                                <Image source={icons.backArrow} className="w-5 h-5" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-2xl font-rubik-bold">Buy or Renew your Car Insurance</Text>

                        <View className="flex mt-5 shadow rounded-lg bg-white p-5">

                            <Text className="text-base font-rubik-medium">Please provide your details so our insurance partner can reach out to you about your inquiry.</Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    {/* Car Brand Name */}
                                    <Text style={[styles.label, errors.selectedBrand && { color: 'red' }]}>Car Brand Name</Text>
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
                                    <Text style={[styles.label, errors.selectedModal && { color: 'red' }]}>Car Model</Text>
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
                            <Text style={[styles.label, errors.selectedVariant && { color: 'red' }]}>Car Version</Text>
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
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, errors.city && { color: 'red' }]}>Select District / City</Text>
                                <View style={styles.pickerContainer}>
                                    <RNPickerSelect
                                        onValueChange={(value) => setCity(value)}
                                        value={city}  // ✅ Ensure selected value is shown
                                        items={Array.isArray(cityData) ? cityData : []}
                                        style={pickerSelectStyles}
                                        placeholder={{ label: 'Choose an option...', value: null }}
                                    />
                                </View>
                            </View>

                            <View style={{ flex: 1 }}>
                                {/* Select Date */}
                                <Text style={[styles.label, errors.selectedDate && { color: 'red' }]}>Registration Date</Text>
                                <TouchableOpacity onPress={() => setShow(true)}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="DD-MM-YYYY"
                                        value={selectedDate}
                                        editable={false}
                                    />
                                </TouchableOpacity>

                                {show && (
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="date"
                                        display={Platform.OS === "ios" ? "inline" : "calendar"}
                                        onChange={handleRegDate}
                                    />
                                )}
                            </View>

                        </View>
                    </ScrollView>
                    <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
                        <Text style={styles.submitButtonText}>{loading ? 'Submitting...' : 'Send Enquiry'}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    )
}

export default carInsurance

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
        marginTop: 10
    },
    pickerContainer: {
        borderRadius: 10, // Apply borderRadius here
        overflow: 'hidden',
        backgroundColor: '#edf5ff',
        marginTop: 10,
        // marginBottom: 20,
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
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
})

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
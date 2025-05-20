import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Platform, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import Toast, { BaseToast } from 'react-native-toast-message';
import icons from '@/constants/icons';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import CitySelector from '../../../components/CitySelector';

const carInsurance = () => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const router = useRouter();

    const [brandData, setBrandData] = useState([]);
    const [modalData, setModalData] = useState([]);
    const [variantData, setVariantData] = useState([]);
    const [cityData, setCityData] = useState([]);

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedModal, setSelectedModal] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [city, setCity] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [formattedDate, setFormattedDate] = useState('');
    const [show, setShow] = useState(false);

    // Animation for button
    const buttonScale = useSharedValue(1);
    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(buttonScale.value) }],
    }));

    const toastConfig = {
        success: (props) => (
            <BaseToast
                {...props}
                style={{
                    borderLeftColor: '#34C759',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                    padding: 12,
                }}
                text1Style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#1A1A1A',
                }}
                text2Style={{
                    fontSize: 14,
                    color: '#555',
                }}
                autoHide={false}
            />
        ),
        error: (props) => (
            <BaseToast
                {...props}
                style={{
                    borderLeftColor: '#FF3B30',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                    padding: 12,
                }}
                text1Style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#1A1A1A',
                }}
                text2Style={{
                    fontSize: 14,
                    color: '#555',
                }}
                autoHide={false}
            />
        ),
    };

    const getUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            const parsedData = userData ? JSON.parse(userData) : null;
            if (!parsedData || !parsedData.id) {
                throw new Error('Invalid user data');
            }
            return { userData: parsedData };
        } catch (error) {
            console.error('❌ Error fetching user data:', error);
            Toast.show({
                type: 'error',
                text1: 'Authentication Error',
                text2: 'Please log in again.',
            });
            setTimeout(() => router.push('/signin'), 2000);
            return { userData: null };
        }
    };

    const handleRegDate = (event, date) => {
        if (date) {
            setSelectedDate(date);
            setFormattedDate(date.toISOString().split('T')[0]);
        }
        setShow(false);
    };

    const fetchBrandList = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://carzchoice.com/api/brandlist');
            if (response.data && response.data.data) {
                setBrandData(response.data.data);
            } else {
                console.error('Unexpected API response format:', response.data);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load car brands.',
                });
            }
        } catch (error) {
            console.error('Error fetching brand list:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load car brands.',
            });
        } finally {
            setLoading(false);
        }
    };

    const getCarModal = async (selectedBrand) => {
        if (!selectedBrand) return;
        setLoading(true);
        try {
            const response = await axios.get(`https://carzchoice.com/api/getCarModal/${selectedBrand}`);
            if (response.data && response.data.carModal) {
                setModalData(response.data.carModal.map((model, index) => ({
                    label: String(model),
                    value: String(model),
                    key: index.toString(),
                })));
            } else {
                console.error('Unexpected API response format:', response.data);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load car models.',
                });
            }
        } catch (error) {
            console.error('Error fetching car models:', error.response?.data || error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load car models.',
            });
        } finally {
            setLoading(false);
        }
    };

    const getCarVariant = async (modalName) => {
        if (!modalName) return;
        setLoading(true);
        try {
            const response = await axios.get(`https://carzchoice.com/api/getCarVariant/${modalName}`);
            if (response.data && response.data.carVariant) {
                setVariantData(response.data.carVariant.map((variant, index) => ({
                    label: String(variant),
                    value: String(variant),
                    key: index.toString(),
                })));
            } else {
                console.error('Unexpected API response format:', response.data);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load car variants.',
                });
            }
        } catch (error) {
            console.error('Error fetching car variants:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load car variants.',
            });
        } finally {
            setLoading(false);
        }
    };

    const getCityList = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://carzchoice.com/api/getCityList');
            if (response.data && Array.isArray(response.data.data)) {
                const formattedCities = response.data.data.map((city, index) => ({
                    label: city.District || `City ${index}`,
                    value: city.District || index,
                    key: index.toString(),
                }));
                setCityData(formattedCities);
            } else {
                console.error('Unexpected API response format:', response.data);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load cities.',
                });
            }
        } catch (error) {
            console.error('Error fetching city list:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load cities.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrandList();
        getCityList();
    }, []);

    useEffect(() => {
        if (selectedBrand) {
            getCarModal(selectedBrand);
            setSelectedModal(null);
            setSelectedVariant(null);
            setVariantData([]);
        }
    }, [selectedBrand]);

    useEffect(() => {
        if (selectedModal) {
            getCarVariant(selectedModal);
            setSelectedVariant(null);
        }
    }, [selectedModal]);

    const validateForm = () => {
        const newErrors = {};
        if (!selectedBrand) newErrors.selectedBrand = true;
        if (!selectedModal) newErrors.selectedModal = true;
        if (!selectedVariant) newErrors.selectedVariant = true;
        if (!city) newErrors.city = true;
        if (!formattedDate) newErrors.selectedDate = true;

        setErrors(newErrors);
        // console.log('Validation errors:', newErrors);
        // console.log('Form state:', { selectedBrand, selectedModal, selectedVariant, city, formattedDate });
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Please fill all required fields.',
            });
            return;
        }

        Alert.alert(
            'Confirm Submission',
            'Are you sure you want to submit the insurance enquiry?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Submit',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const { userData } = await getUserData();
                            if (!userData) {
                                throw new Error('User data is missing.');
                            }
                            const { id } = userData;
                            const formData = new FormData();
                            formData.append('userid', id ?? '');
                            formData.append('brandname', selectedBrand);
                            formData.append('carname', selectedModal);
                            formData.append('modalname', selectedVariant);
                            formData.append('city', city);
                            formData.append('registerdate', formattedDate);
                            formData.append('fullname', userData.fullname);
                            formData.append('emailaddress', userData.email);
                            formData.append('phonenumber', userData.contactno);

                            // console.log('Submitting FormData:');
                            // for (let pair of formData.entries()) {
                            //     console.log(`${pair[0]}: ${pair[1]}`);
                            // }

                            const response = await axios.post(
                                'https://carzchoice.com/api/requestinsurance',
                                formData,
                                {
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                    },
                                    timeout: 10000, // 10s timeout
                                }
                            );

                            // console.log('API Response:', response.data);

                            if (response.status === 201 && response.data.success) {
                                Toast.show({
                                    type: 'success',
                                    text1: 'Success',
                                    text2: 'Vehicle added successfully!',
                                });
                                // setTimeout(() => router.push('/dashboard'), 2000); // Navigate to dashboard
                            } else {
                                throw new Error(response.data.message || 'Failed to add vehicle.');
                            }
                        } catch (error) {
                            console.error('API Error:', error?.response?.data || error);
                            const errorMessage = error.response?.data?.message || error.message || 'Something went wrong.';
                            Toast.show({
                                type: 'error',
                                text1: 'Submission Failed',
                                text2: errorMessage.includes('Class')
                                    ? 'Server error. Please contact support.'
                                    : errorMessage,
                            });
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#0061ff', '#003087']}
                className="p-3 px-5 mb-4 flex-row items-center justify-between"
            >
                <Text className="text-xl font-rubik-bold text-white">Car Insurance</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-white/80 p-2 rounded-lg"
                    accessibilityLabel="Go back"
                >
                    <Image source={icons.backArrow} className="w-6 h-6 tint-white" />
                </TouchableOpacity>
            </LinearGradient>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999 }}>
                <Toast config={toastConfig} position="top" />
            </View>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0061FF" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formCard}>
                        <Text style={styles.title} className="font-rubik-bold">
                            Buy or Renew Your Car Insurance
                        </Text>
                        <Text style={styles.subtitle} className="font-rubik-regular">
                            Provide your details so our insurance partner can reach out.
                        </Text>

                        <View style={styles.formContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, errors.selectedBrand && styles.errorLabel]}>
                                    Car Brand Name
                                </Text>
                                <View style={[styles.pickerContainer, errors.selectedBrand && styles.errorBorder]}>
                                    <RNPickerSelect
                                        onValueChange={(value) => setSelectedBrand(value)}
                                        value={selectedBrand}
                                        items={brandData}
                                        style={pickerSelectStyles}
                                        placeholder={{ label: 'Select a brand...', value: null }}
                                    />
                                </View>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, errors.selectedModal && styles.errorLabel]}>
                                    Car Model Name
                                </Text>
                                <View style={[styles.pickerContainer, errors.selectedModal && styles.errorBorder]}>
                                    <RNPickerSelect
                                        onValueChange={(value) => setSelectedModal(value)}
                                        value={selectedModal}
                                        items={modalData}
                                        style={pickerSelectStyles}
                                        placeholder={{ label: 'Select a model...', value: null }}
                                    />
                                </View>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, errors.selectedVariant && styles.errorLabel]}>
                                    Car Variant Name
                                </Text>
                                <View style={[styles.pickerContainer, errors.selectedVariant && styles.errorBorder]}>
                                    <RNPickerSelect
                                        onValueChange={(value) => setSelectedVariant(value)}
                                        value={selectedVariant}
                                        items={variantData}
                                        style={pickerSelectStyles}
                                        placeholder={{ label: 'Select a variant...', value: null }}
                                    />
                                </View>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, errors.city && styles.errorLabel]}>
                                    District / City
                                </Text>
                                <View style={[styles.pickerContainer, errors.city && styles.errorBorder]}>
                                    <CitySelector
                                        cityData={cityData}
                                        onSelectCity={(value) => {
                                            console.log('Selected city:', value);
                                            setCity(value);
                                        }}
                                    />
                                    {/* Fallback to RNPickerSelect if CitySelector fails */}
                                    {/* <RNPickerSelect
                                        onValueChange={(value) => setCity(value)}
                                        value={city}
                                        items={cityData}
                                        style={pickerSelectStyles}
                                        placeholder={{ label: 'Select a city...', value: null }}
                                    /> */}
                                </View>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, errors.selectedDate && styles.errorLabel]}>
                                    Car Registration Date
                                </Text>
                                <TouchableOpacity onPress={() => setShow(true)}>
                                    <TextInput
                                        style={[styles.input, errors.selectedDate && styles.errorBorder]}
                                        placeholder="YYYY-MM-DD"
                                        value={formattedDate}
                                        editable={false}
                                        placeholderTextColor="#A0A0A0"
                                    />
                                </TouchableOpacity>
                                {show && (
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                                        onChange={handleRegDate}
                                        maximumDate={new Date()}
                                    />
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>
            )}

            <Animated.View style={[buttonAnimatedStyle]}>
                <TouchableOpacity
                    onPress={() => {
                        buttonScale.value = 0.95;
                        handleSubmit();
                        setTimeout(() => { buttonScale.value = 1; }, 150);
                    }}
                    style={styles.submitButton}
                    disabled={loading}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={loading ? ['#A0A0A0', '#808080'] : ['#0061FF', '#003087']}
                        style={styles.submitButtonGradient}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Send Enquiry</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

export default carInsurance;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E8ECEF',
    },
    headerText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
    },
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
        fontFamily: 'Rubik-Regular',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 20,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
    },
    formContainer: {
        marginTop: 0,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    errorLabel: {
        color: '#FF3B30',
    },
    input: {
        backgroundColor: '#F7F9FC',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#E8ECEF',
        fontFamily: 'Rubik-Regular',
    },
    pickerContainer: {
        backgroundColor: '#F7F9FC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8ECEF',
    },
    errorBorder: {
        borderColor: '#FF3B30',
        borderWidth: 2,
    },
    submitButton: {
        marginHorizontal: 16,
        marginVertical: 20,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 12,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Rubik-Medium',
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 0,
        paddingHorizontal: 10,
        backgroundColor: '#F7F9FC',
        borderRadius: 12,
        color: '#1A1A1A',
        fontFamily: 'Rubik-Regular',
    },
    inputAndroid: {
        fontSize: 16,
        paddingVertical: 0,
        paddingHorizontal: 10,
        backgroundColor: '#F7F9FC',
        borderRadius: 12,
        color: '#1A1A1A',
        fontFamily: 'Rubik-Regular',
    },
    placeholder: {
        color: '#A0A0A0',
    },
});
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import images from '@/constants/images';
import icons from '@/constants/icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast, { BaseToast } from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const EditProfile = () => {
    // Initialize state with defaults as empty, to be updated from AsyncStorage
    const [image, setImage] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [usertype, setUsertype] = useState('');
    const [district, setDistrict] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [pincode, setPincode] = useState('');
    const [state, setState] = useState('');
    const [address, setAddress] = useState('');

    // Animation for buttons
    const buttonScale = useSharedValue(1);
    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(buttonScale.value) }],
    }));

    // Load defaults from AsyncStorage on mount
    useEffect(() => {
        const loadAsyncStorageDefaults = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem('userData');
                if (storedUserData) {
                    const parsedUserData = JSON.parse(storedUserData);
                    setUserId(parsedUserData.id || null);
                    setUsername(parsedUserData.fullname || '');
                    setEmail(parsedUserData.email || '');
                    setPhoneNumber(parsedUserData.contactno || '');
                    setUsertype(parsedUserData.usertype || '');
                    setDistrict(parsedUserData.district || '');
                    setState(parsedUserData.state || '');
                    setPincode(parsedUserData.pincode || '');
                    setAddress(parsedUserData.addresss || '');
                    setImage(parsedUserData.dp || images.avatar);
                }
            } catch (error) {
                console.error('Error loading AsyncStorage defaults:', error);
            }
        };

        loadAsyncStorageDefaults();
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const storedUserData = await AsyncStorage.getItem('userData');
            const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;

            if (!parsedUserData || !parsedUserData.id) {
                await AsyncStorage.removeItem('userData');
                router.push('/signin');
                return;
            }

            const response = await axios.get(`https://carzchoice.com/api/userprofile/${parsedUserData.id}`);
            const data = response.data?.userData?.[0];

            if (!data || typeof data !== 'object') {
                throw new Error('Invalid API response format');
            }

            setUserId(data.id);
            setUsername(data.fullname || '');
            setUsertype(data.usertype || '');
            setEmail(data.email || '');
            setPhoneNumber(data.contactno || '');
            setDistrict(data.district || '');
            setState(data.state || '');
            setPincode(data.pincode || '');
            setAddress(data.addresss || data.address || '');

            let profileImage = data?.dp || '';
            if (typeof profileImage === 'number') {
                profileImage = profileImage.toString();
            }
            if (profileImage && profileImage !== 'null' && profileImage !== 'undefined') {
                profileImage = profileImage.startsWith('http')
                    ? profileImage
                    : `https://carzchoice.com/assets/backend-assets/images/${profileImage}`;
            } else {
                profileImage = images.avatar;
            }
            setImage(profileImage);

            // Update AsyncStorage with fetched data
            await AsyncStorage.setItem('userData', JSON.stringify({
                id: data.id,
                fullname: data.fullname,
                email: data.email,
                contactno: data.contactno,
                usertype: data.usertype,
                district: data.district,
                state: data.state,
                pincode: data.pincode,
                addresss: data.addresss || data.address,
                dp: profileImage,
            }));
        } catch (error) {
            console.error('Error fetching profile data:', error.message, error.response?.data);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load profile data. Using local data if available.',
            });
            // Don't redirect; rely on AsyncStorage defaults
        } finally {
            setLoading(false);
        }
    };

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
            />
        ),
    };

    const pickImage = async () => {
        try {
            setImageUploading(true);
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert(
                    'Permission Denied',
                    'Please allow access to photos to select an image.',
                    [{ text: 'OK' }]
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.length > 0) {
                const imageUri = result.assets[0].uri;
                // Validate image size (< 2MB)
                const response = await fetch(imageUri);
                const blob = await response.blob();
                if (blob.size > 2 * 1024 * 1024) {
                    Toast.show({
                        type: 'error',
                        text1: 'Invalid Image',
                        text2: 'Image size must be less than 2MB.',
                    });
                    return;
                }
                setImage(imageUri);
            } else {
                console.log('Image selection canceled or failed');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to pick image. Please try again.',
            });
        } finally {
            setImageUploading(false);
        }
    };

    const validateInputs = () => {
        if (!username.trim()) return 'Username is required.';
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Valid email is required.';
        if (!phoneNumber.trim() || !/^\d{10}$/.test(phoneNumber)) return 'Valid 10-digit phone number is required.';
        if (!district.trim()) return 'District is required.';
        if (!state.trim()) return 'State is required.';
        if (!pincode.trim() || !/^\d{6}$/.test(pincode)) return 'Valid 6-digit pincode is required.';
        if (!address.trim()) return 'Address is required.';
        return null;
    };

    const handleSubmit = async () => {
        if (!userId) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'User ID is missing. Please try again.',
            });
            return;
        }

        const validationError = validateInputs();
        if (validationError) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Input',
                text2: validationError,
            });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('fullname', username);
            formData.append('email', email);
            formData.append('contactno', phoneNumber);
            formData.append('district', district);
            formData.append('pincode', pincode);
            formData.append('state', state);
            formData.append('addresss', address);
            formData.append('usertype', usertype);

            if (image && image.startsWith('file://')) {
                const fileType = image.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
                const fileName = `profile.${fileType.split('/')[1]}`;
                formData.append('dp', {
                    uri: image,
                    name: fileName,
                    type: fileType,
                });
            }

            // console.log('Submitting FormData for userId:', userId);
            // console.log('FormData fields:', {
            //     fullname: username,
            //     email,
            //     contactno: phoneNumber,
            //     district,
            //     pincode,
            //     state,
            //     addresss: address,
            //     usertype,
            //     hasImage: !!image && image.startsWith('file://'),
            // });

            const response = await axios.post(
                `https://carzchoice.com/api/updateuserprofile/${userId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json',
                    },
                    timeout: 10000,
                }
            );

            if (response.data.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Profile updated successfully!',
                });
                // Store all form data in AsyncStorage
                await AsyncStorage.setItem('userData', JSON.stringify({
                    id: userId,
                    fullname: username,
                    email,
                    contactno: phoneNumber,
                    usertype,
                    district,
                    state,
                    pincode,
                    addresss: address,
                    dp: image && !image.startsWith('file://') ? image : response.data.userData?.dp || null,
                }));
                fetchProfileData();
            } else {
                throw new Error(response.data.message || 'Unexpected server response.');
            }
        } catch (error) {
            console.error('Error updating profile:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            const errorMessage =
                error.response?.data?.message?.includes('Class')
                    ? 'Image upload failed due to server configuration.'
                    : error.response?.data?.message ||
                      (error.message === 'timeout of 10000ms exceeded'
                          ? 'Request timed out. Please check your network.'
                          : 'Could not update profile. Please try again.');

            Toast.show({
                type: 'error',
                text1: 'Update Failed',
                text2: errorMessage,
            });

            if (error.response?.data?.message?.includes('Class')) {
                Alert.alert(
                    'Image Upload Failed',
                    'The server failed to process the image. Would you like to update without an image?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Update Without Image',
                            onPress: () => {
                                setImage(null);
                                handleSubmit();
                            },
                        },
                    ]
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#0061ff', '#003087']}
                className="p-3 px-5 flex-row items-center justify-between"
            >
                <Text className="text-xl font-rubik-bold text-white">Edit {usertype} Profile</Text>
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
                    <Text style={styles.loadingText}>Loading Profile...</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.profileCard}>
                        <View style={styles.profileImageContainer}>
                            <Image
                                source={image ? { uri: image } : images.avatar}
                                style={styles.profileImage}
                            />
                            <TouchableOpacity
                                onPress={pickImage}
                                style={styles.editIconContainer}
                                disabled={imageUploading}
                                activeOpacity={0.7}
                            >
                                {imageUploading ? (
                                    <ActivityIndicator size="small" color="#0061FF" />
                                ) : (
                                    <LinearGradient
                                        colors={['#0061FF', '#003087']}
                                        style={styles.editIconGradient}
                                    >
                                        <Image source={icons.edit} style={styles.editIcon} />
                                    </LinearGradient>
                                )}
                            </TouchableOpacity>
                            <Text style={styles.usernameText} className="capitalize font-rubik-bold">
                                {username || 'User'}
                            </Text>
                            <Text style={styles.usertypeText} className="capitalize font-rubik">
                                ({usertype || 'N/A'})
                            </Text>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Username</Text>
                                <TextInput
                                    style={styles.input}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Enter your name"
                                    autoCapitalize="words"
                                    placeholderTextColor="#A0A0A0"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter email address"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor="#A0A0A0"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone Number</Text>
                                <TextInput
                                    style={styles.input}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    placeholder="Enter phone number"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    placeholderTextColor="#A0A0A0"
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, styles.flex1]}>
                                    <Text style={styles.label}>District</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={district}
                                        onChangeText={setDistrict}
                                        placeholder="Enter district"
                                        autoCapitalize="words"
                                        placeholderTextColor="#A0A0A0"
                                    />
                                </View>
                                <View style={[styles.inputGroup, styles.flex1]}>
                                    <Text style={styles.label}>State</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={state}
                                        onChangeText={setState}
                                        placeholder="Enter state"
                                        autoCapitalize="words"
                                        placeholderTextColor="#A0A0A0"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Pincode</Text>
                                <TextInput
                                    style={styles.input}
                                    value={pincode}
                                    onChangeText={setPincode}
                                    placeholder="Enter pincode"
                                    keyboardType="numeric"
                                    maxLength={6}
                                    placeholderTextColor="#A0A0A0"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Address</Text>
                                <TextInput
                                    style={[styles.input, styles.textarea]}
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholder="Enter address here"
                                    multiline
                                    numberOfLines={5}
                                    maxLength={120}
                                    textAlignVertical="top"
                                    placeholderTextColor="#A0A0A0"
                                />
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
                            <Text style={styles.submitButtonText}>Update Profile</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

export default EditProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
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
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#E8ECEF',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderRadius: 20,
        overflow: 'hidden',
    },
    editIconGradient: {
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    editIcon: {
        width: 20,
        height: 20,
        tintColor: '#FFFFFF',
    },
    usernameText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginTop: 12,
    },
    usertypeText: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
    formContainer: {
        marginTop: 10,
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
    textarea: {
        height: 120,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    flex1: {
        flex: 1,
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
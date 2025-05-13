import { ScrollView, StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import images from '@/constants/images';
import icons from '@/constants/icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast, { BaseToast } from 'react-native-toast-message';

const EditProfile = () => {
    const [image, setImage] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [usertype, setUsertype] = useState('');
    const [district, setDistrict] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [pincode, setPincode] = useState('');
    const [state, setState] = useState('');
    const [address, setAddress] = useState('');

    // Fetch existing profile data
    useEffect(() => {

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
            const data = response.data?.userData?.[0]; // ✅ Correct key

            if (!data || typeof data !== 'object') {
                console.error("Invalid API response format:", response.data);
                return;
            }

            // console.log("userData:", data);

            setUserId(data.id);
            setUsername(data.fullname);
            setUsertype(data.usertype);
            setEmail(data.email);
            setPhoneNumber(data.contactno);
            setDistrict(data.district);
            setState(data.state);
            setPincode(data.pincode);
            setAddress(data.addresss);

            let profileImage = data?.dp || ""; // Ensure it’s at least an empty string

            if (typeof profileImage === "number") {
                profileImage = profileImage.toString(); // Convert number to string
            }

            if (profileImage && profileImage !== "null" && profileImage !== "undefined") {
                profileImage = profileImage.startsWith("http")
                    ? profileImage
                    : `https://carzchoice.com/assets/backend-assets/images/${profileImage}`;
            } else {
                profileImage = images.avatar; // Fallback to default
            }

            setImage(profileImage);
        } catch (error) {
            console.error("Error fetching profile data:", error);
        } finally {
            setLoading(false);
        }
    };

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

    // Handle image selection
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
    
        try {
            const formData = new FormData();
            formData.append('fullname', username);
            formData.append('email', email);
            formData.append('contactno', phoneNumber);
            formData.append('district', district);
            formData.append('pincode', pincode);
            formData.append('state', state);
            formData.append('addresss', address); // Ensure spelling matches DB field
    
            // ✅ Append image ONLY if it's a local file
            if (image && image.startsWith('file://')) {
                formData.append('dp', {
                    uri: image,
                    name: 'profile.jpg',
                    type: 'image/jpeg',
                });
            }
    
            console.log("Submitting FormData:", formData);
    
            const response = await axios.post(
                `https://carzchoice.com/api/updateuserprofile/${userId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json',
                    },
                }
            );
    
            if (response.data.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Profile updated successfully!',
                });
    
                fetchProfileData(); // Refresh profile
            } else {
                throw new Error(response.data.message || 'Unexpected server response.');
            }
        } catch (error) {
            console.error('Error updating profile:', error.response?.data || error.message);
            Toast.show({
                type: 'error',
                text1: 'Update Failed',
                text2: 'Could not update profile. Try again later.',
            });
        } finally {
            setLoading(false);
        }
    };
    



    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText} className="capitalize">Edit {usertype} Profile</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Image source={icons.backArrow} style={styles.icon} />
                </TouchableOpacity>
            </View>
            <Toast config={toastConfig} position="top" />

            {loading ? (
                <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 50 }} />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.profileImageContainer}>

                        <Image source={image ? { uri: image } : images.avatar} style={styles.profileImage} />
                        <TouchableOpacity onPress={pickImage} style={styles.editIconContainer}>
                            <Image source={icons.edit} style={styles.editIcon} />
                        </TouchableOpacity>

                        <View>
                            <Text style={styles.roleText} className="capitalize text-black font-rubik-bold">{username}</Text>
                            <Text className="capitalize font-rubik me-4">({usertype})</Text>
                        </View>
                    </View>

                    <View>
                        <Text style={styles.label}>Username</Text>
                        <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Enter your name" />

                        <Text style={styles.label}>Email Address</Text>
                        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter email address" />

                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Enter phone number" />
                        
                        <View className="flex flex-row gap-4">
                            <View className="flex-1">
                                <Text style={styles.label}>District</Text>
                                <TextInput style={styles.input} value={district} onChangeText={setDistrict} placeholder="Enter district" />
                            </View>

                            <View className="flex-1">
                                <Text style={styles.label}>State</Text>
                                <TextInput style={styles.input} value={state} onChangeText={setState} placeholder="Enter State" />
                            </View>
                        </View>


                        <Text style={styles.label}>Pincode</Text>
                        <TextInput style={styles.input} value={pincode} onChangeText={setPincode} placeholder="Enter Pincode" />

                        <Text style={styles.label}>Address</Text>
                        <TextInput
                            style={styles.textarea}
                            value={address}
                            onChangeText={setAddress} maxLength={120}
                            placeholder="Enter Address here"
                            multiline numberOfLines={5}
                        />

                    </View>
                </ScrollView>
            )}

            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
                <Text style={styles.submitButtonText}>{loading ? 'UPDATING...' : 'UPDATE PROFILE'}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default EditProfile;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    backButton: {
        backgroundColor: '#ccc',
        borderRadius: 20,
        padding: 10,
    },
    icon: {
        width: 20,
        height: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileImageContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 60,
        right: 135,
    },
    editIcon: {
        width: 30,
        height: 30,
    },
    roleText: {
        fontSize: 16,
        fontWeight: 'normal',
        marginTop: 10,
    },
    label: {
        fontSize: 16,
        marginVertical: 5,
    },
    input: {
        backgroundColor: '#edf5ff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    docItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    thumbnail: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    dropbox: {
        backgroundColor: '#e0e0e0',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    downloadText: {
        color: 'black',
    },
    submitButton: {
        backgroundColor: '#0061ff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 20,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    textarea: {
        textAlignVertical: 'top',  // hack android
        height: 110,
        fontSize: 14,
        borderRadius: 10,
        color: '#333',
        padding: 15,
        backgroundColor: '#edf5ff',
    },
});

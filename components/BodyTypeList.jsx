import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const BodyTypeList = () => {
    const params = useLocalSearchParams();
    const router = useRouter();

    const [selectedCategory, setSelectedCategory] = useState(params.bodyType || null);
    const [bodyTypes, setBodyTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    const screenWidth = Dimensions.get('window').width;
    const ITEM_MARGIN = 10;
    const ITEMS_PER_ROW = 5;
    const itemWidth = (screenWidth - ITEM_MARGIN) / ITEMS_PER_ROW;

    const handleCategoryPress = (category) => {
        const updatedParams = { ...params, bodyType: category };
        setSelectedCategory(category);
        router.push({ pathname: "explore", params: updatedParams });
    };

    const fetchBodyTypes = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://carzchoice.com/api/getMasterDataLists");
            const bodyTypeData = response?.data?.data?.bodyType || [];
            if (Array.isArray(bodyTypeData)) {
                setBodyTypes(bodyTypeData.map(item => ({
                    ...item,
                    label: item.label === "Compect SUV" ? "Compact SUV" : item.label,
                    value: item.label === "Compect SUV" ? "Compact SUV" : item.value,
                })));
            } else {
                throw new Error("Invalid body type data format");
            }
        } catch (error) {
            console.error("Error fetching body types:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to load body types. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBodyTypes();
    }, []);

    return (
        <View className="flex flex-row flex-wrap mt-5 mb-2 pb-3 justify-center">
            {loading ? (
                <Text>Loading...</Text>
            ) : (
                bodyTypes.slice(0, 15).map((item) => (
                    <TouchableOpacity
                        key={item.id.toString()}
                        onPress={() => handleCategoryPress(item.value)}
                        style={{
                            width: itemWidth,
                            marginRight: ITEM_MARGIN,
                            marginBottom: ITEM_MARGIN,
                            backgroundColor: '#fff',
                            borderColor: '#eee',
                            borderWidth: 1,
                            borderRadius: 10,
                            alignItems: 'center',
                            paddingVertical: 5,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 2,
                            elevation: 2,
                        }}
                    >
                        <Image
                            style={styles.brandImg}
                            source={
                                item.iconimage
                                    ? { uri: `https://carzchoice.com/assets/backend-assets/images/${item.iconimage}` }
                                    : { uri: `https://carzchoice.com/assets/backend-assets/images/1c303b0eed3133200cf715285011b4e4.jpg}` } // Replace with your default image path
                            }
                            onError={() => console.error(`Error loading image for ${item.label}`)}
                            defaultSource={{ uri: `https://carzchoice.com/assets/backend-assets/images/1c303b0eed3133200cf715285011b4e4.jpg` }}
                        />
                        <Text style={{ fontSize: 12, marginTop: 3, fontWeight: '600', textAlign: 'center' }}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))
            )}

            {bodyTypes.length > 11 && !loading && (
                <TouchableOpacity
                    onPress={() => router.push('../dashboard/AllBodyTypes')}
                    style={{
                        width: itemWidth,
                        marginRight: ITEM_MARGIN,
                        marginBottom: ITEM_MARGIN,
                        backgroundColor: '#f5f5f5',
                        borderColor: '#0061ff',
                        borderWidth: 1,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 10,
                    }}
                >
                    <Text className="text-sm text-black font-rubik text-center">View More</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default BodyTypeList;

const styles = StyleSheet.create({
    brandImg: {
        width: 50,
        height: 50,
        resizeMode: "contain",
    },
});
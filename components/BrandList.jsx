import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

const BrandList = () => {
    const params = useLocalSearchParams();
    const router = useRouter();

    const [selectedCategory, setSelectedCategory] = useState(params.brand || 'All');
    const [brandData, setBrandData] = useState([]);
    const [loading, setLoading] = useState(false);

    const screenWidth = Dimensions.get('window').width;
    const ITEM_MARGIN = 10; // space between items
    const ITEMS_PER_ROW = 5;

    // Dynamic item width calculation (including margin)
    const itemWidth = (screenWidth - ITEM_MARGIN) / ITEMS_PER_ROW;

    const handleCategoryPress = (category) => {
        const updatedParams = { ...params, brand: category };
        setSelectedCategory(category);
        router.push({ pathname: "explore", params: updatedParams });
    };


    const fetchBrandList = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://carzchoice.com/api/brandlist");
            if (response.data && response.data.data) {
                setBrandData(response.data.data);
            } else {
                console.error("Unexpected API response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching brand list:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrandList();
    }, []);

    return (

        <View className="flex flex-row flex-wrap mt-5 mb-2 pb-3 justify-center">
            {brandData.slice(0, 11).map((item) => (
                <TouchableOpacity
                    key={item.id.toString()}
                    onPress={() => handleCategoryPress(item.label)}
                    style={{
                        width: itemWidth,
                        marginRight: ITEM_MARGIN,
                        marginBottom: ITEM_MARGIN,
                    }}
                    className={`flex flex-col items-center rounded-xl p-2 border border-gray-300 }`}
                >
                    {item.iconimage ? (
                        <Image
                            style={[styles.brandImg, { width: 65, height: 50 }]}
                            source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${item.iconimage}` }}
                            onError={(e) => console.error(`Error loading image for ${item.label}:`, e.nativeEvent.error)}
                        />
                    ) : (
                        <Text>No Image</Text>
                    )}
                    <Text
                        className={`text-xs text-center font-rubik-bold mt-1 }`}
                    >
                        {item.label}
                    </Text>
                </TouchableOpacity>
            ))}

            {brandData.length > 12 && (
                <TouchableOpacity
                    onPress={() => router.push('../dashboard/AllBrands')}
                    style={{
                        width: itemWidth,
                        marginRight: ITEM_MARGIN,
                        marginBottom: ITEM_MARGIN,
                    }}
                    className="flex flex-col justify-center items-center rounded-xl bg-gray-200 border border-primary-200 p-2"
                >
                    <Text className="text-sm text-black font-rubik text-center">View More</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default BrandList;

const styles = StyleSheet.create({
    brandImg: {
        width: 60,
        height: 60,
        resizeMode: "contain",
    },
});

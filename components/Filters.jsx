import { StyleSheet, Text, Image, TouchableOpacity, ScrollView, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

const Filters = () => {
    const params = useLocalSearchParams();
    const router = useRouter();

    const [selectedCategory, setSelectedCategory] = useState(params.brand || 'All');
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleCategoryPress = (category) => {
        const isRemovingFilter = selectedCategory === category;

        // Prepare new query parameters
        const updatedParams = { ...params };

        if (isRemovingFilter) {
            // delete updatedParams.brand; // Remove filter if category is already selected
            setSelectedCategory(category);
        } else {
            updatedParams.brand = category;
            setSelectedCategory(category);
        }

        // Navigate with updated query parameters
        router.push({
            pathname: "explore",
            params: updatedParams,
        });
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://carzchoice.com/api/brandlist");

            if (response.data && response.data.data) {
                setCategoryData(response.data.data);
                // console.log("categogy data:",categoryData)
            } else {
                console.error("Unexpected API response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 mb-2 pb-3">
            {categoryData.map((item) => (
                <TouchableOpacity
                    key={item.id.toString()} // ✅ Ensure unique key
                    onPress={() => handleCategoryPress(item.label)}
                    className={`flex flex-row justify-center items-center mr-2 px-4 rounded-full ${selectedCategory === item.label ? 'bg-white  border-2 border-primary-300' : '  border border-primary-200'
                        }`}
                >
                    {item.iconimage ? (
                        <Image
                            style={styles.brandImg}
                            source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${item.iconimage}` }}
                            onError={(e) => console.error(`Error loading image for ${item.label}:`, e.nativeEvent.error)}
                        />
                    ) : (
                        <Text>No Image</Text>
                    )}

                    <Text className={`text-sm font-rubik-medium ${selectedCategory === item.label ? 'text-primary-300 font-rubik-bold mt-0.5' : 'text-black-300 font-rubik'}`}>
                        {item.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

export default Filters;

const styles = StyleSheet.create({
    brandImg: {
        width: 35,
        height: 35,
        resizeMode: "contain",
        marginEnd: 5,
        borderRadius: 50,
    },
});

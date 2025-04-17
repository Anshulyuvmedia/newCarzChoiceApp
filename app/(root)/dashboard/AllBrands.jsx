import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, FlatList, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import icons from "@/constants/icons";

const AllBrands = () => {
    const params = useLocalSearchParams();
    const router = useRouter();

    const [selectedCategory, setSelectedCategory] = useState(params.brand || 'All');
    const [brandData, setBrandData] = useState([]);
    const [filteredBrands, setFilteredBrands] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const screenWidth = Dimensions.get('window').width;
    const ITEM_MARGIN = 10;
    const ITEMS_PER_ROW = 4;
    const ITEM_WIDTH = (screenWidth - 20 * 2 - ITEM_MARGIN * (ITEMS_PER_ROW - 1)) / ITEMS_PER_ROW;

    const handleCategoryPress = (category) => {
        const isRemovingFilter = selectedCategory === category;
        const updatedParams = { ...params };

        if (isRemovingFilter) {
            delete updatedParams.brand;
            setSelectedCategory('All');
        } else {
            updatedParams.brand = category;
            setSelectedCategory(category);
        }

        router.push({ pathname: "explore", params: updatedParams });
    };

    const fetchBrandList = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://carzchoice.com/api/brandlist");
            if (response.data?.data) {
                setBrandData(response.data.data);
                setFilteredBrands(response.data.data);
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

    useEffect(() => {
        const filtered = brandData.filter(brand =>
            brand.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredBrands(filtered);
    }, [searchQuery, brandData]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleCategoryPress(item.label)}
            style={{
                width: ITEM_WIDTH,
                margin: ITEM_MARGIN / 2,
                backgroundColor: 'white',
                borderColor: 'lightgray',
                borderWidth: 1,
                borderRadius: 10,
                alignItems: 'center',
                paddingVertical: 2,
            }}
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
            <Text
                style={{
                    fontSize: 12,
                    marginTop: 4,
                    fontWeight: '600'
                }}
            >
                {item.label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 mt-3 px-5">
            {/* Header */}
            <View className="flex flex-row items-center justify-between mb-3">
                <Text className="text-xl font-rubik-bold">All Brands</Text>
                <TouchableOpacity onPress={() => router.back()} className="flex-row bg-gray-300 rounded-full w-11 h-11 items-center justify-center">
                    <Image source={icons.backArrow} className="w-5 h-5" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="flex flex-row items-center justify-between w-full rounded-lg bg-accent-100 border border-primary-100 py-2">
                <View className="flex-1 flex flex-row items-center">
                    <Image source={icons.search} className="size-5 ms-3" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={(text) => setSearchQuery(text)}
                        placeholder="Search brand..."
                        className="text-sm font-rubik text-black-300 ml-2 flex-1"
                    />
                </View>
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Text className="text-red-500">Clear</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View className="flex-1 mt-5">
                {/* Brand List */}
                <FlatList
                    data={filteredBrands}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={ITEMS_PER_ROW}
                    columnWrapperStyle={{ justifyContent: 'center', paddingHorizontal: 20 }}
                    contentContainerStyle={{ paddingBottom: 100, }}
                    keyboardShouldPersistTaps="handled"
                />
            </View>
        </View>
    );
};

export default AllBrands;

const styles = StyleSheet.create({
    brandImg: {
        width: 60,
        height: 60,
        resizeMode: "contain",
        backgroundColor: "white",
    },
});

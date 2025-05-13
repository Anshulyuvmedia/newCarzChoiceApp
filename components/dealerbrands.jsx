import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import icons from "@/constants/icons";

const Dealerbrands = () => {
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
    const ITEM_WIDTH = (screenWidth - 40 - ITEM_MARGIN * (ITEMS_PER_ROW - 1)) / ITEMS_PER_ROW;

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

        router.push({ pathname: "/../dealers/exploredealers", params: updatedParams });
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
                backgroundColor: '#fff',
                borderColor: '#eee',
                borderWidth: 1,
                borderRadius: 10,
                alignItems: 'center',
                paddingVertical: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
            }}
        >
            {item.iconimage ? (
                <Image
                    style={styles.brandImg}
                    source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${item.iconimage}` }}
                />
            ) : (
                <Text style={{ fontSize: 10, color: 'gray' }}>No Image</Text>
            )}
            <Text style={{ fontSize: 12, marginTop: 6, fontWeight: '600', textAlign: 'center' }}>
                {item.label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white px-5 pt-4">
            {/* Search Bar */}
            <View className="flex-row items-center bg-gray-100 border border-gray-300 rounded-lg px-3 py-2">
                <Image source={icons.search} className="w-5 h-5 mr-2" />
                <TextInput
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                    placeholder="Search Dealer Brand..."
                    placeholderTextColor="#888"
                    className="flex-1 text-base text-black"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Text className="text-red-500 text-sm font-medium">Clear</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Brand Grid */}
            {loading ? (
                <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 100 }} />
            ) : (
                <FlatList
                    data={filteredBrands}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={ITEMS_PER_ROW}
                    columnWrapperStyle={{ justifyContent: 'center', marginTop: 12 }}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyboardShouldPersistTaps="handled"
                />
            )}

        </View>
    );
};

export default Dealerbrands;

const styles = StyleSheet.create({
    brandImg: {
        width: 60,
        height: 60,
        resizeMode: "contain",
    },
});

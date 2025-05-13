import { View, TouchableOpacity, Image, TextInput, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import RBSheet from "react-native-raw-bottom-sheet";
import icons from "@/constants/icons";
import images from '@/constants/images';
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const Search = ({ selectedFilters = {}, setSelectedFilters }) => {
    const refRBSheet = useRef(null);
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [fuelTypes, setFuelTypes] = useState([]);
    const [transmissions, setTransmissions] = useState([]);
    const [bodyTypes, setBodyTypes] = useState([]);

    useEffect(() => {
        getMasterDataLists();
    }, []);

    const getMasterDataLists = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://carzchoice.com/api/getMasterDataLists");
            if (response.data && response.data.data) {
                const { brands, budgets, fuelTypes, transmissions, bodyType } = response.data.data;
                const fixedBodyTypes = bodyType.map(item => ({
                    ...item,
                    label: item.label === "Compect SUV" ? "Compact SUV" : item.label,
                    value: item.label === "Compect SUV" ? "Compact SUV" : item.value,
                }));

                setBrands(brands || []);
                setBudgets(budgets || []);
                setFuelTypes(fuelTypes || []);
                setTransmissions(transmissions || []);
                setBodyTypes(fixedBodyTypes || []);
            } else {
                throw new Error("Unexpected API response format");
            }
        } catch (error) {
            console.error("Error fetching master data:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to fetch filter data. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!Object.values(selectedFilters).some(val => val)) {
            Toast.show({
                type: "info",
                text1: "No Filters Selected",
                text2: "Please select at least one filter to search.",
            });
            return;
        }
        if (refRBSheet.current) {
            refRBSheet.current.close();
        }
        router.push({
            pathname: "explore",
            params: selectedFilters,
        });
        Toast.show({
            type: "success",
            text1: "Filters Applied",
            text2: "Your vehicle search filters have been applied successfully.",
        });
    };

    const resetFilters = () => {
        setSelectedFilters({
            budget: null,
            fuelType: null,
            transmission: null,
            brand: null,
            bodyType: null,
        });
        Toast.show({
            type: "info",
            text1: "Filters Reset",
            text2: "All search filters have been cleared.",
        });
    };

    const FilterChip = React.memo(({ item, isSelected, onPress, labelKey, icon = false }) => {
        const scale = useSharedValue(1);
        const [imageError, setImageError] = useState(false);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: withSpring(scale.value) }],
        }));

        const handlePress = () => {
            scale.value = 0.95;
            onPress();
        };

        return (
            <Animated.View style={[animatedStyle]}>
                <TouchableOpacity
                    onPress={handlePress}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 50,
                        borderWidth: 1,
                        borderColor: isSelected ? "#0061ff" : "#ddd",
                        backgroundColor: isSelected ? "#e3f2fd" : "#f8f9fa",
                        marginRight: 10,
                    }}
                    accessibilityLabel={`${isSelected ? "Deselect" : "Select"} ${item[labelKey]}`}
                >
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={18}
                            color={isSelected ? "#0061ff" : "#555"}
                            style={{ marginRight: 6 }}
                        />
                    )}
                    {item.iconimage && !icon && !imageError ? (
                        <Image
                            style={{
                                width: 24,
                                height: 24,
                                marginRight: 6,
                                resizeMode: "contain",
                                borderRadius: 50,
                            }}
                            source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${item.iconimage}` }}
                            onError={() => {
                                console.error(`Failed to load image for ${item[labelKey]}`);
                                setImageError(true);
                            }}
                            defaultSource={images.reactlogo}
                        />
                    ) : item.iconimage && !icon && imageError ? (
                        <Image
                            style={{
                                width: 24,
                                height: 24,
                                marginRight: 6,
                                resizeMode: "contain",
                                borderRadius: 50,
                            }}
                            source={images.reactlogo}
                        />
                    ) : null}
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: isSelected ? "600" : "400",
                            color: isSelected ? "#0061ff" : "#1a1a1a",
                            textTransform: "capitalize",
                        }}
                    >
                        {item[labelKey]}
                    </Text>
                    {isSelected && (
                        <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#0061ff"
                            style={{ marginLeft: 6 }}
                        />
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    });

    // Fallback for selectedFilters
    const filters = selectedFilters || {
        budget: null,
        fuelType: null,
        transmission: null,
        brand: null,
        bodyType: null,
    };

    return (
        <View className="flex-1">
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0061ff" />
                </View>
            )}
            <TouchableOpacity
                onPress={() => refRBSheet.current.open()}
                style={styles.searchBar}
                accessibilityLabel="Open search filters"
            >
                <LinearGradient
                    colors={["#ffffff", "#f0f0f0"]}
                    style={styles.searchBarGradient}
                >
                    <View className="flex-row items-center justify-start flex-1">
                        <Image source={icons.search} className="w-6 h-6" />
                        <TextInput
                            value={[
                                filters.budget,
                                filters.transmission,
                                filters.fuelType,
                                filters.brand,
                                filters.bodyType,
                            ]
                                .filter((val) => val)
                                .join(", ")}
                            editable={false}
                            placeholder="Search Vehicle..."
                            className="text-sm font-rubik-medium text-gray-800 ml-3 flex-1 capitalize"
                        />
                    </View>
                    <Image source={icons.filter} className="w-5 h-5" />
                </LinearGradient>
            </TouchableOpacity>

            <RBSheet
                ref={refRBSheet}
                height={600}
                openDuration={250}
                closeOnDragDown={true}
                customStyles={{
                    container: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        paddingHorizontal: 0,
                        paddingBottom: 20,
                        backgroundColor: "#fff",
                    },
                    draggableIcon: {
                        backgroundColor: "#ddd",
                        width: 50,
                        height: 5,
                        borderRadius: 3,
                        marginVertical: 10,
                    },
                }}
            >
                <View>
                    <LinearGradient
                        colors={["#0061ff", "#003087"]}
                        style={styles.header}
                    >
                        <Text className="text-xl font-rubik-bold text-white">
                            Filter Your Search
                        </Text>
                        <View className="flex-row">
                            <TouchableOpacity
                                onPress={resetFilters}
                                style={styles.headerButton}
                                accessibilityLabel="Reset all filters"
                            >
                                <LinearGradient
                                    colors={["#ffffff", "#f0f0f0"]}
                                    style={styles.headerButtonGradient}
                                >
                                    <Text className="text-sm font-rubik-medium text-gray-800">
                                        Reset
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => refRBSheet.current.close()}
                                style={[styles.headerButton, { marginLeft: 10 }]}
                                accessibilityLabel="Close filter sheet"
                            >
                                <LinearGradient
                                    colors={["#ff4444", "#cc0000"]}
                                    style={styles.headerButtonGradient}
                                >
                                    <Text className="text-sm font-rubik-medium text-white">
                                        Close
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    <Text className="text-lg font-rubik-bold text-gray-800 mt-5 mx-4">
                        Search by Brand
                    </Text>
                    {brands.length > 0 ? (
                        <FlatList
                            data={brands}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => `brand-${item.id}`}
                            keyboardShouldPersistTaps="handled"
                            style={{ marginTop: 10, marginStart: 10 }}
                            renderItem={({ item }) => (
                                <FilterChip
                                    item={item}
                                    isSelected={filters.brand === item.label}
                                    onPress={() =>
                                        setSelectedFilters(prev => ({
                                            ...prev,
                                            brand: prev?.brand === item.label ? null : item.label,
                                        }))
                                    }
                                    labelKey="label"
                                />
                            )}
                        />
                    ) : (
                        <Text className="text-sm text-gray-500 mx-4 mt-2">
                            No brands available
                        </Text>
                    )}

                    <Text className="text-lg font-rubik-bold text-gray-800 mt-5 mx-4">
                        Budget
                    </Text>
                    {budgets.length > 0 ? (
                        <FlatList
                            data={budgets}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => `budget-${index}`}
                            keyboardShouldPersistTaps="handled"
                            style={{ marginTop: 10, marginStart: 10 }}
                            renderItem={({ item }) => (
                                <FilterChip
                                    item={item}
                                    isSelected={filters.budget === item.label}
                                    onPress={() =>
                                        setSelectedFilters(prev => ({
                                            ...prev,
                                            budget: prev?.budget === item.label ? null : item.label,
                                        }))
                                    }
                                    labelKey="label"
                                />
                            )}
                        />
                    ) : (
                        <Text className="text-sm text-gray-500 mx-4 mt-2">
                            No budgets available
                        </Text>
                    )}

                    <Text className="text-lg font-rubik-bold text-gray-800 mt-5 mx-4">
                        Transmission
                    </Text>
                    {transmissions.length > 0 ? (
                        <FlatList
                            data={transmissions}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => `transmission-${index}`}
                            keyboardShouldPersistTaps="handled"
                            style={{ marginTop: 10, marginStart: 10 }}
                            renderItem={({ item }) => (
                                <FilterChip
                                    item={item}
                                    isSelected={filters.transmission === item.label}
                                    onPress={() =>
                                        setSelectedFilters(prev => ({
                                            ...prev,
                                            transmission: prev?.transmission === item.label ? null : item.label,
                                        }))
                                    }
                                    labelKey="value"
                                    icon={
                                        item.label.toLowerCase() === "automatic"
                                            ? "car-sport"
                                            : "cog"
                                    }
                                />
                            )}
                        />
                    ) : (
                        <Text className="text-sm text-gray-500 mx-4 mt-2">
                            No transmissions available
                        </Text>
                    )}

                    <Text className="text-lg font-rubik-bold text-gray-800 mt-5 mx-4">
                        Fuel Type
                    </Text>
                    {fuelTypes.length > 0 ? (
                        <FlatList
                            data={fuelTypes}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => `fueltype-${item.id}`}
                            keyboardShouldPersistTaps="handled"
                            style={{ marginTop: 10, marginStart: 10 }}
                            renderItem={({ item }) => (
                                <FilterChip
                                    item={item}
                                    isSelected={filters.fuelType === item.label}
                                    onPress={() =>
                                        setSelectedFilters(prev => ({
                                            ...prev,
                                            fuelType: prev?.fuelType === item.label ? null : item.label,
                                        }))
                                    }
                                    labelKey="label"
                                    icon={
                                        item.label.toLowerCase().includes("petrol")
                                            ? "water"
                                            : item.label.toLowerCase().includes("diesel")
                                                ? "water"
                                                : item.label.toLowerCase().includes("cng")
                                                    ? "leaf"
                                                    : "flash"
                                    }
                                />
                            )}
                        />
                    ) : (
                        <Text className="text-sm text-gray-500 mx-4 mt-2">
                            No fuel types available
                        </Text>
                    )}

                    <Text className="text-lg font-rubik-bold text-gray-800 mt-5 mx-4">
                        Body Type
                    </Text>
                    {bodyTypes.length > 0 ? (
                        <FlatList
                            data={bodyTypes}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => `bodytype-${item.id}`}
                            keyboardShouldPersistTaps="handled"
                            style={{ marginTop: 10, marginStart: 10 }}
                            renderItem={({ item }) => (
                                <FilterChip
                                    item={item}
                                    isSelected={filters.bodyType === item.label}
                                    onPress={() =>
                                        setSelectedFilters(prev => ({
                                            ...prev,
                                            bodyType: prev?.bodyType === item.label ? null : item.label,
                                        }))
                                    }
                                    labelKey="label"
                                />
                            )}
                        />
                    ) : (
                        <Text className="text-sm text-gray-500 mx-4 mt-2">
                            No body types available
                        </Text>
                    )}

                    <TouchableOpacity
                        onPress={handleSearch}
                        style={styles.applyButton}
                        accessibilityLabel="Apply search filters"
                    >
                        <LinearGradient
                            colors={["#0061ff", "#003087"]}
                            style={styles.applyButtonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="font-rubik-bold text-white text-center text-lg">
                                    Apply Filters
                                </Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </RBSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    searchBar: {
        marginHorizontal: 15,
        marginVertical: 5,
        borderRadius: 50,
    },
    searchBarGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        borderRadius: 0,
    },
    headerButton: {
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerButtonGradient: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    applyButton: {
        marginTop: 20,
        borderRadius: 12,
    },
    applyButtonGradient: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        marginInline: 15,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
});

export default Search;
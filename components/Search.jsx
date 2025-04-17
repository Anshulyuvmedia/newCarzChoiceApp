import { View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image, TextInput, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { useLocalSearchParams, router, usePathname } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import RBSheet from "react-native-raw-bottom-sheet";
import icons from "@/constants/icons";
import axios from "axios";
import Filters from "./Filters";
import LocationScroll from "./LocationScroll";

const Search = () => {
    const refRBSheet = useRef(null);
    const params = useLocalSearchParams();

    const [searchText, setSearchText] = useState("");
    const [filteredCities, setFilteredCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(params.brand || ''); // ✅ Retain value

    const [budgets, setBudgets] = useState([]);
    const [selectedBudget, setSelectedBudget] = useState(params.budget || ""); // ✅ Retain value

    const [fuelTypes, setFuelTypes] = useState([]);
    const [selectedFuelType, setSelectedFuelType] = useState(params.fuelType || ""); // ✅ Retain value

    const [transmissions, setTransmissions] = useState([]);
    const [selectedTransmission, setSelectedTransmission] = useState(params.transmission || ""); // ✅ Retain value

    const [color, setColor] = useState([]);
    const [selectedColor, setSelectedColor] = useState(params.color || ""); // ✅ Retain value

    const [cityData, setCityData] = useState([]);
    const [selectedCity, setSelectedCity] = useState(params.city || ""); // ✅ Retain value


    useEffect(() => {
        // getCityList();
        getMasterDataLists();
    }, []);

    // const getCityList = async () => {
    //     setLoading(true);
    //     try {
    //         const response = await axios.get("https://carzchoice.com/api/getCityList");
    //         if (response.data && Array.isArray(response.data.data)) {
    //             const formattedCities = response.data.data.map((city, index) => ({
    //                 label: city.District || `City ${index}`,
    //                 value: city.District || index,
    //             }));
    //             setCityData(formattedCities);
    //         } else {
    //             console.error("Unexpected API response format:", response.data);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching city list:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const getMasterDataLists = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://carzchoice.com/api/getMasterDataLists");
            // console.log("Full API Response:", response.data);

            if (response.data && response.data.data) {
                const { brands, budgets, fuelTypes, transmissions, color, city } = response.data.data;

                setBrands(brands || []);
                setBudgets(budgets || []);
                setFuelTypes(fuelTypes || []);
                setTransmissions(transmissions || []);
                setCityData(city || []);
                setColor(color || []);

                // console.log("fuelTypes:", fuelTypes);
            } else {
                console.error("Unexpected API response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching master data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const filters = {
            city: selectedCity,
            budget: selectedBudget,
            fuelType: selectedFuelType,
            transmission: selectedTransmission,
            color: selectedColor,
            brand: selectedBrand,
        };

        // console.log("Applied Filters:", filters);

        if (refRBSheet.current) {
            refRBSheet.current.close();
        }

        router.push({
            pathname: "explore",
            params: filters,
        });
    };

    const citySearch = (text) => {
        setSearchText(text);
        if (text.length > 0) {
            const filtered = cityData.filter((city) =>
                city.district.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredCities(filtered);
        } else {
            setFilteredCities(cityData);
        }
    };




    return (
        <View className="flex-1 ">

            <TouchableOpacity onPress={() => refRBSheet.current.open()}>
                <View className="flex flex-row items-center justify-between w-full px-4 py-3 rounded-full bg-accent-100 border border-primary-200">
                    <View className="flex-1 flex flex-row items-center justify-start">
                        <Image source={icons.search} className="size-6 " />
                        <TextInput
                            value={[
                                selectedCity, selectedBudget, selectedTransmission, selectedFuelType,
                                selectedColor, selectedBrand,
                            ]
                                .filter((val) => val) // Filter out empty values
                                .join(", ")}
                            editable={false}
                            placeholder="Search Vehicle..."
                            className="text-sm font-rubik-medium text-black-300 ml-2 flex-1 capitalize "
                        />
                    </View>
                    <Image source={icons.filter} className="size-5" />
                </View>
            </TouchableOpacity>

            {/* RBSheet for Search */}
            <RBSheet
                ref={refRBSheet}
                height={600}
                openDuration={250}
                closeOnDragDown={true}
                customStyles={{
                    container: {
                        borderTopLeftRadius: 15,
                        borderTopRightRadius: 15,
                        padding: 15,
                        backgroundColor: "white",
                    }
                }}
            >
                <View>
                    <View className="flex flex-row justify-between items-center mb-3">
                        <Text className="text-lg font-rubik-bold text-black-300">
                            Filter
                        </Text>
                        <TouchableOpacity onPress={() => refRBSheet.current.close()}>
                            <Text className="text-lg font-rubik-bold text-red-500">
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex flex-row items-center w-full bg-blue-50 rounded-full px-3 py-3">
                        <Image source={icons.location} className="size-6" />
                        <TextInput
                            ref={inputRef}
                            value={searchText}
                            onChangeText={citySearch}
                            placeholder="Search In Your City..."
                            className="flex-1 ml-2 text-black-300 text-sm capitalize"
                        />
                    </View>

                    {filteredCities.length > 0 && (
                        <FlatList
                            data={filteredCities}  // ✅ Use filteredCities instead of cityData
                            keyExtractor={(item, index) => `city-${index}`}
                            keyboardShouldPersistTaps="handled"
                            style={{ backgroundColor: "#fff", borderRadius: 10, marginTop: 5, maxHeight: 150 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedCity(item.district);
                                        setSearchText(item.district);
                                        setFilteredCities([]);

                                    }}
                                    className="p-2 border-b border-gray-200 bg-primary-100"
                                >
                                    <Text className="text-black-300 capitalize">{item.district}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}

                    <LocationScroll />

                    <Text className="text-lg font-rubik-bold text-black-300 mt-3">
                        Search by brand
                    </Text>
                    {brands.length > 0 && (
                        <FlatList
                            data={brands}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => `brand-${item.id}`} // ✅ Unique key
                            keyboardShouldPersistTaps="handled"
                            style={{ backgroundColor: "#fff", borderRadius: 10, marginTop: 5, maxHeight: 150 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    key={item.id.toString()} // ✅ Ensure unique key
                                    onPress={() => setSelectedBrand(selectedBrand === item.label ? "" : item.label)} // ✅ Fix function call
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        paddingHorizontal: 16,
                                        paddingVertical: 6,
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        borderColor: selectedBrand === item.label ? "#007bff" : "#ddd",
                                        backgroundColor: selectedBrand === item.label ? "#e3f2fd" : "#f8f9fa",
                                        marginRight: 8,
                                    }}
                                >
                                    {item.iconimage ? (
                                        <Image
                                            style={{
                                                width: 24,
                                                height: 24,
                                                marginRight: 6,
                                                resizeMode: "contain",
                                                borderRadius: 50,
                                            }}
                                            source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${item.iconimage}` }}
                                        />
                                    ) : (
                                        <Text style={{ fontSize: 12, color: "#555" }}>No Image</Text>
                                    )}

                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: selectedBrand === item.label ? "bold" : "normal",
                                        color: selectedBrand === item.label ? "black" : "#000",
                                    }}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}

                    <Text className="text-lg font-rubik-bold text-black-300 mt-3">
                        Budget
                    </Text>
                    {budgets.length > 0 && (
                        <FlatList
                            data={budgets}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => `budget-${index}`} // Unique key
                            keyboardShouldPersistTaps="handled"
                            style={{ backgroundColor: "#fff", borderRadius: 10, marginTop: 5, maxHeight: 150 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => setSelectedBudget(selectedBudget === item.label ? "" : item.label)}
                                    style={{
                                        paddingHorizontal: 15,
                                        paddingVertical: 5,
                                        borderRadius: 50,
                                        marginEnd: 10,
                                        borderWidth: 1,
                                        borderColor: selectedBudget === item.label ? "#007bff" : "#ddd",
                                        backgroundColor: selectedBudget === item.label ? "#e3f2fd" : "#f8f9fa",
                                    }}
                                >
                                    <Text style={{ color: "#000", textTransform: 'capitalize', fontWeight: selectedBudget === item.label ? "bold" : "normal" }}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                    <Text className="text-lg font-rubik-bold text-black-300 mt-3">
                        Transmission
                    </Text>
                    {transmissions.length > 0 && (
                        <FlatList
                            data={transmissions}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => `budget-${index}`} // Unique key
                            keyboardShouldPersistTaps="handled"
                            style={{ backgroundColor: "#fff", borderRadius: 10, marginTop: 5, maxHeight: 150 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => setSelectedTransmission(selectedTransmission === item.label ? "" : item.label)}

                                    style={{
                                        paddingHorizontal: 15,
                                        paddingVertical: 5,
                                        borderRadius: 50,
                                        marginEnd: 10,
                                        borderWidth: 1,
                                        borderColor: selectedTransmission === item.label ? "#007bff" : "#ddd",
                                        backgroundColor: selectedTransmission === item.label ? "#e3f2fd" : "#f8f9fa",
                                    }}
                                >
                                    <Text style={{ color: "#000", fontWeight: selectedTransmission === item.label ? "bold" : "normal" }}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                    <Text className="text-lg font-rubik-bold text-black-300 mt-3">
                        Fuel Type
                    </Text>
                    {fuelTypes.length > 0 && (
                        <FlatList
                            data={fuelTypes}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => `fueltype-${item.id}`}
                            keyboardShouldPersistTaps="handled"
                            style={{ backgroundColor: "#fff", borderRadius: 10, marginTop: 5, maxHeight: 150 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => setSelectedFuelType(selectedFuelType === item.label ? "" : item.label)}

                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        paddingHorizontal: 15,
                                        paddingVertical: 5,
                                        borderRadius: 50,
                                        marginEnd: 10,
                                        borderWidth: 1,
                                        borderColor: selectedFuelType === item.label ? "#007bff" : "#ddd",
                                        backgroundColor: selectedFuelType === item.label ? "#e3f2fd" : "#f8f9fa",
                                    }}
                                >

                                    <Text style={{ color: "#000", fontWeight: selectedFuelType === item.label ? "bold" : "normal" }}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}

                    <Text className="text-lg font-rubik-bold text-black-300 mt-3">
                        Select Color
                    </Text>
                    {color.length > 0 && (
                        <FlatList
                            data={color}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => `color-${index}`} // ✅ Fixed keyExtractor
                            keyboardShouldPersistTaps="handled"
                            style={{ backgroundColor: "#fff", borderRadius: 10, marginTop: 5, maxHeight: 150 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => setSelectedColor(selectedColor === item.color ? "" : item.color)}

                                    style={{
                                        paddingHorizontal: 15,
                                        paddingVertical: 5,
                                        borderRadius: 50,
                                        marginEnd: 10,
                                        borderWidth: 1,
                                        borderColor: selectedColor === item.color ? "#007bff" : "#ddd", // ✅ Fixed selection logic
                                        backgroundColor: selectedColor === item.color ? "#e3f2fd" : "#f8f9fa",
                                    }}
                                >
                                    <Text style={{ color: "#000", textTransform: 'capitalize', fontWeight: selectedColor === item.color ? "bold" : "normal" }}>
                                        {item.color}  {/* ✅ Corrected property reference */}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}

                </View>
                <TouchableOpacity onPress={() => handleSearch()} className="p-2 rounded-lg bg-primary-300 mt-5">
                    {loading ? <ActivityIndicator color="white" /> : <Text className="font-rubik-bold text-white text-center">Apply Filters</Text>}
                </TouchableOpacity>
            </RBSheet>
        </View>
    );
};

export default Search;

const styles = StyleSheet.create({

});
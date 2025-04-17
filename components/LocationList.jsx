import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import cities from '@/constants/cities';

const screenWidth = Dimensions.get('window').width;
const ITEMS_PER_ROW = 4;
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (screenWidth - 40 - ITEM_MARGIN * (ITEMS_PER_ROW - 1)) / ITEMS_PER_ROW;

const LocationList = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState(params.city || 'All');

    const handleCategoryPress = (category) => {
        const isRemovingFilter = selectedCategory === category;
        const updatedParams = { ...params };

        if (!isRemovingFilter) {
            updatedParams.city = category;
            setSelectedCategory(category);
        }

        setTimeout(() => {
            router.push({ pathname: "explore", params: updatedParams });
        }, 200);
    };

    const renderItem = ({ item: key }) => {
        const city = cities[key];
        const isSelected = selectedCategory === key;

        return (
            <TouchableOpacity
                onPress={() => handleCategoryPress(key)}
                style={[
                    styles.cityContainer,
                    isSelected ? styles.selected : styles.default,
                    { width: ITEM_WIDTH },
                ]}
            >
                <Image source={city} style={styles.cityImg} />
                <Text style={[styles.cityText, isSelected && styles.selectedText]}>
                    {key}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <FlatList
            data={Object.keys(cities)}
            renderItem={renderItem}
            keyExtractor={(item) => item}
            numColumns={ITEMS_PER_ROW}
            contentContainerStyle={styles.flatListContainer}
            columnWrapperStyle={{ justifyContent: 'center', marginBottom: ITEM_MARGIN }}
        />
    );
};

export default LocationList;

const styles = StyleSheet.create({
    flatListContainer: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    cityContainer: {
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        marginEnd: 5,
    },
    selected: {
        backgroundColor: '#EFF6FF', // light blue
    },
    default: {
        borderWidth: 1,
        borderColor: '#D1D5DB', // Tailwind's primary-200 equivalent
    },
    cityImg: {
        width: 55,
        height: 55,
        resizeMode: 'contain',
    },
    cityText: {
        fontSize: 12,
        fontFamily: 'Rubik-Bold',
        color: 'black', // Tailwind's black-300
        textTransform: 'capitalize',
    },
    selectedText: {
        color: '#000',
        marginTop: 2,
    },
});

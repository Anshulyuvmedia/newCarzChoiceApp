import React, { useCallback } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/Cards';

const SimilarCars = ({ data }) => {
    const navigation = useNavigation();

    // Handle cases where data might be undefined or not an array
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Similar Cars</Text>
                <Text style={styles.noData}>No similar cars found</Text>
            </View>
        );
    }

    // Memoized handleCardPress
    const handleCardPress = useCallback(
        (id) => {
            navigation.navigate('VehicleDetails', { id });
        },
        [navigation]
    );

    /*
    // Alternative for Expo Router:
    import { useRouter } from 'expo-router';
    const router = useRouter();
    const handleCardPress = useCallback(
        (id) => {
            router.push(`/vehicles/${id}`);
        },
        [router]
    );
    */

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Similar Cars</Text>
            <FlatList
                data={data}
                renderItem={({ item }) => <Card item={item} onPress={() => handleCardPress(item.id)} />}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        backgroundColor: '#F3F4F6',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginHorizontal: 16,
        marginBottom: 12,
    },
    noData: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginVertical: 20,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    columnWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
});

export default SimilarCars;
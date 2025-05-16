import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CompareOtherCars = ({ data, headerTitle, currentCar, currentCarId }) => {
    const router = useRouter();
    const [visibleData, setVisibleData] = useState([]);
    const [page, setPage] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 5;

    // Convert data object to array and deduplicate by id
    const dataArray = Array.isArray(data) ? data : Object.values(data);
    const uniqueDataArray = Array.from(
        new Map(dataArray.map(item => [item.id, item])).values()
    );

    const loadMoreData = () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);

        setTimeout(() => {
            const startIndex = page * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const newData = uniqueDataArray.slice(startIndex, endIndex);

            const filteredData = newData.filter(car => {
                if (currentCar?.bodytype && car.bodytype !== currentCar.bodytype) {
                    return false;
                }
                return true;
            });

            // Avoid adding duplicates to visibleData
            setVisibleData(prev => {
                const existingIds = new Set(prev.map(item => item.id));
                const newItems = filteredData.filter(item => !existingIds.has(item.id));
                return [...prev, ...newItems];
            });
            setPage(prev => prev + 1);

            if (endIndex >= uniqueDataArray.length) {
                setHasMore(false);
            }

            setLoadingMore(false);
        }, 1000);
    };

    useEffect(() => {
        if (uniqueDataArray.length > 0) {
            loadMoreData();
        }
    }, []);

    const handleCompare = (similarCarId) => {
        if (!currentCarId || !similarCarId) {
            console.error('Missing IDs for comparison:', { currentCarId: currentCarId, similarCarId });
            return;
        }
        router.push({
            pathname: 'vehicles/CompareCars',
            params: {
                variantId1: currentCarId,
                variantId2: similarCarId,
            },
        });
    };

    const renderCarItem = ({ item: car, index }) => {
        const price = car.price
            ? (parseInt(car.price) / 100000).toFixed(2)
            : 'N/A';
        const mileage = car.mileage
            ? Object.values(JSON.parse(car.mileage))[0]
            : 'N/A';
        const fuelType = car.fueltype
            ? JSON.parse(car.fueltype)[0]
            : 'N/A';
        const transmission = car.transmission
            ? JSON.parse(car.transmission)[0]
            : 'N/A';

        const isCompareDisabled = !currentCarId || !car.id;

        return (
            <View style={styles.carCard}>
                {car.addimage ? (
                    <Image
                        source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${car.addimage}` }}
                        style={styles.carImage}
                        resizeMode="cover"
                    />
                ) : (
                    <LinearGradient
                        colors={['#E5E7EB', '#D1D5DB']}
                        style={[styles.carImage, styles.placeholderImage]}
                    >
                        <Feather name="image" size={32} color="#6B7280" />
                        <Text style={styles.placeholderText}>No Image Available</Text>
                    </LinearGradient>
                )}
                <View style={styles.carInfo}>
                    <Text style={styles.carName} numberOfLines={1}>
                        {car.brandname} {car.carname}
                    </Text>
                    <Text style={styles.variantName} numberOfLines={1}>
                        {car.carmodalname}
                    </Text>
                    <Text style={styles.price}>
                        ₹{price} Lakh*
                    </Text>
                    <Text style={styles.detailText} numberOfLines={2}>
                        {fuelType} | {transmission} | {mileage}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.compareButton, isCompareDisabled && styles.compareButtonDisabled]}
                    onPress={() => handleCompare(car.id)}
                    activeOpacity={0.7}
                    disabled={isCompareDisabled}
                    accessibilityLabel={`Compare ${car.brandname} ${car.carname} ${car.carmodalname} with ${currentCar?.brandname || 'Car'} ${currentCar?.carname || ''}`}
                >
                    <LinearGradient
                        colors={isCompareDisabled ? ['#D1D5DB', '#D1D5DB'] : ['#2563EB', '#1D4ED8']}
                        style={styles.compareButtonGradient}
                    >
                        <Text style={styles.compareButtonText}>Compare</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {headerTitle && (
                <Text style={styles.headerTitle}>
                    {headerTitle.replace('{currentCar}', `${currentCar?.brandname || 'Car'} ${currentCar?.carname || ''}`)}
                </Text>
            )}
            <FlatList
                data={visibleData}
                renderItem={renderCarItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                contentContainerStyle={styles.scrollContent}
                onEndReached={loadMoreData}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    <View style={styles.noDataContainer}>
                        <Feather name="info" size={24} color="#64748B" />
                        <Text style={styles.noDataText}>No similar cars available</Text>
                    </View>
                }
                ListFooterComponent={
                    loadingMore ? (
                        <ActivityIndicator size="large" color="#2563EB" style={styles.loadingIndicator} />
                    ) : !hasMore && visibleData.length > 0 ? (
                        <Text style={styles.endOfListText}>No more cars to load</Text>
                    ) : null
                }
            />
        </View>
    );
};

export default CompareOtherCars;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingVertical: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginHorizontal: 20,
        marginBottom: 20,
        letterSpacing: 0.3,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    carCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    carImage: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        marginBottom: 16,
        backgroundColor: '#F1F5F9',
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 8,
        fontWeight: '500',
    },
    carInfo: {
        marginBottom: 16,
    },
    carName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    variantName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#64748B',
        marginBottom: 8,
    },
    price: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#64748B',
        lineHeight: 20,
    },
    compareButton: {
        borderRadius: 9999,
        overflow: 'hidden',
    },
    compareButtonGradient: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    compareButtonDisabled: {
        opacity: 0.6,
    },
    compareButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    noDataContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    noDataText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#64748B',
        marginLeft: 8,
    },
    loadingIndicator: {
        marginVertical: 20,
    },
    endOfListText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
        textAlign: 'center',
        paddingVertical: 20,
    },
});
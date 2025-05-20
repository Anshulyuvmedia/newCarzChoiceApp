import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import RBSheet from 'react-native-raw-bottom-sheet';
import Feather from '@expo/vector-icons/Feather';

const VariantsList = ({ data, headerTitle }) => {
    const router = useRouter();
    const [fuelFilter, setFuelFilter] = useState('All');
    const [transmissionFilter, setTransmissionFilter] = useState('All');
    const [selectedVariants, setSelectedVariants] = useState([]);
    const rbSheetRef = useRef();

    // Handle cases where data might be undefined or not an array
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.noData}>No variants found</Text>
            </View>
        );
    }

    // Parse and format variant data
    const formatVariantData = (variant) => {
        const fuelTypes = JSON.parse(variant.fueltype || '[]');
        const transmissions = JSON.parse(variant.transmission || '[]');
        const mileageData = JSON.parse(variant.mileage || '{}');
        return {
            id: variant.id,
            title: `${variant.brandname} ${variant.carname}`,
            name: `${variant.carname} ${variant.carmodalname}`,
            price: parseInt(variant.price || 0).toLocaleString('en-IN'),
            priceType: variant.pricetype || 'Lakh',
            fuelType: fuelTypes[0] || 'N/A',
            transmission: transmissions[0] || 'N/A',
            engine: variant.engine || 'N/A',
            mileage: mileageData[fuelTypes[0]] || 'N/A',
            bodyType: variant.bodytype?.replace('Compect', 'Compact') || 'N/A',
            status: variant.availabelstatus || 'Unknown',
            image: variant.addimage ? `https://carzchoice.com/assets/backend-assets/images/${variant.addimage}` : null,
            raw: variant, // Store raw data for comparison
        };
    };

    // Filter variants based on fuel type and transmission
    const filteredVariants = data
        .map(formatVariantData)
        .filter((variant) => {
            const fuelMatch = fuelFilter === 'All' || variant.fuelType === fuelFilter;
            const transmissionMatch = transmissionFilter === 'All' || variant.transmission === transmissionFilter;
            return fuelMatch && transmissionMatch;
        });

    // Memoized handleCardPress
    const handleCardPress = useCallback(
        (id) => {
            router.push(`/vehicles/${id}`);
        },
        [router]
    );

    // Handle compare checkbox toggle
    const toggleCompare = (variant) => {
        setSelectedVariants((prev) => {
            if (prev.some((v) => v.id === variant.id)) {
                return prev.filter((v) => v.id !== variant.id);
            } else if (prev.length < 2) {
                const newSelection = [...prev, variant];
                if (newSelection.length === 2) {
                    rbSheetRef.current?.open();
                }
                return newSelection;
            }
            return prev;
        });
    };

    // Render filter button with animation
    const renderFilterButton = (label, selectedLabel, onPress) => {
        const scaleAnim = useRef(new Animated.Value(selectedLabel === label ? 1.05 : 1)).current;

        const animateButton = (toValue) => {
            Animated.spring(scaleAnim, {
                toValue,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }).start();
        };

        return (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        selectedLabel === label && styles.filterButtonActive,
                    ]}
                    onPress={() => {
                        onPress();
                        animateButton(selectedLabel === label ? 1 : 1.05);
                    }}
                    activeOpacity={0.8}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            selectedLabel === label && styles.filterButtonTextActive,
                        ]}
                    >
                        {label}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // Render variant item
    const renderVariant = ({ item, index }) => (
        <TouchableOpacity
            style={styles.variantCard}
            onPress={() => handleCardPress(item.id)}
            activeOpacity={0.8}
        >
            <View style={styles.variantHeader}>
                <Text style={styles.variantName} numberOfLines={1}>
                    {index + 1}. {item.name}
                </Text>

            </View>
            <View style={styles.variantSpecsContainer}>
                <View style={styles.specItem}>
                    <Feather name="zap" size={14} color="#6B7280" style={styles.specIcon} />
                    <Text style={styles.variantSpecs}>{item.engine}</Text>
                </View>
                <View style={styles.specItem}>
                    <Feather name="droplet" size={14} color="#6B7280" style={styles.specIcon} />
                    <Text style={styles.variantSpecs}>{item.fuelType}</Text>
                </View>
                <View style={styles.specItem}>
                    <Feather name="settings" size={14} color="#6B7280" style={styles.specIcon} />
                    <Text style={styles.variantSpecs}>{item.transmission}</Text>
                </View>
                <View style={styles.specItem}>
                    <Feather name="activity" size={14} color="#6B7280" style={styles.specIcon} />
                    <Text style={styles.variantSpecs}>{item.mileage}</Text>
                </View>

            </View>
            <View className="flex flex-row justify-between">
                <Text style={styles.variantPrice}>
                    ₹{item.price} {item.priceType === 'Lakh' ? 'Lakh*' : ''}
                </Text>
                <TouchableOpacity
                    style={styles.compareContainer}
                    onPress={() => toggleCompare(item)}
                >
                    <View
                        style={[
                            styles.checkbox,
                            selectedVariants.some((v) => v.id === item.id) && styles.checkboxSelected,
                        ]}
                    >
                        {selectedVariants.some((v) => v.id === item.id) && (
                            <Feather name="check" size={16} color="#FFFFFF" />
                        )}
                    </View>
                    <Text style={styles.compareText}>Compare</Text>
                </TouchableOpacity>
            </View>


        </TouchableOpacity>
    );

    // Header component for FlatList
    const renderHeader = () => (
        <View>
            {/* Filter Bar */}
            <View style={styles.filterContainer}>
                {headerTitle && (
                    <Text style={styles.headerTitle}>
                        {headerTitle}
                    </Text>
                )}
                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Fuel Type</Text>
                    <View style={styles.filterButtons}>
                        {renderFilterButton('All', fuelFilter, () => setFuelFilter('All'))}
                        {renderFilterButton('Petrol', fuelFilter, () => setFuelFilter('Petrol'))}
                        {renderFilterButton('CNG', fuelFilter, () => setFuelFilter('CNG'))}
                    </View>
                </View>
                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Transmission</Text>
                    <View style={styles.filterButtons}>
                        {renderFilterButton('All', transmissionFilter, () => setTransmissionFilter('All'))}
                        {renderFilterButton('Automatic', transmissionFilter, () => setTransmissionFilter('Automatic'))}
                        {renderFilterButton('Manual', transmissionFilter, () => setTransmissionFilter('Manual'))}
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredVariants}
                renderItem={renderVariant}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <View style={styles.noDataContainer}>
                        <Text style={styles.noData}>No variants match the selected filters</Text>
                    </View>
                }
            />
            {/* Comparison Bottom Sheet */}
            <RBSheet
                ref={rbSheetRef}
                height={320}
                openDuration={300}
                closeDuration={200}
                closeOnDragDown
                animationType="fade"
                customStyles={{
                    container: styles.sheetContainer,
                    draggableIcon: styles.sheetDraggableIcon,
                }}
            >
                <View style={styles.sheetContent}>
                    <Text style={styles.sheetTitle}>My Comparison</Text>
                    {selectedVariants.map((variant, index) => (
                        <View key={variant.id} style={styles.sheetItem}>
                            <View style={styles.sheetDetails}>
                                <Text style={styles.sheetVariantName} numberOfLines={1}>
                                    {variant.name}
                                </Text>
                                <Text style={styles.sheetPrice}>
                                    ₹{variant.price} {variant.priceType === 'Lakh' ? 'Lakh*' : ''}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => toggleCompare(variant)}
                            >
                                <Feather name="x-circle" size={20} color="#EF4444" />
                            </TouchableOpacity>
                            {index === 0 && selectedVariants.length === 2 && (
                                <Text style={styles.vsText}>VS</Text>
                            )}
                        </View>
                    ))}
                    {selectedVariants.length === 2 && (
                        <TouchableOpacity
                            style={styles.compareButton}
                            onPress={() => {
                                router.push({
                                    pathname: 'vehicles/CompareCars',
                                    params: {
                                        variantId1: selectedVariants[0].id,
                                        variantId2: selectedVariants[1].id,
                                    },
                                });
                                rbSheetRef.current?.close();
                            }}
                        >
                            <Text style={styles.compareButtonText}>Compare Now</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </RBSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 24,
    },
    noData: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6B7280',
        textAlign: 'center',
        fontFamily: 'System',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 5,
    },
    // Filter Bar
    filterContainer: {
        marginBottom: 10,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    filterGroup: {
        marginBottom: 12,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    filterButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
    },
    filterButtonActive: {
        borderColor: '#1E3A8A',
        backgroundColor: '#1E3A8A',
    },
    filterButtonText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1F2937',
    },
    filterButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    // Variants List
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 40,
    },
    variantCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    variantHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    variantName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        flex: 1,
        letterSpacing: 0.2,
    },
    variantPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E3A8A',
    },
    variantSpecsContainer: {
        marginBottom: 5,
        display: "flex",
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    specItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    specIcon: {
        opacity: 0.7,
    },
    variantSpecs: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6B7280',
    },
    variantStatus: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 12,
    },
    statusAvailable: {
        color: '#16A34A',
    },
    statusComingSoon: {
        color: '#F59E0B',
    },
    keyFeatures: {
        marginBottom: 16,
    },
    featuresTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 6,
        letterSpacing: 0.2,
    },
    featureItem: {
        fontSize: 13,
        fontWeight: '500',
        color: '#4B5563',
        lineHeight: 18,
    },
    compareContainer: {
        flexDirection: 'row',
        alignItems: 'right',
        marginStart: 'auto',
        gap: 8,
        paddingInline: 8,
        borderStartWidth: 1,
        borderStartColor: '#E5E7EB',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#1E3A8A',
        borderColor: '#1E3A8A',
    },
    compareText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    // Bottom Sheet
    sheetContainer: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    sheetDraggableIcon: {
        backgroundColor: '#D1D5DB',
        width: 40,
        height: 5,
        borderRadius: 2.5,
    },
    sheetContent: {
        padding: 20,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
        letterSpacing: 0.2,
    },
    sheetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        position: 'relative',
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 12,
    },
    sheetImage: {
        width: 90,
        height: 60,
        marginRight: 12,
        borderRadius: 6,
    },
    placeholderImage: {
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheetDetails: {
        flex: 1,
    },
    sheetVariantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    sheetPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E3A8A',
    },
    removeButton: {
        padding: 6,
    },
    vsText: {
        position: 'absolute',
        left: '50%',
        transform: [{ translateX: -15 }, { translateY: 20 }],
        top: '100%',
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    compareButton: {
        backgroundColor: '#1E3A8A',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    compareButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});

export default VariantsList;
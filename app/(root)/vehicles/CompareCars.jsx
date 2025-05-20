import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import icons from "@/constants/icons";
import { LinearGradient } from 'expo-linear-gradient';

const CompareScreen = () => {
    const router = useRouter();
    const { variantId1, variantId2 } = useLocalSearchParams();
    const [variant1Data, setVariant1Data] = useState(null);
    const [variant2Data, setVariant2Data] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const [sections, setSections] = useState({
        features: {},
    });
    const [specSubSections, setSpecSubSections] = useState({});
    const [hideSimilar, setHideSimilar] = useState(false);
    const [highlightDifferences, setHighlightDifferences] = useState(false);

    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds

    const fetchComparisonData = useCallback(async (attempt = 1) => {
        if (!variantId1 || !variantId2) {
            setError('Variant IDs are missing');
            setLoading(false);
            return;
        }

        try {
            const variantId1Num = parseInt(variantId1);
            const variantId2Num = parseInt(variantId2);

            if (isNaN(variantId1Num) || isNaN(variantId2Num)) {
                throw new Error('Invalid variant IDs');
            }

            const response = await fetch(`https://carzchoice.com/api/comparevariants?variantId1=${variantId1Num}&variantId2=${variantId2Num}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response body:', errorText);
                if (response.status === 404 && attempt <= MAX_RETRIES) {
                    console.log(`Retrying request (attempt ${attempt}/${MAX_RETRIES})...`);
                    setTimeout(() => fetchComparisonData(attempt + 1), RETRY_DELAY);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                const { variant1, variant2 } = result.data;

                const formatVariant = (variant) => {
                    const fuelType = variant.fueltype
                        ? JSON.parse(variant.fueltype)[0]
                        : 'N/A';
                    const transmission = variant.transmission
                        ? JSON.parse(variant.transmission)[0]
                        : 'N/A';
                    const mileage = variant.mileage
                        ? Object.values(JSON.parse(variant.mileage))[0]
                        : 'N/A';
                    const price = variant.price
                        ? (parseInt(variant.price) / 100000).toFixed(2)
                        : 'N/A';

                    const groupedSpecs = {};
                    (variant.specifications || []).forEach(spec => {
                        if (spec.label && spec.value) {
                            if (!groupedSpecs[spec.type]) {
                                groupedSpecs[spec.type] = [];
                            }
                            groupedSpecs[spec.type].push({
                                label: spec.label,
                                value: spec.value,
                            });
                        }
                    });

                    const groupedFeatures = {};
                    const featuresArray = variant.features || [];

                    featuresArray.forEach((featureGroup, index) => {
                        if (typeof featureGroup === 'string') {
                            groupedFeatures['General'] = groupedFeatures['General'] || [];
                            groupedFeatures['General'].push({
                                label: featureGroup,
                                value: featureGroup === 'Feature not available' ? 'Yes' : 'No',
                            });
                        } else if (featureGroup && featureGroup.label && featureGroup.type && featureGroup.value) {
                            const featuresList = [];
                            const labels = Array.isArray(featureGroup.label) ? featureGroup.label : [featureGroup.label];
                            const values = Array.isArray(featureGroup.value) ? featureGroup.value : [featureGroup.value];

                            labels.forEach((label, idx) => {
                                const value = values[idx] || '0';
                                featuresList.push({
                                    label,
                                    value: value === '1' || value === 'Yes' || value === '1 beep over 80kmph, Continuous beeps over 120kmph' ? 'Yes' : 'No',
                                });
                            });

                            groupedFeatures[featureGroup.type] = featuresList;
                        } else {
                            console.warn(`Unexpected feature format at index ${index}:`, featureGroup);
                        }
                    });

                    if (Object.keys(groupedFeatures).length === 0) {
                        groupedFeatures['General'] = [{ label: 'Feature not available', value: 'Yes' }];
                    }

                    return {
                        name: `${variant.brandname} ${variant.carname}`,
                        variantName: `${variant.carmodalname}`,
                        price: price,
                        priceType: variant.pricetype || 'Lakh',
                        fuelType: fuelType,
                        transmission: transmission,
                        mileage: mileage,
                        engine: variant.engine || 'N/A',
                        bodyType: variant.bodytype?.replace('Compect', 'Compact') || 'N/A',
                        image: variant.addimage
                            ? `https://carzchoice.com/assets/backend-assets/images/${variant.addimage}`
                            : null,
                        specifications: groupedSpecs,
                        features: groupedFeatures,
                    };
                };

                const formattedVariant1 = formatVariant(variant1);
                const formattedVariant2 = formatVariant(variant2);
                setVariant1Data(formattedVariant1);
                setVariant2Data(formattedVariant2);

                const specTypes = [...new Set([
                    ...Object.keys(formattedVariant1.specifications),
                    ...Object.keys(formattedVariant2.specifications),
                ])];
                const initialSpecSubSections = {};
                specTypes.forEach(type => {
                    initialSpecSubSections[type] = false;
                });
                setSpecSubSections(initialSpecSubSections);

                const featureTypes = [...new Set([
                    ...Object.keys(formattedVariant1.features),
                    ...Object.keys(formattedVariant2.features),
                ])];
                const initialFeatureSections = {};
                featureTypes.forEach(type => {
                    initialFeatureSections[type] = false;
                });
                setSections(prev => ({
                    ...prev,
                    features: initialFeatureSections,
                }));
            } else {
                setError(result.message || 'Failed to fetch comparison data');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(`Failed to fetch data: ${err.message}${attempt > MAX_RETRIES ? ' (Max retries reached)' : ''}`);
        } finally {
            if (attempt === 1 || attempt > MAX_RETRIES) {
                setLoading(false);
            }
        }
    }, [variantId1, variantId2]);

    useEffect(() => {
        setLoading(true);
        setError(null);
        setRetryCount(0);
        fetchComparisonData();
    }, [variantId1, variantId2, fetchComparisonData]);

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        setRetryCount(prev => prev + 1);
        fetchComparisonData();
    };

    const toggleSpecSubSection = (type) => {
        setSpecSubSections(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const toggleFeatureSection = (type) => {
        setSections(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [type]: !prev.features[type],
            },
        }));
    };

    const handleHideSimilar = () => {
        setHideSimilar(prev => !prev);
        setHighlightDifferences(false);
    };

    const handleShowDifference = () => {
        setHighlightDifferences(prev => !prev);
        setHideSimilar(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (error || !variant1Data || !variant2Data) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                    {error || 'Error: Variants not found for comparison'}
                </Text>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                >
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
                {retryCount < MAX_RETRIES && (
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={handleRetry}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    const allSpecTypes = [...new Set([
        ...Object.keys(variant1Data.specifications),
        ...Object.keys(variant2Data.specifications),
    ])];

    const allFeatureTypes = [...new Set([
        ...Object.keys(variant1Data.features),
        ...Object.keys(variant2Data.features),
    ])];
    const featureComparison = {};
    allFeatureTypes.forEach(type => {
        const labels = [...new Set([
            ...(variant1Data.features[type] || []).map(f => f.label),
            ...(variant2Data.features[type] || []).map(f => f.label),
        ])];
        featureComparison[type] = labels.map(label => ({
            label,
            variant1Has: (variant1Data.features[type] || []).find(f => f.label === label)?.value === 'Yes',
            variant2Has: (variant2Data.features[type] || []).find(f => f.label === label)?.value === 'Yes',
        }));
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Compare Vehicles</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={['#FFFFFF', '#E8ECEF']}
                        style={styles.backButtonGradient}
                    >
                        <Image source={icons.backArrow} style={styles.icon} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Car Images and Overview */}
                <View style={styles.overviewCard}>
                    <View style={styles.comparisonRow}>
                        <View style={styles.variantCard}>
                            {variant1Data.image ? (
                                <Image
                                    source={{ uri: variant1Data.image }}
                                    style={styles.carImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.carImage, styles.placeholderImage]}>
                                    <Feather name="image" size={48} color="#9CA3AF" />
                                </View>
                            )}
                            <Text style={styles.variantName} numberOfLines={2}>
                                {variant1Data.name}
                            </Text>
                            <Text className="font-rubik text-sm">
                                {variant1Data.variantName}
                            </Text>
                            <Text style={styles.price}>
                                ₹{variant1Data.price}{' '}
                                {variant1Data.priceType === 'Lakh' ? 'Lakh*' : ''}
                            </Text>
                            <Text className="text-sm text-gray-400">Ex-showroom price</Text>
                        </View>

                        <View style={styles.vsContainer}>
                            <Text style={styles.vsText}>VS</Text>
                        </View>

                        <View style={styles.variantCard}>
                            {variant2Data.image ? (
                                <Image
                                    source={{ uri: variant2Data.image }}
                                    style={styles.carImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.carImage, styles.placeholderImage]}>
                                    <Feather name="image" size={48} color="#9CA3AF" />
                                </View>
                            )}
                            <Text style={styles.variantName} numberOfLines={2}>
                                {variant2Data.name}
                            </Text>
                            <Text className="font-rubik text-sm">
                                {variant2Data.variantName}
                            </Text>
                            <Text style={styles.price}>
                                ₹{variant2Data.price}{' '}
                                {variant2Data.priceType === 'Lakh' ? 'Lakh*' : ''}
                            </Text>
                            <Text className="text-sm text-gray-400">Ex-showroom price</Text>
                        </View>
                    </View>

                    {/* Variant Overview Details */}
                    <View style={styles.overviewDetails}>
                        <View className="flex border-b border-gray-100 pt-3">
                            <Text style={styles.overviewLabel}>Fuel Type</Text>
                            <View style={styles.overviewRow}>
                                <Text style={styles.overviewValue1}>{variant1Data.fuelType}</Text>
                                <Text style={styles.overviewValue2}>{variant2Data.fuelType}</Text>
                            </View>
                        </View>
                        <View className="flex border-b border-gray-100 pt-3">
                            <Text style={styles.overviewLabel}>Transmission</Text>
                            <View style={styles.overviewRow}>
                                <Text style={styles.overviewValue1}>{variant1Data.transmission}</Text>
                                <Text style={styles.overviewValue2}>{variant2Data.transmission}</Text>
                            </View>
                        </View>
                        <View className="flex border-b border-gray-100 pt-3">
                            <Text style={styles.overviewLabel}>Mileage</Text>
                            <View style={styles.overviewRow}>
                                <Text style={styles.overviewValue1}>{variant1Data.mileage}</Text>
                                <Text style={styles.overviewValue2}>{variant2Data.mileage}</Text>
                            </View>
                        </View>
                        <View className="flex border-b border-gray-100 pt-3">
                            <Text style={styles.overviewLabel}>Body Type</Text>
                            <View style={styles.overviewRow}>
                                <Text style={styles.overviewValue1}>{variant1Data.bodyType}</Text>
                                <Text style={styles.overviewValue2}>{variant2Data.bodyType}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Specifications Section */}
                <Text style={styles.sectionTitle}>Specifications</Text>
                {allSpecTypes.map((type) => (
                    <View key={type} style={styles.sectionCard}>
                        <TouchableOpacity
                            style={styles.sectionHeader}
                            onPress={() => toggleSpecSubSection(type)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.sectionHeaderText}>{type}</Text>
                            <Feather
                                name={specSubSections[type] ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#4B5563"
                            />
                        </TouchableOpacity>
                        {specSubSections[type] && (
                            <View style={styles.sectionContent}>
                                {(variant1Data.specifications[type] || variant2Data.specifications[type] || []).map((spec) => {
                                    const variant1Value = (variant1Data.specifications[type] || []).find(s => s.label === spec.label)?.value || 'N/A';
                                    const variant2Value = (variant2Data.specifications[type] || []).find(s => s.label === spec.label)?.value || 'N/A';
                                    const isSame = variant1Value === variant2Value;

                                    if (hideSimilar && isSame) {
                                        return null;
                                    }

                                    return (
                                        <View
                                            key={spec.label}
                                            className="flex border-b border-gray-100 pt-3"
                                            style={[highlightDifferences && !isSame && styles.highlightedRow]}
                                        >
                                            <Text style={styles.specLabel}>{spec.label}</Text>
                                            <View key={`${spec.label}-values`} style={styles.specRow}>
                                                <Text style={styles.specValue1}>{variant1Value}</Text>
                                                <Text style={styles.specValue2}>{variant2Value}</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                ))}

                {/* Features Section */}
                <Text style={styles.sectionTitle}>Features</Text>
                {allFeatureTypes.map((type) => (
                    <View key={type} style={styles.sectionCard}>
                        <TouchableOpacity
                            style={styles.sectionHeader}
                            onPress={() => toggleFeatureSection(type)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.sectionHeaderText}>{type}</Text>
                            <Feather
                                name={sections.features[type] ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#4B5563"
                            />
                        </TouchableOpacity>
                        {sections.features[type] && (
                            <View style={styles.sectionContent}>
                                {featureComparison[type].map((feature) => {
                                    const isSame = feature.variant1Has === feature.variant2Has;

                                    if (hideSimilar && isSame) {
                                        return null;
                                    }

                                    return (
                                        <View
                                            key={feature.label}
                                            className="flex border-b border-gray-100 pt-3"
                                            style={[highlightDifferences && !isSame && styles.highlightedRow]}
                                        >
                                            <Text style={styles.featureLabel}>{feature.label}</Text>
                                            <View key={`${feature.label}-values`} style={styles.featureRow}>
                                                <View style={styles.featureColumn1}>
                                                    <Feather
                                                        name={feature.variant1Has ? 'check-circle' : 'x-circle'}
                                                        size={18}
                                                        color={feature.variant1Has ? '#10B981' : '#EF4444'}
                                                    />
                                                </View>
                                                <View style={styles.featureColumn2}>
                                                    <Feather
                                                        name={feature.variant2Has ? 'check-circle' : 'x-circle'}
                                                        size={18}
                                                        color={feature.variant2Has ? '#10B981' : '#EF4444'}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                ))}

            </ScrollView>
            <View className="flex px-4 pb-4 flex-row g-2 justify-around">
                <TouchableOpacity
                    style={[styles.compareButton, hideSimilar && styles.activeButton]}
                    onPress={handleHideSimilar}
                    activeOpacity={0.8}
                >
                    <Image source={icons.hidden} className="w-5 h-5 mr-2" />
                    <Text style={[styles.compareButtonText, hideSimilar && { color: '#FFFFFF' }]}>
                        {hideSimilar ? 'Show All' : 'Hide Similar'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.compareButton, highlightDifferences && styles.activeButton]}
                    onPress={handleShowDifference}
                    activeOpacity={0.8}
                >
                    <Image source={icons.idea} className="w-5 h-5 mr-2" />
                    <Text style={[styles.compareButtonText, highlightDifferences && { color: '#FFFFFF' }]}>
                        {highlightDifferences ? 'Hide Difference' : 'Show Difference'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    backButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    backButtonGradient: {
        padding: 10,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    icon: {
        width: 20,
        height: 20,
        tintColor: '#1A1A1A',
    },
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // bg-gray-50
    },
    header: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937', // text-gray-800
    },
    closeText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2563EB', // text-blue-600
    },
    scrollContent: {
        paddingHorizontal: 12,
        paddingVertical: 15,
        paddingBottom: 48,
    },
    overviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    comparisonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: 24,
    },
    variantCard: {
        flex: 1,
        alignItems: 'start',
        paddingHorizontal: 2,
    },
    carImage: {
        width: '100%',
        height: 128,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "lightgray",
        marginBottom: 2,
    },
    placeholderImage: {
        backgroundColor: '#F3F4F6', // bg-gray-100
        justifyContent: 'center',
        alignItems: 'center',
    },
    variantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937', // text-gray-800
        textAlign: 'start',
        marginBottom: 4,
    },
    price: {
        marginTop: 5,
        fontSize: 16,
        fontWeight: '700',
        color: '#111827', // text-gray-900
    },
    vsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 35,
        height: 35,
        borderRadius: 24,
        backgroundColor: '#2563EB', // bg-blue-600
        marginTop: 50,
    },
    vsText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    overviewDetails: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB', // border-gray-200
        paddingTop: 0,
    },
    overviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    overviewValue1: {
        flex: 1,
        fontSize: 14,
        color: '#1F2937', // text-gray-600
        textAlign: 'start',
        fontWeight: '700',
    },
    overviewValue2: {
        flex: 1,
        fontSize: 14,
        color: '#1F2937', // text-gray-600
        textAlign: 'right',
        fontWeight: '700',
    },
    overviewLabel: {
        fontSize: 12,
        fontWeight: '400',
        color: '#6B7280', // text-gray-800
        textAlign: "center",
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937', // text-gray-800
        marginBottom: 16,
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937', // text-gray-800
    },
    sectionContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    specValue1: {
        flex: 1,
        fontSize: 14,
        color: '#1F2937', // text-gray-800
        fontWeight: '700',
        textAlign: 'start',
    },
    specValue2: {
        flex: 1,
        fontSize: 14,
        color: '#1F2937', // text-gray-800
        fontWeight: '700',
        textAlign: 'right',
    },
    specLabel: {
        flex: 1,
        fontSize: 12,
        fontWeight: '400',
        textAlign: 'center',
        color: '#6B7280', // text-gray-600
    },
    featureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    featureColumn1: {
        flex: 1,
        alignItems: 'start',
    },
    featureColumn2: {
        flex: 1,
        alignItems: 'flex-end',
    },
    featureLabel: {
        flex: 1,
        fontSize: 12,
        fontWeight: '400',
        color: '#6B7280', // text-gray-600
        textAlign: 'center',
    },
    compareButton: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'white',
        borderColor: 'lightgray',
        borderWidth: 1,
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 9999,
        alignItems: 'center',
        marginTop: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    compareButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000000',
    },
    activeButton: {
        backgroundColor: '#2563EB', // bg-blue-600
        borderColor: '#2563EB',
    },
    highlightedRow: {
        backgroundColor: '#e8ffe6', // bg-yellow-100

    },
    loadingContainer: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6', // bg-gray-50
    },
    loadingText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1F2937', // text-gray-800
    },
    errorContainer: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6', // bg-gray-50
    },
    errorText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937', // text-gray-800
        marginBottom: 16,
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: '#2563EB', // bg-blue-600
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 9999,
        marginBottom: 16,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    retryButton: {
        backgroundColor: '#4F46E5', // bg-indigo-600
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 9999,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },
});

export default CompareScreen;